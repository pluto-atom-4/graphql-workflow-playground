# graphql-workflow-playground

> **Interview preparation playground for Stoke Space Boltline platform**
>
> Master Temporal, Kafka, Hasura, Next.js, and GraphQL through three progressive practice exercises.

## 🎯 Project Overview

This is a comprehensive monorepo that simulates the core technologies behind **Boltline**, Stoke Space's hardware engineering SaaS platform. It includes three independent practice exercises that demonstrate reliability, scalability, and user experience best practices.

### What You'll Build

**Practice 1: Temporal & Kafka** — Reliable workflow orchestration

- Define workflows that recover from failures
- Implement retry policies for transient errors
- Emit events to Kafka for async communication

**Practice 2: Hasura & GraphQL** — Digital backbone with real-time subscriptions

- Design relational schema (Parts, Inventory, Orders)
- Auto-generate GraphQL CRUD + subscriptions
- Create custom Actions for business logic

**Practice 3: Next.js & Apollo** — Technician work plans UI

- Server Components for fast initial load
- Apollo Client with optimistic updates
- Real-time subscriptions on shop floor

## 🏗️ Architecture

```
PostgreSQL ← (schema.sql) → Hasura (auto-generates GraphQL) → Next.js + Apollo
                                         ↓
                                   Custom Actions
                                   (webhooks)
                                         ↓
                    Temporal Workflow → Kafka (events)
```

Each practice is **self-contained** and can be developed independently or integrated end-to-end.

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 9.0.0 (package manager)
- **Docker** & **Docker Compose** (for services)
- **Git** (for version control)

### 1. Install Dependencies

```bash
cd graphql-workflow-playground
pnpm install
```

### 2. Start Infrastructure

All services (PostgreSQL, Hasura, Temporal, Kafka) run in Docker:

```bash
pnpm infra:up
```

Wait ~30 seconds for services to be healthy. Then access:

- **Hasura Console**: http://localhost:8080
- **Temporal UI**: http://localhost:8088
- **PostgreSQL**: localhost:5432

### 3. Run Individual Practices

**Practice 1 — Temporal & Kafka**:

```bash
pnpm dev:p1          # Start worker in one terminal
# In another:
cd practice-1-temporal-kafka
pnpm start:starter   # Trigger a workflow
# View at http://localhost:8088
```

**Practice 2 — Hasura & GraphQL**:

```bash
# Already running via infra:up
# Open http://localhost:8080 → Console → GraphiQL tab
# Try queries/mutations/subscriptions
```

**Practice 3 — Next.js & Apollo**:

```bash
pnpm dev:p3
# Open http://localhost:3000
```

### 4. Generate GraphQL Types

Once Hasura is running:

```bash
pnpm codegen
```

Creates `packages/graphql-types/src/generated/graphql.ts` with types and hooks.

### 5. Run Tests

```bash
pnpm test              # All tests (Turbo)
pnpm test --watch      # Watch mode
pnpm test:e2e         # E2E tests (Practice 3)
```

### 6. Code Quality

```bash
pnpm lint             # Check linting
pnpm lint:fix         # Auto-fix
pnpm format           # Format code
pnpm format:check     # Check (CI mode)
pnpm type-check       # TypeScript validation
```

## 📁 Project Structure

```
graphql-workflow-playground/
├── package.json                    # Root scripts & monorepo config
├── pnpm-workspace.yaml             # pnpm workspaces
├── turbo.json                      # Turborepo build pipeline
├── tsconfig.base.json              # Shared TypeScript config (strict)
│
├── packages/
│   ├── tsconfig/                   # Reusable TypeScript configs
│   ├── shared-types/               # Types used across practices
│   └── graphql-types/              # Generated GraphQL types
│
├── practice-1-temporal-kafka/
│   ├── src/
│   │   ├── temporal/
│   │   │   ├── workflows/          # Temporal workflows
│   │   │   ├── activities/         # Activities (idempotent tasks)
│   │   │   └── worker.ts           # Worker registration
│   │   ├── kafka/                  # Kafka producer/consumer
│   │   └── client/                 # Temporal client
│   ├── __tests__/                  # Jest tests
│   └── package.json
│
├── practice-2-hasura-graphql/
│   ├── postgres/
│   │   ├── schema.sql              # Database schema
│   │   └── seed.sql                # Sample data
│   ├── hasura/
│   │   ├── metadata/               # Auto-generated via Hasura CLI
│   │   └── migrations/             # Schema migrations
│   ├── action-webhook/             # Custom Action handler (Express)
│   ├── graphql/                    # GraphQL operations (queries/mutations/subscriptions)
│   └── package.json
│
├── practice-3-nextjs-graphql/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (Server)
│   │   ├── providers.tsx           # Apollo + Client boundary
│   │   ├── work-plans/             # Work plan pages
│   │   └── globals.css             # Tailwind + custom
│   ├── lib/
│   │   ├── apollo/                 # Apollo Client setup
│   │   ├── graphql/                # Queries/mutations/subscriptions
│   │   └── hooks/                  # Custom hooks
│   ├── components/                 # React components
│   └── package.json
│
├── infra/
│   ├── docker/
│   │   └── docker-compose.shared.yml  # All services
│   ├── k8s/                            # Kubernetes manifests
│   └── scripts/                        # Setup scripts
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # CI/CD pipeline
│   │   └── ai-review.yml           # AI code review
│   ├── pull_request_template.md    # PR template
│   └── dependabot.yml              # Dependency updates
│
├── .copilot/
│   ├── config.json                 # Copilot model (Haiku 4.5)
│   └── agents/                     # Five specialized AI agents
│
├── docs/
│   ├── agent-prompt-flows.md       # Developer onboarding
│   ├── agent-quick-reference.md    # Quick reference
│   ├── github-configuration.md     # GitHub setup
│   └── start-from-here.md          # Original prep guide
│
├── CLAUDE.md                       # Claude Code guidance
├── DESIGN.md                       # Architecture patterns
├── about-me.md                     # Interview context
└── SCAFFOLDING_COMPLETE.md         # Monorepo setup notes
```

## 🤖 Copilot Agents

This project uses **five specialized AI agents** to streamline development:

| Agent               | Role                              | Use When                     |
| ------------------- | --------------------------------- | ---------------------------- |
| **Product Manager** | Defines features & requirements   | Creating acceptance criteria |
| **Orchestrator**    | Plans work & manages dependencies | Breaking down tasks          |
| **Developer**       | Implements code                   | Writing features             |
| **Tester**          | Designs tests & validates         | Creating test files          |
| **Reviewer**        | Reviews code quality              | Checking for issues          |

See `.copilot/agents/` for detailed responsibilities and usage patterns.

### Developer Workflow

```
Product Manager (Define)
  ↓
Orchestrator (Plan)
  ↓
Developer (Build)
  ↓
Tester (Validate)
  ↓
Reviewer (Approve)
  ↓
Merge to Main
```

Read `docs/agent-prompt-flows.md` for complete guide.

## 🧪 Technology Stack

### Core Technologies

| Technology        | Purpose                                | Practice |
| ----------------- | -------------------------------------- | -------- |
| **Temporal**      | Durable workflow orchestration         | P1       |
| **Kafka**         | Event streaming & messaging            | P1       |
| **PostgreSQL**    | Relational database                    | P2       |
| **Hasura**        | Auto-generated GraphQL + subscriptions | P2       |
| **Next.js**       | React framework with SSR               | P3       |
| **Apollo Client** | GraphQL client with caching            | P3       |

### Infrastructure

- **Docker Compose** — Local development
- **Kubernetes** — Production-ready manifests
- **GitHub Actions** — CI/CD pipeline
- **Turborepo** — Monorepo build orchestration
- **TypeScript** — Strict mode across all packages
- **Jest** — Testing framework
- **Playwright** — E2E testing

## 🔑 Key Design Patterns

### Temporal Workflows

Activities are **simple, idempotent, synchronous** functions:

```typescript
// ✅ GOOD: Idempotent, deterministic
async function validateOrder(order: Order): Promise<ValidationResult> {
  return { valid: true, message: "OK" };
}

// Workflow coordinates activities
const result = await workflow.executeActivity(validateOrder, order, {
  retryPolicy: { maximumAttempts: 3 },
});
```

### GraphQL Subscriptions

Real-time updates on data changes:

```graphql
subscription OnInventoryChange {
  inventory(where: { part_id: { _eq: 123 } }) {
    part_id
    quantity
    updated_at
  }
}
```

### Apollo Optimistic Updates

UI responds instantly, backend confirms async:

```typescript
const [completeStep] = useMutation(COMPLETE_STEP, {
  optimisticResponse: {
    completeStep: {
      __typename: "Step",
      id: stepId,
      status: "COMPLETED",
    },
  },
});
```

## 📊 CI/CD Pipeline

GitHub Actions automates quality checks:

```
Lint/Format Check ──┐
Type Check ─────────├──→ Build ──→ Test ──→ ✅ All Pass
Security Audit ─────┤
Practice 1 Tests ───┤
Practice 3 Tests ───┘
```

**Branch Protection**: `main` and `develop` require all checks to pass.

## 🎓 Interview Talking Points

When discussing this project at Stoke Space, emphasize:

1. **"Temporal ensures workflow reliability"**

   > If a technician's tablet crashes mid-manufacturing step, Temporal recovers from the last checkpoint—critical for multi-day workflows.

2. **"Kafka handles high-volume async events"**

   > Shop floor sensor data flows through Kafka without blocking synchronous APIs, enabling scalability.

3. **"Hasura accelerates GraphQL development"**

   > Auto-generating CRUD endpoints and subscriptions saves weeks versus hand-written GraphQL servers.

4. **"Apollo optimistic updates improve UX"**

   > Technicians see instant feedback on poor WiFi (shop floor reality), while the backend confirms async.

5. **"Monorepo with Turborepo scales cleanly"**
   > Coordinating three practices + shared packages prevents the "works locally, fails in CI" class of bugs.

## 🚦 Getting Started

### For Beginners

1. Read `docs/start-from-here.md` — Interview prep checklist
2. Read `docs/agent-prompt-flows.md` — How to use AI agents
3. Run `pnpm infra:up` to start services
4. Explore Practice 1, 2, 3 in order

### For Development

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Use agents for guidance (see `docs/agent-prompt-flows.md`)
3. Push and create a PR
4. AI review approves when CI passes
5. Merge to main when ready

### For Contribution

1. See `.github/pull_request_template.md` for PR guide
2. Follow `.github/copilot-instructions.md` for conventions
3. Run `pnpm lint:fix && pnpm format && pnpm test` before pushing

## 📚 Documentation

| Document                            | Purpose                                   |
| ----------------------------------- | ----------------------------------------- |
| **README.md**                       | This file                                 |
| **DESIGN.md**                       | Architecture patterns & core concepts     |
| **CLAUDE.md**                       | Claude Code guidance & tech stack details |
| **about-me.md**                     | Interview context for Stoke Space         |
| **docs/start-from-here.md**         | Interview prep checklist                  |
| **docs/agent-prompt-flows.md**      | Developer onboarding with agents          |
| **docs/agent-quick-reference.md**   | One-page quick reference                  |
| **docs/github-configuration.md**    | GitHub Actions & CI/CD setup              |
| **.github/copilot-instructions.md** | Copilot development guide                 |
| **.copilot/agents/**                | Five specialized agent guides             |

## 🛠️ Common Commands

```bash
# Setup
pnpm install                    # Install all dependencies
pnpm infra:up                   # Start Docker services

# Development
pnpm dev:p1                     # Practice 1 — Temporal worker
pnpm dev:p2                     # Practice 2 — Hasura (in infra)
pnpm dev:p3                     # Practice 3 — Next.js frontend
pnpm codegen                    # Generate GraphQL types

# Quality
pnpm lint                       # Check linting
pnpm lint:fix                   # Auto-fix linting
pnpm format                     # Format code
pnpm format:check               # Check formatting (CI)
pnpm type-check                 # TypeScript validation

# Testing
pnpm test                       # Run all tests
pnpm test --watch               # Watch mode
pnpm test:e2e                   # E2E tests (Practice 3)

# Build & Cleanup
pnpm build                      # Production build
pnpm infra:down                 # Stop Docker services
pnpm infra:logs                 # View service logs
```

## 🔒 Security & Best Practices

- **TypeScript Strict Mode**: All code validated with strict type checking
- **Environment Variables**: `.env.example` documents required vars
- **Branch Protection**: `main` requires CI passes + code review
- **Dependency Audits**: Dependabot alerts on vulnerabilities
- **No Secrets in Code**: All credentials in environment variables

## 📈 Performance Considerations

- **Turborepo Caching**: Builds only affected packages
- **GraphQL Subscriptions**: Real-time updates without polling
- **Apollo Cache**: Client-side caching reduces API calls
- **Server Components**: Next.js Server Components for fast initial load
- **Temporal Replay**: Workflows replay efficiently without recomputation

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check Docker
docker ps -a

# View logs
pnpm infra:logs

# Restart services
pnpm infra:down
pnpm infra:up
```

### Tests Failing

```bash
# Clear cache
rm -rf node_modules .pnpm-store

# Reinstall
pnpm install --frozen-lockfile

# Run tests
pnpm test
```

### TypeScript Errors

```bash
# Type check all packages
pnpm type-check

# Generate GraphQL types
pnpm codegen
```

### Port Already in Use

Edit `.env` or `docker-compose.yml` to use different ports:

```yaml
services:
  postgres:
    ports:
      - "5432:5432" # Change first number
```

## 📞 Support

- **Documentation**: See files in `docs/` directory
- **Agent Help**: Use `.copilot/agents/` for specialized guidance
- **Examples**: Check existing code in each practice folder
- **GitHub Issues**: Create issue for bugs or feature requests

## 📝 License

This project is created for interview preparation at Stoke Space. Use for personal learning and interview preparation.

## 👨‍💻 About

Designed for **Senior Full Stack Developer** role at **Stoke Space**, focusing on **Boltline** platform technologies:

- Temporal for reliable workflows
- Kafka for event streaming
- Hasura for rapid GraphQL development
- Next.js + Apollo for rich UX
- Kubernetes for production deployment

**Ready to discuss architecture with confidence!** 🚀

---

**Last Updated**: April 2026  
**Node Version**: ≥ 20.0.0  
**pnpm Version**: ≥ 9.0.0  
**Status**: ✅ Production-Ready
