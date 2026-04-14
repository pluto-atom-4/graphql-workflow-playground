# Design & Architecture Guide

This document outlines the practice exercises and architecture patterns for mastering Boltline's core technologies.

## Project Structure

```
graphql-workflow-playground/
├── practice-1-temporal-kafka/          # Reliable Backend Workflow
│   ├── docker-compose.yml
│   ├── temporal/
│   │   ├── workflows/
│   │   │   └── shipment.ts
│   │   ├── activities/
│   │   │   ├── validate-order.ts
│   │   │   ├── reserve-inventory.ts
│   │   │   └── emit-kafka-event.ts
│   │   └── worker.ts
│   ├── kafka/
│   │   └── producer.ts
│   └── starter.ts
│
├── practice-2-hasura-graphql/          # Digital Backbone (Inventory)
│   ├── docker-compose.yml
│   ├── postgres/
│   │   └── schema.sql
│   ├── hasura/
│   │   ├── metadata/
│   │   └── migrations/
│   ├── graphql-schema.gql
│   └── README.md
│
├── practice-3-nextjs-graphql/          # Technician Work Plans
│   ├── app/
│   │   ├── work-plans/
│   │   │   └── [id]/page.tsx
│   │   ├── step/
│   │   │   └── [id]/page.tsx
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── apollo-client.ts
│   │   ├── graphql/
│   │   │   ├── queries.ts
│   │   │   └── mutations.ts
│   │   └── types.ts
│   ├── package.json
│   └── tsconfig.json
│
└── docs/
    └── start-from-here.md
```

## Core Architecture Patterns

### 1. Temporal & Kafka: Reliable Backend Workflow

**Goal**: Simulate an "Order Fulfillment" process where reliability and state management are paramount.

**Key Concepts**:

- **Durable Execution**: Temporal maintains workflow state across system failures
- **Retries**: Configure activities with exponential backoff for transient failures
- **Event-Driven Messaging**: Kafka acts as the event backbone for async communication

**Example Workflow**:

```
Order Received
  → ValidateOrder (immediate)
  → ReserveInventory (with 3 retries)
  → EmitKafkaEvent (publish shipment-events)
  → Complete
```

**What to Practice**:

1. Define a `ShipmentWorkflow` that orchestrates three activities
2. Add retry policies to handle database failures gracefully
3. Emit Kafka events when workflow reaches validated state
4. Observe Temporal UI to see workflow progress and recovery

---

### 2. Hasura & GraphQL: The "Digital Backbone"

**Goal**: Build a relational schema for inventory and orders with real-time subscriptions.

**Core Entities**:

- **Parts**: `id`, `name`, `sku`
- **Inventory**: `part_id`, `quantity`, `location`
- **Orders**: `id`, `part_id`, `status`

**Key Patterns**:

- **Foreign Key Relationships**: Track Orders → Parts via part_id
- **Real-time Subscriptions**: Listen for Inventory changes instantly
- **Custom Business Logic**: Hasura Actions for webhook-backed validation

**What to Practice**:

1. Design PostgreSQL schema with proper constraints
2. Connect Hasura and track relationships in the console
3. Write a GraphQL subscription to observe inventory updates
4. Create a Hasura Action to validate order quantities before insertion

---

### 3. Next.js & GraphQL: Technician Work Plans

**Goal**: Build a shop-floor UI where technicians follow digital instructions and log data in real-time.

**Key Features**:

- **Dynamic Rendering**: Fetch work plan steps using GraphQL queries
- **Server Components**: Initial load via Next.js server-side rendering
- **Client Components**: Interactive buttons and forms
- **Optimistic Updates**: Show "Checkmark" instantly before database confirms

**UI Flow**:

```
Work Plan Overview
  ↓ (click a plan)
→ Step 1: Prepare Assembly
    - Show instructions
    - Log Data form (e.g., torque value)
    ↓ (submit)
→ Optimistic update: mark complete
→ GraphQL mutation to backend
→ Step 2: Weld Joint ...
→ Complete Work Plan
```

**Apollo Client Patterns**:

```typescript
const { data, loading } = useQuery(GET_WORK_PLAN_STEPS, {
  variables: { workPlanId },
});

const [completeStep] = useMutation(COMPLETE_STEP, {
  optimisticResponse: {
    completeStep: { id, status: "COMPLETED" },
  },
  update: (cache, { data }) => {
    // Update local cache
  },
});
```

---

## Interview Preparation Checkpoints

### Before Your Interview

**Checkpoint 1: Temporal Mastery**

- [ ] Run a Temporal workflow locally
- [ ] Trigger a worker failure and observe recovery
- [ ] Explain retry policies and why they matter for manufacturing workflows

**Checkpoint 2: GraphQL Real-time Data**

- [ ] Create a GraphQL subscription and observe live updates
- [ ] Write a custom Hasura Action and test it via GraphQL
- [ ] Explain how this pattern keeps technicians seeing live inventory

**Checkpoint 3: Next.js Fullstack**

- [ ] Build a server component that fetches from GraphQL
- [ ] Implement optimistic UI updates in Apollo Client
- [ ] Explain how technicians see instant feedback even if the network is slow

**During Your Interview**

When discussing architecture, mention:

- **"Temporal ensures workflow state is preserved—if a technician's tablet dies mid-step, the Work Plan recovers safely"**
- **"Kafka acts as our event backbone, ensuring all services stay in sync asynchronously"**
- **"Hasura's real-time subscriptions let technicians see live inventory changes on the shop floor"**
- **"Apollo Client's optimistic updates provide instant feedback while the backend confirms"**

---

## Technology Rationale

| Framework          | Why It Matters for Boltline                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| **Hasura/GraphQL** | Rapidly auto-generate CRUD endpoints and subscriptions without boilerplate                      |
| **Temporal**       | Ensure complex multi-day manufacturing steps complete reliably even if services fail            |
| **Kafka**          | Stream high-volume manufacturing sensor data without blocking synchronous APIs                  |
| **Next.js**        | Server-side rendering for fast initial load, client-side hydration for interactivity            |
| **Apollo Client**  | Local caching and optimistic updates keep technicians productive even on spotty shop floor WiFi |

---

## Resources

- [Temporal Documentation](https://docs.temporal.io/)
- [Hasura GraphQL Engine](https://hasura.io/)
- [Apache Kafka](https://kafka.apache.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
