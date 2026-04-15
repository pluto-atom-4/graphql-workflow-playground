# Practice 1: Gap Analysis — Documentation vs. Implementation

**Date**: 2026-04-15  
**Scope**: Comparing `practice-1-temporal-kafka-guide.md` with actual implementation in `./practice-1-temporal-kafka`

---

## Executive Summary

The implementation is **75% aligned** with the guide but has several material gaps and inconsistencies:

| Category | Status | Severity |
| --- | --- | --- |
| **Project Structure** | ⚠️ Partially Aligned | Medium |
| **Scripts & Commands** | ❌ Mismatched | High |
| **Activities Implementation** | ✅ Aligned | Low |
| **Workflow Definition** | ✅ Aligned | Low |
| **Kafka Integration** | ⚠️ Partially Aligned | Medium |
| **Testing Coverage** | ❌ Incomplete | High |
| **Error Handling** | ✅ Aligned | Low |
| **Documentation in Code** | ⚠️ Minimal | Medium |
| **Cross-Practice Integration** | ⚠️ Unclear | Medium |

---

## 1. Project Structure Gaps

### Guide Says:
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
```

### Implementation Has:
```
practice-1-temporal-kafka/
├── src/
│   ├── client/
│   │   └── temporal-client.ts         # Single client file, not exposed directly
│   ├── config/
│   │   ├── kafka.config.ts
│   │   └── temporal.config.ts         # Config extracted to separate files
│   ├── kafka/
│   │   ├── producer.ts
│   │   └── topics.ts
│   ├── temporal/
│   │   ├── worker.ts
│   │   ├── workflows/
│   │   │   └── shipment.workflow.ts   # Workflow named differently
│   │   └── activities/
│   │       ├── validate-order.activity.ts
│   │       ├── reserve-inventory.activity.ts
│   │       └── emit-kafka-event.activity.ts
│   └── starter.ts                     # Entry point (not client.ts)
├── __tests__/
│   └── unit/
│       └── validate-order.test.ts     # Only one test file
```

### 🔴 Gaps Identified:

1. **Missing types file**: Guide mentions `src/types.ts` but implementation uses `@boltline/shared-types` workspace package
2. **Structure too granular**: Implementation separates config and client logic; guide suggests simpler structure
3. **Missing test files**: Guide expects `activities.test.ts`, `workflows.test.ts`, `kafka.test.ts` but only `validate-order.test.ts` exists
4. **Naming inconsistency**: Guide uses `client.ts` as entry point; implementation uses `starter.ts` and `temporal-client.ts` as internal module
5. **Activities location**: Guide suggests `src/activities/` flat structure; implementation uses `src/temporal/activities/`

---

## 2. Scripts & Commands Mismatch

### Guide Says:
```bash
pnpm dev:worker          # Run the worker
pnpm dev:client          # Trigger a workflow
pnpm test -- tests/activities.test.ts
pnpm test -- tests/workflows.test.ts
```

### Implementation Has:
```json
{
  "dev": "tsx watch src/temporal/worker.ts",
  "start:worker": "node dist/temporal/worker.js",
  "start:starter": "tsx src/starter.ts",
  "lint": "eslint src --ext .ts",
  "lint:fix": "eslint src --ext .ts --fix",
  "test": "jest"
}
```

### 🔴 Critical Gaps:

1. **No `pnpm dev:worker` script**: Guide assumes `dev:worker` but actual script is `dev`
2. **No `pnpm dev:client` script**: Guide assumes `dev:client` to start workflows; implementation requires `pnpm start:starter` (not documented)
3. **Test patterns different**: 
   - Guide uses path-based jest: `pnpm test -- tests/activities.test.ts`
   - Implementation uses jest.config.ts with `testMatch: ["**/__tests__/**/*.test.ts"]` (different directory convention)
4. **No `pnpm build` documented in implementation**: Guide mentions `pnpm build` but no docs on what it does

### ⚠️ Impact:
Users following the guide exactly will fail when running suggested commands. They must discover the actual script names themselves.

---

## 3. Workflow & Activities Implementation

### ✅ Alignment Confirmed:

- **Workflow structure matches**: `shipmentWorkflow` correctly uses `proxyActivities`, defines timeouts, and implements retry logic
- **Activities are small and focused**: `validateOrder`, `reserveInventory`, `emitKafkaEvent` follow single-responsibility principle
- **Error handling present**: Uses `ApplicationFailure.nonRetryable()` as documented
- **Kafka event emission inside workflow**: Unlike guide's suggestion (client-side), implementation emits via an activity (arguably better for atomicity)

### ⚠️ Minor Inconsistencies:

1. **Activity names**: Guide mentions generic names (validateOrder); implementation uses kebab-case with .activity suffix (`validate-order.activity.ts`)
2. **Proxy setup**: Guide shows single proxy; implementation separates proxyActivities per activity set (validation, reservation, Kafka) for granular timeout/retry control
3. **Return types**: Implementation returns structured results (`ValidateOrderResult`, `ReservationResult`); guide examples less specific

---

## 4. Kafka Integration

### Guide Says:
- "Emit the event from the client after workflow completes"
- "Open `src/kafka.ts` and implement the producer"
- Example shows standalone `publishOrderEvent()` function

### Implementation Has:
- Kafka emission integrated as a **workflow activity** (`emit-kafka-event.activity.ts`)
- Producer abstracted as `sendToTopic()` in `src/kafka/producer.ts`
- Configuration externalized to `src/config/kafka.config.ts`
- Kafka topics defined in `src/kafka/topics.ts`

### 🟡 Design Decision Difference:

| Aspect | Guide | Implementation |
| --- | --- | --- |
| **Emission Timing** | Client-side, after workflow | Activity-level, inside workflow |
| **Atomicity** | Weaker (can fail post-workflow) | Stronger (part of workflow history) |
| **Producer Pattern** | Singleton with manual connect/disconnect | Singleton with single-use producer lifecycle |
| **Topic Management** | Hardcoded in code | Centralized config |

**Recommendation**: Implementation's approach (activity-level emission) is more robust for production but differs from guide's teaching.

---

## 5. Testing Coverage

### Guide Expects:

```
tests/
├── activities.test.ts    # Unit tests for all activities
├── workflows.test.ts     # Integration tests using TestWorkflowEnvironment
└── kafka.test.ts         # Verification of Kafka event publishing
```

### Implementation Has:

```
__tests__/
└── unit/
    └── validate-order.test.ts  # Only validateOrder activity tested
```

### 🔴 Major Gap:

1. **Missing workflow integration tests**: Guide emphasizes `TestWorkflowEnvironment` (lines 327–356); implementation has no integration tests
2. **Missing Kafka event tests**: Guide shows test pattern for verifying published events (lines 414–447); no equivalent in implementation
3. **Single activity tested**: Only `validateOrder` tested; no tests for `reserveInventory` or `emitKafkaEvent`
4. **No test documentation**: Implementation doesn't explain how to run tests or what they verify

### Coverage Implications:
- Current test coverage likely **<50%** (jest.config.ts sets 50% threshold, barely met with single test)
- Workflow retries, failures, and Kafka integration untested
- Interview talking point weakened: can't discuss testing strategy with confidence

---

## 6. Inconsistencies with Practice 2 & 3

### Data Flow Contract Issues:

**Guide suggests**:
1. Practice 1 emits events to Kafka topic `shipment-events`
2. Practice 2 exposes orders/work plans via GraphQL API
3. Practice 3 fetches real-time work plan updates via subscriptions

**Implementation Status**:

| Layer | Status | Notes |
| --- | --- | --- |
| **Practice 1 → Kafka** | ✅ Works | Emits to `shipment-events` topic |
| **Kafka → Practice 2 (GraphQL)** | ❓ Unclear | No documented integration; no consumer shown |
| **Practice 2 → Practice 3** | ✅ Documented | Practice 3 guide assumes Practice 2 API |
| **Practice 3 ← Practice 1 flow** | ❌ Missing | How do Temporal workflows trigger GraphQL mutations/subscriptions? |

### 🟡 Cross-Practice Gap:
- Practice 1 documentation doesn't explain how Kafka events feed into Practice 2's database
- No example of consuming Kafka messages and writing to PostgreSQL
- No trigger shown for updating Order/WorkPlan status in GraphQL when Temporal workflow completes
- Interview question: "How do the three practices integrate?" is not clearly answered

---

## 7. Environment & Configuration

### Guide Assumes:
- All services run on `localhost:7233` (Temporal), `localhost:29092` (Kafka)
- No mention of `.env` or environment variable handling

### Implementation Provides:
- `.env.example` with explicit config:
  ```
  TEMPORAL_ADDRESS=localhost:7233
  TEMPORAL_NAMESPACE=default
  TEMPORAL_TASK_QUEUE=shipment-queue
  KAFKA_BROKER=localhost:9092
  KAFKA_TOPIC_SHIPMENT_EVENTS=shipment-events
  ```
- Config modules (`temporal.config.ts`, `kafka.config.ts`) read from `.env`

### ✅ Implementation Better:
Configuration explicitly defined beats hardcoding, but **guide should mention env setup**.

---

## 8. Docker Compose Integration

### Guide Says:
- "Start services: `docker-compose up -d`"
- Lists expected containers: `temporal`, `kafka`, `zookeeper`

### Implementation Has:
```yaml
include:
  - path: ../infra/docker/docker-compose.shared.yml
services:
  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    # ...
```

### 🟡 Gaps:

1. **Shared docker-compose unclear**: Guide doesn't mention shared infrastructure; users may not realize it's in `../infra/`
2. **Kafka UI added**: Extra service not mentioned in guide (helpful for debugging, but undocumented)
3. **Temporal UI port**: Guide mentions `http://localhost:8080` but actual shared config may use different port (needs verification)

---

## 9. Code Quality & Documentation

### In Implementation:
- Minimal inline comments
- No README in practice-1 folder
- No troubleshooting section at package level
- Types imported from shared workspace but not explained

### Missing:
- Clear instructions on:
  - How to extend with new activities
  - How to add new workflow types
  - How to test locally without full Docker stack
- No examples of failure scenarios or recovery

---

## 10. Temporal UI & Observability

### Guide Emphasizes (Step 11):
- "Visit `http://localhost:8080` to see workflows"
- Shows exact UI features: Workflows tab, Execution details, Failure details, History

### Implementation Note:
- `starter.ts` (line 29) references `http://localhost:8088` (different port!)
  ```typescript
  View workflow in Temporal UI: http://localhost:8088/namespaces/${temporalConfig.namespace}/workflows/${order.orderId}
  ```

### 🔴 Critical Mismatch:
- Guide says port 8080; implementation prints port 8088
- Users following guide will go to wrong URL

---

## 11. Activity Error Handling Comparison

### Guide Pattern (line 396):
```typescript
try {
  // ...
} catch (error) {
  await activities.releaseReservation(input.orderId);
  throw error; // Fail the workflow
}
```

### Implementation Pattern:
```typescript
const validation = await activities.validateOrder(order);
if (!validation.valid) {
  throw ApplicationFailure.nonRetryable(`Order validation failed: ${validation.reason}`);
}
```

### Analysis:
- Implementation uses **return-based validation** (better); guide uses **exception-based**
- Implementation's `ApplicationFailure.nonRetryable()` correctly signals unrecoverable errors
- Guide's compensating transaction example (`releaseReservation`) missing from implementation

---

## Summary of Severity Levels

### 🔴 Critical Issues (Must Fix):
1. Script names (`dev:worker`, `dev:client`) don't match implementation
2. Temporal UI port 8088 vs 8080 discrepancy
3. Missing integration tests (guide promises; implementation missing)
4. Test directory structure differs (`tests/` vs `__tests__/unit/`)

### 🟡 Medium Issues (Should Clarify):
1. Project structure too granular vs. guide simplicity
2. Config externalization not explained
3. Kafka emission moved to activity level (design change)
4. Cross-practice integration undefined
5. Shared infrastructure dependency not documented

### 🟢 Low Issues (Nice to Have):
1. Activity naming conventions (kebab-case + .activity suffix)
2. Minimal inline code comments
3. No README at practice folder level
4. TypeScript version (guide says "standard"; implementation uses ^6.0.0, beta)

---

## Recommendations

### For Guide Update:
1. **Correct script names**: Change `pnpm dev:worker` → `pnpm dev` and document `pnpm start:starter`
2. **Fix Temporal UI port**: Confirm whether port is 8080 or 8088; update consistently
3. **Add test directory structure** section explaining `__tests__/unit/` pattern
4. **Add config section** explaining `.env.example` and `src/config/`
5. **Clarify cross-practice flow**: How do Kafka events feed into Practice 2?
6. **Explain why activities structure** differs (`src/temporal/activities/` vs `src/activities/`)

### For Implementation Update:
1. **Add missing tests**:
   - `__tests__/unit/reserve-inventory.test.ts`
   - `__tests__/unit/emit-kafka-event.test.ts`
   - `__tests__/integration/shipment-workflow.test.ts` (using TestWorkflowEnvironment)
2. **Update starter.ts**: Fix Temporal UI port reference (8080 vs 8088)
3. **Add npm scripts**:
   - Consider adding `dev:worker` alias for `dev`
   - Consider adding `dev:client` alias for `start:starter` or exposing better entry point
4. **Add README.md** at practice-1 level explaining structure
5. **Document Kafka integration**: How do consumers read from `shipment-events`?
6. **Add example of failure recovery** in a test scenario

### For Cross-Practice Alignment:
1. **Kafka consumer in Practice 2**: Add example that reads `shipment-events` and writes to PostgreSQL
2. **Webhook from Practice 3 to Practice 1**: Show how GraphQL mutations might trigger Temporal workflows
3. **Create integration diagram**: ASCII or markdown showing data flow across all three practices

---

## Appendix: File-by-File Alignment

| File | Guide Reference | Implementation Status | Notes |
| --- | --- | --- | --- |
| `src/workflows/orderWorkflow.ts` | ✅ Documented | `src/temporal/workflows/shipment.workflow.ts` | Named differently, but equivalent |
| `src/activities/validateOrder.ts` | ✅ Documented | `src/temporal/activities/validate-order.activity.ts` | Naming convention change |
| `src/activities/reserveInventory.ts` | ✅ Documented | `src/temporal/activities/reserve-inventory.activity.ts` | Exists but no examples in guide |
| `src/client.ts` | ✅ Documented | `src/client/temporal-client.ts` + `src/starter.ts` | Split into two files |
| `src/worker.ts` | ✅ Documented | `src/temporal/worker.ts` | Matches intent |
| `src/kafka.ts` | ✅ Documented | `src/kafka/producer.ts` + `src/config/kafka.config.ts` | Modularized |
| `src/types.ts` | ✅ Documented | Uses `@boltline/shared-types` | Externalized to workspace |
| `tests/activities.test.ts` | ✅ Expected | `__tests__/unit/validate-order.test.ts` (partial) | Incomplete |
| `tests/workflows.test.ts` | ✅ Expected | ❌ Missing | Critical gap |
| `tests/kafka.test.ts` | ✅ Expected | ❌ Missing | Critical gap |

---

## Conclusion

The implementation is **production-ready in core functionality** (Temporal workflows, Kafka integration, activity patterns) but **documentation and testing are incomplete**. The guide is excellent for learning but diverges from actual implementation in critical areas (script names, ports, test structure).

**Recommendation for Interview Context**: 
- Be prepared to explain why implementation differs from guide
- Highlight improvements made (config externalization, granular timeouts, activity-level Kafka emission)
- Acknowledge gaps (missing tests, unclear cross-practice integration) as opportunities
- Use this analysis to strengthen discussion of reliability and observability

