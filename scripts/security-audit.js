const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runSecurityAudit() {
  console.log("========================================");
  console.log("Security Audit Starting");
  console.log("========================================\n");

  const checks = [
    {
      name: "NPM Audit",
      command: "npm audit --audit-level=moderate",
      critical: false
    },
    {
      name: "Solhint Security",
      command: "npm run lint:sol",
      critical: true
    },
    {
      name: "Contract Size Check",
      command: "npx hardhat size-contracts",
      critical: false
    }
  ];

  let hasErrors = false;

  for (const check of checks) {
    console.log(`\n🔍 Running: ${check.name}`);
    console.log("─".repeat(40));

    try {
      const { stdout, stderr } = await execPromise(check.command);

      if (stdout) {
        console.log(stdout);
      }

      if (stderr && !stderr.includes('npm WARN')) {
        console.warn("⚠️  Warnings:", stderr);
      }

      console.log(`✅ ${check.name} completed`);
    } catch (error) {
      console.error(`❌ ${check.name} failed:`);
      console.error(error.stdout || error.message);

      if (check.critical) {
        hasErrors = true;
      }
    }
  }

  console.log("\n========================================");
  console.log("Security Audit Summary");
  console.log("========================================\n");

  if (hasErrors) {
    console.error("❌ Critical security issues found!");
    console.error("Please fix the issues before deploying.\n");
    process.exit(1);
  } else {
    console.log("✅ All critical security checks passed!");
    console.log("⚠️  Review any warnings above.\n");
  }

  // Additional security recommendations
  console.log("📋 Security Checklist:");
  console.log("  □ Review contract for reentrancy vulnerabilities");
  console.log("  □ Check access control modifiers");
  console.log("  □ Verify input validation");
  console.log("  □ Test with maximum gas limits");
  console.log("  □ Review time-dependent logic");
  console.log("  □ Check for integer overflow/underflow");
  console.log("  □ Verify event emissions");
  console.log("  □ Test emergency pause functionality\n");
}

runSecurityAudit().catch((error) => {
  console.error("Security audit failed:", error);
  process.exit(1);
});
