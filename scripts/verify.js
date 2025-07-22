const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("========================================");
  console.log("Contract Verification Script");
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
  console.log("Starting verification process...\n");

  try {
    // Verify the contract on Etherscan
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: "contracts/SecureDAOVoting.sol:SecureDAOVoting"
    });

    console.log("\n✓ Contract verified successfully!");
    console.log(`View on Etherscan: ${deploymentInfo.blockExplorer}\n`);

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();

    fs.writeFileSync(
      deploymentFile,
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("Verification status saved to deployment file");

  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("✓ Contract is already verified!");
      console.log(`View on Etherscan: ${deploymentInfo.blockExplorer}\n`);
    } else {
      console.error("\n❌ Verification failed:");
      console.error(error.message);

      console.log("\nPossible reasons:");
      console.log("1. Invalid ETHERSCAN_API_KEY in .env file");
      console.log("2. Contract not yet indexed by Etherscan (wait a few minutes)");
      console.log("3. Constructor arguments mismatch");
      console.log("\nPlease check your configuration and try again.");
      process.exit(1);
    }
  }

  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification script failed:");
    console.error(error);
    process.exit(1);
  });
