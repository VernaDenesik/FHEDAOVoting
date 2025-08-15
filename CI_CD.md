# CI/CD Pipeline Documentation

## Overview

This project uses **GitHub Actions** for continuous integration and continuous deployment, providing automated testing, code quality checks, and security analysis on every push and pull request.

## Pipeline Architecture

### Workflow Triggers

The CI/CD pipeline runs automatically on:
- ✅ Every push to `main` branch
- ✅ Every push to `develop` branch
- ✅ All pull requests to `main` or `develop`

### Multi-Node Testing

Tests run on multiple Node.js versions to ensure compatibility:
- **Node.js 18.x** (LTS)
- **Node.js 20.x** (Active LTS)

## CI/CD Jobs

### 1. Test on Node.js 18.x

**Purpose**: Ensure compatibility with Node.js 18 LTS

**Steps**:
1. Checkout code
2. Setup Node.js 18.x environment
3. Install dependencies (`npm ci`)
4. Compile contracts
5. Run test suite
6. Generate coverage report
7. Upload coverage to Codecov

**Artifacts**:
- Coverage report (lcov.info)

### 2. Test on Node.js 20.x

**Purpose**: Ensure compatibility with Node.js 20 Active LTS

**Steps**:
1. Checkout code
2. Setup Node.js 20.x environment
3. Install dependencies (`npm ci`)
4. Compile contracts
5. Run test suite
6. Generate coverage report
7. Upload coverage to Codecov

**Artifacts**:
- Coverage report (lcov.info)

### 3. Code Quality Checks

**Purpose**: Enforce code quality standards

**Checks**:
- ✅ **Solhint** - Solidity linting
- ✅ **Prettier** - Code formatting verification
- ✅ **Compilation** - Successful contract compilation

**Steps**:
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Run Solhint on contracts
5. Check code formatting with Prettier
6. Compile contracts

### 4. Security Analysis

**Purpose**: Identify security vulnerabilities

**Tools**:
- ✅ **Slither** - Static analysis for Solidity

**Steps**:
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Run Slither static analysis

**Note**: Security checks continue on error to not block the pipeline.

### 5. Gas Usage Report

**Purpose**: Monitor gas consumption

**Output**:
- Gas report for all contract functions
- Comparative gas usage metrics

**Steps**:
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Run tests with gas reporting enabled
5. Upload gas report as artifact

## Code Quality Tools

### Solhint Configuration

**File**: `.solhint.json`

**Rules Enforced**:
- Code complexity ≤ 8
- Compiler version: ^0.8.24
- Function visibility enforcement
- Max line length: 120 characters
- Naming conventions (camelCase, mixedCase)
- Import ordering
- Visibility modifier ordering

**Usage**:
```bash
# Run Solhint
npm run lint:sol

# Auto-fix issues
npm run lint:fix
```

### Prettier Configuration

**File**: `.prettierrc.json`

**Settings**:
- Print width: 120 characters
- Tab width: 2 spaces (4 for Solidity)
- Semicolons: required
- Single quotes: false
- Trailing commas: ES5
- End of line: LF

**Usage**:
```bash
# Check formatting
npm run prettier:check

# Auto-format code
npm run prettier:write
```

### Codecov Integration

**File**: `codecov.yml`

**Configuration**:
- Coverage precision: 2 decimal places
- Acceptable range: 70-100%
- Auto target with 1% threshold
- Ignores: test/, scripts/, node_modules/

**Badges**:
Add to README.md:
```markdown
[![codecov](https://codecov.io/gh/USERNAME/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/USERNAME/REPO)
```

## Local Development

### Pre-commit Checks

Before committing, run:

```bash
# Run all quality checks
npm run lint

# Auto-fix formatting issues
npm run format

# Run tests
npm test

# Check coverage
npm run coverage
```

### Quality Scripts

| Command | Description |
|---------|-------------|
| `npm run lint` | Run all linters (Solhint + Prettier) |
| `npm run lint:sol` | Run Solhint on Solidity files |
| `npm run lint:fix` | Auto-fix Solhint issues |
| `npm run prettier:check` | Check code formatting |
| `npm run prettier:write` | Auto-format all files |
| `npm run format` | Alias for prettier:write |
| `npm run coverage` | Generate coverage report |

## GitHub Actions Workflow

### File Structure

```
.github/
└── workflows/
    └── test.yml          # Main CI/CD workflow
```

### Workflow File: `test.yml`

**Jobs**:
1. `test-node-18` - Test on Node.js 18.x
2. `test-node-20` - Test on Node.js 20.x
3. `code-quality` - Code quality checks
4. `security-analysis` - Security scanning
5. `gas-report` - Gas usage reporting

### Secrets Required

Add these secrets in GitHub repository settings:

| Secret | Description | Required |
|--------|-------------|----------|
| `CODECOV_TOKEN` | Codecov upload token | Yes |

**How to add**:
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add `CODECOV_TOKEN` with your Codecov token

### Status Badges

Add to README.md:

```markdown
![Tests](https://github.com/USERNAME/REPO/workflows/Tests/badge.svg)
[![codecov](https://codecov.io/gh/USERNAME/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/USERNAME/REPO)
```

## Coverage Reports

### Viewing Coverage

**Locally**:
```bash
npm run coverage
```

Output location: `./coverage/index.html`

**On Codecov**:
Visit: `https://codecov.io/gh/USERNAME/REPO`

### Coverage Metrics

Target coverage goals:
- **Statements**: ≥95%
- **Branches**: ≥90%
- **Functions**: 100%
- **Lines**: ≥95%

## Gas Reporting

### Generating Gas Reports

```bash
REPORT_GAS=true npm test
```

Output: `gas-report.txt`

### Gas Report Contents

- Gas usage per function
- Average gas costs
- Method call comparisons
- Deployment costs

## Continuous Integration Best Practices

### 1. Always Run Tests Locally

Before pushing:
```bash
npm run lint
npm test
npm run coverage
```

### 2. Keep Dependencies Updated

Regularly update:
```bash
npm update
npm audit fix
```

### 3. Review CI Failures

When CI fails:
1. Check the GitHub Actions logs
2. Reproduce locally
3. Fix the issue
4. Re-run checks before pushing

### 4. Monitor Coverage

- Keep coverage above 90%
- Add tests for new features
- Don't decrease coverage

## Troubleshooting

### Common CI Issues

**Issue**: Tests fail on CI but pass locally
- **Solution**: Ensure dependencies are locked with `package-lock.json`

**Issue**: Codecov upload fails
- **Solution**: Check `CODECOV_TOKEN` secret is set correctly

**Issue**: Prettier checks fail
- **Solution**: Run `npm run format` locally before pushing

**Issue**: Solhint errors
- **Solution**: Fix issues with `npm run lint:fix` or manually

### Debug Mode

To debug GitHub Actions:
1. Add `ACTIONS_STEP_DEBUG` secret with value `true`
2. Re-run workflow to see detailed logs

## Deployment Pipeline

### Automated Deployment (Future)

The workflow can be extended for automated deployment:

```yaml
deploy:
  needs: [test-node-18, test-node-20, code-quality]
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: actions/checkout@v4
    - name: Deploy to Sepolia
      run: npm run deploy:sepolia
      env:
        SEPOLIA_RPC_URL: ${{ secrets.SEPOLIA_RPC_URL }}
        PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
```

## Security Scanning

### Slither Analysis

Automated static analysis runs on every PR:

**Checks**:
- Reentrancy vulnerabilities
- Integer overflow/underflow
- Unprotected functions
- Gas optimization opportunities

**View Results**:
Check GitHub Actions → Security Analysis job

## Performance Monitoring

### Gas Usage Tracking

Gas reports are generated on every run:

**Access**:
1. Go to GitHub Actions run
2. Click on "Gas Usage Report" job
3. Download `gas-report` artifact

### Benchmark Comparisons

Track gas usage over time:
- Compare reports between commits
- Identify gas regressions
- Optimize high-gas functions

## Maintenance

### Updating Workflow

To modify the CI/CD pipeline:

1. Edit `.github/workflows/test.yml`
2. Test changes in a feature branch
3. Verify all jobs pass
4. Merge to main

### Updating Dependencies

GitHub Actions dependencies:
- `actions/checkout` - Latest: v4
- `actions/setup-node` - Latest: v4
- `codecov/codecov-action` - Latest: v4
- `actions/upload-artifact` - Latest: v4

## Summary

The CI/CD pipeline provides:
- ✅ **Automated testing** on multiple Node.js versions
- ✅ **Code quality** enforcement with Solhint and Prettier
- ✅ **Security analysis** with Slither
- ✅ **Coverage tracking** with Codecov
- ✅ **Gas monitoring** for optimization
- ✅ **Fast feedback** on every commit

**Pipeline Status**: All checks must pass before merging to main.

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Codecov Documentation](https://docs.codecov.com/)
- [Slither Documentation](https://github.com/crytic/slither)

---

**Last Updated**: 2024
**Workflow Version**: 1.0
**Maintained By**: Development Team
