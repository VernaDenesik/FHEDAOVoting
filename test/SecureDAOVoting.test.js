const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("SecureDAOVoting", function () {
  let votingContract;
  let owner, alice, bob, carol;

  const VOTING_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds
  const REVEAL_PERIOD = 24 * 60 * 60; // 1 day in seconds
  const MIN_VOTING_POWER = 100;

  // Deploy fixture - reusable deployment function
  async function deployVotingFixture() {
    const signers = await ethers.getSigners();
    const [deployer, voter1, voter2, voter3] = signers;

    const SecureDAOVoting = await ethers.getContractFactory("SecureDAOVoting");
    const contract = await SecureDAOVoting.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    // Set initial voter weights
    await contract.setVoterWeight(deployer.address, 1000);
    await contract.setVoterWeight(voter1.address, 500);
    await contract.setVoterWeight(voter2.address, 300);
    await contract.setVoterWeight(voter3.address, 200);

    return {
      contract,
      contractAddress,
      deployer,
      voter1,
      voter2,
      voter3,
      signers
    };
  }

  beforeEach(async function () {
    const fixture = await loadFixture(deployVotingFixture);
    votingContract = fixture.contract;
    owner = fixture.deployer;
    alice = fixture.voter1;
    bob = fixture.voter2;
    carol = fixture.voter3;
  });

  // ========================================
  // 1. Deployment and Initialization Tests
  // ========================================
  describe("Deployment and Initialization", function () {
    it("should deploy successfully with valid address", async function () {
      expect(await votingContract.getAddress()).to.be.properAddress;
    });

    it("should set the correct owner on deployment", async function () {
      expect(await votingContract.owner()).to.equal(owner.address);
    });

    it("should start with voting system open", async function () {
      expect(await votingContract.votingOpen()).to.equal(true);
    });

    it("should start with zero proposals", async function () {
      expect(await votingContract.proposalCount()).to.equal(0);
    });

    it("should initialize voter weights correctly", async function () {
      expect(await votingContract.voterWeight(owner.address)).to.equal(1000);
      expect(await votingContract.voterWeight(alice.address)).to.equal(500);
      expect(await votingContract.voterWeight(bob.address)).to.equal(300);
      expect(await votingContract.voterWeight(carol.address)).to.equal(200);
    });

    it("should have zero voting power for new addresses", async function () {
      const newAddress = ethers.Wallet.createRandom().address;
      expect(await votingContract.voterWeight(newAddress)).to.equal(0);
    });
  });

  // ========================================
  // 2. Voter Weight Management Tests
  // ========================================
  describe("Voter Weight Management", function () {
    it("should allow owner to set individual voter weight", async function () {
      await votingContract.setVoterWeight(alice.address, 750);
      expect(await votingContract.voterWeight(alice.address)).to.equal(750);
    });

    it("should allow owner to set voter weight to zero", async function () {
      await votingContract.setVoterWeight(alice.address, 0);
      expect(await votingContract.voterWeight(alice.address)).to.equal(0);
    });

    it("should allow batch setting of voter weights", async function () {
      const voters = [alice.address, bob.address, carol.address];
      const weights = [600, 400, 250];

      await votingContract.setMultipleVoterWeights(voters, weights);

      expect(await votingContract.voterWeight(alice.address)).to.equal(600);
      expect(await votingContract.voterWeight(bob.address)).to.equal(400);
      expect(await votingContract.voterWeight(carol.address)).to.equal(250);
    });

    it("should reject batch setting with mismatched array lengths", async function () {
      const voters = [alice.address, bob.address];
      const weights = [600]; // Mismatched length

      await expect(
        votingContract.setMultipleVoterWeights(voters, weights)
      ).to.be.revertedWith("Array length mismatch");
    });

    it("should allow owner to update existing voter weight", async function () {
      await votingContract.setVoterWeight(alice.address, 800);
      expect(await votingContract.voterWeight(alice.address)).to.equal(800);

      await votingContract.setVoterWeight(alice.address, 900);
      expect(await votingContract.voterWeight(alice.address)).to.equal(900);
    });

    it("should not allow non-owner to set voter weights", async function () {
      await expect(
        votingContract.connect(alice).setVoterWeight(bob.address, 500)
      ).to.be.revertedWith("Only owner can operate");
    });

    it("should not allow non-owner to batch set voter weights", async function () {
      const voters = [alice.address];
      const weights = [600];

      await expect(
        votingContract.connect(alice).setMultipleVoterWeights(voters, weights)
      ).to.be.revertedWith("Only owner can operate");
    });
  });

  // ========================================
  // 3. Proposal Creation Tests
  // ========================================
  describe("Proposal Creation", function () {
    it("should allow creating proposal with sufficient voting power", async function () {
      const title = "Protocol Upgrade";
      const description = "Upgrade to version 2.0";

      await votingContract.createProposal(title, description);

      const proposal = await votingContract.getProposal(1);
      expect(proposal.title).to.equal(title);
      expect(proposal.description).to.equal(description);
      expect(proposal.creator).to.equal(owner.address);
      expect(proposal.active).to.equal(true);
      expect(proposal.executed).to.equal(false);
    });

    it("should increment proposal count correctly", async function () {
      await votingContract.createProposal("Proposal 1", "Description 1");
      expect(await votingContract.proposalCount()).to.equal(1);

      await votingContract.createProposal("Proposal 2", "Description 2");
      expect(await votingContract.proposalCount()).to.equal(2);

      await votingContract.createProposal("Proposal 3", "Description 3");
      expect(await votingContract.proposalCount()).to.equal(3);
    });

    it("should set correct voting end time", async function () {
      const tx = await votingContract.createProposal("Test", "Description");
      const receipt = await tx.wait();
      const blockTimestamp = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;

      const proposal = await votingContract.getProposal(1);
      const expectedEndTime = BigInt(blockTimestamp) + BigInt(VOTING_DURATION);

      expect(proposal.votingEnd).to.equal(expectedEndTime);
    });

    it("should reject proposal creation with insufficient voting power", async function () {
      const newVoter = (await ethers.getSigners())[4];
      await votingContract.setVoterWeight(newVoter.address, MIN_VOTING_POWER - 1);

      await expect(
        votingContract.connect(newVoter).createProposal("Test", "Test")
      ).to.be.revertedWith("Insufficient voting power");
    });

    it("should reject proposal creation with zero voting power", async function () {
      const newVoter = (await ethers.getSigners())[4];

      await expect(
        votingContract.connect(newVoter).createProposal("Test", "Test")
      ).to.be.revertedWith("Insufficient voting power");
    });

    it("should reject proposal creation when voting system is closed", async function () {
      await votingContract.setVotingOpen(false);

      await expect(
        votingContract.createProposal("Test", "Description")
      ).to.be.revertedWith("Voting system is closed");
    });

    it("should emit ProposalCreated event with correct parameters", async function () {
      const title = "Test Proposal";

      await expect(votingContract.createProposal(title, "Description"))
        .to.emit(votingContract, "ProposalCreated")
        .withArgs(1, title, owner.address);
    });

    it("should allow multiple users to create proposals", async function () {
      await votingContract.connect(owner).createProposal("Owner Proposal", "By Owner");
      await votingContract.connect(alice).createProposal("Alice Proposal", "By Alice");
      await votingContract.connect(bob).createProposal("Bob Proposal", "By Bob");

      expect(await votingContract.proposalCount()).to.equal(3);

      const proposal1 = await votingContract.getProposal(1);
      const proposal2 = await votingContract.getProposal(2);
      const proposal3 = await votingContract.getProposal(3);

      expect(proposal1.creator).to.equal(owner.address);
      expect(proposal2.creator).to.equal(alice.address);
      expect(proposal3.creator).to.equal(bob.address);
    });
  });

  // ========================================
  // 4. Vote Commitment Tests
  // ========================================
  describe("Vote Commitment", function () {
    let proposalId;

    beforeEach(async function () {
      await votingContract.createProposal("Test Proposal", "Description");
      proposalId = 1;
    });

    it("should allow committing a vote with valid hash", async function () {
      const support = true;
      const nonce = 12345;
      const voteHash = await votingContract.connect(alice).generateVoteHash(support, nonce);

      await votingContract.connect(alice).commitVote(proposalId, voteHash);

      expect(await votingContract.hasUserVoted(proposalId, alice.address)).to.equal(true);
    });

    it("should increment total voters on commit", async function () {
      const voteHash1 = await votingContract.connect(alice).generateVoteHash(true, 111);
      const voteHash2 = await votingContract.connect(bob).generateVoteHash(false, 222);

      await votingContract.connect(alice).commitVote(proposalId, voteHash1);
      await votingContract.connect(bob).commitVote(proposalId, voteHash2);

      const proposal = await votingContract.getProposal(proposalId);
      expect(proposal.totalVoters).to.equal(2);
    });

    it("should reject commit from voter with no voting power", async function () {
      const newVoter = (await ethers.getSigners())[4];
      const voteHash = await votingContract.connect(newVoter).generateVoteHash(true, 123);

      await expect(
        votingContract.connect(newVoter).commitVote(proposalId, voteHash)
      ).to.be.revertedWith("No voting permission");
    });

    it("should reject double voting in commit phase", async function () {
      const voteHash = await votingContract.connect(alice).generateVoteHash(true, 123);

      await votingContract.connect(alice).commitVote(proposalId, voteHash);

      await expect(
        votingContract.connect(alice).commitVote(proposalId, voteHash)
      ).to.be.revertedWith("Already voted");
    });

    it("should reject commit after voting period ends", async function () {
      await time.increase(VOTING_DURATION + 1);

      const voteHash = await votingContract.connect(alice).generateVoteHash(true, 123);

      await expect(
        votingContract.connect(alice).commitVote(proposalId, voteHash)
      ).to.be.revertedWith("Voting has ended");
    });

    it("should reject commit for non-existent proposal", async function () {
      const voteHash = await votingContract.connect(alice).generateVoteHash(true, 123);

      await expect(
        votingContract.connect(alice).commitVote(999, voteHash)
      ).to.be.revertedWith("Proposal does not exist");
    });

    it("should reject commit when voting system is closed", async function () {
      const voteHash = await votingContract.connect(alice).generateVoteHash(true, 123);

      await votingContract.setVotingOpen(false);

      await expect(
        votingContract.connect(alice).commitVote(proposalId, voteHash)
      ).to.be.revertedWith("Voting system is closed");
    });

    it("should emit VoteCommitted event on successful commit", async function () {
      const voteHash = await votingContract.connect(alice).generateVoteHash(true, 123);

      await expect(votingContract.connect(alice).commitVote(proposalId, voteHash))
        .to.emit(votingContract, "VoteCommitted")
        .withArgs(proposalId, alice.address);
    });

    it("should accept different vote hashes from different users", async function () {
      const hash1 = await votingContract.connect(alice).generateVoteHash(true, 111);
      const hash2 = await votingContract.connect(bob).generateVoteHash(false, 222);
      const hash3 = await votingContract.connect(carol).generateVoteHash(true, 333);

      await votingContract.connect(alice).commitVote(proposalId, hash1);
      await votingContract.connect(bob).commitVote(proposalId, hash2);
      await votingContract.connect(carol).commitVote(proposalId, hash3);

      expect(await votingContract.hasUserVoted(proposalId, alice.address)).to.equal(true);
      expect(await votingContract.hasUserVoted(proposalId, bob.address)).to.equal(true);
      expect(await votingContract.hasUserVoted(proposalId, carol.address)).to.equal(true);
    });
  });

  // ========================================
  // 5. Vote Revelation Tests
  // ========================================
  describe("Vote Revelation", function () {
    let proposalId;
    const support = true;
    const nonce = 54321;

    beforeEach(async function () {
      await votingContract.createProposal("Test Proposal", "Description");
      proposalId = 1;

      const voteHash = await votingContract.connect(alice).generateVoteHash(support, nonce);
      await votingContract.connect(alice).commitVote(proposalId, voteHash);

      // Fast forward past voting period
      await time.increase(VOTING_DURATION + 1);
    });

    it("should allow revealing a valid vote", async function () {
      await votingContract.connect(alice).revealVote(proposalId, support, nonce);

      const proposal = await votingContract.getProposal(proposalId);
      expect(proposal.yesVotes).to.equal(500); // alice's weight
    });

    it("should count YES votes with correct weight", async function () {
      await votingContract.connect(alice).revealVote(proposalId, support, nonce);

      const proposal = await votingContract.getProposal(proposalId);
      expect(proposal.yesVotes).to.equal(500);
      expect(proposal.noVotes).to.equal(0);
    });

    it("should count NO votes with correct weight", async function () {
      const noSupport = false;
      const noNonce = 99999;

      // Create new proposal and commit NO vote
      await time.increase(-(VOTING_DURATION + 1)); // Reset time
      await votingContract.createProposal("New Proposal", "Desc");
      const newProposalId = 2;

      const noHash = await votingContract.connect(bob).generateVoteHash(noSupport, noNonce);
      await votingContract.connect(bob).commitVote(newProposalId, noHash);

      await time.increase(VOTING_DURATION + 1);
      await votingContract.connect(bob).revealVote(newProposalId, noSupport, noNonce);

      const proposal = await votingContract.getProposal(newProposalId);
      expect(proposal.noVotes).to.equal(300); // bob's weight
    });

    it("should reject reveal with wrong nonce", async function () {
      const wrongNonce = 11111;

      await expect(
        votingContract.connect(alice).revealVote(proposalId, support, wrongNonce)
      ).to.be.revertedWith("Vote verification failed");
    });

    it("should reject reveal with wrong support value", async function () {
      await expect(
        votingContract.connect(alice).revealVote(proposalId, !support, nonce)
      ).to.be.revertedWith("Vote verification failed");
    });

    it("should reject reveal before voting period ends", async function () {
      await votingContract.createProposal("New Proposal", "Description");
      const newProposalId = 2;

      const voteHash = await votingContract.connect(alice).generateVoteHash(true, 777);
      await votingContract.connect(alice).commitVote(newProposalId, voteHash);

      await expect(
        votingContract.connect(alice).revealVote(newProposalId, true, 777)
      ).to.be.revertedWith("Voting not ended yet");
    });

    it("should reject reveal from non-participant", async function () {
      await expect(
        votingContract.connect(bob).revealVote(proposalId, true, 123)
      ).to.be.revertedWith("Did not participate in voting");
    });

    it("should emit VoteRevealed event on successful reveal", async function () {
      await expect(votingContract.connect(alice).revealVote(proposalId, support, nonce))
        .to.emit(votingContract, "VoteRevealed")
        .withArgs(proposalId, alice.address, support);
    });

    it("should prevent double reveal by clearing hash", async function () {
      await votingContract.connect(alice).revealVote(proposalId, support, nonce);

      // Try to reveal again
      await expect(
        votingContract.connect(alice).revealVote(proposalId, support, nonce)
      ).to.be.revertedWith("Vote verification failed");
    });
  });

  // ========================================
  // 6. Proposal Execution Tests
  // ========================================
  describe("Proposal Execution", function () {
    let proposalId;

    beforeEach(async function () {
      await votingContract.createProposal("Test Proposal", "Description");
      proposalId = 1;

      // Commit and reveal votes
      const yesHash = await votingContract.connect(alice).generateVoteHash(true, 111);
      const noHash = await votingContract.connect(bob).generateVoteHash(false, 222);

      await votingContract.connect(alice).commitVote(proposalId, yesHash);
      await votingContract.connect(bob).commitVote(proposalId, noHash);

      await time.increase(VOTING_DURATION + 1);

      await votingContract.connect(alice).revealVote(proposalId, true, 111);
      await votingContract.connect(bob).revealVote(proposalId, false, 222);
    });

    it("should allow execution after reveal period", async function () {
      await time.increase(REVEAL_PERIOD + 1);

      await votingContract.executeProposal(proposalId);

      const proposal = await votingContract.getProposal(proposalId);
      expect(proposal.executed).to.equal(true);
    });

    it("should reject execution during reveal period", async function () {
      await expect(
        votingContract.executeProposal(proposalId)
      ).to.be.revertedWith("Reveal period not ended");
    });

    it("should reject double execution", async function () {
      await time.increase(REVEAL_PERIOD + 1);

      await votingContract.executeProposal(proposalId);

      await expect(
        votingContract.executeProposal(proposalId)
      ).to.be.revertedWith("Proposal already executed");
    });

    it("should emit ProposalExecuted event with PASSED result", async function () {
      await time.increase(REVEAL_PERIOD + 1);

      await expect(votingContract.executeProposal(proposalId))
        .to.emit(votingContract, "ProposalExecuted")
        .withArgs(proposalId, true); // Yes: 500, No: 300, so passed
    });

    it("should emit ProposalExecuted event with REJECTED result", async function () {
      // Create new proposal where NO wins
      await votingContract.createProposal("Rejected Proposal", "Desc");
      const newId = 2;

      const noHash1 = await votingContract.connect(bob).generateVoteHash(false, 333);
      const noHash2 = await votingContract.connect(carol).generateVoteHash(false, 444);
      const yesHash = await votingContract.connect(alice).generateVoteHash(true, 555);

      await votingContract.connect(bob).commitVote(newId, noHash1);
      await votingContract.connect(carol).commitVote(newId, noHash2);
      await votingContract.connect(alice).commitVote(newId, yesHash);

      await time.increase(VOTING_DURATION + 1);

      await votingContract.connect(bob).revealVote(newId, false, 333);
      await votingContract.connect(carol).revealVote(newId, false, 444);
      await votingContract.connect(alice).revealVote(newId, true, 555);

      await time.increase(REVEAL_PERIOD + 1);

      // No: 300+200=500, Yes: 500, so NO wins (needs > not >=)
      // Actually Yes would still win, let's use owner
      await votingContract.createProposal("Another Proposal", "Desc");
      const id3 = 3;

      const ownerNoHash = await votingContract.connect(owner).generateVoteHash(false, 666);
      await votingContract.connect(owner).commitVote(id3, ownerNoHash);

      await time.increase(VOTING_DURATION + 1);
      await votingContract.connect(owner).revealVote(id3, false, 666);

      await time.increase(REVEAL_PERIOD + 1);

      await expect(votingContract.executeProposal(id3))
        .to.emit(votingContract, "ProposalExecuted")
        .withArgs(id3, false); // No: 1000, Yes: 0
    });

    it("should reject execution of non-existent proposal", async function () {
      await expect(
        votingContract.executeProposal(999)
      ).to.be.revertedWith("Proposal does not exist");
    });
  });

  // ========================================
  // 7. Voting Status Tests
  // ========================================
  describe("Voting Status", function () {
    let proposalId;

    beforeEach(async function () {
      await votingContract.createProposal("Test Proposal", "Description");
      proposalId = 1;
    });

    it("should return 'Voting in progress' during voting period", async function () {
      expect(await votingContract.getVotingStatus(proposalId)).to.equal("Voting in progress");
    });

    it("should return 'Reveal phase' after voting ends", async function () {
      await time.increase(VOTING_DURATION + 1);
      expect(await votingContract.getVotingStatus(proposalId)).to.equal("Reveal phase");
    });

    it("should return 'Awaiting execution' after reveal period", async function () {
      await time.increase(VOTING_DURATION + REVEAL_PERIOD + 2);
      expect(await votingContract.getVotingStatus(proposalId)).to.equal("Awaiting execution");
    });

    it("should return 'Executed' after execution", async function () {
      await time.increase(VOTING_DURATION + REVEAL_PERIOD + 2);
      await votingContract.executeProposal(proposalId);
      expect(await votingContract.getVotingStatus(proposalId)).to.equal("Executed");
    });

    it("should return 'Proposal not active' for paused proposal", async function () {
      await votingContract.pauseProposal(proposalId);
      expect(await votingContract.getVotingStatus(proposalId)).to.equal("Proposal not active");
    });

    it("should return 'Proposal does not exist' for invalid ID", async function () {
      expect(await votingContract.getVotingStatus(999)).to.equal("Proposal does not exist");
      expect(await votingContract.getVotingStatus(0)).to.equal("Proposal does not exist");
    });
  });

  // ========================================
  // 8. System Controls Tests
  // ========================================
  describe("System Controls", function () {
    it("should allow owner to close voting system", async function () {
      await votingContract.setVotingOpen(false);
      expect(await votingContract.votingOpen()).to.equal(false);
    });

    it("should allow owner to reopen voting system", async function () {
      await votingContract.setVotingOpen(false);
      await votingContract.setVotingOpen(true);
      expect(await votingContract.votingOpen()).to.equal(true);
    });

    it("should prevent proposal creation when system is closed", async function () {
      await votingContract.setVotingOpen(false);

      await expect(
        votingContract.createProposal("Test", "Description")
      ).to.be.revertedWith("Voting system is closed");
    });

    it("should allow owner to pause individual proposal", async function () {
      await votingContract.createProposal("Test", "Description");
      await votingContract.pauseProposal(1);

      const proposal = await votingContract.getProposal(1);
      expect(proposal.active).to.equal(false);
    });

    it("should not allow non-owner to close voting system", async function () {
      await expect(
        votingContract.connect(alice).setVotingOpen(false)
      ).to.be.revertedWith("Only owner can operate");
    });

    it("should not allow non-owner to pause proposal", async function () {
      await votingContract.createProposal("Test", "Description");

      await expect(
        votingContract.connect(alice).pauseProposal(1)
      ).to.be.revertedWith("Only owner can operate");
    });
  });

  // ========================================
  // 9. View Functions Tests
  // ========================================
  describe("View Functions", function () {
    it("should return current block timestamp", async function () {
      const contractTime = await votingContract.getCurrentTime();
      const blockTime = (await ethers.provider.getBlock('latest')).timestamp;

      expect(contractTime).to.be.closeTo(BigInt(blockTime), 5n);
    });

    it("should correctly report if user has voted", async function () {
      await votingContract.createProposal("Test", "Desc");
      const voteHash = await votingContract.connect(alice).generateVoteHash(true, 123);

      expect(await votingContract.hasUserVoted(1, alice.address)).to.equal(false);

      await votingContract.connect(alice).commitVote(1, voteHash);

      expect(await votingContract.hasUserVoted(1, alice.address)).to.equal(true);
    });

    it("should generate consistent vote hashes", async function () {
      const hash1 = await votingContract.connect(alice).generateVoteHash(true, 12345);
      const hash2 = await votingContract.connect(alice).generateVoteHash(true, 12345);

      expect(hash1).to.equal(hash2);
    });

    it("should generate different hashes for different inputs", async function () {
      const hash1 = await votingContract.connect(alice).generateVoteHash(true, 111);
      const hash2 = await votingContract.connect(alice).generateVoteHash(false, 111);
      const hash3 = await votingContract.connect(alice).generateVoteHash(true, 222);
      const hash4 = await votingContract.connect(bob).generateVoteHash(true, 111);

      expect(hash1).to.not.equal(hash2);
      expect(hash1).to.not.equal(hash3);
      expect(hash1).to.not.equal(hash4);
    });
  });

  // ========================================
  // 10. Edge Cases and Boundary Tests
  // ========================================
  describe("Edge Cases and Boundary Conditions", function () {
    it("should handle proposal with zero votes", async function () {
      await votingContract.createProposal("No Votes Proposal", "Description");

      await time.increase(VOTING_DURATION + REVEAL_PERIOD + 2);

      await votingContract.executeProposal(1);

      const proposal = await votingContract.getProposal(1);
      expect(proposal.yesVotes).to.equal(0);
      expect(proposal.noVotes).to.equal(0);
      expect(proposal.executed).to.equal(true);
    });

    it("should handle tie votes (NO wins on tie)", async function () {
      await votingContract.createProposal("Tie Proposal", "Description");

      // Set equal weights
      await votingContract.setVoterWeight(alice.address, 500);
      await votingContract.setVoterWeight(bob.address, 500);

      const yesHash = await votingContract.connect(alice).generateVoteHash(true, 111);
      const noHash = await votingContract.connect(bob).generateVoteHash(false, 222);

      await votingContract.connect(alice).commitVote(1, yesHash);
      await votingContract.connect(bob).commitVote(1, noHash);

      await time.increase(VOTING_DURATION + 1);

      await votingContract.connect(alice).revealVote(1, true, 111);
      await votingContract.connect(bob).revealVote(1, false, 222);

      await time.increase(REVEAL_PERIOD + 1);

      await expect(votingContract.executeProposal(1))
        .to.emit(votingContract, "ProposalExecuted")
        .withArgs(1, false); // Tie means NO wins (yesVotes must be > noVotes)
    });

    it("should handle minimum voting power (100)", async function () {
      const newVoter = (await ethers.getSigners())[4];
      await votingContract.setVoterWeight(newVoter.address, MIN_VOTING_POWER);

      await expect(
        votingContract.connect(newVoter).createProposal("Min Power", "Test")
      ).to.not.be.reverted;
    });

    it("should handle maximum uint256 nonce", async function () {
      await votingContract.createProposal("Max Nonce", "Test");
      const maxNonce = ethers.MaxUint256;

      const voteHash = await votingContract.connect(alice).generateVoteHash(true, maxNonce);
      await votingContract.connect(alice).commitVote(1, voteHash);

      await time.increase(VOTING_DURATION + 1);

      await expect(
        votingContract.connect(alice).revealVote(1, true, maxNonce)
      ).to.not.be.reverted;
    });

    it("should handle long proposal titles and descriptions", async function () {
      const longTitle = "A".repeat(200);
      const longDesc = "B".repeat(1000);

      await expect(
        votingContract.createProposal(longTitle, longDesc)
      ).to.not.be.reverted;

      const proposal = await votingContract.getProposal(1);
      expect(proposal.title).to.equal(longTitle);
      expect(proposal.description).to.equal(longDesc);
    });

    it("should handle empty proposal title and description", async function () {
      await expect(
        votingContract.createProposal("", "")
      ).to.not.be.reverted;
    });
  });

  // ========================================
  // 11. Gas Optimization Tests
  // ========================================
  describe("Gas Optimization", function () {
    it("should use reasonable gas for proposal creation", async function () {
      const tx = await votingContract.createProposal("Gas Test", "Description");
      const receipt = await tx.wait();

      // Should be less than 200k gas
      expect(receipt.gasUsed).to.be.lt(200000);
    });

    it("should use reasonable gas for vote commit", async function () {
      await votingContract.createProposal("Test", "Desc");
      const voteHash = await votingContract.connect(alice).generateVoteHash(true, 123);

      const tx = await votingContract.connect(alice).commitVote(1, voteHash);
      const receipt = await tx.wait();

      // Should be less than 100k gas
      expect(receipt.gasUsed).to.be.lt(100000);
    });

    it("should use reasonable gas for vote reveal", async function () {
      await votingContract.createProposal("Test", "Desc");
      const voteHash = await votingContract.connect(alice).generateVoteHash(true, 123);
      await votingContract.connect(alice).commitVote(1, voteHash);

      await time.increase(VOTING_DURATION + 1);

      const tx = await votingContract.connect(alice).revealVote(1, true, 123);
      const receipt = await tx.wait();

      // Should be less than 100k gas
      expect(receipt.gasUsed).to.be.lt(100000);
    });
  });

  // ========================================
  // 12. Integration Tests
  // ========================================
  describe("Integration - Complete Voting Cycle", function () {
    it("should complete full voting lifecycle successfully", async function () {
      // 1. Create proposal
      await votingContract.createProposal("Integration Test", "Full cycle test");

      // 2. Multiple voters commit
      const aliceHash = await votingContract.connect(alice).generateVoteHash(true, 111);
      const bobHash = await votingContract.connect(bob).generateVoteHash(true, 222);
      const carolHash = await votingContract.connect(carol).generateVoteHash(false, 333);

      await votingContract.connect(alice).commitVote(1, aliceHash);
      await votingContract.connect(bob).commitVote(1, bobHash);
      await votingContract.connect(carol).commitVote(1, carolHash);

      // 3. Wait for voting to end
      await time.increase(VOTING_DURATION + 1);

      // 4. Reveal votes
      await votingContract.connect(alice).revealVote(1, true, 111);
      await votingContract.connect(bob).revealVote(1, true, 222);
      await votingContract.connect(carol).revealVote(1, false, 333);

      // 5. Check vote counts
      let proposal = await votingContract.getProposal(1);
      expect(proposal.yesVotes).to.equal(800); // alice(500) + bob(300)
      expect(proposal.noVotes).to.equal(200);   // carol(200)

      // 6. Wait for reveal period
      await time.increase(REVEAL_PERIOD + 1);

      // 7. Execute proposal
      await votingContract.executeProposal(1);

      // 8. Verify execution
      proposal = await votingContract.getProposal(1);
      expect(proposal.executed).to.equal(true);
      expect(await votingContract.getVotingStatus(1)).to.equal("Executed");
    });

    it("should handle multiple concurrent proposals", async function () {
      // Create 3 proposals
      await votingContract.createProposal("Proposal 1", "First");
      await votingContract.createProposal("Proposal 2", "Second");
      await votingContract.createProposal("Proposal 3", "Third");

      // Vote on all 3
      for (let i = 1; i <= 3; i++) {
        const hash = await votingContract.connect(alice).generateVoteHash(true, 100 + i);
        await votingContract.connect(alice).commitVote(i, hash);
      }

      expect(await votingContract.hasUserVoted(1, alice.address)).to.equal(true);
      expect(await votingContract.hasUserVoted(2, alice.address)).to.equal(true);
      expect(await votingContract.hasUserVoted(3, alice.address)).to.equal(true);
    });
  });
});
