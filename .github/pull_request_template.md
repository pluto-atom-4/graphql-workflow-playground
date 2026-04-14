name: PR Template
description: Pull request template for feature development

# This template guides developers through creating pull requests

# that reference the AI agent workflow

---

## Description

<!-- Describe what this PR accomplishes -->

### Related Issue

<!-- Link to the issue this PR addresses -->

- Closes #123

### Type of Change

- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 🔧 Configuration/infrastructure
- [ ] 📝 Documentation
- [ ] ♻️ Refactoring

## Which Practice Area(s)?

- [ ] Practice 1 — Temporal & Kafka
- [ ] Practice 2 — Hasura & GraphQL
- [ ] Practice 3 — Next.js & Apollo
- [ ] Shared/Monorepo
- [ ] Infrastructure

## How It Works

This project uses **Copilot agents** to manage development:

1. **Product Manager Agent** → Defined requirements
2. **Orchestrator Agent** → Planned the work
3. **Developer Agent** → Implemented this PR
4. **Tester Agent** → Created tests
5. **Reviewer Agent** → Reviewed the code

See `.copilot/agents/` for details on each role.

## Changes Made

<!-- Describe the specific changes in this PR -->

- [ ] Added/modified code
- [ ] Added tests
- [ ] Updated documentation
- [ ] Updated dependencies

### Files Changed

<!-- List key files modified -->

-
-
-

## Testing

<!-- Describe how this was tested -->

### Unit Tests

- [ ] All tests pass: `pnpm test`
- [ ] Coverage adequate (>80%)

### Integration Tests

- [ ] Cross-practice integration verified (if applicable)

### Manual Testing

- [ ] Feature tested locally
- [ ] Error cases verified

## Code Quality

- [ ] Passes linting: `pnpm lint`
- [ ] Passes formatting: `pnpm format:check`
- [ ] Passes type-check: `pnpm type-check`
- [ ] TypeScript strict mode: ✅
- [ ] No `any` types without justification

## Documentation

- [ ] Updated `.github/copilot-instructions.md` (if applicable)
- [ ] Updated `.copilot/agents/` (if new agent responsibilities)
- [ ] Updated `DESIGN.md` (if architecture changed)
- [ ] Updated practice README (if applicable)
- [ ] Code comments explain complex logic

## Interview Relevance

<!-- How does this PR demonstrate the Stoke Space / Boltline context? -->

### Boltline Impact

- [ ] Demonstrates Temporal reliability
- [ ] Demonstrates GraphQL real-time capability
- [ ] Demonstrates Apollo optimistic updates
- [ ] Demonstrates Kafka async messaging
- [ ] Demonstrates monorepo coordination

### Talking Points

<!-- Add any interview talking points demonstrated in this PR -->

## Checklist

- [ ] Commits follow project conventions
- [ ] Code follows `.github/copilot-instructions.md` conventions
- [ ] All required checks pass
- [ ] Backward compatibility maintained (or breaking change documented)
- [ ] No secrets or credentials committed
- [ ] Branch is up to date with target branch

## Agent Sign-Off

<!-- This section is auto-populated by the AI review workflow -->

- **Developer**: Implemented per requirements
- **Tester**: Verified with adequate tests
- **Reviewer**: Approved for merge

---

**Merge Strategy**: Squash and merge (keeps history clean)

---

_This template follows the agent-driven development workflow described in `docs/agent-prompt-flows.md`_
