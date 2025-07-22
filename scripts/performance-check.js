const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const execPromise = util.promisify(exec);

async function runPerformanceCheck() {
  console.log("========================================");
  console.log("Performance Check Starting");
  console.log("========================================\n");

  // Run gas reporter
  console.log("📊 Generating Gas Report...");
  console.log("─".repeat(40));

  try {
    const { stdout } = await execPromise('REPORT_GAS=true npm test');
    console.log(stdout);

    // Check if gas report was generated
    const gasReportPath = path.join(__dirname, '..', 'gas-report.txt');
    if (fs.existsSync(gasReportPath)) {
      console.log("\n✅ Gas report generated successfully");
      console.log(`📄 Location: ${gasReportPath}\n`);

      // Read and analyze gas report
      const gasReport = fs.readFileSync(gasReportPath, 'utf8');

      // Extract key metrics
      const lines = gasReport.split('\n');
      console.log("🔍 Key Performance Metrics:");
      console.log("─".repeat(40));

      lines.forEach(line => {
        if (line.includes('createProposal') ||
            line.includes('commitVote') ||
            line.includes('revealVote') ||
            line.includes('executeProposal')) {
          console.log(line);
        }
      });
    }
  } catch (error) {
    console.error("❌ Gas report generation failed");
    console.error(error.message);
  }

  // Check contract sizes
  console.log("\n📏 Contract Size Analysis...");
  console.log("─".repeat(40));

  try {
    const { stdout } = await execPromise('npx hardhat size-contracts');
    console.log(stdout);
  } catch (error) {
    console.warn("⚠️  Contract size check not available");
  }

  // Performance recommendations
  console.log("\n========================================");
  console.log("Performance Optimization Tips");
  console.log("========================================\n");

  console.log("📋 Gas Optimization Checklist:");
  console.log("  □ Use 'calldata' instead of 'memory' for external functions");
  console.log("  □ Pack struct variables efficiently");
  console.log("  □ Use events instead of storage when possible");
  console.log("  □ Batch operations when applicable");
  console.log("  □ Use unchecked for safe arithmetic");
  console.log("  □ Minimize storage writes");
  console.log("  □ Use immutable for constants");
  console.log("  □ Optimize loop iterations\n");

  console.log("🎯 DoS Protection:");
  console.log("  □ Implement gas limits for loops");
  console.log("  □ Use pull over push pattern");
  console.log("  □ Avoid unbounded arrays");
  console.log("  □ Implement circuit breakers");
  console.log("  □ Rate limiting for sensitive functions\n");

  console.log("✅ Performance check completed!\n");
}

runPerformanceCheck().catch((error) => {
  console.error("Performance check failed:", error);
  process.exit(1);
});
