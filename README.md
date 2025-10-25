# 🗳️ Secure Governance Voting System

[![Coverage](https://codecov.io/gh/your-repo/governance-voting/branch/main/graph/badge.svg)](https://codecov.io/gh/your-repo/governance-voting)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org/)

> A privacy-preserving DAO voting platform using cryptographic commit-reveal schemes to ensure fair, manipulation-resistant governance on Ethereum.

**Website**: [https://fhedao-voting.vercel.app/](https://fhedao-voting.vercel.app/)

**Demo Video**: Available in project repository (`demo.mp4`)
---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [🔧 Technical Implementation](#-technical-implementation)
- [🧪 Testing](#-testing)
- [📦 Deployment](#-deployment)
- [🔐 Security & Privacy](#-security--privacy)
- [💡 Usage Guide](#-usage-guide)
- [⚙️ Configuration](#️-configuration)
- [🛠️ Development](#️-development)
- [📊 CI/CD Pipeline](#-cicd-pipeline)
- [🐛 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🔐 Privacy-Preserving Voting
- **Commit-Reveal Mechanism** - Two-phase cryptographic voting prevents vote manipulation
- **Hash-Based Commitments** - Cryptographic proof ensures vote integrity
- **Hidden Votes** - Individual choices remain private during voting period
- **Anti-Coercion** - Eliminates vote buying and strategic voting

### 🏛️ Decentralized Governance
- **Proposal System** - Community-driven governance proposal creation
- **Weighted Democracy** - Token-based voting power for fair representation
- **Automatic Execution** - Self-executing proposals upon approval
- **Full Transparency** - All actions verifiable on blockchain

### 🛡️ Enterprise-Grade Security
- **72+ Test Cases** - Comprehensive test coverage (>95% target)
- **Static Analysis** - Automated Slither security scanning
- **Gas Optimized** - Advanced Yul optimizer for efficiency
- **Multi-Version Testing** - Validated on Node.js 18.x and 20.x

### ⚡ Developer Experience
- **Complete Toolchain** - Hardhat + ESLint + Solhint + Prettier
- **Pre-commit Hooks** - Automated quality gates with Husky
- **CI/CD Pipeline** - GitHub Actions with 5 parallel jobs
- **Comprehensive Docs** - 9 documentation files covering all aspects

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                  Governance Voting System                │
└─────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Users/Voters  │  │   Proposal      │  │   Admin/Owner   │
│                 │  │   Creators      │  │                 │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ▼
                ┌─────────────────────────────┐
                │  SecureDAOVoting Contract   │
                │  (Solidity 0.8.24)          │
                └─────────────┬───────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌──────────────────┐   ┌──────────────┐
│ Commit Phase  │   │  Reveal Phase    │   │  Execution   │
│               │   │                  │   │              │
│ • Hash votes  │   │ • Disclose vote  │   │ • Count      │
│ • Store hash  │   │ • Verify proof   │   │ • Execute    │
│ • Time-locked │   │ • Tally results  │   │ • Complete   │
└───────────────┘   └──────────────────┘   └──────────────┘
```

### Smart Contract Architecture

```
SecureDAOVoting.sol
├── Proposal Management
│   ├── createProposal(title, description)
│   ├── executeProposal(proposalId)
│   └── getProposal(proposalId) → Proposal
│
├── Commit-Reveal Voting
│   ├── commitVote(proposalId, voteHash)
│   ├── revealVote(proposalId, support, nonce)
│   └── generateVoteHash(support, nonce) → bytes32
│
├── Voter Weight Management
│   ├── setVoterWeight(voter, weight)
│   └── getVoterWeight(voter) → uint256
│
├── System Controls
│   ├── setPaused(paused)
│   └── setMinVotingPower(minPower)
│
└── View Functions
    ├── hasVoted(proposalId, voter) → bool
    ├── getVotingStatus(proposalId) → VotingStatus
    └── proposalCount() → uint256
```

### Data Flow

```
1. Proposal Creation
   User → createProposal() → Store Proposal → Emit ProposalCreated

2. Vote Commitment
   Voter → Generate Hash → commitVote() → Store Hash → Emit VoteCommitted

3. Vote Revelation
   Voter → revealVote() → Verify Hash → Update Tally → Emit VoteRevealed

4. Proposal Execution
   Anyone → executeProposal() → Check Quorum → Execute → Emit ProposalExecuted
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 7.0.0
- **Git**

### Installation

```bash
# Clone repository
git clone <repository-url>
cd governance-voting-system

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration
```

### Local Development

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Start local node (Terminal 1)
npm run node

# Run simulation (Terminal 2)
npm run simulate
```

### Deploy to Sepolia

```bash
# Deploy contract
npm run deploy:sepolia

# Verify on Etherscan
npm run verify

# Interact with contract
npm run interact
```

---

## 🔧 Technical Implementation

### Smart Contract Core

**Encrypted Vote Commitment**
```solidity
// Generate vote hash
function generateVoteHash(bool support, uint256 nonce)
    public
    view
    returns (bytes32)
{
    return keccak256(abi.encodePacked(msg.sender, support, nonce));
}

// Commit vote
function commitVote(uint256 proposalId, bytes32 voteHash)
    external
    whenNotPaused
{
    require(proposal.votingDeadline > block.timestamp, "Voting ended");
    require(!hasVoted[proposalId][msg.sender], "Already voted");

    voteCommitments[proposalId][msg.sender] = voteHash;
    hasVoted[proposalId][msg.sender] = true;

    emit VoteCommitted(proposalId, msg.sender);
}
```

**Cryptographic Verification**
```solidity
// Reveal and verify vote
function revealVote(uint256 proposalId, bool support, uint256 nonce)
    external
    whenNotPaused
{
    bytes32 storedHash = voteCommitments[proposalId][msg.sender];
    bytes32 revealedHash = generateVoteHash(support, nonce);

    require(storedHash == revealedHash, "Hash mismatch");

    uint256 weight = voterWeights[msg.sender];
    if (support) {
        proposal.yesVotes += weight;
    } else {
        proposal.noVotes += weight;
    }

    emit VoteRevealed(proposalId, msg.sender, support, weight);
}
```

**Weighted Voting System**
```solidity
// Set voter weight (owner only)
function setVoterWeight(address voter, uint256 weight)
    external
    onlyOwner
{
    voterWeights[voter] = weight;
    emit VoterWeightSet(voter, weight);
}

// Proposal execution
function executeProposal(uint256 proposalId)
    external
    whenNotPaused
{
    require(proposal.yesVotes > proposal.noVotes, "Proposal rejected");
    proposal.executed = true;
    emit ProposalExecuted(proposalId);
}
```

### Frontend Integration Example

```javascript
const { ethers } = require("hardhat");

// Connect to contract
const contract = await ethers.getContractAt(
    "SecureDAOVoting",
    "0x08C09eC71Fe5CF02ce7E9bcfCBC406e052EA0248"
);

// Create proposal
const tx = await contract.createProposal(
    "Upgrade Protocol",
    "Proposal to implement new features"
);
await tx.wait();

// Commit vote
const nonce = Math.floor(Math.random() * 1000000);
const voteHash = await contract.generateVoteHash(true, nonce);
await contract.commitVote(proposalId, voteHash);

// Save nonce securely for reveal phase!
localStorage.setItem(`nonce_${proposalId}`, nonce);

// Later: Reveal vote
const savedNonce = localStorage.getItem(`nonce_${proposalId}`);
await contract.revealVote(proposalId, true, savedNonce);
```

### Technology Stack

**Smart Contract Layer**
- **Language**: Solidity 0.8.24
- **Framework**: Hardhat 2.19+
- **Libraries**: OpenZeppelin Contracts 5.0
- **Network**: Ethereum (Sepolia Testnet)
- **Optimization**: Yul optimizer with 200 runs

**Development Tools**
- **Testing**: Mocha + Chai (72 test cases)
- **Coverage**: Solidity Coverage (>95% target)
- **Linting**: Solhint + ESLint + Prettier
- **Security**: Slither static analysis
- **Gas Analysis**: Hardhat Gas Reporter

**CI/CD Pipeline**
- **Platform**: GitHub Actions
- **Testing**: Multi-version (Node 18.x, 20.x)
- **Quality**: Automated code quality checks
- **Security**: Automated vulnerability scanning
- **Coverage**: Codecov integration

---

## 🧪 Testing

### Test Coverage

The project includes **72 comprehensive test cases** organized into 12 categories:

```
✅ 72 Test Cases
├── Deployment & Initialization (6 tests)
├── Voter Weight Management (7 tests)
├── Proposal Creation (8 tests)
├── Vote Commitment (9 tests)
├── Vote Revelation (8 tests)
├── Proposal Execution (6 tests)
├── Voting Status (6 tests)
├── System Controls (6 tests)
├── View Functions (4 tests)
├── Edge Cases (7 tests)
├── Gas Optimization (3 tests)
└── Integration Tests (2 tests)
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run coverage

# Run with gas reporting
npm run gas-report

# Run specific test file
npx hardhat test test/SecureDAOVoting.test.js
```

### Test Output Example

```
SecureDAOVoting
  Deployment and Initialization
    ✓ Should deploy with correct initial values
    ✓ Should set deployer as owner
    ✓ Should start with zero proposals

  Vote Commitment
    ✓ Should allow voter to commit vote
    ✓ Should emit VoteCommitted event
    ✓ Should prevent double voting (52ms)
    ✓ Should reject votes after deadline

  72 passing (3.2s)
```

### Coverage Report

```
----------------------|----------|----------|----------|----------|
File                  |  % Stmts | % Branch |  % Funcs |  % Lines |
----------------------|----------|----------|----------|----------|
SecureDAOVoting.sol   |    98.15 |    95.83 |   100.00 |    98.46 |
----------------------|----------|----------|----------|----------|
All files             |    98.15 |    95.83 |   100.00 |    98.46 |
----------------------|----------|----------|----------|----------|
```

For detailed testing documentation, see [TESTING.md](TESTING.md).

---

## 📦 Deployment

### Network Configuration

**Sepolia Testnet**
- **Contract Address**: `0x08C09eC71Fe5CF02ce7E9bcfCBC406e052EA0248`
- **Chain ID**: 11155111
- **Block Explorer**: [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x08C09eC71Fe5CF02ce7E9bcfCBC406e052EA0248)
- **Faucet**: [Sepolia Faucet](https://sepoliafaucet.com/)

### Deployment Process

**Step 1: Configure Environment**
```bash
# Copy environment template
cp .env.example .env
```

**Edit `.env`:**
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_without_0x_prefix
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Step 2: Deploy Contract**
```bash
npm run deploy:sepolia
```

**Output:**
```
Deploying SecureDAOVoting...
Network: sepolia
Deployer: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5
Balance: 1.5 ETH

✅ Contract deployed to: 0x08C09eC71Fe5CF02ce7E9bcfCBC406e052EA0248
📊 Gas used: 2,458,392
💰 Deployment cost: 0.0123 ETH

Deployment info saved to: deployments/sepolia.json
```

**Step 3: Verify on Etherscan**
```bash
npm run verify
```

**Step 4: Interact with Contract**
```bash
npm run interact
```

### Deployment Scripts

**`scripts/deploy.js`** - Main deployment
- Deploys contract
- Sets up initial voter weights
- Saves deployment information
- Displays gas metrics

**`scripts/verify.js`** - Contract verification
- Verifies on Etherscan
- Handles already-verified contracts
- Updates deployment records

**`scripts/interact.js`** - Contract interaction
- Views contract state
- Displays proposals
- Provides example interactions

**`scripts/simulate.js`** - Full voting simulation
- Demonstrates complete voting cycle
- Tests commit-reveal mechanism
- Includes time manipulation

For detailed deployment guide, see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 🔐 Security & Privacy

### Privacy Model

#### What's Private

✅ **Vote Choices During Voting**
- Individual vote selections remain hidden during the commit phase
- Cryptographic hashes prevent vote disclosure until reveal phase
- Prevents vote manipulation and coercion

✅ **Voter Nonces**
- Random nonces ensure unique vote hashes
- Stored securely off-chain by voters
- Required for vote revelation

#### What's Public

📊 **Proposal Information**
- Proposal titles and descriptions
- Voting deadlines and creation times
- Proposal creators and execution status

📊 **Voting Participation**
- Total number of voters per proposal
- Voter addresses (but not their choices during commit phase)
- Final vote tallies after reveal phase

📊 **Blockchain Metadata**
- Transaction existence and timestamps
- Gas costs and block numbers
- Event logs and contract interactions

### Security Features

**🛡️ Cryptographic Protection**
```
Commit Phase:
User generates: keccak256(address + vote + nonce) → Commitment Hash
Contract stores: Hash only (vote hidden)

Reveal Phase:
User reveals: vote + nonce
Contract verifies: Regenerated hash matches stored hash
```

**🔒 Access Control**
- **Owner Only**: Voter weight management, system pause
- **Voter Requirements**: Minimum voting power for proposals
- **Time Locks**: Enforced voting and reveal periods

**⚙️ DoS Protection**
- Gas limit considerations for loops
- Bounded array operations
- Rate limiting via contract design
- Circuit breaker (pause functionality)

### Security Audit Checklist

✅ **Automated Checks**
```bash
# Run security audit
npm run security

# Includes:
# - NPM dependency audit
# - Solhint security rules
# - Contract size validation
# - Gas optimization checks
```

✅ **Static Analysis (CI/CD)**
- Slither automated scanning
- 90+ security detectors
- Reentrancy protection
- Integer overflow checks

✅ **Manual Review**
- [ ] Access control verification
- [ ] Input validation review
- [ ] Time-dependent logic audit
- [ ] Event emission verification
- [ ] Emergency pause testing

For complete security documentation, see [TOOLCHAIN.md](TOOLCHAIN.md#security-tools).

---

## 💡 Usage Guide

### For Voters

**Step 1: Check Voting Power**
```javascript
const weight = await contract.getVoterWeight(voterAddress);
console.log(`Your voting power: ${weight}`);
```

**Step 2: View Active Proposals**
```javascript
const count = await contract.proposalCount();
for (let i = 0; i < count; i++) {
    const proposal = await contract.getProposal(i);
    console.log(`Proposal ${i}: ${proposal.title}`);
    console.log(`Description: ${proposal.description}`);
    console.log(`Deadline: ${new Date(proposal.votingDeadline * 1000)}`);
}
```

**Step 3: Commit Your Vote**
```javascript
// Generate random nonce (SAVE THIS!)
const nonce = Math.floor(Math.random() * 1000000);

// Create vote hash (true = yes, false = no)
const voteHash = await contract.generateVoteHash(true, nonce);

// Submit commitment
await contract.commitVote(proposalId, voteHash);

// ⚠️ IMPORTANT: Save nonce securely!
localStorage.setItem(`nonce_${proposalId}`, nonce.toString());
```

**Step 4: Wait for Voting Period to End**
```javascript
const proposal = await contract.getProposal(proposalId);
const deadline = new Date(proposal.votingDeadline * 1000);
console.log(`Voting ends: ${deadline}`);
```

**Step 5: Reveal Your Vote**
```javascript
// Retrieve saved nonce
const nonce = parseInt(localStorage.getItem(`nonce_${proposalId}`));

// Reveal vote
await contract.revealVote(proposalId, true, nonce);
console.log("Vote revealed successfully!");
```

### For Proposal Creators

**Create a Proposal**
```javascript
// Check minimum voting power requirement
const minPower = await contract.minVotingPower();
const yourPower = await contract.getVoterWeight(yourAddress);

if (yourPower >= minPower) {
    await contract.createProposal(
        "Upgrade Smart Contract",
        "Proposal to implement new features in version 2.0"
    );
    console.log("Proposal created!");
} else {
    console.log(`Need ${minPower} voting power, you have ${yourPower}`);
}
```

**Execute Approved Proposal**
```javascript
// Wait for reveal period to end
const proposal = await contract.getProposal(proposalId);
const revealEnd = proposal.votingDeadline + (await contract.revealPeriod());

if (Date.now() / 1000 > revealEnd) {
    if (proposal.yesVotes > proposal.noVotes) {
        await contract.executeProposal(proposalId);
        console.log("Proposal executed!");
    } else {
        console.log("Proposal was rejected");
    }
}
```

### For Administrators

**Manage Voter Weights**
```javascript
// Set voting power for multiple users
const voters = [
    { address: "0x123...", weight: 1000 },
    { address: "0x456...", weight: 500 },
    { address: "0x789...", weight: 250 }
];

for (const voter of voters) {
    await contract.setVoterWeight(voter.address, voter.weight);
    console.log(`Set ${voter.address} to ${voter.weight} voting power`);
}
```

**Emergency Controls**
```javascript
// Pause system in emergency
await contract.setPaused(true);
console.log("System paused");

// Resume when safe
await contract.setPaused(false);
console.log("System resumed");
```

---

## ⚙️ Configuration

### Environment Variables

Complete `.env.example` template with 160+ lines covering:

**Network Configuration**
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
```

**Account Configuration**
```env
PRIVATE_KEY=your_private_key_without_0x_prefix
# Alternative: MNEMONIC=your twelve word mnemonic phrase
```

**API Keys**
```env
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
```

**Contract Configuration**
```env
MIN_VOTING_POWER=100
VOTING_DURATION=604800    # 7 days in seconds
REVEAL_PERIOD=86400        # 1 day in seconds
```

**Security Configuration**
```env
PAUSER_ADDRESSES=0x0000000000000000000000000000000000000000
EMERGENCY_PAUSE_ENABLED=false
MAX_PROPOSALS_PER_DAY=5
MAX_VOTERS_PER_PROPOSAL=1000
```

**Gas & Optimization**
```env
GAS_PRICE=auto
GAS_LIMIT=8000000
REPORT_GAS=false
OPTIMIZER_RUNS=200
YUL_OPTIMIZER_ENABLED=true
```

**Testing & CI/CD**
```env
TEST_TIMEOUT=40000
COVERAGE_THRESHOLD=95
CODECOV_TOKEN=your_codecov_token
CI_SECURITY_CHECKS=true
```

For complete configuration reference, see [.env.example](.env.example).

---

## 🛠️ Development

### Development Commands

```bash
# Compilation
npm run compile              # Compile contracts
npm run clean                # Clean artifacts

# Testing
npm test                     # Run tests
npm run coverage             # Generate coverage report
npm run gas-report           # Gas usage analysis

# Code Quality
npm run lint                 # Run all linters
npm run lint:sol             # Solidity linting
npm run lint:js              # JavaScript linting
npm run format               # Auto-format code

# Security & Performance
npm run security             # Security audit
npm run performance          # Performance check
npm run size                 # Contract size analysis

# Validation
npm run validate             # Full validation (lint + test + security)
```

### Pre-commit Hooks

Husky automatically runs before each commit:

```bash
✓ Prettier formatting check
✓ Solhint (Solidity linting)
✓ ESLint (JavaScript linting)
✓ Test suite execution
```

If any check fails, the commit is blocked until issues are resolved.

### Commit Message Format

Follow conventional commits format:

```bash
# Valid commits
git commit -m "feat: add proposal voting weight"
git commit -m "fix: resolve hash mismatch error"
git commit -m "docs: update deployment guide"
git commit -m "test: add edge case for reveal phase"

# Invalid commits (will be rejected)
git commit -m "updated stuff"
git commit -m "WIP"
```

**Valid types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

### Project Structure

```
governance-voting-system/
├── contracts/
│   └── SecureDAOVoting.sol          # Main voting contract
│
├── scripts/
│   ├── deploy.js                    # Deployment script
│   ├── verify.js                    # Etherscan verification
│   ├── interact.js                  # Contract interaction
│   ├── simulate.js                  # Voting simulation
│   ├── security-audit.js            # Security checks
│   └── performance-check.js         # Performance analysis
│
├── test/
│   └── SecureDAOVoting.test.js      # 72 test cases
│
├── .github/
│   └── workflows/
│       └── test.yml                 # CI/CD pipeline
│
├── .husky/
│   ├── pre-commit                   # Pre-commit hook
│   ├── commit-msg                   # Commit validation
│   └── pre-push                     # Pre-push checks
│
├── deployments/                     # Deployment records
│   └── sepolia.json                 # Sepolia deployment info
│
├── docs/
│   ├── TESTING.md                   # Testing guide
│   ├── DEPLOYMENT.md                # Deployment guide
│   ├── CI_CD.md                     # CI/CD documentation
│   ├── TOOLCHAIN.md                 # Toolchain guide
│   └── ...
│
├── hardhat.config.js                # Hardhat configuration
├── package.json                     # Dependencies & scripts
├── .env.example                     # Environment template
├── .solhint.json                    # Solidity linting rules
├── .eslintrc.json                   # JavaScript linting rules
├── .prettierrc.json                 # Code formatting rules
├── codecov.yml                      # Coverage configuration
└── README.md                        # This file
```

---

## 📊 CI/CD Pipeline

### GitHub Actions Workflow

5 parallel jobs run on every push and pull request:

```
┌─────────────────────────────────────────────────────────┐
│              GitHub Actions Pipeline                     │
└─────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┬─────────────┐
          ▼                ▼                ▼             ▼

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Test Node   │  │  Test Node   │  │    Code      │  │   Security   │
│     18.x     │  │     20.x     │  │   Quality    │  │   Analysis   │
│              │  │              │  │              │  │              │
│ • Compile    │  │ • Compile    │  │ • Solhint    │  │ • Slither    │
│ • Test (72)  │  │ • Test (72)  │  │ • ESLint     │  │ • Detectors  │
│ • Coverage   │  │ • Coverage   │  │ • Prettier   │  │ • Report     │
│ • Codecov    │  │ • Codecov    │  │ • Validate   │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                   │
                                   ▼
                          ✅ All Checks Pass
```

### Automated Checks

**Code Quality**
- ✅ Solhint (25+ rules)
- ✅ ESLint (complexity, security)
- ✅ Prettier (formatting)

**Testing**
- ✅ 72 test cases
- ✅ >95% coverage target
- ✅ Gas optimization verification

**Security**
- ✅ Slither static analysis
- ✅ NPM audit
- ✅ Contract size validation

**Performance**
- ✅ Gas reporting
- ✅ Contract size monitoring
- ✅ Optimization verification

### Pipeline Execution Time

```
Total: 3-5 minutes (parallel execution)

├── Test Node 18.x:       ~2m 30s
├── Test Node 20.x:       ~2m 30s
├── Code Quality:         ~1m 30s
├── Security Analysis:    ~2m 00s
└── Gas Reporting:        ~2m 45s
```

For complete CI/CD documentation, see [CI_CD.md](CI_CD.md).

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Deployment fails with "insufficient funds"**
```
Error: insufficient funds for intrinsic transaction cost
```
**Solution**:
- Get Sepolia ETH from [faucet](https://sepoliafaucet.com/)
- Check balance: `npx hardhat run scripts/check-balance.js --network sepolia`

**Issue: Verification fails on Etherscan**
```
Error: Already Verified
```
**Solution**:
- Wait 1-2 minutes after deployment before verifying
- Check if contract is already verified on Etherscan
- Ensure `ETHERSCAN_API_KEY` is correct in `.env`

**Issue: "Already voted" error**
```
Error: Already voted
```
**Solution**:
- Each address can only vote once per proposal
- Use different accounts for testing
- Check if vote was already committed: `await contract.hasVoted(proposalId, address)`

**Issue: "Voting has ended" during commit**
```
Error: Voting has ended
```
**Solution**:
- Check proposal deadline: `await contract.getProposal(proposalId)`
- Create new proposal for testing
- Use time manipulation in local tests

**Issue: "Hash mismatch" during reveal**
```
Error: Hash mismatch
```
**Solution**:
- Verify you're using the same nonce from commit phase
- Check vote choice (true/false) matches commitment
- Ensure using correct proposalId

**Issue: Tests fail with "HH22" error**
```
Error: HH22: Trying to use a non-local installation of Hardhat
```
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm test
```

**Issue: Husky hooks not running**
```
Git commits without running checks
```
**Solution**:
```bash
npm run prepare
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

**Issue: Gas reporter not generating**
```
Gas report not appearing after tests
```
**Solution**:
```bash
# Set environment variable
REPORT_GAS=true npm test

# Or use dedicated script
npm run gas-report
```

### Debug Mode

Enable verbose logging:

```bash
# In .env
DEBUG=true
VERBOSE=true

# Run with debug output
npm run deploy:sepolia
```

### Getting Help

- 📖 Check [documentation files](docs/)
- 🔍 Review [test files](test/) for examples
- 🐛 [Open an issue](https://github.com/your-repo/issues)
- 💬 Check existing issues for solutions

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Process

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/governance-voting-system
   cd governance-voting-system
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Make changes**
   - Write code following project style
   - Add tests for new functionality
   - Update documentation as needed

4. **Run validation**
   ```bash
   npm run validate
   ```

5. **Commit changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

6. **Push and create PR**
   ```bash
   git push origin feat/your-feature-name
   ```

### Contribution Guidelines

**Code Style**
- ✅ Follow Solidity style guide
- ✅ Use consistent naming conventions
- ✅ Add comments for complex logic
- ✅ Run `npm run format` before committing

**Testing**
- ✅ Write tests for new features
- ✅ Maintain >95% coverage
- ✅ Include edge cases
- ✅ Test both success and failure paths

**Documentation**
- ✅ Update README if needed
- ✅ Add inline code comments
- ✅ Document new configuration options
- ✅ Include usage examples

**Pull Requests**
- ✅ Clear description of changes
- ✅ Reference related issues
- ✅ All CI checks passing
- ✅ Review requested from maintainers

---

## 📈 Roadmap

### Current Features ✅
- ✅ Commit-reveal voting mechanism
- ✅ Weighted voting system
- ✅ Proposal creation and execution
- ✅ Emergency pause functionality
- ✅ Comprehensive testing (72 tests)
- ✅ CI/CD pipeline
- ✅ Security toolchain

### Upcoming Features 🚀

**Phase 1: Enhanced Governance**
- [ ] Multi-signature proposal approval
- [ ] Proposal delegation system
- [ ] Vote delegation
- [ ] Quorum requirements
- [ ] Proposal categories

**Phase 2: Advanced Features**
- [ ] Time-locked execution
- [ ] Proposal amendments
- [ ] Voting power snapshots
- [ ] Reputation system
- [ ] Reward mechanisms

**Phase 3: Scalability**
- [ ] Layer 2 integration
- [ ] Gas optimization improvements
- [ ] Batch voting operations
- [ ] Off-chain vote aggregation
- [ ] IPFS integration for proposals

**Phase 4: User Experience**
- [ ] Web frontend interface
- [ ] Mobile app
- [ ] Email notifications
- [ ] Voting analytics dashboard
- [ ] Governance forum integration

---

## 📊 Performance & Gas Costs

### Contract Specifications

- **Contract Size**: ~18 KB (well under 24 KB limit)
- **Optimization**: 200 runs (balanced for deployment and execution)
- **Compiler**: Solidity 0.8.24 with Yul optimizer

### Gas Usage Estimates

| Operation | Gas Cost (avg) | USD Cost* |
|-----------|----------------|-----------|
| Deploy Contract | ~2,458,000 | ~$12.30 |
| Create Proposal | ~150,000 | ~$0.75 |
| Commit Vote | ~80,000 | ~$0.40 |
| Reveal Vote | ~90,000 | ~$0.45 |
| Execute Proposal | ~70,000 | ~$0.35 |
| Set Voter Weight | ~45,000 | ~$0.23 |

*Based on 25 gwei gas price and $2,000 ETH price

### Optimization Strategies

✅ **Applied Optimizations**
- Efficient storage patterns
- Minimal SLOAD operations
- Batch-friendly design
- Event-driven architecture
- Uint256 packing where possible

For detailed gas analysis:
```bash
npm run gas-report
npm run performance
```

---

## 🔗 Resources & Links

### Documentation
- 📖 [Hardhat Documentation](https://hardhat.org/docs)
- 📖 [Ethers.js Documentation](https://docs.ethers.org/)
- 📖 [Solidity Documentation](https://docs.soliditylang.org/)
- 📖 [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

### Networks
- 🌐 [Sepolia Testnet](https://sepolia.dev/)
- 🌐 [Sepolia Faucet](https://sepoliafaucet.com/)
- 🌐 [Sepolia Etherscan](https://sepolia.etherscan.io/)

### Tools
- 🔧 [Hardhat Toolbox](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-toolbox)
- 🔧 [Solhint](https://github.com/protofire/solhint)
- 🔧 [Slither](https://github.com/crytic/slither)
- 🔧 [Codecov](https://codecov.io/)

### Community
- 💬 GitHub Issues
- 💬 GitHub Discussions
- 💬 Twitter: [@YourProject](https://twitter.com/)

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 Governance Voting System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See the [LICENSE](LICENSE) file for full details.

---

## ⚠️ Disclaimer

**Important Notice:**

This is **experimental software** designed for educational and development purposes.

⚠️ **Security Considerations:**
- This contract has not been professionally audited
- Use at your own risk
- Do not use for production with real funds without thorough security audit
- Test extensively on testnet before any mainnet deployment

⚠️ **No Warranties:**
- The software is provided "as is" without warranties
- No guarantee of fitness for any particular purpose
- Authors not liable for any damages or losses

⚠️ **Best Practices:**
- Always perform comprehensive security audits before mainnet deployment
- Test all functionality thoroughly on testnet
- Consider professional security review for production use
- Follow Ethereum development best practices
- Keep dependencies updated

---

## 🙏 Acknowledgments

### Built With
- **Hardhat** - Ethereum development environment
- **OpenZeppelin** - Secure contract libraries
- **Ethers.js** - Ethereum library
- **Mocha & Chai** - Testing framework

### Special Thanks
- OpenZeppelin team for secure contract patterns
- Hardhat team for excellent development tools
- Ethereum community for continuous innovation
- All contributors and testers

---

## 📞 Contact & Support

### Get Help
- 📖 Read the [documentation](docs/)
- 🐛 [Report bugs](https://github.com/your-repo/issues)
- 💡 [Request features](https://github.com/your-repo/issues)
- ❓ [Ask questions](https://github.com/your-repo/discussions)

### Project Links
- 🏠 **Homepage**: [Project Website](https://your-website.com)
- 📦 **Repository**: [GitHub](https://github.com/your-repo/governance-voting)
- 🌐 **Live Demo**: [Sepolia Deployment](https://sepolia.etherscan.io/address/0x08C09eC71Fe5CF02ce7E9bcfCBC406e052EA0248)
- 📊 **Status**: [CI/CD Dashboard](https://github.com/your-repo/actions)

---

<div align="center">

**Built with ❤️ for decentralized governance**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/your-repo/issues) · [Request Feature](https://github.com/your-repo/issues) · [Documentation](docs/)

</div>
