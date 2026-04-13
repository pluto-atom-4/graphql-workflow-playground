# Practice 1: Temporal & Kafka — Workflow Orchestration Guide

## Overview

In this exercise, you'll build a **resilient workflow orchestration system** using Temporal and Kafka. You'll learn how to:
- Define multi-step workflows that coordinate activities
- Implement retry policies for fault tolerance
- Emit events asynchronously via Kafka for decoupled communication
- Test workflows against a local Temporal server
- Handle failures gracefully and recover workflow state

**Key Technologies**: Node.js, TypeScript, Temporal SDK, Kafka, Docker

**Time to Complete**: 2–3 hours

---

## Prerequisites

Before starting, ensure you have:
- Docker & Docker Compose installed
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Basic understanding of async/await in TypeScript
- Familiarity with the project structure (read `CLAUDE.md`)

---

## Step 1: Start the Docker Services

Navigate to the practice-1 directory and spin up Temporal and Kafka:

```bash
cd practice-1-temporal-kafka
docker-compose up -d
```

**What this does**:
- Starts a **Temporal Server** (usually accessible at `http://localhost:8080`)
- Starts a **Kafka broker** for event streaming
- Starts a **PostgreSQL database** (if needed for Temporal history)

**Verify services are running**:
```bash
docker-compose ps
```

You should see healthy containers for `temporal`, `kafka`, and `zookeeper`.

---

## Step 2: Install Dependencies

```bash
pnpm install
```

This installs:
- `@temporalio/client` — Client to start workflows
- `@temporalio/worker` — Worker to execute workflows and activities
- `@temporalio/workflow` — Workflow definitions
- `kafkajs` — Kafka producer/consumer
- TypeScript utilities and test frameworks

---

## Step 3: Explore the Project Structure

```
practice-1-temporal-kafka/
├── src/
│   ├── activities/           # Simple, synchronous functions
│   │   ├── validateOrder.ts
│   │   ├── reserveInventory.ts
│   │   └── ...
│   ├── workflows/            # Orchestration logic
│   │   └── orderWorkflow.ts  # Main workflow
│   ├── client.ts             # Starts workflows from the app
│   ├── worker.ts             # Executes workflows and activities
│   ├── kafka.ts              # Kafka producer
│   └── types.ts              # Shared TypeScript types
├── tests/
│   ├── activities.test.ts    # Unit tests for activities
│   ├── workflows.test.ts     # Integration tests for workflows
│   └── kafka.test.ts         # Kafka event verification
├── docker-compose.yml
├── tsconfig.json
└── package.json
```

**Key distinction**:
- **Activities**: Pure functions that do work (validate, reserve, charge)
- **Workflows**: Orchestrate activities, retry on failure, coordinate state
- **Kafka**: Publishes events once workflow reaches a certain state

---

## Step 4: Understand the Workflow Architecture

Open `src/workflows/orderWorkflow.ts` and read through the workflow definition:

```typescript
import { proxyActivities } from '@temporalio/workflow';
import { validateOrder, reserveInventory, chargePayment } from '../activities';

const activities = proxyActivities<typeof import('../activities')>({
  startToCloseTimeout: '10 seconds',
  retry: { initialInterval: '1 second', maximumAttempts: 3 },
});

export async function orderWorkflow(input: OrderInput): Promise<void> {
  // Step 1: Validate order
  await activities.validateOrder(input);
  
  // Step 2: Reserve inventory
  await activities.reserveInventory(input.orderId);
  
  // Step 3: Charge payment
  await activities.chargePayment(input.orderId, input.amount);
  
  // Step 4: Emit event to Kafka
  // (This happens after workflow completes successfully)
}
```

**Key concepts**:
- `proxyActivities()` wraps activity functions so Temporal can track them
- `startToCloseTimeout` limits how long a single activity can run
- `retry` automatically retries failed activities up to 3 times
- Each `await activities.X()` is a step that Temporal records in history

---

## Step 5: Examine the Activities

Open `src/activities/` to see individual activity implementations.

Example: `validateOrder.ts`
```typescript
export async function validateOrder(order: OrderInput): Promise<void> {
  // Validate order details (not idempotent required here)
  if (!order.items || order.items.length === 0) {
    throw new Error('Order has no items');
  }
  // ... validation logic
}
```

**Activity guidelines**:
- Keep activities small and focused (one job per activity)
- If an activity fails, Temporal retries it automatically
- Activities must be **idempotent** if retried (same inputs = same side effects)
- Avoid long-running activities; break into smaller steps via the workflow

---

## Step 6: Set Up the Worker

The worker executes workflows and activities. Open `src/worker.ts`:

```typescript
import { Worker } from '@temporalio/worker';
import * as workflows from './workflows';
import * as activities from './activities';

async function run() {
  const worker = await Worker.create({
    connection: { address: 'localhost:7233' }, // Temporal server address
    namespace: 'default',
    workflowsPath: require.resolve('./workflows'), // Where workflows are defined
    activities, // All activities
    taskQueue: 'default', // Task queue name
  });

  await worker.run();
}

run().catch(console.error);
```

**Start the worker**:
```bash
pnpm dev:worker
```

This process continuously polls Temporal for workflow and activity tasks, executes them, and reports results back to Temporal.

---

## Step 7: Start a Workflow

The client initiates workflows. Open `src/client.ts`:

```typescript
import { Connection, Client } from '@temporalio/client';
import { orderWorkflow } from './workflows';

async function startWorkflow() {
  const connection = await Connection.connect({ address: 'localhost:7233' });
  const client = new Client({ connection });

  const orderId = 'order-123';
  const handle = await client.workflow.start(orderWorkflow, {
    args: [{ orderId, items: [...], amount: 100 }],
    taskQueue: 'default',
  });

  console.log(`Workflow started: ${handle.workflowId}`);
  
  // Wait for completion
  const result = await handle.result();
  console.log(`Workflow completed:`, result);
}

startWorkflow().catch(console.error);
```

**Start a workflow**:
```bash
pnpm dev:client
```

---

## Step 8: Emit Events to Kafka

Once the workflow completes, emit an event. Modify `src/workflows/orderWorkflow.ts`:

```typescript
import { Connection, Client } from '@temporalio/client';
import { publishOrderEvent } from '../kafka';

export async function orderWorkflow(input: OrderInput): Promise<void> {
  await activities.validateOrder(input);
  await activities.reserveInventory(input.orderId);
  await activities.chargePayment(input.orderId, input.amount);

  // After all activities succeed, emit to Kafka
  // (Must happen outside the workflow—use a signal or client-side logic)
}
```

Better approach: **Emit the event from the client after workflow completes**:

```typescript
const result = await handle.result();
// Emit to Kafka now that workflow is done
await publishOrderEvent({
  orderId: input.orderId,
  status: 'Validated',
  timestamp: new Date(),
});
```

Open `src/kafka.ts` and implement the producer:

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: ['localhost:29092'], // Kafka broker address
});

const producer = kafka.producer();

export async function publishOrderEvent(event: any) {
  await producer.connect();
  await producer.send({
    topic: 'shipment-events',
    messages: [{ value: JSON.stringify(event) }],
  });
  await producer.disconnect();
}
```

---

## Step 9: Write Unit Tests for Activities

Open `tests/activities.test.ts` and write tests for individual activities:

```typescript
import { validateOrder } from '../src/activities';

describe('Activities', () => {
  it('should validate a valid order', async () => {
    const order = {
      orderId: 'order-123',
      items: [{ sku: 'PART-1', qty: 5 }],
    };
    // Should not throw
    await expect(validateOrder(order)).resolves.toBeUndefined();
  });

  it('should reject an order with no items', async () => {
    const order = { orderId: 'order-456', items: [] };
    await expect(validateOrder(order)).rejects.toThrow('Order has no items');
  });
});
```

**Run tests**:
```bash
pnpm test -- tests/activities.test.ts
```

---

## Step 10: Write Integration Tests for Workflows

Open `tests/workflows.test.ts` and test the full workflow:

```typescript
import { TestWorkflowEnvironment } from '@temporalio/sdk/testing';
import { orderWorkflow } from '../src/workflows';

describe('Workflows', () => {
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createLocal();
  });

  afterAll(async () => {
    await testEnv?.teardown();
  });

  it('should complete a successful order workflow', async () => {
    const { client, nativeConnection } = testEnv;
    const handle = await client.workflow.start(orderWorkflow, {
      args: [{ orderId: 'order-123', items: [...], amount: 100 }],
      taskQueue: 'default',
    });
    const result = await handle.result();
    expect(result).toBeUndefined(); // Workflow completed
  });

  it('should retry on activity failure', async () => {
    // Mock an activity failure and verify retry logic
    const { client } = testEnv;
    // ... test retry behavior
  });
});
```

**Run workflow tests**:
```bash
pnpm test -- tests/workflows.test.ts
```

---

## Step 11: Observe Workflow Execution

While a workflow runs, visit the Temporal UI:

```
http://localhost:8080
```

You'll see:
- **Workflows tab**: List of running/completed workflows
- **Execution details**: Timeline of activities with timestamps and results
- **Failure details**: If an activity fails, why it failed and retry attempts
- **History**: Complete audit trail of all events

**This is invaluable for debugging**: You can see exactly what happened, where it failed, and how many retries occurred.

---

## Step 12: Handle Workflow Failures

Modify your workflow to handle expected failures gracefully:

```typescript
export async function orderWorkflow(input: OrderInput): Promise<void> {
  try {
    await activities.validateOrder(input);
    await activities.reserveInventory(input.orderId);
    await activities.chargePayment(input.orderId, input.amount);
  } catch (error) {
    // Compensating transaction: undo the reservation if payment fails
    await activities.releaseReservation(input.orderId);
    throw error; // Fail the workflow
  }
}
```

**Temporal guarantees**:
- If a worker crashes mid-activity, Temporal resumes from that activity (not from the start)
- Retries are automatic (configured in `proxyActivities`)
- Workflow state is never lost—it's replayed from the event history

---

## Step 13: Test Kafka Event Emission

Write a test to verify events are published to Kafka:

```typescript
import { publishOrderEvent } from '../src/kafka';
import { Kafka } from 'kafkajs';

describe('Kafka', () => {
  it('should publish an order event to Kafka', async () => {
    const event = {
      orderId: 'order-123',
      status: 'Validated',
      timestamp: new Date(),
    };

    await publishOrderEvent(event);

    // Create a consumer to verify the event was published
    const kafka = new Kafka({ brokers: ['localhost:29092'] });
    const consumer = kafka.consumer({ groupId: 'test-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'shipment-events' });

    // Read the message
    const messages: any[] = [];
    await consumer.run({
      eachMessage: async ({ message }) => {
        messages.push(JSON.parse(message.value!.toString()));
      },
    });

    // Verify
    expect(messages).toContainEqual(event);
    await consumer.disconnect();
  });
});
```

---

## Step 14: Run the Full End-to-End Scenario

1. **Start services** (if not running):
   ```bash
   docker-compose up -d
   ```

2. **Start the worker** (in terminal 1):
   ```bash
   pnpm dev:worker
   ```

3. **Trigger a workflow** (in terminal 2):
   ```bash
   pnpm dev:client
   ```

4. **Watch the Temporal UI**:
   - Go to `http://localhost:8080`
   - See the workflow progress through each activity
   - Observe retry attempts if any activity fails

5. **Verify Kafka events** (in terminal 3):
   ```bash
   docker-compose exec kafka kafka-console-consumer \
     --bootstrap-server localhost:9092 \
     --topic shipment-events \
     --from-beginning
   ```

---

## Step 15: Build and Test

Run all tests and linting:

```bash
pnpm test              # Run all tests
pnpm lint              # Check for linting issues
pnpm lint:fix          # Auto-fix linting issues
pnpm build             # Compile TypeScript
```

Ensure everything passes before moving to Practice 2.

---

## Key Takeaways

✅ **Temporal ensures reliability**: Workflows survive worker crashes and automatically retry failures

✅ **Activities are simple**: Each activity is a single, focused job that Temporal can retry

✅ **Kafka decouples systems**: Once a workflow completes, emit events that other services consume asynchronously

✅ **The UI is your friend**: Use the Temporal UI to understand workflow execution and debug failures

✅ **Test at multiple levels**:
  - Unit test activities in isolation
  - Integration test workflows with a test Temporal server
  - E2E test Kafka event emission

---

## Troubleshooting

**Worker not connecting to Temporal?**
- Check that `docker-compose up -d` started the temporal service: `docker-compose ps`
- Verify the address in `worker.ts` matches: typically `localhost:7233`

**Workflow stuck or timed out?**
- Check the Temporal UI for details
- Verify activities aren't taking longer than `startToCloseTimeout` (default 10s)

**Kafka events not appearing?**
- Ensure the producer connects before publishing: `await producer.connect()`
- Check the broker address: typically `localhost:29092` (internal Kafka port)
- Verify the topic exists or is auto-created

**Tests failing?**
- Ensure Docker services are running: `docker-compose up -d`
- Check that both `worker.ts` and tests use the same task queue name (`'default'`)

---

## Interview Talking Points

When discussing this exercise in your interview:

> "In this exercise, I built a resilient workflow orchestration system using Temporal. The key insight is that **Temporal is a state machine**—it records every workflow step in an event history, so if a worker crashes mid-activity, the workflow resumes from exactly where it left off. This is critical for Boltline because a technician's tablet might lose connection mid-step on the shop floor, and we can't lose workflow progress."

> "I also learned that **Kafka decouples systems**: Once a work order is validated, I emit an event to Kafka that inventory systems and other services consume asynchronously. This prevents a slow downstream service from blocking the main order pipeline."

> "The retry logic is built in—Temporal automatically retries failed activities with exponential backoff. I configured activities with a 3-attempt retry policy, so transient failures (network hiccup, brief database unavailability) don't fail the entire workflow."

---

## Next Steps

Once you've completed this exercise:
1. Move to **Practice 2: Hasura & GraphQL** to build the data layer
2. Come back here if you need to emit workflows results to the GraphQL schema
