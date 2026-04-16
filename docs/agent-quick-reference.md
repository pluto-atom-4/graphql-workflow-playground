# Agent Quick Reference Card

**Use this one-page guide when working with Copilot agents.**

⚠️ **First Time?** Read the **[Code Quality Standards](./../.copilot/agents/quality-assurance.md)** to understand ESLint, Prettier, and npm audit requirements.

---

## The Agent Team

| Agent               | Icon | Purpose                                              |
| ------------------- | ---- | ---------------------------------------------------- |
| **Product Manager** | 📋   | Defines features, requirements, acceptance criteria  |
| **Orchestrator**    | 🎯   | Plans work, tracks dependencies, sequences tasks     |
| **Developer**       | 💻   | Writes code, implements features, fixes bugs         |
| **Tester**          | ✅   | Designs tests, validates code, writes test files     |
| **Reviewer**        | 👀   | Reviews code, validates architecture, catches issues |

---

## When to Use Each Agent

### 📋 Product Manager

```
@product-manager

Create acceptance criteria for [feature]

Consider:
- Shop-floor reality (WiFi, device crashes)
- Interview talking points
- Cross-practice impact
```

### 🎯 Orchestrator

```
@orchestrator

Break down this work into tasks:
[Feature description]

Provide:
- Task breakdown
- Dependencies
- Recommended sequence
```

### 💻 Developer

```
@developer

Implement [feature name]

Context: [background]
Requirements: [list]
Files: [paths]
```

### ✅ Tester

```
@tester

Write tests for [code/feature]

Must test:
- Happy path
- Error cases
- Edge cases
```

### 👀 Reviewer

```
@reviewer

Review this code:
[Files changed]

Focus on:
- Type safety
- Error handling
- Performance
```

---

## Feature Development Flow

```
📋 Product Manager → Define feature
        ↓
🎯 Orchestrator → Plan tasks & dependencies
        ↓
💻 Developer → Implement feature
        ↓
✅ Tester → Write tests & validate
        ↓
👀 Reviewer → Code review & approval
        ↓
🎯 Orchestrator → Mark complete
```

---

## Prompt Template

Use this structure for better results:

```
@[agent-name]

[What you want]

Context:
- [Relevant background]
- [Related files]
- [Constraints]

Requirements:
- [Req 1]
- [Req 2]
- [Req 3]

Output:
- [What format do you want?]
```

---

## Quick Tips

✅ **Be Specific**

```
❌ "Help me implement inventory"
✅ "Implement Apollo Client subscription for inventory updates
    in practice-3-nextjs-graphql/lib/hooks/useInventorySubscription.ts"
```

✅ **Provide Context**

```
❌ "Write a test"
✅ "Write Jest test for useInventorySubscription hook.
    Must test: subscription lifecycle, cache updates, error handling"
```

✅ **Use Project Docs**

- `.github/copilot-instructions.md` — Commands & conventions
- `DESIGN.md` — Architecture patterns
- `CLAUDE.md` — Technology details
- `.copilot/agents/` — Agent responsibilities

✅ **Chain Agents** (don't ask one to do everything)

```
@developer → write code
@tester → write tests
@reviewer → review code
```

✅ **Reference Previous Steps**

```
Based on this implementation from Developer:
[paste the code]

Now @tester, write tests for it...
```

---

## Common Scenarios

### Adding a New Temporal Activity

1. **@product-manager** → Define what it does
2. **@orchestrator** → Plan impact & blockers
3. **@developer** → Implement activity
4. **@tester** → Write unit & integration tests
5. **@reviewer** → Verify idempotency & error handling

### Adding a New GraphQL Type

1. **@product-manager** → Define data model
2. **@orchestrator** → Check schema impact
3. **@developer** → Create migration + metadata
4. **@tester** → Write query/subscription tests
5. **@reviewer** → Check relationships & constraints

### Fixing a Bug

1. **@orchestrator** → Diagnose & plan fix
2. **@developer** → Implement fix
3. **@tester** → Write regression test
4. **@reviewer** → Validate fix completeness

---

## Anti-Patterns: Don't Do This ❌

- Ask one agent to design + implement + test + review (breaks specialization)
- Ask one agent to work on 2+ unrelated tasks (loses focus)
- Make architectural decisions without context from Orchestrator (miss constraints)
- Ignore escalation criteria (blockers compound)
- Use default model for complex multi-practice tasks (insufficient reasoning)

Instead: **Chain agents by specialty** and **follow escalation thresholds**

---

## Multi-Agent Conversation Example

```
@orchestrator
The inventory subscription is slow. How do we approach this?

→ [get diagnosis & tasks]

@developer
Implement the optimizations suggested

→ [get optimized code]

@tester
Write performance tests ensuring <500ms

→ [get performance tests]

@reviewer
Verify the approach is correct

→ [get approval]
```

---

## Prompt Anti-Patterns

| ❌ Anti-Pattern                 | ✅ Better Approach                      |
| ------------------------------- | --------------------------------------- |
| "Help me" (too vague)           | "Implement X with these requirements"   |
| No context                      | Include files, constraints, background  |
| One agent for everything        | Chain agents by specialty               |
| "Is this right?" (no specifics) | "@reviewer Check for [specific issues]" |
| Too much rambling               | Concise, structured requirements        |

---

## Copilot CLI Commands Quick Reference

Use these GitHub Copilot CLI commands to enhance your workflow:

| Command         | Purpose                               | Common Use                                |
| --------------- | ------------------------------------- | ----------------------------------------- |
| **`/plan`**     | Create implementation plan            | Start complex feature, define approach    |
| **`/diff`**     | Review changes before committing      | Validate changes before pushing           |
| **`/review`**   | Automated code review                 | Find bugs and issues before merge         |
| **`/ask`**      | Ask clarifying questions              | Unblock without changing context          |
| **`/delegate`** | Send work to GitHub (auto-create PR)  | Escalate multi-practice or blocker issues |
| **`/lsp`**      | Language server for code intelligence | Navigate, find definitions, refactor      |
| **`/tasks`**    | View and manage background tasks      | Monitor long-running operations           |
| **`/fleet`**    | Enable parallel subagent execution    | Run multiple agents in parallel           |

**Example Usage:**

```
/plan   → Create feature implementation plan
/diff   → Review your code changes before git push
/ask    → "What's the best way to structure this?" (without losing context)
/review → Get automated code quality check
/delegate → "This impacts 3 practices, escalate to GitHub PR"
```

---

## Model Override Policy

**Default Model**: Claude Haiku 4.5 (cost-efficient, fast)

**When to Use Premium Models** (requires explicit `/model` command):

- **`gpt-5.4`** — Complex multi-practice architectural decisions
- **`claude-sonnet-4.6`** — Large codebase analysis, refactoring
- **`claude-opus-4.6`** — Emergency high-complexity debugging

**How to Override:**

```
/model gpt-5.4

@developer
[Your task that needs premium reasoning]

Justification: Multi-practice impact requires complex tradeoff analysis
```

**Cost Control**: Premium model requests are logged. Use sparingly for genuinely complex work.

---

## Escalation Criteria (Specific Thresholds)

### 🎯 Orchestrator

- **Handle**: 0–1 concurrent blockers
- **Escalate**: 2+ concurrent blockers OR work blocked >2 hours
- **Red Flags**: Multi-practice dependencies without clear sequence

### 📋 Product Manager

- **Approve**: 0–10% scope creep (feature aligned with original goal)
- **Review**: 10–30% scope creep (borderline, needs refinement)
- **Restart**: >30% scope creep (restart requirement gathering)

### ✅ Tester

- **Block PR**: Code coverage <80% (non-negotiable)
- **Report Flaky**: Tests pass <95% consistently (investigate)
- **Escalate**: Any test takes >5 seconds to run (performance issue)

### 👀 Reviewer

- **Block PR**: Critical bugs or security issues (blocker red flags)
- **Request Changes**: Type safety issues, missing error handling
- **Approve**: Minor code style issues only (non-blocking)

### 💻 Developer

- **Escalate to Orchestrator**: Multi-practice impact unclear OR depends on unfinished task

---

## Tool Interactions Reference

How Copilot agents use CLI tools:

| Agent               | Primary Tools                | Secondary Tools     | Rarely Used |
| ------------------- | ---------------------------- | ------------------- | ----------- |
| **Orchestrator**    | `/plan`, `/ask`, `/delegate` | `/diff`, `/tasks`   | `/lsp`      |
| **Product Manager** | `/ask`, `/plan`              | `/review`           | `/delegate` |
| **Developer**       | `/lsp`, `/diff`, `/plan`     | `/ask`, `/review`   | `/fleet`    |
| **Tester**          | `/plan`, `/ask`, `/diff`     | `/review`, `/tasks` | `/delegate` |
| **Reviewer**        | `/review`, `/diff`, `/lsp`   | `/ask`, `/tasks`    | `/plan`     |

**When to Use Each:**

- **`/ask`** → Clarify without escalating (Developer ↔ Orchestrator)
- **`/delegate`** → Escalate blocker to GitHub (all agents)
- **`/diff`** → Validate before commit (all agents)
- **`/fleet`** → Run parallel tasks (Orchestrator coordinating agents)

---

## Red Flags 🚩 vs. Escalation Criteria ✅

**Instead of generic "Red Flags", use specific escalation criteria:**

| Scenario                          | What to Do                                       |
| --------------------------------- | ------------------------------------------------ |
| 1 blocker, <2 hours               | Orchestrator handles directly                    |
| 2+ blockers OR >2 hours blocked   | Orchestrator escalates via `/delegate`           |
| Scope creep 5%                    | Product Manager approves                         |
| Scope creep 20%                   | Product Manager refines with stakeholder         |
| Scope creep 35%                   | Product Manager escalates `/delegate` to restart |
| Test coverage 85%                 | Tester approves                                  |
| Test coverage 75%                 | Tester blocks PR, requests additional tests      |
| Code has type errors              | Reviewer blocks PR                               |
| Code has style issues             | Reviewer requests minor changes (non-blocking)   |
| Task affects 2+ practices unclear | Developer escalates `/ask` to Orchestrator       |

---

## Meta-Agent Collaboration Guide

**For advanced workflows, see:** [`.copilot/agents/README.md`](../.copilot/agents/README.md)

This guide includes:

- Communication flow diagram showing how agents interact
- CLI commands matrix (which agent uses which commands)
- 3 real-world multi-agent scenarios with exact command sequences
- Model override coordination policy
- Complete escalation matrix with decision trees

---

## Key Files

- **`docs/agent-prompt-flows.md`** — Full onboarding guide (you're reading an excerpt)
- **`.copilot/agents/`** — Agent documentation (read for details)
- **`.copilot/agents/README.md`** — Meta-Agent Collaboration guide (advanced)
- **`.github/copilot-instructions.md`** — Build/test commands & conventions
- **`DESIGN.md`** — Architecture patterns

---

## Getting Help

1. **For workflow?** → Ask **@orchestrator**
2. **For implementation?** → Ask **@developer**
3. **For code review?** → Ask **@reviewer**
4. **For testing?** → Ask **@tester**
5. **For requirements?** → Ask **@product-manager**

---

**Pro Tip:** Save this file and reference it during development. The full guide is in `docs/agent-prompt-flows.md`.
