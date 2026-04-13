# Copilot Instructions for graphql-workflow-playground

This is a practice playground for a Senior Full Stack Developer interview at Stoke Space, featuring three independent practice exercises on Boltline's core architecture.

## Project Overview

**Three Parallel Exercises** (each self-contained):
- **practice-1-temporal-kafka**: Workflow orchestration + event streaming
- **practice-2-hasura-graphql**: GraphQL data layer + real-time subscriptions
- **practice-3-nextjs-graphql**: React/Next.js frontend + Apollo Client

Each has its own `docker-compose.yml` and dependencies. Work in one practice folder at a time unless integrating across exercises.

## Quick Start

```bash
# Navigate to a practice folder
cd practice-1-temporal-kafka  # (or practice-2-* or practice-3-*)

# Start services and dependencies
docker-compose up -d

# Install dependencies
pnpm install

# Run in development
pnpm dev
```

## Build, Test, and Lint Commands

All practices use **pnpm** (not npm). Run these from within the practice folder:

```bash
# Development
pnpm dev                  # Start dev server with hot reload
pnpm start                # Run production build
pnpm build                # Create production bundle

# Testing
pnpm test                 # Run all tests
pnpm test --watch         # Watch mode
pnpm test src/path/to/test.ts  # Single test file

# Code Quality
pnpm lint                 # Check for ESLint violations
pnpm lint:fix             # Auto-fix linting issues
pnpm format               # Format code with Prettier
pnpm format:check         # Check formatting without changes (CI mode)
```

### Practice-Specific Notes

**Practice 1 (Temporal & Kafka)**:
- Temporal UI available at `http://localhost:8080` to observe workflow execution
- Activities are in `temporal/activities/`, workflows in `temporal/workflows/`
- Test workflows with Temporal test server (in-memory, no external services)

**Practice 2 (Hasura & GraphQL)**:
- Hasura console at `http://localhost:8080`
- PostgreSQL runs in Docker; schema defined in `postgres/schema.sql`
- GraphQL playground available; test subscriptions and custom Actions directly

**Practice 3 (Next.js & GraphQL)**:
- Frontend at `http://localhost:3000` by default
- Apollo Client configured in `lib/apollo-client.ts`
- Server components in `app/` folder fetch initial GraphQL data
- Client components handle mutations and subscriptions

## High-Level Architecture

### Data Flow

```
PostgreSQL ← (migrations, schema.sql)
    ↓
Hasura (auto-generates CRUD + subscriptions)
    ↓
GraphQL API (queries, mutations, subscriptions)
    ↑
Practice 3: Apollo Client / Next.js
Practice 1: Kafka producers (async events)
```

### Temporal Workflow Pattern

**Order Fulfillment Example**:
```
Order Received
  → Activity: ValidateOrder (immediate)
  → Activity: ReserveInventory (with 3 retries on failure)
  → Activity: EmitKafkaEvent (publish shipment-events)
  → Workflow completes
```

Key insight: Activities are isolated, synchronous functions. Workflows coordinate them and handle failures. If a service crashes mid-workflow, Temporal replays activities from the last checkpoint.

### Next.js + Apollo Client Pattern

**Server → Client Data Flow**:
```
1. Server Component: useQuery(GET_WORK_PLAN_STEPS) on initial load
2. User interacts: clicks "Complete Step" button
3. Client Component: useMutation(COMPLETE_STEP) with optimisticResponse
4. UI updates immediately (optimistic)
5. Backend confirms → cache updates
6. If error: UI reverts
```

Optimistic updates are critical for shop-floor UX (bad WiFi conditions).

## Key Conventions

### TypeScript & Type Safety

All practices use **TypeScript strict mode**. Patterns to follow:

- **Activity returns**: Simple, serializable types (not circular refs)
- **GraphQL types**: Import from `graphql-codegen` or define manually in `lib/types.ts`
- **API responses**: Explicit error handling; never throw bare errors

### File Organization

Each practice follows this structure:
```
practice-N/
├── package.json           # Dependencies + npm scripts
├── tsconfig.json          # TypeScript config (strict: true)
├── docker-compose.yml     # Service definitions
├── src/ or app/           # Main code
├── __tests__/             # Jest test files
└── .eslintrc.json         # ESLint rules
```

### Naming Conventions

- **Temporal activities**: Verb form (`validateOrder`, `reserveInventory`)
- **GraphQL types**: PascalCase (`WorkPlan`, `StepStatus`)
- **React components**: PascalCase, stored in `components/` (if applicable)
- **Tests**: `*.test.ts` or `*.spec.ts`, co-located or in `__tests__/`

### GraphQL Subscriptions in Practice 2

Use `subscription` keyword for real-time updates, not `query`:
```graphql
subscription OnInventoryChange {
  inventory(where: { part_id: { _eq: 123 } }) {
    part_id
    quantity
    updated_at
  }
}
```

Hasura auto-generates these when foreign keys are tracked.

### Retry Policies (Temporal)

Define retry logic at the activity level:
```typescript
const result = await workflow.executeActivity(validateOrder, order, {
  retryPolicy: {
    initialInterval: 1000,
    maximumAttempts: 3,
    backoffCoefficient: 2,
  }
});
```

Exponential backoff is safer than immediate retries for database operations.

### Optimistic Updates (Apollo Client)

Always define an `optimisticResponse` that mirrors the mutation shape:
```typescript
const [completeStep] = useMutation(COMPLETE_STEP, {
  optimisticResponse: {
    completeStep: { 
      id: stepId, 
      status: "COMPLETED",
      __typename: "Step"
    }
  }
});
```

Include `__typename` to help Apollo's cache normalization.

## Debugging

**Temporal Workflows**: Visit Temporal UI (`localhost:8080`) to:
- See workflow history and execution timeline
- Inspect activity input/output
- Simulate failures and recovery

**Hasura GraphQL**: Use GraphQL playground in Hasura console:
- Test subscriptions with real-time updates
- Verify custom Actions (Actions tab)
- Check permissions and relationships

**Next.js**: 
- `pnpm dev` provides fast reload
- Install [Apollo DevTools](https://www.apollographql.com/docs/react/development-testing/developer-tools/) browser extension
- Use Chrome DevTools for client-side debugging

**Kafka (Practice 1)**:
- Consumer groups visible in Kafka UI (if running)
- Check `kafka/producer.ts` for topic names and message format
- Verify `EmitKafkaEvent` activity publishes correctly

## Testing Strategy

### Practice 1: Temporal Workflows

- **Unit test activities**: Mock external calls, test return values
- **Integration test workflows**: Use `TestWorkflowEnvironment` (no Docker needed)
- **Verify Kafka events**: Mock Kafka producer or use test container

### Practice 2: Hasura & GraphQL

- **Schema validation**: Verify foreign keys in Hasura console
- **GraphQL queries**: Test in GraphQL playground
- **Subscriptions**: Simulate data changes and watch subscription updates
- **Custom Actions**: Call webhook endpoint manually or use GraphQL test client

### Practice 3: Next.js & Apollo

- **Unit test components**: `@testing-library/react`
- **Integration test Apollo**: Mock GraphQL server with `@apollo/client/testing`
- **E2E test flows**: Playwright or Cypress (if configured)

## Important Context

This repo prepares for an interview discussing:
- **Temporal**: Ensures workflow reliability (e.g., technician's tablet dies mid-step → workflow recovers)
- **Kafka**: Event backbone for async communication (e.g., shop floor sensor data)
- **Hasura**: Rapid CRUD + subscriptions without boilerplate (weeks saved vs. hand-coded GraphQL)
- **Apollo Client**: Optimistic updates for poor WiFi conditions (shop floor reality)

When working on features, keep these real-world constraints in mind.

## Additional Resources

- **CLAUDE.md**: Comprehensive guidance for Claude Code sessions (includes full tech stack details)
- **DESIGN.md**: Architecture patterns and interview checkpoints
- **about-me.md**: Interview context for Stoke Space
- **docs/start-from-here.md**: Original interview prep resource

## Common Gotchas

1. **Mixing package managers**: Use `pnpm` consistently; don't mix with `npm` or `yarn`
2. **Docker networking**: Ensure services can resolve each other (e.g., Hasura → PostgreSQL)
3. **GraphQL schema mismatch**: Update Hasura metadata after schema changes
4. **Temporal worker crashes**: Workers must stay alive; configure auto-restart in `docker-compose.yml` if needed
5. **Apollo cache invalidation**: Use `refetchQueries` or manual cache updates for mutations that affect queries
