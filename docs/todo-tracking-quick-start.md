# Todo Tracking System - Quick Start Guide

**Created**: April 16, 2026  
**Database**: SQLite (session-local)  
**Tasks**: 11 todos tracking GitHub Issues #25-#35

---

## 30-Second Overview

The **SQL Todo Tracking System** manages the Type System Remediation project:

- **SQLite database** (session-local, in-memory)
- **11 todos** (Phase 1: 5, Phase 2: 3, Phase 3: 3)
- **11 dependencies** (blocking relationships)
- **GitHub integration** (issue #s embedded in descriptions)
- **Progress tracking** (pending → in_progress → done)

---

## Database Info

| Property | Value |
|----------|-------|
| **Type** | SQLite 3 |
| **Storage** | Session-local memory (non-persistent) |
| **Scope** | Current Copilot CLI session |
| **Tables** | 2 (`todos`, `todo_deps`) |
| **Records** | 22 total (11 + 11) |
| **Size** | < 1 KB |

---

## Quick Start

### 1. View All Todos

```sql
SELECT id, title, status FROM todos ORDER BY id;
```

Shows all 11 tasks with their current status.

---

### 2. Get GitHub Issue Number

```sql
SELECT description FROM todos WHERE id = 'p1-graphql-codegen';
```

Output: `... [GitHub Issue #25]`

Extract issue #25 and go to: `https://github.com/pluto-atom-4/.../issues/25`

---

### 3. Mark as In Progress

```sql
UPDATE todos SET status = 'in_progress' WHERE id = 'p1-graphql-codegen';
```

---

### 4. Do the Work

- Implement the feature (described in todo)
- Create PR with "Fixes #25"
- Pass tests

---

### 5. Mark as Done

```sql
UPDATE todos SET status = 'done' WHERE id = 'p1-graphql-codegen';
```

GitHub issue auto-closes.

---

### 6. Find Next Ready Todo

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

## The Two Tables

### Table: todos (11 rows)

```
id                   | title                    | status   | description
────────────────────────────────────────────────────────────────────────
p1-graphql-codegen   | Generate GraphQL types   | pending  | Run pnpm... [#25]
p1-order-status-...  | Unify order status       | pending  | Create... [#26]
... (9 more)
```

### Table: todo_deps (11 rows)

```
todo_id              | depends_on
────────────────────────────────────────────
p2-type-guides       | p1-graphql-codegen
p2-type-guides       | p1-order-status-unify
... (9 more)
```

**Meaning**: `p2-type-guides` **BLOCKS ON** (waits for) `p1-graphql-codegen`

---

## SQL-GitHub Mapping (Quick Reference)

| SQL Todo ID | Issue # | Title |
|---|---|---|
| p1-graphql-codegen | 25 | Generate GraphQL types |
| p1-order-status-unify | 26 | Unify order status |
| p1-timestamp-standardize | 27 | Standardize timestamps |
| p1-error-types | 28 | Create error types |
| p1-data-flow-doc | 29 | Document data flow |
| p2-type-guides | 30 | Create type guides |
| p2-runtime-validation | 31 | Implement validation |
| p2-type-testing | 32 | Create type testing |
| p3-e2e-type-test | 33 | E2E type testing |
| p3-docs-verify | 34 | Verify documentation |
| p3-interview-prep | 35 | Interview preparation |

---

## Status Values

| Status | Meaning |
|--------|---------|
| `pending` | Not started, waiting for dependencies |
| `in_progress` | Currently being worked on |
| `done` | Completed |
| `blocked` | Cannot proceed, waiting for something |

---

## Phases

### Phase 1: Foundation (5 todos, 6-8 hours)

**Dependencies**: None (start now!)

```
p1-graphql-codegen      (#25)  ← CRITICAL
p1-order-status-unify   (#26)
p1-timestamp-standardize (#27)
p1-error-types          (#28)
p1-data-flow-doc        (#29)
```

All independent → run in parallel

---

### Phase 2: Integration (3 todos, 4-6 hours)

**Dependencies**: All Phase 1 must be done first

```
p2-type-guides          (#30) ← depends on #25, #26, #27
p2-runtime-validation   (#31) ← depends on #28
p2-type-testing         (#32) ← depends on #26, #27, #28
```

---

### Phase 3: Validation (3 todos, 2-4 hours)

**Dependencies**: All Phase 2 must be done first

```
p3-e2e-type-test        (#33) ← depends on #30, #31
p3-docs-verify          (#34) ← depends on #30
p3-interview-prep       (#35) ← depends on #33
```

---

## Useful Queries (Copy & Paste)

### See All Todos
```sql
SELECT id, title, status FROM todos ORDER BY id;
```

### See Pending Todos
```sql
SELECT id, title FROM todos WHERE status = 'pending';
```

### Count by Phase
```sql
SELECT SUBSTR(id, 1, 2) as phase, COUNT(*) FROM todos GROUP BY phase;
```

### See Dependencies
```sql
SELECT t.id, GROUP_CONCAT(td.depends_on) FROM todos t
LEFT JOIN todo_deps td ON t.id = td.todo_id
GROUP BY t.id ORDER BY t.id;
```

### Find Ready Todos
```sql
SELECT t.id FROM todos t WHERE t.status = 'pending'
AND NOT EXISTS (SELECT 1 FROM todo_deps td
JOIN todos d ON td.depends_on = d.id
WHERE td.todo_id = t.id AND d.status != 'done') LIMIT 1;
```

### Check Progress
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
FROM todos;
```

---

## Current State

✅ 11 todos created  
✅ All status: pending  
✅ Phase 1: Ready to start NOW  
✅ Phase 2: Waiting for Phase 1  
✅ Phase 3: Waiting for Phase 2  
✅ 11 GitHub issues #25-#35 open  

**Ready to execute**: Start Phase 1 immediately

---

## Important: Session Scope

⚠️ **This database is session-local**:
- Data **NOT** saved to disk
- Each new session = fresh database
- Use session workspace (`plan.md`) for permanent notes
- GitHub issues are the permanent record

---

## Documentation

**Full Guides** (in docs/):

1. `docs/todo-tracking-system.md` 
   - Complete system documentation
   - Schema definition
   - Usage patterns
   - Workflows

2. `docs/todo-tracking-database.md`
   - Database specifications
   - Data content details
   - Maintenance procedures
   - Technical details

3. `docs/analysis-type-definition.md`
   - Source: task requirements
   - 958 lines of analysis

---

## Next Steps

### Immediate (Now)

1. Start Phase 1:
   ```sql
   UPDATE todos SET status = 'in_progress' WHERE id LIKE 'p1%';
   ```

2. Get first todo:
   ```sql
   SELECT id FROM todos WHERE id LIKE 'p1%' LIMIT 1;
   ```
   Result: `p1-graphql-codegen`

3. Get GitHub issue:
   ```sql
   SELECT description FROM todos WHERE id = 'p1-graphql-codegen';
   ```
   Extract: `[GitHub Issue #25]`

4. Work on issue #25 on GitHub

5. Mark as done:
   ```sql
   UPDATE todos SET status = 'done' WHERE id = 'p1-graphql-codegen';
   ```

### After Phase 1 Complete

Find Phase 2 todos that are now ready:
```sql
SELECT t.id FROM todos t WHERE t.status = 'pending'
AND t.id LIKE 'p2%'
AND NOT EXISTS (SELECT 1 FROM todo_deps td
JOIN todos d ON td.depends_on = d.id
WHERE td.todo_id = t.id AND d.status != 'done');
```

---

## Key Points

✅ **Database Type**: SQLite (session-local)  
✅ **Data**: 11 todos from analysis doc  
✅ **GitHub Issues**: #25-#35 linked via descriptions  
✅ **Dependencies**: 11 blocking relationships tracked  
✅ **Persistence**: Use GitHub + session workspace for permanent records  
✅ **Ready to Start**: Phase 1 (all 5 independent)

---

**Ready to Execute**: All 11 GitHub issues open and tracked  
**Expected Timeline**: 20-28 hours (full) or 9 hours (fast-track)  
**Start With**: Issue #25 (CRITICAL blocker)

---

For detailed documentation, see:
- `docs/todo-tracking-system.md`
- `docs/todo-tracking-database.md`
