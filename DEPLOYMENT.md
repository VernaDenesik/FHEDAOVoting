# Deployment Guide

This guide provides detailed instructions for deploying the Governance Voting System to Ethereum networks.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Sepolia Testnet Deployment](#sepolia-testnet-deployment)
- [Contract Verification](#contract-verification)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **Node.js and npm**
   - Node.js >= 18.0.0
   - npm >= 7.0.0

2. **Wallet with Funds**
   - For Sepolia: Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
   - Recommended: At least 0.1 Sepolia ETH for deployment and initial transactions

3. **API Keys**
   - Infura or Alchemy RPC URL
   - Etherscan API key (for contract verification)

## Environment Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd governance-voting-system
npm install
```

### 2. Configure Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Sepolia RPC URL (get from Infura or Alchemy)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Your wallet private key (WITHOUT 0x prefix)
PRIVATE_KEY=your_private_key_here

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Security Warning**: Never commit your `.env` file or share your private key!

### 3. Verify Configuration

Test your configuration:

```bash
npm run compile
```

You should see:
```
Compiled 1 Solidity file successfully
```

## Local Development

### Start Local Hardhat Node

In terminal 1:
```bash
npm run node
```

This starts a local Ethereum network at `http://127.0.0.1:8545`

### Run Simulation

In terminal 2:
```bash
npm run simulate
```

This will:
1. Deploy the contract locally
2. Set up voter weights
3. Create a test proposal
4. Simulate the complete voting cycle
5. Display results

Expected output:
```
========================================
Governance Voting System Simulation
========================================

Simulation Accounts:
Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Voter 1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
...
✓ Contract deployed at: 0x...
✓ Proposal created: "Protocol Upgrade to v2.0"
✓ All votes committed successfully!
✓ Voting period ended
✓ Proposal executed successfully!
```

## Sepolia Testnet Deployment

### 1. Pre-Deployment Checks

Verify your wallet balance:
```bash
# Check balance (use your own address)
cast balance YOUR_ADDRESS --rpc-url $SEPOLIA_RPC_URL
```

### 2. Deploy Contract

```bash
npm run deploy:sepolia
```

Expected output:
```
========================================
Starting Governance Voting System Deployment
========================================

Network: sepolia
Chain ID: 11155111

Deploying contracts with account: 0x...
Account balance: 0.5 ETH

Deploying SecureDAOVoting contract...

✓ Contract deployed successfully in 12.34s
Contract address: 0x...

========================================
Deployment Summary
========================================
Contract Address: 0x...
Deployer: 0x...
Network: sepolia (Chain ID: 11155111)
Block Explorer: https://sepolia.etherscan.io/address/0x...
========================================
```

### 3. Save Deployment Information

The deployment script automatically saves deployment info to:
```
deployments/sepolia-deployment.json
```

Example content:
```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "contractAddress": "0x...",
  "deployer": "0x...",
  "deployedAt": "2024-01-15T10:30:00.000Z",
  "blockExplorer": "https://sepolia.etherscan.io/address/0x..."
}
```

## Contract Verification

Verify your contract on Etherscan for public transparency:

```bash
npm run verify
```

Expected output:
```
========================================
Contract Verification Script
========================================

Network: sepolia
Chain ID: 11155111

Contract Address: 0x...
Starting verification process...

Successfully submitted source code for contract
contracts/SecureDAOVoting.sol:SecureDAOVoting at 0x...
for verification on the block explorer. Waiting for verification result...

Successfully verified contract SecureDAOVoting on Etherscan.

✓ Contract verified successfully!
View on Etherscan: https://sepolia.etherscan.io/address/0x...
```

### Verification Troubleshooting

If verification fails:

1. **"Already verified"**: Contract is already verified, no action needed
2. **"Invalid API key"**: Check `ETHERSCAN_API_KEY` in `.env`
3. **"Contract not found"**: Wait 1-2 minutes after deployment, then retry
4. **"Bytecode mismatch"**: Ensure you're using the exact same compiler settings

## Post-Deployment

### 1. Interact with Contract

View contract state:
```bash
npm run interact
```

This displays:
- Contract owner
- Voting system status
- All active proposals
- Your voting weight

### 2. Initial Configuration

Set voter weights for your DAO members:

Edit `scripts/interact.js` and uncomment:
```javascript
const voterAddress = '0x...';
const weight = 500;
const tx = await votingContract.setVoterWeight(voterAddress, weight);
await tx.wait();
```

Run:
```bash
npm run interact
```

### 3. Create First Proposal

Edit `scripts/interact.js` and uncomment:
```javascript
const tx = await votingContract.createProposal(
  "Protocol Upgrade",
  "Proposal to upgrade the governance protocol"
);
await tx.wait();
```

Run:
```bash
npm run interact
```

## Current Deployment

### Sepolia Testnet

**Contract Address**: `0x08C09eC71Fe5CF02ce7E9bcfCBC406e052EA0248`

**Network Details**:
- Chain ID: 11155111
- Block Explorer: [View on Etherscan](https://sepolia.etherscan.io/address/0x08C09eC71Fe5CF02ce7E9bcfCBC406e052EA0248)

**Contract Functions**:
- Owner functions: `setVoterWeight`, `setMultipleVoterWeights`, `setVotingOpen`, `pauseProposal`
- Voter functions: `createProposal`, `commitVote`, `revealVote`, `executeProposal`
- View functions: `getProposal`, `hasUserVoted`, `getVotingStatus`, `generateVoteHash`

**Voting Parameters**:
- Voting Duration: 7 days
- Reveal Period: 1 day after voting ends
- Minimum Voting Power: 100 (for proposal creation)

## Deployment Checklist

Before deploying to mainnet:

- [ ] All tests passing (`npm run test`)
- [ ] Contract compiled successfully
- [ ] Environment variables configured
- [ ] Sufficient ETH in deployer wallet
- [ ] Contract code reviewed and audited
- [ ] Deployment script tested on testnet
- [ ] Verify script tested
- [ ] Initial voter weights planned
- [ ] Governance parameters reviewed
- [ ] Emergency procedures documented

## Gas Estimates

Typical gas costs on Sepolia (may vary):

| Operation | Estimated Gas | Approx. Cost (20 gwei) |
|-----------|---------------|------------------------|
| Deploy Contract | ~2,500,000 | 0.05 ETH |
| Create Proposal | ~150,000 | 0.003 ETH |
| Commit Vote | ~80,000 | 0.0016 ETH |
| Reveal Vote | ~70,000 | 0.0014 ETH |
| Execute Proposal | ~60,000 | 0.0012 ETH |
| Set Voter Weight | ~45,000 | 0.0009 ETH |

## Troubleshooting

### Common Issues

**Error: "insufficient funds for gas * price + value"**
- Solution: Add more ETH to your wallet
- Get Sepolia ETH from: https://sepoliafaucet.com/

**Error: "nonce too low"**
- Solution: Reset your MetaMask account or wait for pending transactions

**Error: "execution reverted"**
- Check contract requirements (voting power, proposal existence, etc.)
- View detailed error with: `--show-stack-traces` flag

**Deployment hangs**
- Check RPC URL is correct and responsive
- Try increasing gas limit in hardhat.config.js
- Verify network connectivity

### Getting Help

1. Check deployment logs in `deployments/` directory
2. Review Hardhat documentation: https://hardhat.org/docs
3. Check Etherscan for transaction details
4. Review contract events on block explorer

## Security Considerations

### Before Mainnet Deployment

1. **Audit**: Get professional smart contract audit
2. **Testing**: Achieve >95% test coverage
3. **Testnet**: Run on testnet for extended period
4. **Multi-sig**: Consider using multi-sig wallet for owner
5. **Timelock**: Consider adding timelock for critical operations
6. **Insurance**: Evaluate smart contract insurance options

### Operational Security

- Use hardware wallet for mainnet deployments
- Enable 2FA on all service accounts
- Maintain separate hot/cold wallets
- Regular security reviews
- Monitor contract events
- Have incident response plan

## Upgrading

This contract is not upgradeable by design for security. To upgrade:

1. Deploy new contract version
2. Migrate state if needed
3. Update frontend to point to new contract
4. Communicate changes to community
5. Optionally pause old contract

## Support

For deployment assistance:
- Review this guide thoroughly
- Check example scripts in `scripts/` directory
- Test on local network first
- Consult Hardhat documentation
- Open GitHub issue for specific problems
