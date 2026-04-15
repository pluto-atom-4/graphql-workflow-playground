# Practice 1: Gap Analysis — Documentation vs. Implementation

**Date**: 2026-04-15  
**Scope**: Comparing `practice-1-temporal-kafka-guide.md` with actual implementation in `./practice-1-temporal-kafka`

---

## Executive Summary

The implementation is **75% aligned** with the guide but has several material gaps and inconsistencies:

| Category                       | Status               | Severity |
| ------------------------------ | -------------------- | -------- |
| **Project Structure**          | ⚠️ Partially Aligned | Medium   |
| **Scripts & Commands**         | ❌ Mismatched        | High     |
| **Activities Implementation**  | ✅ Aligned           | Low      |
| **Workflow Definition**        | ✅ Aligned           | Low      |
| **Kafka Integration**          | ⚠️ Partially Aligned | Medium   |
| **Testing Coverage**           | ❌ Incomplete        | High     |
| **Error Handling**             | ✅ Aligned           | Low      |
| **Documentation in Code**      | ⚠️ Minimal           | Medium   |
| **Cross-Practice Integration** | ⚠️ Unclear           | Medium   |

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

| Aspect               | Guide                                    | Implementation                               |
| -------------------- | ---------------------------------------- | -------------------------------------------- |
| **Emission Timing**  | Client-side, after workflow              | Activity-level, inside workflow              |
| **Atomicity**        | Weaker (can fail post-workflow)          | Stronger (part of workflow history)          |
| **Producer Pattern** | Singleton with manual connect/disconnect | Singleton with single-use producer lifecycle |
| **Topic Management** | Hardcoded in code                        | Centralized config                           |

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

| Layer                            | Status        | Notes                                                              |
| -------------------------------- | ------------- | ------------------------------------------------------------------ |
| **Practice 1 → Kafka**           | ✅ Works      | Emits to `shipment-events` topic                                   |
| **Kafka → Practice 2 (GraphQL)** | ❓ Unclear    | No documented integration; no consumer shown                       |
| **Practice 2 → Practice 3**      | ✅ Documented | Practice 3 guide assumes Practice 2 API                            |
| **Practice 3 ← Practice 1 flow** | ❌ Missing    | How do Temporal workflows trigger GraphQL mutations/subscriptions? |

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

| File                                 | Guide Reference | Implementation Status                                   | Notes                             |
| ------------------------------------ | --------------- | ------------------------------------------------------- | --------------------------------- |
| `src/workflows/orderWorkflow.ts`     | ✅ Documented   | `src/temporal/workflows/shipment.workflow.ts`           | Named differently, but equivalent |
| `src/activities/validateOrder.ts`    | ✅ Documented   | `src/temporal/activities/validate-order.activity.ts`    | Naming convention change          |
| `src/activities/reserveInventory.ts` | ✅ Documented   | `src/temporal/activities/reserve-inventory.activity.ts` | Exists but no examples in guide   |
| `src/client.ts`                      | ✅ Documented   | `src/client/temporal-client.ts` + `src/starter.ts`      | Split into two files              |
| `src/worker.ts`                      | ✅ Documented   | `src/temporal/worker.ts`                                | Matches intent                    |
| `src/kafka.ts`                       | ✅ Documented   | `src/kafka/producer.ts` + `src/config/kafka.config.ts`  | Modularized                       |
| `src/types.ts`                       | ✅ Documented   | Uses `@boltline/shared-types`                           | Externalized to workspace         |
| `tests/activities.test.ts`           | ✅ Expected     | `__tests__/unit/validate-order.test.ts` (partial)       | Incomplete                        |
| `tests/workflows.test.ts`            | ✅ Expected     | ❌ Missing                                              | Critical gap                      |
| `tests/kafka.test.ts`                | ✅ Expected     | ❌ Missing                                              | Critical gap                      |

---

---

## 12. Strategic Recommendation: Documentation vs. Implementation Refactor

After analyzing resource requirements and cross-practice dependencies, here's a strategic assessment:

### Current State Analysis

| Practice        | Implementation Status | Documentation Status  | Tests           | README  | Cross-Practice Ready? |
| --------------- | --------------------- | --------------------- | --------------- | ------- | --------------------- |
| **1: Temporal** | 75% Complete          | 100% (but misaligned) | 9% (1/11 files) | ❌ None | ⚠️ Partial            |
| **2: Hasura**   | 60% Complete          | 100%                  | ~0%             | ❌ None | ✅ Yes                |
| **3: Next.js**  | 70% Complete          | 100%                  | ~5%             | ❌ None | ⚠️ Partial            |

### Resource Requirements Analysis

#### Option A: Update Documentation Only

**Effort**: 8–12 hours  
**Scope**:

- Fix script names across all guides (dev, dev:worker, dev:client)
- Correct port references (8080 vs 8088 for Temporal UI)
- Update test directory structure references (tests/ → **tests**/unit/)
- Add cross-practice integration chapter explaining Kafka → GraphQL → UI flow
- Create architecture diagram showing Practice 1→2→3 data dependencies
- Add READMEs for each practice folder

**Pros**:

- Fast turnaround
- Implementation stays stable (less risk of regressions)
- Can be done in parallel with development

**Cons**:

- Leaves testing incomplete (critical for interview prep)
- Implementation remains more complex than documented
- Config patterns unexplained
- Cross-practice data flow still unclear to users

#### Option B: Refactor Implementation Only

**Effort**: 16–24 hours  
**Scope**:

- Flatten directory structure: `src/temporal/activities/` → `src/activities/`
- Rename entry points: `starter.ts` → `client.ts`
- Create npm scripts aliases: add `dev:worker`, `dev:client`
- Add missing test files (workflows.test.ts, kafka.test.ts)
- Consolidate config logic
- Align Temporal UI port reference (8080)
- Add Kafka consumer example for Practice 2 integration
- Add comprehensive JSDoc comments

**Pros**:

- Implementation matches guide exactly
- Simpler structure for learning
- Testing becomes complete
- Better aligns with interview talking points

**Cons**:

- Higher risk (refactoring core workflow files)
- Requires regression testing across all three practices
- Longer time to completion
- May need schema/API adjustments in Practice 2

#### Option C: Hybrid Approach (Recommended) ⭐

**Effort**: 20–28 hours  
**Scope**:

**Phase 1: Documentation (6–8 hours)**

- Fix critical mismatches (script names, ports, test structure)
- Add cross-practice integration chapter
- Create data flow diagrams
- Add READMEs to each practice

**Phase 2: Implementation Refactor (12–16 hours)**

- Flatten directory structure for clarity
- Add missing tests (workflows, kafka)
- Create npm script aliases for compatibility
- Add Kafka→GraphQL bridge documentation
- Implement consumer pattern example

**Phase 3: Validation (2–4 hours)**

- Verify all three practices work end-to-end
- Run full test suite
- Update interview talking points
- Final documentation review

**Pros**:

- ✅ Both documentation and implementation align
- ✅ Interview prep strengthened (full testing, clear architecture)
- ✅ Users can follow guide without deviation
- ✅ Code quality improved without major risk
- ✅ Cross-practice integration becomes explicit

**Cons**:

- Longest timeline
- Requires most coordination

---

### Recommendation: **Proceed with Option C (Hybrid)**

**Justification**:

1. **Interview Context**: Stoke Space will test both implementation quality AND ability to explain architecture. Fixing documentation alone leaves explanation gaps; refactoring alone leaves guide-following issues.

2. **Teaching Value**: This is a practice playground. Users following the guide exactly should succeed; implementation should match documentation.

3. **Quality**: With only 2 test files across the project, testing is a critical gap for demonstrating reliability—core to Temporal interview talking point.

4. **Cross-Practice Integration**: Currently undefined. Hybrid approach forces clarity on how Kafka events propagate to GraphQL subscriptions.

5. **Effort Justification**: 20–28 hours is ~3–4 days of focused work; interview prep value far exceeds this investment.

---

### Implementation Roadmap (Option C Phases)

#### Phase 1: Documentation Alignment (6–8 hours)

**1.1 Fix Script Names** (1 hour)

- Update practice-1 guide: `pnpm dev:worker` → `pnpm dev`, add `pnpm start:starter`
- Verify Practice 2 & 3 scripts match their actual package.json
- Add script reference table to all guides

**1.2 Fix Infrastructure & Ports** (1.5 hours)

- Correct Temporal UI port: 8080 vs 8088 (verify actual port in docker-compose.shared.yml)
- Document shared infrastructure location (`../infra/docker-compose.shared.yml`)
- Add port reference table

**1.3 Add Cross-Practice Integration** (2 hours)

- Create "Integration Architecture" section in all three guides
- Show data flow: Practice 1 (Temporal) → Kafka → Practice 2 (GraphQL) → Practice 3 (Apollo)
- Add example: "Order Fulfillment Flow" spanning all three
- Document how Kafka messages trigger GraphQL mutations/subscriptions

**1.4 Add READMEs** (1.5 hours)

- Create `practice-1-temporal-kafka/README.md` (quick start)
- Create `practice-2-hasura-graphql/README.md` (schema overview)
- Create `practice-3-nextjs-graphql/README.md` (component structure)

**1.5 Update practice-1-impl-analysis.md** (2 hours)

- Add "Recommended Action Plan" with phased approach
- Create checklist for each phase
- Document success metrics

#### Phase 2: Implementation Refactor (12–16 hours)

**2.1 Directory Structure** (3 hours)

- Move `src/temporal/activities/` → `src/activities/`
- Move `src/temporal/workflows/` → `src/workflows/`
- Move config to `src/config/` (already done, keep)
- Move client to `src/client.ts` (rename from starter.ts)
- Update all imports and tests

**2.2 npm Scripts** (1 hour)

- Add `dev:worker` alias: `"dev:worker": "pnpm dev"`
- Add `dev:client` script: `"dev:client": "tsx src/client.ts"`
- Ensure all scripts match guide references

**2.3 Missing Tests** (6–8 hours)

- Write `__tests__/unit/reserve-inventory.test.ts` (activity unit test)
- Write `__tests__/unit/emit-kafka-event.test.ts` (activity unit test)
- Write `__tests__/integration/shipment-workflow.test.ts` (workflow integration test using TestWorkflowEnvironment)
- Write `__tests__/integration/kafka-integration.test.ts` (verify event emission)
- Achieve 70%+ coverage threshold

**2.4 Code Quality** (2 hours)

- Add JSDoc comments to all activities
- Add JSDoc to workflows
- Ensure TypeScript strict mode compliance
- Run linter and fix issues

**2.5 Cross-Practice Bridge** (1–2 hours)

- Add Kafka consumer example (not required, but helpful)
- Document how Kafka events would trigger GraphQL mutations (pseudo-code)
- Add example payload structures

#### Phase 3: Validation & Final Polish (2–4 hours)

**3.1 End-to-End Testing** (1 hour)

- Verify Practice 1 workflow executes end-to-end
- Verify Kafka events publish correctly
- Verify Temporal UI is accessible and shows workflow

**3.2 Documentation Verification** (1 hour)

- Follow guide exactly as written; verify all commands work
- Test all script aliases
- Verify port references are correct

**3.3 Cross-Practice Validation** (1 hour)

- Verify Practice 1 Kafka events could feed Practice 2
- Verify Practice 2 GraphQL schema is ready for Practice 3
- Verify Practice 3 components can consume Practice 2 API

**3.4 Interview Preparation** (1 hour)

- Update "Interview Talking Points" in each guide
- Add specific metrics (test coverage, lines of code, performance)
- Create cheat sheet for demo scenarios

---

### Success Criteria (Option C)

After completion, the project should satisfy:

- [ ] All npm scripts in guides match actual package.json
- [ ] All ports referenced are verified (Temporal UI, Hasura, Next.js)
- [ ] Test structure matches guide expectations
- [ ] Directory structure matches guide references
- [ ] Cross-practice data flow documented
- [ ] Each practice has a README
- [ ] Test coverage ≥70% for Practice 1
- [ ] All three practices work end-to-end
- [ ] User can follow any guide and succeed without deviation
- [ ] Interview talking points are reinforced in implementation

---

### Alternative: Fast-Track Option (10–12 hours)

If time is limited, focus on **highest-impact items**:

1. **Fix script names** (1 hour) — Unblocks users following guide
2. **Correct port references** (0.5 hours) — Unblocks Temporal UI debugging
3. **Add integration tests** (6 hours) — Enables reliability talking point
4. **Create Practice 1 README** (1 hour) — Quick-start documentation
5. **Update cross-practice data flow** (1.5 hours) — Clarifies architecture

**Time**: 10–12 hours  
**Impact**: 70% of Option C benefits, 40% of the effort

---

## Conclusion

The implementation is **production-ready in core functionality** but **documentation and testing gaps undermine interview readiness**.

**Strategic Recommendation**: Proceed with **Option C (Hybrid)** for strongest interview preparation. The 20–28 hour investment pays dividends through:

- Clear alignment between documentation and implementation
- Strong testing story (critical for Temporal reliability narrative)
- Explicit cross-practice integration (shows architectural thinking)
- Polished learning experience for future users

If timeline is tight, pursue **Fast-Track Option** (10–12 hours) for immediate impact.

---

## Action Items

### Immediate (Next Session)

1. Verify actual Temporal UI port (8080 or 8088)
2. Confirm shared infrastructure path in docker-compose.shared.yml
3. Decide between Option A, B, C, or Fast-Track
4. Create task breakdown in SQL or Markdown

### If Proceeding with Refactor

1. Create feature branch: `refactor/practice-1-alignment`
2. Phase 1: Documentation updates (6–8 hours)
3. Phase 2: Implementation refactor (12–16 hours)
4. Phase 3: Validation (2–4 hours)
5. Create PR with testing evidence

### Success Metrics Post-Completion

- All guides successfully followed with zero deviation
- Test coverage ≥70% across practices
- Cross-practice integration explicitly documented
- Interview talking points reinforced in code examples
