const hre = require("hardhat");

async function main() {
  console.log("========================================");
  console.log("Starting Governance Voting System Deployment");
  console.log("========================================\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.chainId}\n`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // Deploy the SecureDAOVoting contract
  console.log("Deploying SecureDAOVoting contract...");
  const SecureDAOVoting = await hre.ethers.getContractFactory("SecureDAOVoting");

  const startTime = Date.now();
  const votingContract = await SecureDAOVoting.deploy();
  await votingContract.waitForDeployment();

  const contractAddress = await votingContract.getAddress();
  const deployTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n✓ Contract deployed successfully in ${deployTime}s`);
  console.log(`Contract address: ${contractAddress}\n`);

  // Initialize voter weights
  console.log("Setting up initial voter weights...");
  const initialVoters = [
    { address: deployer.address, weight: 1000 }
  ];

  for (const voter of initialVoters) {
    const tx = await votingContract.setVoterWeight(voter.address, voter.weight);
    await tx.wait();
    console.log(`✓ Set voting weight for ${voter.address}: ${voter.weight}`);
  }

  console.log("\n========================================");
  console.log("Deployment Summary");
  console.log("========================================");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Block Explorer: https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("========================================\n");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    contractAddress: contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockExplorer: `https://sepolia.etherscan.io/address/${contractAddress}`
  };

  const fs = require('fs');
  const path = require('path');
  const deploymentsDir = path.join(__dirname, '..', 'deployments');

  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${network.name}-deployment.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment information saved to deployments/ directory");
  console.log("\nNext steps:");
  console.log("1. Verify the contract: npm run verify");
  console.log("2. Interact with the contract: npm run interact");
  console.log("3. Run simulations: npm run simulate\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
