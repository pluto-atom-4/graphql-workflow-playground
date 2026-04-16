# Quality Assurance Hooks & Workflow

This document defines the code quality assurance (QA) standards, tools, and workflows that all agents must follow and enforce.

## Overview

The graphql-workflow-playground uses **three core QA tools** to maintain high code quality:

1. **ESLint** — Static code analysis for TypeScript/JavaScript
2. **Prettier** — Code formatting and style enforcement
3. **pnpm audit** — Security vulnerability detection

All changes must pass these QA checks before being merged.

---

## 1. ESLint Configuration

### What ESLint Does

ESLint analyzes code for:

- ✅ TypeScript type safety violations
- ✅ Unused imports and variables
- ✅ Naming convention violations
- ✅ Suspicious code patterns
- ✅ Missing error handling
- ✅ Code complexity issues

### Commands

#### In Each Practice Folder

```bash
# Check for violations
pnpm lint

# Auto-fix where possible (only safe fixes)
pnpm lint:fix

# Verify all issues resolved
pnpm lint
```

#### At Project Root

```bash
# Lint all practices simultaneously
pnpm lint

# Fix all practices
pnpm lint:fix
```

### ESLint by Practice

**Practice 1 (Temporal & Kafka)**:

- File: `practice-1-temporal-kafka/package.json`
- Command: `eslint src --ext .ts`
- Targets: TypeScript activities and workflows

**Practice 3 (Next.js & GraphQL)**:

- File: `practice-3-nextjs-graphql/package.json`
- Command: `eslint . --ext .ts,.tsx`
- Targets: TypeScript and JSX/React components

**Practice 2 (Hasura & GraphQL)**:

- File: `practice-2-hasura-graphql/package.json`
- Note: Minimal linting; primarily configuration/infrastructure

### Common ESLint Errors & Fixes

```typescript
// ❌ ERROR: Unused variable
const result = await api.fetch();

// ✅ FIXED: Remove unused variable
await api.fetch();

// ❌ ERROR: Missing 'any' type
function process(data) { ... }

// ✅ FIXED: Add explicit type
function process(data: OrderData): void { ... }

// ❌ ERROR: Missing error handling
await activity.execute();

// ✅ FIXED: Add try-catch
try {
  await activity.execute();
} catch (error) {
  logger.error('Activity failed', error);
  throw error;
}
```

---

## 2. Prettier Configuration

### What Prettier Does

Prettier enforces consistent code formatting:

- ✅ Consistent indentation (2 spaces)
- ✅ Quote style (double quotes in TS/JS)
- ✅ Line length (80 character default)
- ✅ Trailing commas in arrays/objects
- ✅ Spacing around operators
- ✅ JSX formatting

### Commands

#### In Each Practice Folder

```bash
# Check current formatting status
pnpm format:check

# Apply Prettier formatting
pnpm format

# Re-verify formatting passes
pnpm format:check
```

#### At Project Root

```bash
# Format all TypeScript, JSON, Markdown, GraphQL files
pnpm format

# Check formatting without changes
pnpm format:check
```

### Files Processed by Prettier

```
**/*.{ts,tsx,json,md,gql}
```

Excludes: `.gitignore` patterns

### Common Prettier Fixes

```typescript
// ❌ BEFORE: Inconsistent formatting
const order = { id: "123", name: "Widget", status: "PENDING" };

// ✅ AFTER: Prettier applied
const order = { id: "123", name: "Widget", status: "PENDING" };

// ❌ BEFORE: Long line
const result =
  (await validateOrder(order)) && (await reserveInventory(order)) && (await emitKafkaEvent(order));

// ✅ AFTER: Line wrapping applied
const result =
  (await validateOrder(order)) && (await reserveInventory(order)) && (await emitKafkaEvent(order));
```

---

## 3. pnpm audit (Security Vulnerabilities)

### What pnpm audit Does

pnpm audit scans dependencies for:

- ✅ Known security vulnerabilities
- ✅ Outdated package versions
- ✅ Breaking changes in dependencies

### Commands

```bash
# From root directory only
cd /home/pluto-atom-4/Documents/full-stack/graphql-workflow-playground

# Audit all dependencies for vulnerabilities
pnpm audit

# Review detailed audit report
pnpm audit --json

# Attempt automatic fixes (use with caution)
pnpm audit --fix

# Force latest versions (high risk—test thoroughly)
pnpm audit --force
```

### Reading the Audit Report

```
┌──────────────────────────────────────────────────────────────────┐
│                        pnpm audit report                          │
├──────────────────────────────────────────────────────────────────┤
│ found X vulnerabilities (Y critical, Z high, A moderate)         │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Vulnerability: OPEN_REDIRECT                                   │
│ Severity: high                                                  │
│ Affected versions: >3.0.0 <3.2.1                              │
│ Recommendation: Upgrade to 3.2.1 or later                     │
│ More info: https://nvd.nist.gov/vuln/detail/CVE-2024-12345 │
└─────────────────────────────────────────────────────────────────┘
```

### Policy on Vulnerabilities

**Critical/High Severity**:

- Must be fixed before merge
- May require dependency update or workaround
- Escalate to Orchestrator if blocking

**Moderate Severity**:

- Should be fixed; acceptable to defer with justification
- Document in PR why deferring

**Low Severity**:

- Log for tracking; not a blocker
- Fix when convenient

---

## Developer Workflow (QA Pre-Commit Checklist)

### Step-by-Step QA Before Committing

```bash
# 1. Navigate to practice folder
cd practice-1-temporal-kafka  # or practice-2-* or practice-3-*

# 2. Run ESLint check
pnpm lint
# If failures → pnpm lint:fix → pnpm lint (verify)

# 3. Run Prettier check
pnpm format:check
# If failures → pnpm format → pnpm format:check (verify)

# 4. Run TypeScript check
pnpm type-check

# 5. Run tests
pnpm test

# 6. Build verification
pnpm build

# 7. Return to root and audit dependencies
cd ../..
pnpm audit
# If vulnerabilities → review and document

# 8. If all pass → ready to commit
git add .
git commit -m "feat: [description]

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Automated QA Script (Optional)

Save as `.copilot/scripts/qa-check.sh`:

```bash
#!/bin/bash

PRACTICE=$1

if [ -z "$PRACTICE" ]; then
  echo "Usage: ./qa-check.sh <practice-folder>"
  echo "Example: ./qa-check.sh practice-1-temporal-kafka"
  exit 1
fi

cd "$PRACTICE" || exit 1

echo "🔍 Running QA checks for $PRACTICE..."

echo "1️⃣  ESLint..."
pnpm lint || { echo "❌ ESLint failed"; exit 1; }

echo "2️⃣  Prettier..."
pnpm format:check || { echo "❌ Prettier failed"; exit 1; }

echo "3️⃣  TypeScript..."
pnpm type-check || { echo "❌ TypeScript failed"; exit 1; }

echo "4️⃣  Tests..."
pnpm test || { echo "❌ Tests failed"; exit 1; }

echo "5️⃣  Build..."
pnpm build || { echo "❌ Build failed"; exit 1; }

cd ..
echo "6️⃣  Security audit..."
pnpm audit || echo "⚠️  Review audit results"

echo "✅ All QA checks passed!"
```

---

## Reviewer Workflow (QA Verification)

### Before Approving a PR

The Reviewer must verify all QA checks passed:

```bash
# Checkout PR branch
git checkout pr-branch

# 1. Verify ESLint passes
pnpm lint
# If fails → Request changes

# 2. Verify Prettier passes
pnpm format:check
# If fails → Request changes

# 3. Verify TypeScript strict mode passes
pnpm type-check
# If fails → Request changes

# 4. Verify tests pass
pnpm test
# If fails → Request changes

# 5. Verify build succeeds
pnpm build
# If fails → Request changes

# 6. From root: Verify no new vulnerabilities
pnpm audit
# If new critical/high → Request changes; defer moderate/low
```

### Reviewer Checklist

- [ ] ESLint: `pnpm lint` passes with no violations
- [ ] Prettier: `pnpm format:check` passes (code is properly formatted)
- [ ] TypeScript: `pnpm type-check` passes (strict mode compliance)
- [ ] Tests: `pnpm test` passes with adequate coverage (>80% new code)
- [ ] Build: `pnpm build` succeeds without errors
- [ ] Security: `pnpm audit` shows no new critical/high vulnerabilities
- [ ] Commit: Message includes Co-authored-by trailer
- [ ] Documentation: README/comments updated if needed

---

## CI/CD Integration

The GitHub Actions workflow automatically runs QA checks on every PR:

```yaml
# .github/workflows/ci.yml - Actual structure
jobs:
  lint-format:
    name: 📝 Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm lint
      - run: pnpm format:check

  type-check:
    name: 🔍 Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm type-check

  build:
    name: 🔨 Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm build

  test:
    name: ✅ Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm test

  practice-1-temporal:
    name: 🚀 Practice 1 (Temporal & Kafka)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm --filter @boltline/practice-temporal test

  practice-3-nextjs:
    name: 🚀 Practice 3 (Next.js & GraphQL)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm --filter @boltline/practice-nextjs-graphql test

  security-checks:
    name: 📦 Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit --prod # Scans production dependencies only

  all-checks-pass:
    name: All Checks Pass
    runs-on: ubuntu-latest
    needs:
      [
        lint-format,
        type-check,
        build,
        test,
        practice-1-temporal,
        practice-3-nextjs,
        security-checks,
      ]
    if: always()
    steps:
      - name: Verify all checks passed
        run: |
          # Exit with error if any required job failed
          exit 1 if any dependency failed
```

**Key points:**

- **Lint & Format combined**: Both run in the same job for efficiency
- **Security on all events**: `security-checks` runs on all pushes and PRs (not PR-only)
- **--prod flag**: Scans only production dependencies (excludes dev/peer dependencies) for a faster, focused audit
- **All-checks-pass gate**: Blocks merge until ALL 7 jobs succeed

---

## Troubleshooting QA Issues

### ESLint Errors Won't Fix Automatically

```bash
# Verbose output
pnpm lint --debug

# Check eslintrc for conflicts
cat .eslintrc.json

# Reset node_modules if config changed
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Prettier Conflicts with ESLint

```bash
# Ensure both pass together
pnpm lint:fix
pnpm format
pnpm lint  # Should still pass

# If conflict persists, check eslintrc for format rules
```

### pnpm audit Reports False Positives

```bash
# Review vulnerability details
pnpm audit --json | grep -A 10 "CVE-2024-xxxxx"

# Check if it affects your code path
# Document if false positive; note for tracking
```

### Dependencies Won't Update

```bash
# Use pnpm to update specific package
pnpm update package-name@latest

# Or update all
pnpm update -r

# Then re-audit
pnpm audit
```

---

## Agent Responsibilities

### Developer

- ✅ Run QA checks before committing
- ✅ Fix all ESLint violations
- ✅ Apply Prettier formatting
- ✅ Ensure tests pass
- ✅ Address pnpm audit findings

### Reviewer

- ✅ Verify all QA checks pass before approving
- ✅ Request changes if QA fails
- ✅ Check PR against approval threshold
- ✅ Ensure security vulnerabilities addressed

### Tester

- ✅ Verify ESLint/Prettier/audit pass as part of test validation
- ✅ Report coverage metrics
- ✅ Ensure tests meet >80% threshold

### Orchestrator

- ✅ Ensure QA standards applied consistently
- ✅ Escalate if QA tools misconfigured
- ✅ Track blockers caused by failing QA

### Product Manager

- ✅ Understand QA standards for acceptance criteria
- ✅ Factor QA time into feature timelines

---

## Key Takeaways

| Tool       | Purpose                    | Command           | Frequency  |
| ---------- | -------------------------- | ----------------- | ---------- |
| ESLint     | Type safety & code quality | `pnpm lint`       | Per commit |
| Prettier   | Code formatting            | `pnpm format`     | Per commit |
| pnpm audit | Security vulnerabilities   | `pnpm audit`      | Per commit |
| TypeScript | Type checking              | `pnpm type-check` | Per commit |
| Tests      | Functionality verification | `pnpm test`       | Per commit |
| Build      | Compilation success        | `pnpm build`      | Per commit |

**Golden Rule**: No code reaches code review without passing all QA checks.

---

## Resources

- `.github/workflows/ci.yml` — CI/CD pipeline definitions
- Root `package.json` — Project-level scripts
- Individual practice `package.json` — Practice-specific scripts
- `.eslintrc.json` files — ESLint configuration
- `.prettierrc.json` files — Prettier configuration
