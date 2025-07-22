const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("========================================");
  console.log("Contract Interaction Script");
  console.log("========================================\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.chainId}\n`);

  // Load deployment info
  const deploymentFile = path.join(__dirname, '..', 'deployments', `${network.name}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.error("Please deploy the contract first using: npm run deploy:sepolia");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const contractAddress = deploymentInfo.contractAddress;

  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Block Explorer: ${deploymentInfo.blockExplorer}\n`);

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log(`Interacting with account: ${signer.address}\n`);

  // Connect to the deployed contract
  const SecureDAOVoting = await hre.ethers.getContractFactory("SecureDAOVoting");
  const votingContract = SecureDAOVoting.attach(contractAddress);

  console.log("========================================");
  console.log("Contract State Information");
  console.log("========================================\n");

  // Get contract state
  const owner = await votingContract.owner();
  const votingOpen = await votingContract.votingOpen();
  const proposalCount = await votingContract.proposalCount();
  const voterWeight = await votingContract.voterWeight(signer.address);

  console.log(`Owner: ${owner}`);
  console.log(`Voting System Status: ${votingOpen ? 'Open' : 'Closed'}`);
  console.log(`Total Proposals: ${proposalCount}`);
  console.log(`Your Voting Weight: ${voterWeight}\n`);

  // Display all proposals
  if (proposalCount > 0) {
    console.log("========================================");
    console.log("Active Proposals");
    console.log("========================================\n");

    for (let i = 1; i <= proposalCount; i++) {
      const proposal = await votingContract.getProposal(i);
      const status = await votingContract.getVotingStatus(i);
      const currentTime = await votingContract.getCurrentTime();

      console.log(`Proposal #${i}:`);
      console.log(`  Title: ${proposal.title}`);
      console.log(`  Description: ${proposal.description}`);
      console.log(`  Creator: ${proposal.creator}`);
      console.log(`  Status: ${status}`);
      console.log(`  Yes Votes: ${proposal.yesVotes}`);
      console.log(`  No Votes: ${proposal.noVotes}`);
      console.log(`  Total Voters: ${proposal.totalVoters}`);
      console.log(`  Voting Ends: ${new Date(Number(proposal.votingEnd) * 1000).toLocaleString()}`);
      console.log(`  Executed: ${proposal.executed}`);
      console.log(`  Active: ${proposal.active}\n`);
    }
  } else {
    console.log("No proposals have been created yet.\n");
  }

  // Interactive menu
  console.log("========================================");
  console.log("Available Actions");
  console.log("========================================\n");
  console.log("Uncomment the desired action in this script to execute:\n");

  // Example 1: Create a new proposal
  console.log("// Example 1: Create a new proposal");
  console.log("/*");
  console.log("const tx1 = await votingContract.createProposal(");
  console.log('  "Upgrade Protocol",');
  console.log('  "Proposal to upgrade the governance protocol to version 2.0"');
  console.log(");");
  console.log("await tx1.wait();");
  console.log("console.log('Proposal created successfully!');");
  console.log("*/\n");

  // Example 2: Commit a vote
  console.log("// Example 2: Commit a vote");
  console.log("/*");
  console.log("const proposalId = 1;");
  console.log("const support = true; // true for yes, false for no");
  console.log("const nonce = Math.floor(Math.random() * 1000000);");
  console.log("const voteHash = await votingContract.generateVoteHash(support, nonce);");
  console.log("const tx2 = await votingContract.commitVote(proposalId, voteHash);");
  console.log("await tx2.wait();");
  console.log("console.log('Vote committed! Save your nonce:', nonce);");
  console.log("*/\n");

  // Example 3: Reveal a vote
  console.log("// Example 3: Reveal a vote");
  console.log("/*");
  console.log("const proposalId = 1;");
  console.log("const support = true;");
  console.log("const nonce = 123456; // Use the nonce from commit phase");
  console.log("const tx3 = await votingContract.revealVote(proposalId, support, nonce);");
  console.log("await tx3.wait();");
  console.log("console.log('Vote revealed successfully!');");
  console.log("*/\n");

  // Example 4: Execute a proposal
  console.log("// Example 4: Execute a proposal");
  console.log("/*");
  console.log("const proposalId = 1;");
  console.log("const tx4 = await votingContract.executeProposal(proposalId);");
  console.log("await tx4.wait();");
  console.log("console.log('Proposal executed!');");
  console.log("*/\n");

  // Example 5: Set voter weight (owner only)
  console.log("// Example 5: Set voter weight (owner only)");
  console.log("/*");
  console.log("const voterAddress = '0x...';");
  console.log("const weight = 500;");
  console.log("const tx5 = await votingContract.setVoterWeight(voterAddress, weight);");
  console.log("await tx5.wait();");
  console.log("console.log('Voter weight set successfully!');");
  console.log("*/\n");

  console.log("========================================\n");
  console.log("To execute an action, uncomment the relevant code block and run:");
  console.log("npm run interact\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Interaction failed:");
    console.error(error);
    process.exit(1);
  });
