# SQL Todo Tracking System

**Status**: Active  
**Created**: April 16, 2026  
**Purpose**: Track type system remediation tasks across 3 phases with dependency management  
**Database**: SQLite (session-local, per-session isolation)

---

## Overview

The **SQL Todo Tracking System** provides structured task management for the Type System Remediation project (GitHub Issues #25-#35). It enables:

- **Individual task tracking** (11 todos across 3 phases)
- **Dependency management** (blocking relationships between tasks)
- **Progress monitoring** (pending → in_progress → done → blocked)
- **GitHub integration** (issue numbers embedded in descriptions)

---

## Database Architecture

### Database Type

**SQLite** (Relational Database)

- **Location**: Session-local database (isolated per session)
- **File**: Not persisted to disk (memory-based, in-session only)
- **Scope**: Per GitHub Copilot CLI session
- **Reset**: New session = fresh database
- **Access**: Via SQL tool in Copilot CLI

**Rationale**:
- Lightweight, no external dependencies
- Perfect for task tracking within a session
- Session isolation prevents cross-session data pollution
- Structured queries enable complex dependency tracking

### Database Schema

#### Table 1: `todos`

**Purpose**: Store individual task records

**Columns**:
```sql
CREATE TABLE todos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Column Details**:

| Column | Type | Description | Example |
|--------|------|---|---|
| `id` | TEXT (PK) | Unique task identifier | `p1-graphql-codegen` |
| `title` | TEXT (NOT NULL) | Human-readable task name | `Generate GraphQL types from Hasura schema` |
| `description` | TEXT | Full task details + GitHub issue number | `Run pnpm codegen... (2 hours) [GitHub Issue #25]` |
| `status` | TEXT | Current progress state | `pending`, `in_progress`, `done`, `blocked` |
| `created_at` | TIMESTAMP | When task was created | `2026-04-16 17:53:46` |
| `updated_at` | TIMESTAMP | When task was last modified | `2026-04-16 17:53:46` |

**Sample Data**:
```sql
id: p1-graphql-codegen
title: Generate GraphQL types from Hasura schema
description: Run pnpm codegen to generate types from running Hasura instance... (2 hours) [GitHub Issue #25]
status: pending
created_at: 2026-04-16 17:53:46.549Z
updated_at: 2026-04-16 17:53:46.549Z
```

---

#### Table 2: `todo_deps`

**Purpose**: Track task dependencies (blocking relationships)

**Columns**:
```sql
CREATE TABLE todo_deps (
    todo_id TEXT,
    depends_on TEXT,
    PRIMARY KEY (todo_id, depends_on),
    FOREIGN KEY (todo_id) REFERENCES todos(id),
    FOREIGN KEY (depends_on) REFERENCES todos(id)
);
```

**Column Details**:

| Column | Type | Description | Example |
|--------|------|---|---|
| `todo_id` | TEXT (FK) | Dependent task (waiting to start) | `p2-type-guides` |
| `depends_on` | TEXT (FK) | Blocker task (must complete first) | `p1-graphql-codegen` |

**Meaning**: `todo_id` **BLOCKS ON** `depends_on` (cannot start until blocker completes)

**Sample Data**:
```sql
todo_id: p2-type-guides
depends_on: p1-graphql-codegen
→ Meaning: p2-type-guides cannot start until p1-graphql-codegen is done
```

**Primary Key**: Composite `(todo_id, depends_on)` prevents duplicate dependencies

---

## Data Content

### 11 Todos (Phase 1, 2, 3)

All 11 todo records created April 16, 2026, linked to GitHub Issues #25-#35:

**Phase 1: Foundation (5 todos, 0 dependencies)**

| ID | Title | Issue | Status | Hours |
|---|---|---|---|---|
| p1-graphql-codegen | Generate GraphQL types | #25 | pending | 2 |
| p1-order-status-unify | Unify order status | #26 | pending | 1.5 |
| p1-timestamp-standardize | Standardize timestamps | #27 | pending | 1.5 |
| p1-error-types | Create error types | #28 | pending | 2 |
| p1-data-flow-doc | Document data flow | #29 | pending | 1 |

**Phase 2: Integration (3 todos, 7 dependencies)**

| ID | Title | Issue | Status | Hours | Blocks On |
|---|---|---|---|---|---|
| p2-type-guides | Create type guides | #30 | pending | 2 | #25,#26,#27 |
| p2-runtime-validation | Implement validation | #31 | pending | 3 | #28 |
| p2-type-testing | Create type testing | #32 | pending | 1 | #26,#27,#28 |

**Phase 3: Validation (3 todos, 4 dependencies)**

| ID | Title | Issue | Status | Hours | Blocks On |
|---|---|---|---|---|---|
| p3-e2e-type-test | E2E type testing | #33 | pending | 1 | #30,#31 |
| p3-docs-verify | Verify documentation | #34 | pending | 1 | #30 |
| p3-interview-prep | Interview preparation | #35 | pending | 1 | #33 |

### 11 Dependencies (Blocking Relationships)

| Todo ID | Depends On | Reason |
|---------|---|---|
| p2-runtime-validation | p1-error-types | Needs error types for validation |
| p2-type-guides | p1-graphql-codegen | Needs generated types to document |
| p2-type-guides | p1-order-status-unify | Needs unified status to document |
| p2-type-guides | p1-timestamp-standardize | Needs timestamp utils to document |
| p2-type-testing | p1-error-types | Needs error types to test |
| p2-type-testing | p1-order-status-unify | Needs status machine to test |
| p2-type-testing | p1-timestamp-standardize | Needs conversions to test |
| p3-docs-verify | p2-type-guides | Needs guides created to verify |
| p3-e2e-type-test | p2-runtime-validation | Needs validators to test |
| p3-e2e-type-test | p2-type-guides | Needs integration plan to test |
| p3-interview-prep | p3-e2e-type-test | Needs E2E results for talking points |

---

## Usage Patterns

### View All Todos

```sql
SELECT id, title, status FROM todos ORDER BY id;
```

**Output**: 11 rows showing all tasks with their current status

---

### View Specific Todo (with GitHub Issue)

```sql
SELECT id, title, description, status FROM todos 
WHERE id = 'p1-graphql-codegen';
```

**Output**:
```
id:          p1-graphql-codegen
title:       Generate GraphQL types from Hasura schema
description: Run pnpm codegen... (2 hours) [GitHub Issue #25]
status:      pending
```

**Extract GitHub Issue**: Look for `[GitHub Issue #N]` in description

---

### View Todo Dependencies

```sql
SELECT t.id, t.title, GROUP_CONCAT(td.depends_on) as blocks_on
FROM todos t
LEFT JOIN todo_deps td ON t.id = td.todo_id
GROUP BY t.id
ORDER BY t.id;
```

**Output**: Shows which todos each task blocks on

---

### View Phase-Specific Todos

```sql
-- Phase 1
SELECT id, title, status FROM todos WHERE id LIKE 'p1%' ORDER BY id;

-- Phase 2
SELECT id, title, status FROM todos WHERE id LIKE 'p2%' ORDER BY id;

-- Phase 3
SELECT id, title, status FROM todos WHERE id LIKE 'p3%' ORDER BY id;
```

---

### Find Next Ready Todo

```sql
SELECT t.id, t.title FROM todos t
WHERE t.status = 'pending'
AND NOT EXISTS (
  SELECT 1 FROM todo_deps td
  JOIN todos dep ON td.depends_on = dep.id
  WHERE td.todo_id = t.id AND dep.status != 'done'
)
ORDER BY t.id
LIMIT 1;
```

**Output**: First pending todo with no pending blockers (ready to start)

---

### Mark Todo as In Progress

```sql
UPDATE todos SET status = 'in_progress' 
WHERE id = 'p1-graphql-codegen';
```

---

### Mark Todo as Done

```sql
UPDATE todos SET status = 'done' 
WHERE id = 'p1-graphql-codegen';
```

---

### Check Completion Status

```sql
SELECT status, COUNT(*) as count 
FROM todos 
GROUP BY status
ORDER BY status;
```

**Output**: Breakdown by status (pending, in_progress, done, blocked)

---

## GitHub Integration

### Issue Number Format

Each todo description ends with `[GitHub Issue #N]`:

```
Description: Run pnpm codegen to generate types... (2 hours) [GitHub Issue #25]
                                                                       ↑ Issue
```

### How to Use

1. **Extract Issue Number**:
   ```sql
   SELECT description FROM todos WHERE id = 'p1-graphql-codegen';
   ```
   Output: `... [GitHub Issue #25]`

2. **Navigate to GitHub**:
   ```
   https://github.com/pluto-atom-4/graphql-workflow-playground/issues/25
   ```

3. **Create PR with Reference**:
   - When submitting PR, use: `Fixes #25`
   - GitHub auto-closes issue when PR merges
   - Update todo status: `UPDATE todos SET status = 'done' WHERE id = '...';`

---

## SQL-GitHub Mapping

| SQL Todo ID | GitHub Issue | Title |
|---|---|---|
| p1-graphql-codegen | #25 | Generate GraphQL types |
| p1-order-status-unify | #26 | Unify order status |
| p1-timestamp-standardize | #27 | Standardize timestamps |
| p1-error-types | #28 | Create error types |
| p1-data-flow-doc | #29 | Document data flow |
| p2-type-guides | #30 | Create type guides |
| p2-runtime-validation | #31 | Implement validation |
| p2-type-testing | #32 | Create type testing |
| p3-e2e-type-test | #33 | E2E type testing |
| p3-docs-verify | #34 | Verify documentation |
| p3-interview-prep | #35 | Interview preparation |

---

## Workflow

### Step-by-Step Process

**1. Start Phase 1 (All Independent)**
```sql
UPDATE todos SET status = 'in_progress' WHERE id LIKE 'p1%';
```

**2. For Each Todo**:
- Get issue number from description
- Navigate to GitHub issue
- Implement the work
- Create PR with "Fixes #N"
- Update status to done

**3. After Phase 1 Complete**:
```sql
SELECT t.id FROM todos t
WHERE t.status = 'pending' AND t.id LIKE 'p2%'
AND NOT EXISTS (
  SELECT 1 FROM todo_deps td
  JOIN todos d ON td.depends_on = d.id
  WHERE td.todo_id = t.id AND d.status != 'done'
);
```

**4. Repeat for Phase 2, then Phase 3**

---

## Execution Phases

### Phase 1: Foundation (6-8 hours)

- **Dependencies**: None (all independent)
- **Status**: Ready to start NOW
- **Todos**: 5 (p1-*)
- **Strategy**: Execute all in parallel

### Phase 2: Integration (4-6 hours)

- **Dependencies**: All Phase 1 must be done
- **Status**: Waiting for Phase 1
- **Todos**: 3 (p2-*)
- **Strategy**: Execute in order (respecting dependencies)

### Phase 3: Validation (2-4 hours)

- **Dependencies**: All Phase 2 must be done
- **Status**: Waiting for Phase 2
- **Todos**: 3 (p3-*)
- **Strategy**: Execute in order (respecting dependencies)

---

## Key Metrics

**Total Work**:
- 11 todos
- 6-8 + 4-6 + 2-4 = 20-28 hours (full execution)
- 9 hours (fast-track critical path)

**Completion Target**:
- Phase 1: 6-8 hours
- Phase 2: 4-6 hours (after Phase 1)
- Phase 3: 2-4 hours (after Phase 2)
- **Total**: 20-28 hours

---

## Related Documentation

- **Type System Analysis**: `docs/analysis-type-definition.md` (source document)
- **Remediation Plan**: `docs/type-system-remediation-plan.md` (execution strategy)
- **Quick Reference**: `docs/type-system-quick-ref.md` (at-a-glance guide)
- **Orchestrator Pattern**: `.copilot/agents/orchestrator.md` (coordination patterns)

---

## Database Maintenance

### Session Isolation

- Database is **session-local** (per GitHub Copilot CLI session)
- Each new session gets a fresh database
- No data persists across sessions
- Use session workspace (`plan.md`) for persistent notes

### Backup Strategy

1. **Document Progress**: Update todo status regularly
2. **Save to Session Workspace**: Export queries to markdown if needed
3. **GitHub as Source of Truth**: Issues and PRs are permanent

### Common Tasks

**Export all todos**:
```sql
SELECT id, title, status FROM todos ORDER BY id;
```

**Count by phase**:
```sql
SELECT 
  SUBSTR(id, 1, 2) as phase,
  COUNT(*) as count,
  SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
FROM todos
GROUP BY phase
ORDER BY phase;
```

**Show progress**:
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
  SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
FROM todos;
```

---

## Status Values

| Status | Meaning | Transition |
|--------|---------|---|
| `pending` | Not started, waiting for dependencies | → in_progress |
| `in_progress` | Currently being worked on | → done or blocked |
| `done` | Completed, GitHub issue closed | (final) |
| `blocked` | Cannot proceed, waiting for something | → pending or in_progress |

---

## Current State (As of April 16, 2026)

✅ **Database Created**: SQLite (session-local)  
✅ **Tables Created**: `todos` (11 rows), `todo_deps` (11 rows)  
✅ **All Todos Created**: Pending status  
✅ **All Dependencies Mapped**: Blocking relationships established  
✅ **GitHub Issues Linked**: #25-#35 all open  
✅ **Issue Numbers Embedded**: Each todo has `[GitHub Issue #N]` in description  

**Ready to Execute**: Phase 1 can start immediately

---

## Quick Start

**To get started**:

1. **View all todos**:
   ```sql
   SELECT id, title, status FROM todos ORDER BY id;
   ```

2. **Start Phase 1**:
   ```sql
   UPDATE todos SET status = 'in_progress' WHERE id LIKE 'p1%';
   ```

3. **Get GitHub issue for a todo**:
   ```sql
   SELECT description FROM todos WHERE id = 'p1-graphql-codegen';
   ```
   Extract: `[GitHub Issue #25]`

4. **Work on GitHub issue**: Open the issue and implement

5. **Mark as done**:
   ```sql
   UPDATE todos SET status = 'done' WHERE id = 'p1-graphql-codegen';
   ```

6. **Find next ready todo**:
   ```sql
   SELECT t.id FROM todos t
   WHERE t.status = 'pending'
   AND NOT EXISTS (
     SELECT 1 FROM todo_deps td
     JOIN todos d ON td.depends_on = d.id
     WHERE td.todo_id = t.id AND d.status != 'done'
   ) LIMIT 1;
   ```

---

**Document Created**: April 16, 2026  
**Database Type**: SQLite (session-local)  
**Data Source**: GitHub Issues #25-#35 + Type System Analysis  
**Maintained By**: GitHub Copilot CLI
