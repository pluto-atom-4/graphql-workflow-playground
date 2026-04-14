# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **practice playground** for a Senior Full Stack Software Developer interview at Stoke Space for their Boltline platform. The project provides three progressive practice exercises to master the core technologies behind Boltline—a hardware engineering SaaS platform.

See `about-me.md` for interview context and `DESIGN.md` for architecture patterns.

## Project Structure

Three parallel practice exercises, each with its own Docker setup:

1. **practice-1-temporal-kafka/** — Workflow orchestration and event streaming
2. **practice-2-hasura-graphql/** — GraphQL data layer with real-time subscriptions
3. **practice-3-nextjs-graphql/** — Full-stack React/Next.js frontend with Apollo Client

Each exercise is **self-contained** and can be developed/tested independently. See `DESIGN.md` for the full directory structure.

## Common Development Tasks

### Setting Up a Practice Exercise

Each practice folder has its own `docker-compose.yml` and dependencies. To start:

```bash
cd practice-1-temporal-kafka
docker-compose up -d
pnpm install
pnpm dev
```

### Running Tests

In the practice-N folder:

```bash
pnpm test                 # Run all tests
pnpm test --watch         # Watch mode
pnpm test path/to/test.ts # Single test file
```

### Linting and Formatting

```bash
pnpm lint            # Check linting
pnpm lint:fix        # Fix linting issues
pnpm format          # Format code
pnpm format:check    # Check formatting without changes
```

### Building for Production

Each practice exercise generates a production build:

```bash
cd practice-N
pnpm build
pnpm start           # Run production build
```

## Technology Stack & Architecture

### Practice 1: Temporal & Kafka (Backend Workflow)

**Technologies**: Node.js, Temporal SDK, Kafka, TypeScript

**Key Responsibilities**:

- Define workflows that orchestrate multi-step activities
- Implement retry policies for fault tolerance
- Emit events to Kafka for async communication

**Architecture Patterns**:

- Activities are simple, synchronous functions (ValidateOrder, ReserveInventory)
- Workflows coordinate activities and handle failures
- Kafka producer sends messages once workflow reaches "Validated" state

**Testing Approach**:

- Unit test activities in isolation
- Integration test workflows with Temporal test server
- Verify Kafka events are emitted correctly

---

### Practice 2: Hasura & GraphQL (Digital Backbone)

**Technologies**: PostgreSQL, Hasura, GraphQL, SQL

**Key Responsibilities**:

- Design relational schema (Parts, Inventory, Orders)
- Track foreign key relationships in Hasura
- Create custom GraphQL Actions for business logic

**Data Flow**:

```
PostgreSQL (schema) → Hasura (auto-generated CRUD) → GraphQL (subscriptions & queries)
```

**Key Patterns**:

- Real-time subscriptions listen for Inventory changes
- Custom Actions validate orders before insertion
- Foreign key relationships maintain referential integrity

**Testing Approach**:

- Use Hasura test mode to verify schema and permissions
- Write GraphQL queries/subscriptions in GraphiQL
- Test Hasura Actions via webhook simulation

---

### Practice 3: Next.js & GraphQL (Work Plans UI)

**Technologies**: React, Next.js, TypeScript, Apollo Client, Tailwind CSS

**Key Responsibilities**:

- Fetch Work Plan data via GraphQL queries
- Render steps with real-time status updates
- Log technician data via GraphQL mutations

**Component Architecture**:

- **Server Components** (`app/work-plans/[id]/page.tsx`): Initial data fetch
- **Client Components**: Interactive forms and buttons that trigger mutations
- **Apollo Client**: Local caching, optimistic updates, subscription handling

**Key Patterns**:

- Optimistic updates show "Checkmark" before backend confirms
- Subscriptions keep step status in sync across technician devices
- Error boundaries gracefully handle network failures

**Testing Approach**:

- Unit test React components with @testing-library
- Integration test Apollo Client with mock GraphQL server
- E2E test full workflows using Playwright

---

## Key Files & Their Purposes

| File                      | Purpose                                                  |
| ------------------------- | -------------------------------------------------------- |
| `about-me.md`             | Interview context and Boltline overview                  |
| `DESIGN.md`               | Architecture patterns and setup guides for each practice |
| `docs/start-from-here.md` | Original interview preparation resource                  |

## Framework Integration Points

**Between Temporal and Kafka**: Activities publish events that Kafka consumes

- Workflow reaches "Validated" state → Activity emits to `shipment-events` topic
- Other services subscribe to topic for async notifications

**Between Hasura and Next.js**: GraphQL is the contract

- Next.js components call Hasura via Apollo Client
- Real-time subscriptions keep UI in sync with database changes

**Between PostgreSQL and Hasura**: Schema drives GraphQL generation

- Foreign keys become relationships in GraphQL schema
- Hasura auto-generates queries, mutations, and subscriptions

## Interview Talking Points

When discussing architecture in your interview:

1. **Temporal ensures reliability**: "If a technician's tablet dies mid-step, Temporal recovers the workflow state—critical for multi-day manufacturing"

2. **Kafka enables async at scale**: "Sensor events from the shop floor flow through Kafka without blocking synchronous APIs"

3. **Hasura accelerates development**: "Auto-generating CRUD endpoints and subscriptions saves weeks vs. hand-written GraphQL servers"

4. **Apollo Client improves UX**: "Optimistic updates show technicians instant feedback, even on spotty shop floor WiFi"

## Key Dependencies

**All practices** require:

- Docker & Docker Compose
- Node.js 18+
- pnpm

**Practice 1** adds: `@temporalio/client`, `@temporalio/worker`, `kafkajs`

**Practice 2** adds: PostgreSQL (Docker), Hasura (Docker)

**Practice 3** adds: `next`, `@apollo/client`, `graphql`

## Code Style & Quality

- **Language**: TypeScript (strict mode enabled)
- **Formatting**: Prettier (configured in each practice folder)
- **Linting**: ESLint with TypeScript rules
- **Testing**: Jest (unit & integration), Playwright (E2E)
- **Package Manager**: pnpm (faster, more efficient than npm)

Use `pnpm lint:fix` to auto-fix style issues before committing.

## Debugging Tips

**Temporal**: Use the Temporal UI (usually `localhost:8080`) to observe workflow progress, see activity results, and simulate failures

**Hasura**: GraphiQL console at `localhost:8080` lets you test queries/subscriptions/mutations directly

**Next.js**: Use `pnpm dev` for fast reload during development; Chrome DevTools for client-side debugging

**Apollo Client**: Install [Apollo DevTools](https://www.apollographql.com/docs/react/development-testing/developer-tools/) browser extension to inspect cache and network activity

---

## Anthropic Best Practices Applied

This project follows Anthropic's guidelines for AI-assisted development:

✅ **Clear architecture documentation** — Future Claude Code sessions understand the big picture without reading every file

✅ **Explicit framework roles** — Each technology has a clear, single responsibility

✅ **Type safety** — All practice exercises use TypeScript strict mode

✅ **Real-time capabilities** — Subscriptions and optimistic updates demonstrate modern web patterns

✅ **Fault tolerance** — Temporal and retry policies show production-ready thinking

✅ **Scalability** — Kafka handles high-volume async messaging without synchronous bottlenecks
