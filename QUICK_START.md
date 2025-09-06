# Quick Start Guide

Get started with the Governance Voting System in minutes.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 7.0.0
- MetaMask or similar Web3 wallet

## Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

## Configuration

Edit `.env` file:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_without_0x
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Quick Commands

### Development

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Start local node (terminal 1)
npm run node

# Run simulation (terminal 2)
npm run simulate
```

### Deployment

```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Verify on Etherscan
npm run verify

# Interact with deployed contract
npm run interact
```

## Project Structure

```
governance-voting-system/
├── contracts/          # Solidity smart contracts
├── scripts/           # Deployment and utility scripts
├── test/              # Contract tests
├── deployments/       # Deployment records
└── hardhat.config.js  # Hardhat configuration
```

## Key Scripts

### `scripts/deploy.js`
Deploys the voting contract and sets up initial configuration.

```bash
npm run deploy:sepolia
```

### `scripts/verify.js`
Verifies the contract on Etherscan for transparency.

```bash
npm run verify
```

### `scripts/interact.js`
View contract state and execute functions.

```bash
npm run interact
```

### `scripts/simulate.js`
Run a complete voting cycle simulation locally.

```bash
npm run node      # Terminal 1
npm run simulate  # Terminal 2
```

## Basic Usage

### 1. Create a Proposal

```javascript
await votingContract.createProposal(
  "Upgrade Protocol",
  "Proposal to upgrade to version 2.0"
);
```

### 2. Commit a Vote

```javascript
const nonce = Math.floor(Math.random() * 1000000);
const voteHash = await votingContract.generateVoteHash(true, nonce);
await votingContract.commitVote(proposalId, voteHash);
// Save your nonce!
```

### 3. Reveal Vote (after voting period)

```javascript
await votingContract.revealVote(proposalId, true, nonce);
```

### 4. Execute Proposal (after reveal period)

```javascript
await votingContract.executeProposal(proposalId);
```

## Testing

Run the complete test suite:

```bash
npm run test
```

Expected output:
```
  SecureDAOVoting
    Deployment
      ✓ Should set the correct owner
      ✓ Should start with voting system open
    Voter Weights
      ✓ Should allow owner to set voter weights
    ...

  XX passing (Xs)
```

## Current Deployment

### Sepolia Testnet
- **Contract**: `0x08C09eC71Fe5CF02ce7E9bcfCBC406e052EA0248`
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x08C09eC71Fe5CF02ce7E9bcfCBC406e052EA0248)
- **Network**: Sepolia (Chain ID: 11155111)

## Common Issues

**Problem**: `npm install` fails
- **Solution**: Ensure Node.js >= 18.0.0

**Problem**: Deployment fails
- **Solution**: Check Sepolia ETH balance, get from [faucet](https://sepoliafaucet.com/)

**Problem**: Verification fails
- **Solution**: Wait 1-2 minutes after deployment, check ETHERSCAN_API_KEY

## Next Steps

1. Read the full [README.md](./README.md) for detailed documentation
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide
3. Check test files for usage examples
4. Explore the contract on [Etherscan](https://sepolia.etherscan.io/address/0x08C09eC71Fe5CF02ce7E9bcfCBC406e052EA0248)

## Support

- Open an issue on GitHub
- Review documentation
- Check test files for examples

## Security

- Never commit `.env` file
- Never share private keys
- Always audit before mainnet deployment
- Use hardware wallet for production
