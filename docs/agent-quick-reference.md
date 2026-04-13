# Agent Quick Reference Card

**Use this one-page guide when working with Copilot agents.**

---

## The Agent Team

| Agent | Icon | Purpose |
|-------|------|---------|
| **Product Manager** | 📋 | Defines features, requirements, acceptance criteria |
| **Orchestrator** | 🎯 | Plans work, tracks dependencies, sequences tasks |
| **Developer** | 💻 | Writes code, implements features, fixes bugs |
| **Tester** | ✅ | Designs tests, validates code, writes test files |
| **Reviewer** | 👀 | Reviews code, validates architecture, catches issues |

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

## Red Flags 🚩

Don't ask one agent to:
- Design + implement + test + review (breaks specialization)
- Work on multiple unrelated tasks (loses focus)
- Make architectural decisions without context (may miss constraints)

Instead: **Chain agents** (each handles their specialty)

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

| ❌ Anti-Pattern | ✅ Better Approach |
|---|---|
| "Help me" (too vague) | "Implement X with these requirements" |
| No context | Include files, constraints, background |
| One agent for everything | Chain agents by specialty |
| "Is this right?" (no specifics) | "@reviewer Check for [specific issues]" |
| Too much rambling | Concise, structured requirements |

---

## Key Files

- **`docs/agent-prompt-flows.md`** — Full onboarding guide (you're reading an excerpt)
- **`.copilot/agents/`** — Agent documentation (read for details)
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
