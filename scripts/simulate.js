const hre = require("hardhat");

async function main() {
  console.log("========================================");
  console.log("Governance Voting System Simulation");
  console.log("========================================\n");

  // Get signers
  const [owner, voter1, voter2, voter3] = await hre.ethers.getSigners();

  console.log("Simulation Accounts:");
  console.log(`Owner: ${owner.address}`);
  console.log(`Voter 1: ${voter1.address}`);
  console.log(`Voter 2: ${voter2.address}`);
  console.log(`Voter 3: ${voter3.address}\n`);

  // Deploy contract
  console.log("========================================");
  console.log("Step 1: Deploying Contract");
  console.log("========================================\n");

  const SecureDAOVoting = await hre.ethers.getContractFactory("SecureDAOVoting");
  const votingContract = await SecureDAOVoting.deploy();
  await votingContract.waitForDeployment();

  const contractAddress = await votingContract.getAddress();
  console.log(`✓ Contract deployed at: ${contractAddress}\n`);

  // Set voter weights
  console.log("========================================");
  console.log("Step 2: Setting Voter Weights");
  console.log("========================================\n");

  const weights = [
    { signer: owner, address: owner.address, weight: 1000, name: "Owner" },
    { signer: voter1, address: voter1.address, weight: 500, name: "Voter 1" },
    { signer: voter2, address: voter2.address, weight: 300, name: "Voter 2" },
    { signer: voter3, address: voter3.address, weight: 200, name: "Voter 3" }
  ];

  for (const voter of weights) {
    const tx = await votingContract.setVoterWeight(voter.address, voter.weight);
    await tx.wait();
    console.log(`✓ ${voter.name} weight set to: ${voter.weight}`);
  }

  console.log();

  // Create proposal
  console.log("========================================");
  console.log("Step 3: Creating Proposal");
  console.log("========================================\n");

  const proposalTitle = "Protocol Upgrade to v2.0";
  const proposalDescription = "Proposal to upgrade the governance protocol to version 2.0 with enhanced security features";

  const createTx = await votingContract.connect(owner).createProposal(
    proposalTitle,
    proposalDescription
  );
  await createTx.wait();

  console.log(`✓ Proposal created: "${proposalTitle}"`);
  console.log(`Description: ${proposalDescription}\n`);

  const proposalId = 1;
  const proposal = await votingContract.getProposal(proposalId);
  console.log(`Proposal ID: ${proposalId}`);
  console.log(`Voting ends at: ${new Date(Number(proposal.votingEnd) * 1000).toLocaleString()}\n`);

  // Commit votes
  console.log("========================================");
  console.log("Step 4: Committing Votes (Secret Phase)");
  console.log("========================================\n");

  const votes = [
    { signer: voter1, support: true, name: "Voter 1" },
    { signer: voter2, support: true, name: "Voter 2" },
    { signer: voter3, support: false, name: "Voter 3" }
  ];

  const voteCommitments = [];

  for (const vote of votes) {
    const nonce = Math.floor(Math.random() * 1000000);
    const voteHash = await votingContract.connect(vote.signer).generateVoteHash(vote.support, nonce);

    const commitTx = await votingContract.connect(vote.signer).commitVote(proposalId, voteHash);
    await commitTx.wait();

    voteCommitments.push({ ...vote, nonce });
    console.log(`✓ ${vote.name} committed vote (support: ${vote.support ? 'YES' : 'NO'})`);
    console.log(`  Nonce: ${nonce}`);
  }

  console.log("\n✓ All votes committed successfully!");
  console.log("Note: Vote choices are hidden during the commit phase\n");

  // Simulate time passing - advance to after voting period
  console.log("========================================");
  console.log("Step 5: Simulating Time Passage");
  console.log("========================================\n");

  console.log("Advancing time to end of voting period...");
  await hre.network.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]); // 7 days + 1 second
  await hre.network.provider.send("evm_mine");

  console.log("✓ Voting period ended\n");

  // Reveal votes
  console.log("========================================");
  console.log("Step 6: Revealing Votes");
  console.log("========================================\n");

  for (const commitment of voteCommitments) {
    const revealTx = await votingContract.connect(commitment.signer).revealVote(
      proposalId,
      commitment.support,
      commitment.nonce
    );
    await revealTx.wait();

    console.log(`✓ ${commitment.name} revealed vote: ${commitment.support ? 'YES' : 'NO'}`);
  }

  console.log();

  // Get voting results
  console.log("========================================");
  console.log("Step 7: Voting Results");
  console.log("========================================\n");

  const updatedProposal = await votingContract.getProposal(proposalId);
  console.log(`Yes Votes: ${updatedProposal.yesVotes}`);
  console.log(`No Votes: ${updatedProposal.noVotes}`);
  console.log(`Total Voters: ${updatedProposal.totalVoters}`);
  console.log(`Result: ${updatedProposal.yesVotes > updatedProposal.noVotes ? 'PASSED ✓' : 'REJECTED ✗'}\n`);

  // Wait for reveal period to end
  console.log("========================================");
  console.log("Step 8: Executing Proposal");
  console.log("========================================\n");

  console.log("Advancing time past reveal period...");
  await hre.network.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]); // 1 day + 1 second
  await hre.network.provider.send("evm_mine");

  const executeTx = await votingContract.executeProposal(proposalId);
  const receipt = await executeTx.wait();

  console.log("✓ Proposal executed successfully!\n");

  // Summary
  console.log("========================================");
  console.log("Simulation Complete");
  console.log("========================================\n");

  console.log("Summary:");
  console.log(`- Contract: ${contractAddress}`);
  console.log(`- Proposal: "${proposalTitle}"`);
  console.log(`- Total Voters: ${voteCommitments.length}`);
  console.log(`- Yes Votes: ${updatedProposal.yesVotes} (Voter 1: 500, Voter 2: 300)`);
  console.log(`- No Votes: ${updatedProposal.noVotes} (Voter 3: 200)`);
  console.log(`- Final Result: ${updatedProposal.yesVotes > updatedProposal.noVotes ? 'PASSED ✓' : 'REJECTED ✗'}`);
  console.log("\nThe commit-reveal voting mechanism successfully:");
  console.log("  1. Kept vote choices secret during voting period");
  console.log("  2. Verified all votes during reveal phase");
  console.log("  3. Counted weighted votes accurately");
  console.log("  4. Executed the proposal based on results\n");

  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation failed:");
    console.error(error);
    process.exit(1);
  });
