# Developer Onboarding: Agent Prompt Flows

Welcome to the graphql-workflow-playground! This project uses **Copilot agents** to streamline development across multiple roles. This guide explains how to use these agents effectively through prompt flows.

---

## 🚀 Quick Start: Copilot CLI Commands

These commands accelerate your workflow. Use them throughout development:

| Command         | What It Does                          | Example                                    |
| --------------- | ------------------------------------- | ------------------------------------------ |
| **`/plan`**     | Create implementation plan            | `/plan` → Break down a complex feature     |
| **`/diff`**     | Review changes before commit          | `/diff` → Check your code changes          |
| **`/review`**   | Automated code review                 | `/review` → Find bugs automatically        |
| **`/ask`**      | Ask clarifying questions              | `/ask` → Unblock without losing context    |
| **`/delegate`** | Escalate to GitHub PR                 | `/delegate` → Send blocker to GitHub       |
| **`/lsp`**      | Language server (go-to-def, refactor) | `/lsp` → Navigate large codebase           |
| **`/tasks`**    | View background operations            | `/tasks` → Monitor long-running work       |
| **`/fleet`**    | Run agents in parallel                | `/fleet` → Orchestrator uses to run agents |

**Most Important**: Use `/plan` to start complex work, `/diff` before git push, `/review` before merging.

---

## Model Override Guidance

**Default**: Claude Haiku 4.5 (fast, cost-efficient) ✅

**Premium Models** (require explicit `/model` + justification):

- `gpt-5.4` — Complex multi-practice architecture
- `claude-sonnet-4.6` — Large codebase analysis
- `claude-opus-4.6` — Emergency high-complexity debugging

**How to use**:

```
/model claude-sonnet-4.6

@developer
[Complex task that needs premium reasoning]

Justification: Analyzing 3 practices' interaction patterns
```

**Policy**: Premium requests are tracked. Use for genuinely complex work only.

---

## What Are Agents?

Agents are specialized assistants, each with deep knowledge of their role:

- **Product Manager** — Defines features and requirements
- **Orchestrator** — Plans and coordinates work
- **Developer** — Implements features and fixes bugs
- **Tester** — Validates code and designs tests
- **Reviewer** — Reviews code quality and architecture

Instead of asking one general assistant, you invoke specific agents for specific tasks. This leads to better results and faster feedback.

---

## Agent Overview

| Agent               | When to Use                                             | Example Prompt                                            |
| ------------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| **Product Manager** | Define a feature, validate requirements                 | "Create acceptance criteria for a new workflow feature"   |
| **Orchestrator**    | Plan complex work, break tasks down, track dependencies | "Break down the order fulfillment feature into tasks"     |
| **Developer**       | Write code, fix bugs, implement features                | "Implement the validateOrder activity in Temporal"        |
| **Tester**          | Design tests, validate edge cases, write test code      | "Write Jest tests for the validateOrder activity"         |
| **Reviewer**        | Code review, validate architecture, catch issues        | "Review my Apollo Client mutation for performance issues" |

---

## The Feature Development Workflow

Here's how agents work together to take a feature from idea to production:

### Phase 1: Definition (Product Manager)

**Your Prompt:**

```
@product-manager

Create acceptance criteria for this feature:
"Allow technicians to see real-time inventory updates on the work plan screen"

Consider:
- Poor WiFi on shop floor
- Multiple technicians viewing same inventory
- GraphQL subscriptions for real-time
- Optimistic updates in Apollo Client

Output: User stories and acceptance criteria (Given/When/Then)
```

**What You Get:**

- Clear feature definition
- Acceptance criteria
- Technical approach notes
- Interview talking points

### Phase 2: Planning (Orchestrator)

**Your Prompt:**

```
@orchestrator

Break down this feature into tasks:
Feature: Real-time inventory updates on work plan screen
Practices: Hasura (Practice 2), Next.js/Apollo (Practice 3)

Please provide:
1. Task breakdown with dependencies
2. Which practices each task touches
3. Recommended sequence
4. Any blockers or prerequisites
```

**What You Get:**

- Task list with clear order
- Dependency graph
- Risk assessment
- Implementation approach

### Phase 3: Implementation (Developer)

**Your Prompt:**

```
@developer

Implement the Apollo Client subscription for inventory updates.

Context:
- Use GraphQL subscription ON_INVENTORY_CHANGE
- Subscribe in useEffect hook
- Update Apollo cache with new data
- Handle subscription errors gracefully

File: practice-3-nextjs-graphql/lib/hooks/useInventorySubscription.ts

Requirements:
- TypeScript strict mode
- Proper cleanup on unmount
- Error handling with console.error
```

**What You Get:**

- Production-ready implementation
- Tests included if appropriate
- TypeScript types
- Error handling

### Phase 4: Testing (Tester)

**Your Prompt:**

```
@tester

Write Jest tests for the inventory subscription hook.

Hook: useInventorySubscription.ts
Must test:
1. Subscription starts on mount
2. Cache updates when new data arrives
3. Unsubscribe on component unmount
4. Handles subscription errors gracefully

Use @apollo/client/testing for mocks.
Target: >85% coverage
```

**What You Get:**

- Test file with full coverage
- Mock setup examples
- Edge case tests
- Performance checks

### Phase 5: Code Review (Reviewer)

**Your Prompt:**

```
@reviewer

Review this code for issues:
- File: practice-3-nextjs-graphql/lib/hooks/useInventorySubscription.ts
- Changes: Added inventory subscription with Apollo cache updates

Check for:
1. Memory leaks (unsubscribe on unmount?)
2. Cache normalization (__typename present?)
3. Error handling completeness
4. TypeScript type safety
5. Performance issues (unnecessary re-renders?)

Provide specific line-by-line feedback.
```

**What You Get:**

- Detailed code review
- Bugs identified
- Suggestions for improvement
- Approval or requests for changes

---

## Real Example Prompt Flows

### Scenario 1: Bug Fix

**Step 1: Understand (Orchestrator)**

```
@orchestrator

I found a bug: GraphQL subscription for inventory doesn't update the UI
when another technician reserves a part.

Help me diagnose:
1. Where might the issue be? (Schema? Subscription? Cache?)
2. What should I investigate first?
3. How do the three practices interact here?
```

**Step 2: Fix (Developer)**

```
@developer

I think the issue is Apollo cache not updating when subscription fires.

File: practice-3-nextjs-graphql/lib/hooks/useInventorySubscription.ts

Current code updates cache like:
  cache.modify({ fields: { inventory: () => newData } })

But this isn't reactive. How do I properly update the cache
so the component re-renders?

Show me the correct Apollo cache update pattern for subscriptions.
```

**Step 3: Test (Tester)**

```
@tester

I fixed the inventory subscription cache update.

New approach:
  subscription.onNext((data) => {
    client.cache.writeQuery({ query: GET_INVENTORY, data })
  })

Write a Jest test to verify:
1. Cache is updated with new inventory
2. Component re-renders with new data
3. __typename is present in cache entries
```

**Step 4: Review (Reviewer)**

```
@reviewer

Please review my subscription fix:

Files changed:
- practice-3-nextjs-graphql/lib/hooks/useInventorySubscription.ts
- practice-3-nextjs-graphql/__tests__/useInventorySubscription.test.ts

Focus on:
1. Is the cache update approach correct?
2. Am I properly handling Apollo cache normalization?
3. Any performance concerns with re-renders?
4. Missing error cases?
```

### Scenario 2: Cross-Practice Feature

**Step 1: Define (Product Manager)**

```
@product-manager

We want to add a new feature: "Technician can mark a part as defective
and it reduces inventory."

This touches:
- Temporal workflow (Practice 1) - emit event
- GraphQL/Schema (Practice 2) - track defective status
- UI (Practice 3) - show defective button

Create acceptance criteria and approach for each practice.
```

**Step 2: Plan (Orchestrator)**

```
@orchestrator

Using these acceptance criteria from the Product Manager,
create a task breakdown:

Feature: Mark Part as Defective
Practices: 1, 2, 3

For each task:
- What to implement
- Dependencies on other tasks
- Files to modify
- Testing approach
```

**Step 3-5: Implement → Test → Review (Developer → Tester → Reviewer)**

```
@developer

Implement the "mark defective" button in Practice 3.

Workflow:
1. User clicks button
2. Apollo mutation called with part ID
3. Optimistic update: show "Marked Defective"
4. Backend confirms
5. Inventory subscription reflects change

File: practice-3-nextjs-graphql/components/MarkDefectiveButton.tsx
Mutation: MARK_PART_DEFECTIVE

Include error handling for network failures.
```

Then: `@tester` writes tests, `@reviewer` checks quality.

---

## Quick Reference: When to Use Each Agent

### Use Product Manager When:

- ❓ "What should this feature do?"
- ❓ "What are the acceptance criteria?"
- ❓ "How does this relate to shop-floor reality?"
- ❓ "Is this the right approach for the interview?"

### Use Orchestrator When:

- 📋 "How should I break this down?"
- 📋 "What's the right order to implement?"
- 📋 "What are the dependencies?"
- 📋 "What might block this work?"

### Use Developer When:

- 💻 "How do I implement this?"
- 💻 "Show me example code"
- 💻 "What's the right pattern for this?"
- 💻 "I have a compile error, help me fix it"

### Use Tester When:

- ✅ "How do I test this feature?"
- ✅ "Write tests for my code"
- ✅ "What edge cases should I test?"
- ✅ "Is my test coverage adequate?"

### Use Reviewer When:

- 👀 "Please review my code"
- 👀 "Are there bugs in this?"
- 👀 "Is this architecturally sound?"
- 👀 "Does this follow project conventions?"

---

## Best Practices for Prompt Flows

### 0. Understand Escalation Criteria (Know When to Ask for Help)

Each agent has specific thresholds for when to escalate or seek help:

**Orchestrator Escalation Thresholds:**

- Handle: 0–1 concurrent blockers
- Escalate: 2+ concurrent blockers OR work blocked >2 hours
- Use `/delegate` to escalate to GitHub

**Product Manager Escalation Thresholds:**

- Approve: 0–10% scope creep (feature aligned)
- Review & Refine: 10–30% scope creep (borderline)
- Restart Planning: >30% scope creep (too far off target)

**Tester Approval Thresholds:**

- Block PR: <80% code coverage (non-negotiable)
- Report Issue: Tests <95% reliable (flaky tests)
- Escalate: Any test >5 seconds (performance blocker)

**Reviewer Block Criteria:**

- Block: Critical bugs, security issues, type errors
- Request Changes: Missing error handling, unsafe patterns
- Approve: Style issues, minor improvements

**Developer Escalation:**

- Ask Orchestrator `/ask` when: Multi-practice impact unclear OR depends on unfinished task
- Use `/delegate` when: Blocker affecting 2+ practices

**When These Thresholds Matter:**

- Orchestrator: Decides if 2 blockers = escalate to GitHub
- Product Manager: Decides if 15% scope change = refinement or rejection
- Tester: Decides if coverage of 78% = block PR or acceptable
- Developer: Decides if multi-practice work = escalate to Orchestrator

### 1. Be Specific

**❌ Bad Prompt:**

```
@developer
Help me implement the inventory feature
```

**✅ Good Prompt:**

```
@developer
Implement a GraphQL subscription for inventory updates in Practice 3.

File: practice-3-nextjs-graphql/lib/hooks/useInventorySubscription.ts

Requirements:
- Subscribe to ON_INVENTORY_CHANGE (parts with quantity < 10)
- Update Apollo cache when new data arrives
- Unsubscribe on component unmount
- Handle network errors with console.warn()
- Use TypeScript strict mode

Include the full hook implementation with JSDoc comments.
```

### 2. Provide Context

Include relevant files, requirements, and constraints:

```
@developer

Update the Temporal workflow to emit a Kafka event after inventory
is reserved.

Current workflow: practice-1-temporal-kafka/temporal/workflows/shipment.ts
Current status: validateOrder() ✅, reserveInventory() ✅

New requirement:
- After reserveInventory succeeds, call emitKafkaEvent()
- Event topic: "shipment-events"
- Event payload: { orderId, reservationId, quantity, timestamp }
- If Kafka fails, workflow should retry up to 3 times

Show the updated workflow with retry policy.
```

### 3. Reference Project Docs

Point agents to relevant documentation:

```
@developer

Implement the GraphQL subscription for inventory.

See:
- DESIGN.md: "GraphQL Subscriptions Pattern" section
- .github/copilot-instructions.md: GraphQL conventions
- practice-2-hasura-graphql/graphql-schema.gql: Current schema

Requirement: Real-time updates when inventory quantity changes
```

### 4. Ask for Output Format

Specify what you want back:

```
@tester

Design a test plan for the inventory subscription feature.

Output format:
1. Test cases (name + description)
2. Mock setup (what to mock, how)
3. Assertions (what to verify)
4. Edge cases (error scenarios)

Make it copy-paste ready for Jest.
```

### 5. Iterate and Refine

Start with broad prompts, then zoom in:

```
@orchestrator
Break down the inventory feature into tasks

↓ (get tasks)

@developer
Implement Task 1: Update PostgreSQL schema

↓ (get schema migration)

@tester
Write tests for the new inventory table

↓ (get tests)

@reviewer
Review the schema migration and tests

↓ (get feedback)

@developer
Fix the issues mentioned in the review
```

---

## Tool Interaction Patterns

Learn how agents communicate using Copilot CLI tools:

### Pattern 1: Developer ↔ Orchestrator via `/ask`

Use this when a developer is uncertain about approach:

```
@developer
I'm implementing the inventory subscription, but I'm not sure if this
should live in Practice 2 or Practice 3.

/ask
Where should this be implemented? Multi-practice impact?
```

**→ Orchestrator responds** with recommendation, then:

```
@developer
Based on Orchestrator's advice, implementing in Practice 3...
```

### Pattern 2: Tester ↔ Developer via `/ask`

Use this when tester finds issues:

```
@tester
I'm seeing flaky tests in the cache update logic.

/ask
@developer: What's the root cause? Is this a race condition?
```

**→ Developer responds** with explanation and fix suggestion.

### Pattern 3: Escalation via `/delegate`

Use this when work exceeds thresholds:

**Orchestrator escalates**:

```
2 concurrent blockers detected.

/delegate
This work has 2+ concurrent blockers affecting Practices 1 & 3.
Cannot proceed without external help.
```

**Developer escalates**:

```
This change affects Practices 1, 2, and 3 simultaneously.

/delegate
Multi-practice architectural decision needed.
```

### Pattern 4: All Agents Use `/diff` Before Commit

Always validate changes before pushing:

```
@developer
I've implemented the activity.

/diff
Review my changes before I commit.
```

### Pattern 5: All Agents Use `/review` For Validation

Get automated code quality checks:

```
@developer
Here's my implementation.

/review
Check for bugs, type errors, and performance issues.
```

### Tool Usage by Agent

| Agent               | Primary Commands             | When to Use                                   |
| ------------------- | ---------------------------- | --------------------------------------------- |
| **Orchestrator**    | `/plan`, `/ask`, `/delegate` | Starting complex work, unblocking, escalating |
| **Developer**       | `/lsp`, `/diff`, `/plan`     | Navigating code, validating, planning impl    |
| **Tester**          | `/plan`, `/ask`, `/diff`     | Planning tests, clarifying, validating        |
| **Reviewer**        | `/review`, `/diff`, `/lsp`   | Validating code, exploring, reviewing         |
| **Product Manager** | `/ask`, `/plan`              | Clarifying, planning requirements             |

---

## Multi-Agent Conversations

Sometimes you need multiple agents in one discussion. Use this pattern:

```
Scenario: Inventory feature is slow

@orchestrator
The inventory subscription is causing performance issues.
How should we approach this?

→ (get diagnosis and task breakdown)

@developer
Implement the optimizations suggested:
1. Batch GraphQL queries
2. Implement pagination
3. Debounce subscription updates

→ (get optimized code)

@tester
Write performance tests to ensure the optimizations work:
- Subscription with 1000 inventory items should complete in <500ms
- Multiple rapid updates should batch correctly

→ (get performance tests)

@reviewer
Review the optimization approach for correctness

→ (get approval/feedback)
```

---

## Prompt Templates

Use these templates as starting points:

### Template: Implement a Feature

```
@developer

Implement [feature name]

Context:
- Practice: [1/2/3]
- Files: [specific files to modify]
- Dependencies: [what must exist first]

Requirements:
- [Req 1]
- [Req 2]
- [Req 3]

Technical approach:
- [Use technology X for Y reason]
- [Follow pattern Z from existing code]

Output:
- Complete code with comments
- TypeScript types
- Error handling
- JSDoc for public functions
```

### Template: Write Tests

```
@tester

Write tests for [feature name]

Code to test: [file path]
Testing framework: Jest

Must test:
- Happy path: [scenario]
- Error case 1: [scenario]
- Error case 2: [scenario]
- Edge case: [scenario]

Requirements:
- >80% code coverage
- Mock external calls (Kafka, DB, GraphQL)
- Clear test names and descriptions

Output:
- Complete Jest test file
- Mock setup
- Test data fixtures if needed
```

### Template: Code Review

```
@reviewer

Please review this code

Files changed:
- [file 1]
- [file 2]

Focus on:
- [concern 1]
- [concern 2]
- [concern 3]

Background:
- This implements [feature]
- Relates to [other code/feature]

Output:
- Line-by-line issues
- Risk assessment (High/Medium/Low)
- Specific suggestions for improvement
- Approval or request for changes
```

---

## Common Workflows

### Adding a New Activity (Temporal)

1. **Product Manager**: Define what the activity does, acceptance criteria
2. **Orchestrator**: Assess impact, dependencies, blockers
3. **Developer**: Implement activity + integration with workflow
4. **Tester**: Write unit tests for activity, integration tests for workflow
5. **Reviewer**: Check activity is idempotent, error handling complete

### Adding a New GraphQL Type (Hasura)

1. **Product Manager**: Define what data the type represents
2. **Orchestrator**: Check schema impact, subscription implications
3. **Developer**: Create PostgreSQL migration + Hasura metadata
4. **Tester**: Verify schema constraints, test queries/mutations
5. **Reviewer**: Check relationships, constraints, performance

### Adding a New React Component (Next.js)

1. **Product Manager**: Define UX requirements, acceptance criteria
2. **Orchestrator**: Check GraphQL dependencies, integration points
3. **Developer**: Implement component + queries/mutations
4. **Tester**: Unit tests for component, integration tests with Apollo
5. **Reviewer**: Check Server/Client component split, optimization

---

## Tips and Tricks

### Tip 1: Chain Agents for Efficiency

Instead of asking one agent for everything, chain them:

```
Bad:  @developer: Write code, write tests, review yourself

Good: @developer: Write code
      ↓
      @tester: Write tests
      ↓
      @reviewer: Review code
```

Each agent is specialized, so you get better results.

### Tip 2: Use Context from Previous Steps

When you move to a new agent, include what the previous agent said:

```
@tester

Based on this implementation from the Developer:
[paste the code]

Write comprehensive tests ensuring:
[list of requirements]
```

### Tip 3: Ask for Explanations

Don't just get code; understand why:

```
@developer

Implement the validateOrder activity.

Also explain:
1. Why must activities be idempotent?
2. What happens if this activity fails?
3. Why return a simple object instead of custom class?
```

### Tip 4: Reference Interview Context

Remind agents about the interview context:

```
@reviewer

Review this Temporal workflow implementation.

Remember: This is for Stoke Space interview on Boltline platform.
Emphasize how this demonstrates reliability and fault tolerance.

Check:
- Does it show workflow resilience?
- Good talking point for interview?
```

---

## Troubleshooting

### Issue: Agent Response Doesn't Match Your Project

**Solution**: Provide more specific context

```
@developer

Implement X for our project.

Our project:
- Uses pnpm (not npm)
- TypeScript strict mode
- Prettier + ESLint configured
- Jest for testing
- Apollo Client v3

Reference the code at: [file path]
Follow the pattern used in: [similar file]
```

### Issue: Agent Missing Important Details

**Solution**: Ask for clarification

```
@developer

You suggested using [approach], but we already have [existing code].

Can you:
1. Integrate with existing approach?
2. Show the updated pattern?
3. Explain why this approach is better?
```

### Issue: Multi-Step Task Incomplete

**Solution**: Break it into separate prompts

```
❌ "Implement the feature"

✅ Step 1: @developer - Implement schema migration
   Step 2: @developer - Implement Temporal activity
   Step 3: @developer - Implement React component
   Step 4: @tester - Write all tests
   Step 5: @reviewer - Code review
```

---

## Next Steps

1. **Read Agent Documentation**: Open `.copilot/agents/` and read each role
2. **Review Meta-Agent Collaboration Guide**: See [`.copilot/agents/README.md`](../.copilot/agents/README.md) for advanced multi-agent workflows
3. **Try a Simple Feature**: Use the workflow above to implement something small
4. **Iterate**: Refine your prompts based on results
5. **Teach Others**: Share what you learned with teammates

## Advanced: Meta-Agent Collaboration Guide

For sophisticated multi-agent workflows, escalation decision trees, and model coordination, see:

**[`.copilot/agents/README.md`](../.copilot/agents/README.md)**

This advanced guide includes:

- Complete communication flow diagram
- CLI commands matrix (which agent uses which commands)
- 3 real-world cross-agent scenarios with exact command sequences
- Model override coordination policy
- Full escalation matrix with decision trees

## Resources

- **Agent Documentation**: `.copilot/agents/[agent-name].md`
- **Meta-Agent Collaboration**: `.copilot/agents/README.md` (advanced multi-agent workflows)
- **Build/Test Commands**: `.github/copilot-instructions.md`
- **Architecture Overview**: `DESIGN.md`
- **Interview Context**: `about-me.md`
- **Project Setup**: See specific practice folder `README.md`

## Questions?

If you're stuck:

1. Check the relevant agent documentation (`.copilot/agents/`)
2. Ask the **Orchestrator** for guidance on workflow
3. Ask the **Developer** for implementation help
4. Ask the **Reviewer** to validate your approach

Happy coding! 🚀
