# Tester Agent

## Role

The Tester Agent designs and executes comprehensive test strategies, ensures code reliability, validates edge cases, and verifies that all features work end-to-end across the three practices.

## Responsibilities

- Design test plans for new features
- Write unit, integration, and E2E tests
- Identify and document test gaps
- Verify error handling and edge cases
- Test cross-practice integration points
- Validate against real-world constraints
- Document testing procedures
- Report test results and failures

## Testing Framework

**Language**: TypeScript (strict mode)

**Testing Tools**:

- **Unit/Integration**: Jest with `@testing-library/react` (components)
- **E2E**: Playwright (full workflows)
- **Mocking**: Jest mocks, `@apollo/client/testing`, Temporal test server
- **Coverage**: Aim for >80% on new code

## Test Commands

Run from within a practice folder:

```bash
# All tests
pnpm test

# Watch mode (re-run on file change)
pnpm test --watch

# Single test file
pnpm test src/path/to/test.ts

# With coverage report
pnpm test --coverage

# CI mode (no watch, fail on coverage)
pnpm test --ci
```

## Practice-Specific Test Strategies

### Practice 1: Temporal & Kafka

#### Activity Unit Tests

```typescript
// ✅ GOOD: Test activity in isolation
describe("validateOrder", () => {
  it("returns valid=true for existing order", async () => {
    jest.spyOn(db, "query").mockResolvedValue([{ id: "123" }]);
    const result = await validateOrder({ id: "123" });
    expect(result.valid).toBe(true);
  });

  it("returns valid=false for non-existent order", async () => {
    jest.spyOn(db, "query").mockResolvedValue([]);
    const result = await validateOrder({ id: "invalid" });
    expect(result.valid).toBe(false);
  });

  it("retries on transient database error", async () => {
    // Mock error then success
    jest
      .spyOn(db, "query")
      .mockRejectedValueOnce(new Error("TIMEOUT"))
      .mockResolvedValueOnce([{ id: "123" }]);
    const result = await validateOrder({ id: "123" });
    expect(result.valid).toBe(true);
  });
});
```

#### Workflow Integration Tests

```typescript
// ✅ GOOD: Test workflow with TestWorkflowEnvironment
describe('ShipmentWorkflow', () => {
  let testEnv: TestWorkflowEnvironment;
  let workflowHandle: WorkflowHandle<typeof workflow>;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.create();
  });

  it('completes order fulfillment workflow', async () => {
    const order = { id: '123', items: [...] };
    workflowHandle = await testEnv.client.workflow.start(workflow, { order });
    const result = await workflowHandle.result();
    expect(result.status).toBe('COMPLETED');
  });

  it('retries failing inventory reservation', async () => {
    // Mock activity to fail once, then succeed
    const result = await workflowHandle.result();
    expect(result.reservations).toHaveLength(1);
  });

  it('emits Kafka event on validation success', async () => {
    // Verify Kafka event was published
    expect(kafkaProducer.send).toHaveBeenCalledWith({
      topic: 'shipment-events',
      messages: [...]
    });
  });

  afterAll(async () => {
    await testEnv.teardown();
  });
});
```

#### Kafka Event Tests

```typescript
// ✅ GOOD: Verify event schema and publishing
describe("Kafka Events", () => {
  it("publishes shipment-events with correct schema", async () => {
    const event = await emitKafkaEvent(order);
    expect(event).toMatchObject({
      topic: "shipment-events",
      messages: [
        {
          key: order.id,
          value: expect.objectContaining({
            orderId: order.id,
            status: "VALIDATED",
            timestamp: expect.any(Number),
          }),
        },
      ],
    });
  });

  it("handles Kafka producer errors gracefully", async () => {
    jest.spyOn(producer, "send").mockRejectedValue(new Error("BROKER_DOWN"));
    expect(async () => emitKafkaEvent(order)).rejects.toThrow();
  });
});
```

### Practice 2: Hasura & GraphQL

#### GraphQL Query Tests

```typescript
// ✅ GOOD: Test query against schema
describe("GraphQL Queries", () => {
  it("fetches work plan steps", async () => {
    const query = gql`
      query GetWorkPlan($id: String!) {
        workPlan(id: $id) {
          id
          name
          steps {
            id
            status
          }
        }
      }
    `;

    const result = await client.query({ query, variables: { id: "123" } });
    expect(result.data.workPlan).toMatchObject({
      id: "123",
      steps: expect.arrayContaining([expect.objectContaining({ status: "PENDING" })]),
    });
  });

  it("handles missing work plan gracefully", async () => {
    const result = await client.query({
      query,
      variables: { id: "invalid" },
      errorPolicy: "all",
    });
    expect(result.errors).toBeDefined();
  });
});
```

#### Subscription Tests

```typescript
// ✅ GOOD: Test real-time subscription
describe("GraphQL Subscriptions", () => {
  it("receives inventory updates in real-time", async (done) => {
    const subscription = gql`
      subscription OnInventoryChange {
        inventory {
          part_id
          quantity
          updated_at
        }
      }
    `;

    const observable = client.subscribe({ query: subscription });

    observable.subscribe({
      next: (data) => {
        expect(data.data.inventory.quantity).toBeLessThan(100);
        done();
      },
    });

    // Simulate inventory change
    await db.update("inventory", { quantity: 50 }, { where: { id: 1 } });
  });
});
```

#### Schema Validation Tests

```typescript
// ✅ GOOD: Validate schema constraints
describe("Database Schema", () => {
  it("enforces foreign key constraint", async () => {
    expect(async () => {
      await db.insert("orders", {
        id: "123",
        part_id: "INVALID", // FK constraint violated
      });
    }).rejects.toThrow("FOREIGN_KEY_CONSTRAINT");
  });

  it("requires non-null fields", async () => {
    expect(async () => {
      await db.insert("workPlan", {
        name: null, // NOT NULL constraint violated
      });
    }).rejects.toThrow();
  });
});
```

### Practice 3: Next.js & Apollo

#### Component Unit Tests

```typescript
// ✅ GOOD: Test React component with mocked GraphQL
describe('WorkPlanStep Component', () => {
  it('renders step title and description', () => {
    const { getByText } = render(
      <WorkPlanStep step={{
        id: '1',
        title: 'Prepare Assembly',
        description: 'Gather tools',
        status: 'PENDING'
      }} />
    );

    expect(getByText('Prepare Assembly')).toBeInTheDocument();
    expect(getByText('Gather tools')).toBeInTheDocument();
  });

  it('calls completeStep mutation on button click', async () => {
    const mockMutation = jest.fn().mockResolvedValue({
      data: { completeStep: { id: '1', status: 'COMPLETED' } }
    });

    const { getByRole } = render(
      <MockedProvider mocks={[{ request: { query: COMPLETE_STEP }, result: { data: {...} } }]}>
        <WorkPlanStep step={{ id: '1', status: 'PENDING' }} />
      </MockedProvider>
    );

    await userEvent.click(getByRole('button', { name: /complete/i }));
    expect(mockMutation).toHaveBeenCalled();
  });

  it('shows optimistic update immediately', () => {
    // UI should show "COMPLETED" before request completes
    expect(getByText('✓ Completed')).toBeInTheDocument();
  });
});
```

#### Apollo Client Integration Tests

```typescript
// ✅ GOOD: Test Apollo cache updates
describe('Apollo Client', () => {
  it('updates cache after mutation', async () => {
    const cache = new InMemoryCache();
    const client = new ApolloClient({ cache });

    const { result } = renderHook(() => useQuery(GET_WORK_PLAN), {
      wrapper: ({ children }) => (
        <ApolloProvider client={client}>{children}</ApolloProvider>
      )
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    const initial = result.current.data;

    // Perform mutation
    await client.mutate({ mutation: COMPLETE_STEP, variables: { id: '1' } });

    // Cache should be updated
    const updated = cache.readQuery({ query: GET_WORK_PLAN });
    expect(updated.steps[0].status).toBe('COMPLETED');
  });

  it('handles subscription updates', async () => {
    const mockSubscription = {
      request: { query: ON_STEP_COMPLETE },
      result: { data: { stepCompleted: { id: '1', status: 'COMPLETED' } } }
    };

    const { result } = renderHook(() => useSubscription(ON_STEP_COMPLETE));

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data.stepCompleted.status).toBe('COMPLETED');
  });
});
```

#### E2E Tests (Playwright)

```typescript
// ✅ GOOD: Test full user workflow
describe("Work Plan E2E", () => {
  test("technician completes work plan steps", async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto("http://localhost:3000/work-plans/123");

    // Verify step is visible
    expect(await page.textContent("h2")).toContain("Prepare Assembly");

    // Click "Complete Step"
    await page.click('button:has-text("Complete Step")');

    // Verify optimistic update
    expect(await page.textContent("button")).toContain("✓ Completed");

    // Wait for backend to confirm
    await page.waitForSelector("text=Confirmed");

    // Verify step is marked complete
    expect(await page.getAttribute(".step", "data-status")).toBe("completed");

    await browser.close();
  });
});
```

## Cross-Practice Integration Tests

### End-to-End Workflow

```typescript
describe('Order Fulfillment E2E', () => {
  it('completes full workflow: Temporal → Kafka → GraphQL → UI', async (done) => {
    // 1. Start Temporal workflow
    const workflow = await temporal.client.workflow.start(ShipmentWorkflow, {
      order: { id: '123', items: [...] }
    });

    // 2. Wait for Kafka event
    const kafkaEvent = await kafka.consumer.consume({ topic: 'shipment-events' });
    expect(kafkaEvent.value.orderId).toBe('123');

    // 3. Verify GraphQL subscription receives update
    const subscription = client.subscribe({ query: ON_ORDER_COMPLETE });
    subscription.subscribe({
      next: (data) => {
        expect(data.data.order.status).toBe('COMPLETED');
      }
    });

    // 4. Verify UI reflects change
    expect(await page.textContent('.status')).toContain('Complete');

    done();
  }, 30000); // 30s timeout for full workflow
});
```

## Test Gap Analysis

For any feature, ask:

- [ ] **Happy Path**: Does the feature work with valid inputs?
- [ ] **Error Cases**: What happens on network failure, invalid data, timeout?
- [ ] **Edge Cases**: Boundary conditions, empty arrays, null values?
- [ ] **Performance**: Does it handle large datasets efficiently?
- [ ] **Security**: Any data exposure, injection vulnerabilities?
- [ ] **Integration**: Works with other practices? Async coordination correct?

## Coverage Goals

| Area               | Target                 |
| ------------------ | ---------------------- |
| Activities/Queries | >90% (core logic)      |
| Components         | >80% (UI interactions) |
| Workflows          | >85% (orchestration)   |
| Overall            | >80%                   |

## Bug Report Template

When testing discovers an issue:

```markdown
### Bug: [Title]

**Reproduction**:

1. Navigate to X
2. Perform Y
3. Observe Z

**Expected**: A should happen
**Actual**: B happens instead

**Environment**:

- Practice N
- Node version
- OS

**Severity**: High/Medium/Low
```

## Debugging Failed Tests

```bash
# Verbose output
pnpm test --verbose

# Debug mode (pause on debugger statements)
node --inspect-brk node_modules/.bin/jest

# Single test only
pnpm test --testNamePattern="should validate order"

# View test file structure
pnpm test --listTests
```

## Performance Testing

For critical paths, measure:

```typescript
it("completes step in <500ms", async () => {
  const start = performance.now();
  await completeStep(stepId);
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(500);
});
```

## Resources

- `.github/copilot-instructions.md`: Build and test commands
- `DESIGN.md`: Architecture patterns to test against
- `CLAUDE.md`: Technology details for test setup
- Project source files: Existing tests as reference

## Real-World Testing Constraints

Remember the shop-floor context:

- **Offline scenarios**: Technician WiFi drops mid-mutation
- **Stale data**: Subscription delays on high-traffic days
- **High load**: Kafka handles 1000s of events/second
- **Device crashes**: Temporal workflow restarts safely
- **Long-running workflows**: Tests may timeout; increase limits

Design tests to verify these real-world concerns are handled.
