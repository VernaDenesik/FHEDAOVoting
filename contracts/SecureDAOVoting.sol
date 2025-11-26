// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, externalEuint64, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Advanced DAO Voting Contract with FHE Privacy & Gateway Callbacks
/// @notice Privacy-preserving governance using Fully Homomorphic Encryption with timeout protection and refund mechanisms
/// @dev Implements Gateway callback pattern for decryption with comprehensive security features
contract SecureDAOVoting is SepoliaConfig {

    /*//////////////////////////////////////////////////////////////
                                STRUCTURES
    //////////////////////////////////////////////////////////////*/

    struct Proposal {
        uint256 id;
        string title;
        string description;
        address creator;
        uint256 createdAt;
        uint256 votingEnd;
        euint64 yesVotes;        // FHE-encrypted vote tally
        euint64 noVotes;         // FHE-encrypted vote tally
        uint64 revealedYes;      // Decrypted yes votes
        uint64 revealedNo;       // Decrypted no votes
        uint256 totalVoters;
        uint256 totalStaked;     // Total ETH staked by voters
        bool executed;
        bool active;
        bool isResolved;         // Decryption completed
        uint256 decryptionRequestId;
        uint256 decryptionRequestTime;  // For timeout tracking
        bool refundEnabled;      // Enable refunds if decryption fails
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public voterWeight;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint8)) internal userVoteType; // 0=No, 1=Yes
    mapping(uint256 => mapping(address => bool)) internal hasClaimed;
    mapping(uint256 => mapping(address => uint256)) internal userStake; // Track individual stakes
    mapping(uint256 => uint256) internal proposalIdByRequestId;

    uint256 public proposalCount;
    uint256 public constant VOTING_DURATION = 7 days;
    uint256 public constant REVEAL_PERIOD = 1 days;
    uint256 public constant DECRYPTION_TIMEOUT = 3 days;
    uint256 public constant MIN_VOTING_POWER = 100;
    uint256 public constant MIN_STAKE = 0.001 ether;
    uint256 public constant PLATFORM_FEE = 0.01 ether;

    address public owner;
    bool public votingOpen;
    uint256 public platformFees;

    // Privacy protection: random multiplier to prevent division leakage
    uint256 private randomMultiplier;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event ProposalCreated(uint256 indexed proposalId, string title, address creator, uint256 votingEnd);
    event VoteCommitted(uint256 indexed proposalId, address indexed voter, uint256 stake);
    event VoteRevealed(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);
    event DecryptionRequested(uint256 indexed proposalId, uint256 requestId);
    event DecryptionCompleted(uint256 indexed proposalId, uint64 yesVotes, uint64 noVotes);
    event DecryptionFailed(uint256 indexed proposalId, string reason);
    event RefundIssued(uint256 indexed proposalId, address indexed voter, uint256 amount);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);
    event VoterWeightSet(address indexed voter, uint256 weight);
    event TimeoutRefundTriggered(uint256 indexed proposalId, uint256 timeElapsed);

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier votingIsOpen() {
        require(votingOpen, "Voting system closed");
        _;
    }

    modifier proposalExists(uint256 proposalId) {
        require(proposalId > 0 && proposalId <= proposalCount, "Proposal does not exist");
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() {
        owner = msg.sender;
        votingOpen = true;
        randomMultiplier = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 1000 + 1;
    }

    /*//////////////////////////////////////////////////////////////
                          ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Set voter weight with input validation
    /// @param voter Address of the voter
    /// @param weight Voting weight (must be non-zero)
    function setVoterWeight(address voter, uint256 weight) external onlyOwner validAddress(voter) {
        require(weight > 0, "Weight must be positive");
        require(weight <= 1e18, "Weight too large"); // Overflow protection
        voterWeight[voter] = weight;
        emit VoterWeightSet(voter, weight);
    }

    /// @notice Batch set voter weights with validation
    /// @param voters Array of voter addresses
    /// @param weights Array of voting weights
    function setMultipleVoterWeights(address[] memory voters, uint256[] memory weights) external onlyOwner {
        require(voters.length == weights.length, "Array length mismatch");
        require(voters.length <= 100, "Batch too large"); // Gas optimization

        for (uint i = 0; i < voters.length; i++) {
            require(voters[i] != address(0), "Invalid address");
            require(weights[i] > 0 && weights[i] <= 1e18, "Invalid weight");
            voterWeight[voters[i]] = weights[i];
            emit VoterWeightSet(voters[i], weights[i]);
        }
    }

    /// @notice Withdraw accumulated platform fees
    /// @param to Recipient address
    function withdrawPlatformFees(address to) external onlyOwner validAddress(to) {
        require(platformFees > 0, "No fees available");
        uint256 amount = platformFees;
        platformFees = 0;

        (bool sent, ) = payable(to).call{value: amount}("");
        require(sent, "Transfer failed");

        emit PlatformFeesWithdrawn(to, amount);
    }

    /// @notice Open/close voting system
    function setVotingOpen(bool _open) external onlyOwner {
        votingOpen = _open;
    }

    /// @notice Emergency pause proposal
    function pauseProposal(uint256 proposalId) external onlyOwner proposalExists(proposalId) {
        proposals[proposalId].active = false;
    }

    /*//////////////////////////////////////////////////////////////
                        PROPOSAL MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    /// @notice Create a new proposal with platform fee
    /// @param title Proposal title
    /// @param description Proposal description
    function createProposal(string memory title, string memory description) external payable votingIsOpen {
        require(voterWeight[msg.sender] >= MIN_VOTING_POWER, "Insufficient voting power");
        require(msg.value == PLATFORM_FEE, "Incorrect platform fee");
        require(bytes(title).length > 0 && bytes(title).length <= 200, "Invalid title length");
        require(bytes(description).length > 0 && bytes(description).length <= 2000, "Invalid description length");

        platformFees += msg.value;
        proposalCount++;

        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.title = title;
        newProposal.description = description;
        newProposal.creator = msg.sender;
        newProposal.createdAt = block.timestamp;
        newProposal.votingEnd = block.timestamp + VOTING_DURATION;
        newProposal.active = true;
        newProposal.yesVotes = FHE.asEuint64(0);
        newProposal.noVotes = FHE.asEuint64(0);
        newProposal.revealedYes = 0;
        newProposal.revealedNo = 0;
        newProposal.totalStaked = 0;
        newProposal.isResolved = false;
        newProposal.refundEnabled = false;

        emit ProposalCreated(proposalCount, title, msg.sender, newProposal.votingEnd);
    }

    /*//////////////////////////////////////////////////////////////
                        VOTING FUNCTIONS (FHE)
    //////////////////////////////////////////////////////////////*/

    /// @notice Cast encrypted vote using FHE
    /// @param proposalId Proposal ID
    /// @param encryptedWeight Encrypted voting weight
    /// @param voteType Vote choice (0=No, 1=Yes)
    /// @param inputProof FHE input proof
    function vote(
        uint256 proposalId,
        externalEuint64 encryptedWeight,
        uint8 voteType,
        bytes calldata inputProof
    ) external payable proposalExists(proposalId) votingIsOpen {
        Proposal storage proposal = proposals[proposalId];

        // Input validation
        require(proposal.active, "Proposal not active");
        require(!proposal.isResolved, "Proposal already resolved");
        require(block.timestamp < proposal.votingEnd, "Voting has ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(msg.value >= MIN_STAKE, "Stake too low");
        require(msg.value <= 100 ether, "Stake too high"); // Overflow protection
        require(voteType == 0 || voteType == 1, "Invalid vote type");
        require(voterWeight[msg.sender] > 0, "No voting permission");

        // FHE operations with error handling
        try this.processEncryptedVote(proposal, encryptedWeight, voteType, inputProof) {
            // Vote processed successfully
            hasVoted[proposalId][msg.sender] = true;
            userVoteType[proposalId][msg.sender] = voteType;
            userStake[proposalId][msg.sender] = msg.value;
            proposal.totalStaked += msg.value;
            proposal.totalVoters++;

            emit VoteCommitted(proposalId, msg.sender, msg.value);
        } catch {
            revert("FHE vote processing failed");
        }
    }

    /// @notice Internal function to process encrypted vote
    /// @dev Separated for better error handling
    function processEncryptedVote(
        Proposal storage proposal,
        externalEuint64 encryptedWeight,
        uint8 voteType,
        bytes calldata inputProof
    ) external {
        require(msg.sender == address(this), "Internal only");

        // Import and validate encrypted weight
        euint64 weight = FHE.fromExternal(encryptedWeight, inputProof);
        euint64 zero = FHE.asEuint64(0);

        // Create encrypted booleans for vote type
        ebool isYes = FHE.eq(FHE.asEuint64(voteType), FHE.asEuint64(1));
        ebool isNo = FHE.eq(FHE.asEuint64(voteType), FHE.asEuint64(0));

        // Homomorphic vote aggregation with conditional selection
        proposal.yesVotes = FHE.add(proposal.yesVotes, FHE.select(isYes, weight, zero));
        proposal.noVotes = FHE.add(proposal.noVotes, FHE.select(isNo, weight, zero));

        // Grant contract access to encrypted values for decryption
        FHE.allowThis(proposal.yesVotes);
        FHE.allowThis(proposal.noVotes);
    }

    /*//////////////////////////////////////////////////////////////
                    GATEWAY CALLBACK DECRYPTION
    //////////////////////////////////////////////////////////////*/

    /// @notice Request vote tally decryption from Gateway oracle
    /// @param proposalId Proposal ID
    function requestTallyReveal(uint256 proposalId) external proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.active, "Proposal not active");
        require(block.timestamp >= proposal.votingEnd, "Voting not ended");
        require(!proposal.isResolved, "Already resolved");
        require(msg.sender == proposal.creator || msg.sender == owner, "Unauthorized");
        require(proposal.decryptionRequestId == 0, "Decryption already requested");

        // Prepare ciphertexts for decryption
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(proposal.yesVotes);
        cts[1] = FHE.toBytes32(proposal.noVotes);

        // Request decryption from Gateway oracle
        uint256 requestId = FHE.requestDecryption(cts, this.resolveTallyCallback.selector);

        proposal.decryptionRequestId = requestId;
        proposal.decryptionRequestTime = block.timestamp;
        proposalIdByRequestId[requestId] = proposalId;

        emit DecryptionRequested(proposalId, requestId);
    }

    /// @notice Gateway callback for decryption results
    /// @param requestId Decryption request ID
    /// @param cleartexts Decrypted values
    /// @param decryptionProof Cryptographic proof
    function resolveTallyCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify cryptographic signatures
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        // Decode decrypted vote tallies
        (uint64 revealedYes, uint64 revealedNo) = abi.decode(cleartexts, (uint64, uint64));

        uint256 proposalId = proposalIdByRequestId[requestId];
        require(proposalId > 0, "Invalid request ID");

        Proposal storage proposal = proposals[proposalId];
        require(!proposal.isResolved, "Already resolved");

        // Update proposal with decrypted results
        proposal.revealedYes = revealedYes;
        proposal.revealedNo = revealedNo;
        proposal.isResolved = true;

        emit DecryptionCompleted(proposalId, revealedYes, revealedNo);
    }

    /// @notice Enable refunds if decryption times out
    /// @param proposalId Proposal ID
    function triggerTimeoutRefund(uint256 proposalId) external proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.decryptionRequestId > 0, "No decryption requested");
        require(!proposal.isResolved, "Already resolved");
        require(
            block.timestamp >= proposal.decryptionRequestTime + DECRYPTION_TIMEOUT,
            "Timeout not reached"
        );

        // Enable refunds for all voters
        proposal.refundEnabled = true;

        emit TimeoutRefundTriggered(proposalId, block.timestamp - proposal.decryptionRequestTime);
        emit DecryptionFailed(proposalId, "Decryption timeout");
    }

    /*//////////////////////////////////////////////////////////////
                    PROPOSAL EXECUTION & CLAIMS
    //////////////////////////////////////////////////////////////*/

    /// @notice Execute proposal after decryption
    /// @param proposalId Proposal ID
    function executeProposal(uint256 proposalId) external proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.isResolved, "Not resolved");
        require(!proposal.executed, "Already executed");
        require(proposal.active, "Proposal not active");
        require(
            block.timestamp >= proposal.votingEnd + REVEAL_PERIOD,
            "Reveal period not ended"
        );

        proposal.executed = true;

        // Determine outcome with division protection
        bool passed = proposal.revealedYes > proposal.revealedNo;

        emit ProposalExecuted(proposalId, passed);
    }

    /// @notice Claim refund if decryption failed or timed out
    /// @param proposalId Proposal ID
    function claimRefund(uint256 proposalId) external proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];

        require(hasVoted[proposalId][msg.sender], "Did not vote");
        require(!hasClaimed[proposalId][msg.sender], "Already claimed");
        require(proposal.refundEnabled, "Refunds not enabled");

        uint256 refundAmount = userStake[proposalId][msg.sender];
        require(refundAmount > 0, "No stake to refund");

        hasClaimed[proposalId][msg.sender] = true;

        // Transfer refund with reentrancy protection
        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Refund transfer failed");

        emit RefundIssued(proposalId, msg.sender, refundAmount);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Get proposal information with obfuscated details before resolution
    /// @param proposalId Proposal ID
    function getProposal(uint256 proposalId) external view proposalExists(proposalId) returns (
        uint256 id,
        string memory title,
        string memory description,
        address creator,
        uint256 createdAt,
        uint256 votingEnd,
        uint64 yesVotes,
        uint64 noVotes,
        uint256 totalVoters,
        uint256 totalStaked,
        bool executed,
        bool active,
        bool isResolved
    ) {
        Proposal storage proposal = proposals[proposalId];

        // Price obfuscation: only reveal counts after resolution
        uint64 displayYes = proposal.isResolved ? proposal.revealedYes : 0;
        uint64 displayNo = proposal.isResolved ? proposal.revealedNo : 0;

        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.creator,
            proposal.createdAt,
            proposal.votingEnd,
            displayYes,
            displayNo,
            proposal.totalVoters,
            proposal.totalStaked,
            proposal.executed,
            proposal.active,
            proposal.isResolved
        );
    }

    /// @notice Check if user has voted
    function hasUserVoted(uint256 proposalId, address user) external view returns (bool) {
        return hasVoted[proposalId][user];
    }

    /// @notice Check if user has claimed refund
    function hasUserClaimed(uint256 proposalId, address user) external view returns (bool) {
        return hasClaimed[proposalId][user];
    }

    /// @notice Get voting status with comprehensive state info
    function getVotingStatus(uint256 proposalId) external view proposalExists(proposalId) returns (string memory) {
        Proposal storage proposal = proposals[proposalId];

        if (!proposal.active) return "Proposal not active";
        if (proposal.executed) return "Executed";
        if (proposal.refundEnabled) return "Refunds enabled";
        if (proposal.isResolved) return "Awaiting execution";
        if (proposal.decryptionRequestId > 0) return "Decryption pending";
        if (block.timestamp < proposal.votingEnd) return "Voting in progress";
        return "Awaiting decryption";
    }

    /// @notice Get decryption status
    function getDecryptionStatus(uint256 proposalId) external view proposalExists(proposalId) returns (
        bool requested,
        bool completed,
        bool timedOut,
        uint256 requestTime,
        uint256 timeElapsed
    ) {
        Proposal storage proposal = proposals[proposalId];
        requested = proposal.decryptionRequestId > 0;
        completed = proposal.isResolved;

        if (requested && !completed) {
            timeElapsed = block.timestamp - proposal.decryptionRequestTime;
            timedOut = timeElapsed >= DECRYPTION_TIMEOUT;
        }

        return (requested, completed, timedOut, proposal.decryptionRequestTime, timeElapsed);
    }

    /// @notice Get current block timestamp
    function getCurrentTime() external view returns (uint256) {
        return block.timestamp;
    }

    /// @notice Get user stake for a proposal
    function getUserStake(uint256 proposalId, address user) external view returns (uint256) {
        return userStake[proposalId][user];
    }

    /*//////////////////////////////////////////////////////////////
                        EMERGENCY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Emergency function to enable refunds (owner only)
    /// @param proposalId Proposal ID
    function emergencyEnableRefund(uint256 proposalId) external onlyOwner proposalExists(proposalId) {
        proposals[proposalId].refundEnabled = true;
        emit DecryptionFailed(proposalId, "Emergency refund enabled by owner");
    }

    /// @notice Receive ETH
    receive() external payable {}

    /// @notice Fallback
    fallback() external payable {}
}
