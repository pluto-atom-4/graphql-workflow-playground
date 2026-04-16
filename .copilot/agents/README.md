# Copilot Agents Overview

This directory contains role-based agent configurations for the graphql-workflow-playground project. Each agent has a specialized focus and works collaboratively to deliver high-quality code and features.

## Agent Roles

### 🧑‍💻 [Developer](./developer.md)

**Focus**: Implementation, code quality, testing

Writes features, fixes bugs, and maintains code across all three practices. Ensures TypeScript strict mode, proper error handling, and project conventions.

**Key Responsibilities**:

- Implement features and bug fixes
- Write and run tests locally
- Follow TypeScript/ESLint conventions
- Update dependencies

**Tools & Commands**:

```bash
pnpm dev           # Development server
pnpm test          # Run tests
pnpm lint:fix      # Auto-fix linting
pnpm format        # Format code
```

---

### 🎯 [Orchestrator](./orchestrator.md)

**Focus**: Coordination, workflow, task tracking

Manages complex work across three practices, tracks dependencies, breaks down tasks, and ensures architectural alignment. Acts as project manager for technical execution.

**Key Responsibilities**:

- Coordinate work across Temporal, Hasura, Next.js
- Manage task dependencies
- Track progress and blockers
- Plan feature rollouts
- Resolve escalated issues

**Key Patterns**:

- Sequential workflows (one practice at a time)
- Parallel development (independent features)
- Blocked task escalation

---

### 📋 [Product Manager](./product-manager.md)

**Focus**: Requirements, prioritization, interview alignment

Defines features, validates against Boltline platform requirements, and ensures development aligns with interview preparation goals and real-world constraints.

**Key Responsibilities**:

- Define feature requirements with acceptance criteria
- Prioritize work using interview/business value
- Validate features against shop-floor reality
- Gather feedback on implementation approaches
- Document business logic

**Interview Checkpoints**:

- Temporal reliability (failure recovery)
- GraphQL real-time (subscriptions)
- Apollo optimistic updates (poor WiFi)
- Kafka async messaging (scale)

---

### 👀 [Reviewer](./reviewer.md)

**Focus**: Code quality, architecture, standards

Performs thorough code reviews, validates design decisions, ensures quality standards, and identifies bugs before they reach production.

**Key Responsibilities**:

- Review code for correctness and quality
- Validate architectural decisions
- Check TypeScript type safety
- Ensure adequate test coverage
- Identify bugs and edge cases

**Review Checklist**:

- ✅ TypeScript strict mode passes
- ✅ Tests are adequate (>80% coverage)
- ✅ ESLint/Prettier checks pass
- ✅ No red flags (circular refs, N+1 queries, etc.)
- ✅ Documentation updated

---

### 🧪 [Tester](./tester.md)

**Focus**: Testing strategy, test automation, quality assurance

Designs and executes comprehensive test strategies, validates edge cases, and ensures features work end-to-end across all practices.

**Key Responsibilities**:

- Design test plans for new features
- Write unit, integration, E2E tests
- Identify test gaps
- Verify error handling
- Test cross-practice integration
- Report test results

**Test Types**:

- Unit tests (Jest)
- Integration tests (Jest + test containers)
- E2E tests (Playwright)
- Subscription tests (GraphQL mock)

---

## Collaboration Model

### Feature Workflow

```
Product Manager
  ↓ (defines requirements with acceptance criteria)
Orchestrator
  ↓ (breaks into tasks, tracks dependencies)
Developer
  ↓ (implements feature)
Tester
  ↓ (validates against acceptance criteria)
Reviewer
  ↓ (ensures code quality and architecture)
Orchestrator
  ↓ (marks done, updates progress)
```

### Task Lifecycle

```
1. CREATED (Product Manager)
   ↓ Requirements: What problem? Which practices? Acceptance criteria?

2. PLANNED (Orchestrator)
   ↓ Breakdown: How to approach? What are dependencies? What's the order?

3. IN_PROGRESS (Developer)
   ↓ Implementation: Write code, run tests locally, follow conventions

4. TESTING (Tester)
   ↓ Validation: Test plan, coverage, edge cases, integration

5. REVIEW (Reviewer)
   ↓ Quality: Code review, architecture validation, standards check

6. DONE (Orchestrator)
   ↓ Completion: Mark merged, update documentation
```

### Cross-Agent Communication

**Developer → Orchestrator**: "This task is blocked by Practice 2 schema changes"

**Orchestrator → Product Manager**: "Can we simplify the requirement to unblock this?"

**Tester → Developer**: "Test coverage is below 80% for this module"

**Reviewer → Developer**: "This activity has a mutable return; see developer.md for pattern"

**Product Manager → All**: "This feature demonstrates Temporal resilience; emphasize in tests"

---

## Project Structure

```
.copilot/
├── config.json                  # Model configuration (Claude Haiku 4.5)
└── agents/
    ├── developer.md             # Implementation role
    ├── orchestrator.md          # Coordination role
    ├── product-manager.md       # Requirements role
    ├── reviewer.md              # Quality role
    ├── tester.md                # Testing role
    └── README.md                # This file
```

---

## Key Resources

All agents reference these core documents:

- **`.github/copilot-instructions.md`**: Build/test commands, architecture overview, conventions
- **`DESIGN.md`**: Architecture patterns, interview checkpoints, core concepts
- **`CLAUDE.md`**: Detailed technology stack, framework integration points
- **`about-me.md`**: Interview context for Stoke Space Boltline platform

---

## Common Scenarios

### Scenario 1: Implementing a New Workflow

```
Product Manager: "Define feature: Order Fulfillment Workflow"
  Requirements: Why? (Boltline needs reliable multi-step manufacturing)
  Acceptance: Workflow starts → validates → reserves → completes

Orchestrator: "Plan the work"
  Step 1: Update PostgreSQL schema (Practice 2)
  Step 2: Create Temporal workflow + activities (Practice 1)
  Step 3: Build UI components (Practice 3)

Developer: "Implement each step"
  → Schema migration
  → Workflow + activities + tests
  → React components + mutations

Tester: "Validate end-to-end"
  → Unit tests for activities
  → Integration tests for workflow
  → E2E test of full UI flow

Reviewer: "Code quality check"
  → Verify activities are idempotent
  → Check workflow error handling
  → Ensure UI components use Server/Client correctly
```

### Scenario 2: Performance Issue Found

```
Tester: "GraphQL queries are N+1"

Developer: "Investigate and fix"
  → Add batch loaders
  → Optimize query structure
  → Run performance tests

Reviewer: "Verify solution"
  → Check new query structure
  → Ensure cache strategy is correct

Orchestrator: "Document and resolve"
  → Mark task complete
  → Note pattern for future features
```

### Scenario 3: Cross-Practice Integration Issue

```
Orchestrator: "Practice 2 schema changed; Practice 3 UI broken"

Product Manager: "Is this a feature or a bug?"
  → If feature: redefine acceptance criteria
  → If bug: escalate to developer

Developer: "Fix Apollo Client types"
  → Regenerate types from schema
  → Update mutations/queries
  → Test integration

Tester: "Verify integration works"
  → End-to-end test across practices
  → Subscription still receives updates
```

---

## Meta-Agent Collaboration Model

### How Agents Work Together

All five agents use GitHub Copilot CLI commands to coordinate and communicate:

#### Communication Flow

```
Product Manager (defines requirements)
    ↓ /share: requirements & acceptance criteria
Orchestrator (plans work breakdown)
    ↓ /plan: task list with dependencies
Developer (implements feature)
    ↓ /diff + /review: shows changes
Tester (validates completeness)
    ↓ /share: test results & coverage
Reviewer (ensures quality)
    ↓ approval/request changes
Orchestrator (marks done)
```

#### Copilot CLI Commands by Agent

| Command | Developer | Orchestrator | Product Manager | Reviewer | Tester |
|---------|-----------|---|---|---|---|
| `/plan` | ✅ Design | ✅ Breaking down | ✅ Requirements | ⭕ Review plan | ✅ Test strategy |
| `/diff` | ✅ Review changes | ⭕ Integration | ⭕ Verify impl | ✅ **PRIMARY** | ⭕ Coverage check |
| `/review` | ⭕ Auto-review | ⭕ Architecture | ⭕ Feature check | ✅ **PRIMARY** | ✅ Test quality |
| `/ask` | ✅ Clarify | ✅ **PRIMARY** | ✅ **PRIMARY** | ✅ Questions | ✅ Clarify |
| `/share` | ⭕ Optional | ✅ Progress | ✅ **PRIMARY** | ✅ Feedback | ✅ Results |
| `/delegate` | ⭕ Escalate | ✅ **PRIMARY** | ✅ Escalate | ✅ Escalate | ✅ Escalate |
| `/lsp` | ✅ Debugging | ⭕ N/A | ⭕ N/A | ✅ Code intel | ✅ Test debug |
| `/tasks` | ⭕ View only | ✅ **PRIMARY** | ⭕ View | ⭕ View only | ⭕ View only |

**Legend**: ✅ Primary use | ⭕ Secondary use | (blank) Rarely used

#### Cross-Agent Scenarios

**Scenario 1: New Feature Request**
```
1. Product Manager: /plan → Define requirements
2. Product Manager: /share → Send to Orchestrator
3. Orchestrator: /plan → Break into tasks
4. Orchestrator: /delegate → Send to Developer
5. Developer: /diff + /review → Self-check before pushing
6. Tester: /plan → Design test strategy
7. Reviewer: /diff + /review → Code review
8. Orchestrator: Mark done → /share final status
```

**Scenario 2: Cross-Practice Integration Issue**
```
1. Tester: /ask → "Why is Practice 2 → Practice 3 failing?"
2. Developer: /diff → Show root cause
3. Orchestrator: /ask → Clarify if blocking merge
4. Reviewer: /review → Architectural assessment
5. Orchestrator: /delegate → If needs leadership input
```

**Scenario 3: Blocked by Test Failures**
```
1. Tester: /plan → Design test fix
2. Developer: /ask → "Should I fix implementation or test?"
3. Reviewer: /ask → "Does this follow test patterns?"
4. Orchestrator: /tasks → Track blocker resolution
5. Tester: Verify fix + /share results
```

#### Model Override Coordination

Each agent has **locked model** (Haiku by default):
- ✅ Developer uses Haiku only (unless explicitly requested via `/model`)
- ✅ Orchestrator uses Haiku only (unless explicitly requested)
- ✅ Product Manager uses Haiku only (unless explicitly requested)
- ✅ Reviewer uses Haiku only (unless explicitly requested)
- ✅ Tester uses Haiku only (unless explicitly requested)

**Override Pattern**: Agent requests premium model via `/model` with explicit justification (e.g., "Complex architectural decision requiring gpt-5.4").

#### Tool Escalation Matrix

**Who calls whom?**

- **Developer → Orchestrator**: Blocked by multi-practice dependencies (`/ask`)
- **Developer → Reviewer**: Architecture question before implementing (`/ask`)
- **Orchestrator → Product Manager**: Scope creep or feasibility concern (`/ask`)
- **Orchestrator → Leadership**: Infrastructure blocker (`/delegate`)
- **Tester → Developer**: Test failure root cause (`/ask`)
- **Tester → Orchestrator**: Performance or flaky test blocker (`/delegate`)
- **Reviewer → Orchestrator**: Architectural concern affecting architecture (`/delegate`)

---

### Developer

- Always run tests locally before committing
- Use `pnpm lint:fix` to auto-fix style issues
- Reference similar patterns in existing code
- Ask Reviewer for help on architectural questions

### Orchestrator

- Document blockers clearly
- Sequence tasks to minimize dependencies
- Regular status updates to team
- Escalate infrastructure/tooling issues

### Product Manager

- Validate features against real-world shop-floor constraints
- Keep interview talking points in focus
- Write clear acceptance criteria
- Collaborate with Orchestrator on feasibility

### Reviewer

- Provide constructive feedback with examples
- Point to specific lines/files
- Suggest alternatives, not just criticism
- Ask "Why?" to understand developer intent

### Tester

- Design tests that cover happy path + edge cases
- Test integration across practices early
- Automate tests; don't rely on manual QA
- Document test gaps for future work

---

## Model Configuration

All agents use **Claude Haiku 4.5** (configured in `.copilot/config.json`).

This provides:

- Fast turnaround on routine tasks
- Cost-effective for large codebases
- Sufficient capability for code review, testing, coordination

For complex architectural decisions, escalate to Product Manager or Orchestrator for deeper analysis.

---

## Getting Started

To use agents in your workflow:

1. **For Development**: Refer to [Developer Agent](./developer.md)
2. **For Planning**: Refer to [Orchestrator Agent](./orchestrator.md)
3. **For Requirements**: Refer to [Product Manager Agent](./product-manager.md)
4. **For Code Review**: Refer to [Reviewer Agent](./reviewer.md)
5. **For Testing**: Refer to [Tester Agent](./tester.md)

Each agent has specific commands, patterns, and examples relevant to their role.

---

## Questions?

- **How do I set up a practice environment?** → See `.github/copilot-instructions.md`
- **What's the architecture?** → See `DESIGN.md` and `CLAUDE.md`
- **What's the interview context?** → See `about-me.md`
- **How do I write tests?** → See [Tester Agent](./tester.md)
- **What's the code review standard?** → See [Reviewer Agent](./reviewer.md)
