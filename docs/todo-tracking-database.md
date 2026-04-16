# Todo Tracking - Database Reference

**Database Type**: SQLite (Session-Local)  
**Created**: April 16, 2026  
**Scope**: Per-session (isolated, non-persistent)

---

## Database Specifications

### Type: SQLite

- **Engine**: SQLite 3
- **Persistence**: Session-local (memory-based)
- **Isolation**: Per GitHub Copilot CLI session
- **Access Method**: SQL tool
- **Transactions**: ACID-compliant
- **Foreign Keys**: Enabled

### Storage

| Aspect | Detail |
|--------|--------|
| **Location** | In-memory (session-local, not on disk) |
| **Scope** | Current Copilot CLI session only |
| **Lifespan** | Duration of session (cleared on new session) |
| **Backup** | Not persisted; use session workspace for permanent records |
| **Size** | Minimal (11 todos + 11 dependencies) |

### Connection

```
Database: session (default)
Method: SQL tool in Copilot CLI
Command: Use /sql tool to execute queries
```

---

## Data File Information

### Data Specification

**Source Document**:
- `docs/analysis-type-definition.md` (958 lines)
- Phase 1.1-1.5 requirements (Foundation tasks)
- Phase 2.1-2.3 requirements (Integration tasks)
- Phase 3.1-3.3 requirements (Validation tasks)

**Data Extraction**:
- 11 tasks extracted from analysis
- Organized into 3 execution phases
- Dependencies mapped from task descriptions
- GitHub issues #25-#35 created from tasks

**Data Entry Date**: April 16, 2026

---

## Schema Definition

### Table 1: todos

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

**Indexes**: Primary key on `id` (auto-indexed)

**Constraints**:
- `id`: UNIQUE, NOT NULL
- `title`: NOT NULL
- `status`: DEFAULT 'pending'

### Table 2: todo_deps

```sql
CREATE TABLE todo_deps (
    todo_id TEXT,
    depends_on TEXT,
    PRIMARY KEY (todo_id, depends_on),
    FOREIGN KEY (todo_id) REFERENCES todos(id),
    FOREIGN KEY (depends_on) REFERENCES todos(id)
);
```

**Indexes**: Composite primary key on `(todo_id, depends_on)`

**Constraints**:
- Foreign keys enforced
- Prevents duplicate dependencies
- Ensures referential integrity

---

## Data Content Summary

### Table: todos

**11 Records** (as of April 16, 2026):

```
Total Rows: 11
Phase 1: 5 rows (ids: p1-*)
Phase 2: 3 rows (ids: p2-*)
Phase 3: 3 rows (ids: p3-*)

All status: 'pending'
All created_at: 2026-04-16 17:53:46
```

**Data Types**:
- `id`: TEXT (e.g., "p1-graphql-codegen")
- `title`: TEXT (human-readable task name)
- `description`: TEXT (full details + [GitHub Issue #N])
- `status`: TEXT (pending, in_progress, done, blocked)
- `created_at`: TIMESTAMP ISO8601
- `updated_at`: TIMESTAMP ISO8601

### Table: todo_deps

**11 Records** (dependency relationships):

```
Total Rows: 11
Phase 1 Dependencies: 0
Phase 2 Dependencies: 7
Phase 3 Dependencies: 4

All created with: todo_id REFERENCES todos(id)
All created with: depends_on REFERENCES todos(id)
```

**Referential Integrity**:
- All `todo_id` values reference valid `todos.id`
- All `depends_on` values reference valid `todos.id`
- No orphaned records

---

## Data Import Details

### GitHub Issues Integration

Each todo has GitHub issue number embedded in description:

```
Format: [GitHub Issue #N]
Location: End of description field
Example: "Run pnpm codegen... (2 hours) [GitHub Issue #25]"
```

**Mapping** (11 todos → 11 issues):
| Todo ID | Issue # | Link |
|---------|---------|------|
| p1-graphql-codegen | 25 | github.com/pluto-atom-4/.../issues/25 |
| p1-order-status-unify | 26 | github.com/pluto-atom-4/.../issues/26 |
| ... | ... | ... |
| p3-interview-prep | 35 | github.com/pluto-atom-4/.../issues/35 |

### Data Update Operations

Initial creation (April 16, 2026):
```sql
-- Created 11 todos from analysis document
INSERT INTO todos (id, title, description) VALUES ...

-- Created 11 dependencies
INSERT INTO todo_deps (todo_id, depends_on) VALUES ...

-- Updated descriptions with GitHub issue numbers
UPDATE todos SET description = CONCAT(description, ' [GitHub Issue #25]')
WHERE id = 'p1-graphql-codegen';
-- (repeated 11 times for all todos)
```

---

## Database Statistics

### Disk Usage

- **Total Size**: < 1 KB (in-memory SQLite)
- **Tables**: 2
- **Rows**: 22 (11 todos + 11 dependencies)
- **Columns**: 12 total (6 per table)

### Performance

- **Query Speed**: Instant (< 1ms typical)
- **Insert Speed**: Instant
- **Update Speed**: Instant
- **Transaction Support**: Yes (ACID)

---

## Session Data Management

### Persistence

| Item | Persistent? | Location |
|------|---|---|
| todos table | ❌ No | Session memory only |
| todo_deps table | ❌ No | Session memory only |
| Status updates | ❌ No | Lost on session end |
| Issue history | ✅ Yes | GitHub (permanent) |
| Analysis docs | ✅ Yes | docs/ folder (permanent) |

### Permanent Records

For permanent tracking, use:
1. **GitHub Issues**: Source of truth for all work items
2. **Session Workspace**: `plan.md` for persistent notes
3. **Git Commits**: PR descriptions reference issues
4. **Documentation**: `docs/` folder contains analysis and plans

### How to Preserve Progress

```
At session end:
1. Note which todos are 'done' in session workspace
2. All 'done' todos have corresponding closed GitHub issues
3. Next session: Query GitHub issues to see what's complete
4. Rebuild todo status from GitHub issue status
```

---

## Query Examples

### Basic Queries

**View all todos**:
```sql
SELECT id, title, status FROM todos ORDER BY id;
```

**Count by phase**:
```sql
SELECT SUBSTR(id, 1, 2) as phase, COUNT(*) FROM todos GROUP BY phase;
```

**Show progress**:
```sql
SELECT status, COUNT(*) as count FROM todos GROUP BY status;
```

### Advanced Queries

**Find blocking dependencies**:
```sql
SELECT td.todo_id, td.depends_on, 
       d.status as blocker_status,
       t.status as dependent_status
FROM todo_deps td
JOIN todos d ON td.depends_on = d.id
JOIN todos t ON td.todo_id = t.id
ORDER BY t.id;
```

**Find ready todos (no pending blockers)**:
```sql
SELECT t.id, t.title
FROM todos t
WHERE t.status = 'pending'
AND NOT EXISTS (
  SELECT 1 FROM todo_deps td
  JOIN todos d ON td.depends_on = d.id
  WHERE td.todo_id = t.id AND d.status != 'done'
)
ORDER BY t.id;
```

**Extract GitHub issue numbers**:
```sql
SELECT id, 
       SUBSTR(description, INSTR(description, '#') + 1, 2) as issue_number
FROM todos
ORDER BY id;
```

---

## Maintenance

### Common Operations

**Update todo status**:
```sql
UPDATE todos SET status = 'done' WHERE id = 'p1-graphql-codegen';
```

**Check completion**:
```sql
SELECT COUNT(*) as done FROM todos WHERE status = 'done';
```

**Reset todo to pending**:
```sql
UPDATE todos SET status = 'pending' WHERE id = 'p1-graphql-codegen';
```

### Data Integrity

**Verify referential integrity**:
```sql
-- Check orphaned todo_deps
SELECT * FROM todo_deps WHERE 
  todo_id NOT IN (SELECT id FROM todos) OR
  depends_on NOT IN (SELECT id FROM todos);
```

Expected result: 0 rows (no orphans)

---

## Backup & Recovery

### Session-Local Limitation

Since data is not persistent:

❌ **Cannot backup** database directly  
❌ **Cannot restore** from previous session  
✅ **Can use** GitHub issues as recovery source  
✅ **Can document** progress in session workspace  

### Recovery Strategy

If session ends:
1. **New session**: Create fresh todos table
2. **From GitHub**: Check issue status to determine which todos are done
3. **Update locally**: Re-import done status from GitHub issues
4. **Continue**: Start where previous session left off

---

## Integration Points

### With GitHub Issues

- **One-way sync**: SQL todos → GitHub issues (via issue numbers in description)
- **Permanent record**: GitHub issues persist beyond session
- **Cross-reference**: Each todo has issue # for easy lookup

### With Session Workspace

- **plan.md**: Persistent notes across sessions
- **Checkpoint files**: Saved analysis and summaries
- **References**: Links to todo tracking system documentation

### With Documentation

- **docs/analysis-type-definition.md**: Source of task requirements
- **docs/type-system-remediation-plan.md**: Execution strategy
- **docs/todo-tracking-system.md**: This file (system documentation)

---

## Technical Details

### SQLite Features Used

| Feature | Purpose |
|---------|---------|
| PRIMARY KEY | Unique todo IDs |
| FOREIGN KEY | Referential integrity |
| TIMESTAMP | Track creation/updates |
| DEFAULT | Set default values |
| COMPOSITE KEY | Prevent duplicate dependencies |
| TEXT, TIMESTAMP | Data types |

### ACID Compliance

- **Atomicity**: Updates are atomic (all-or-nothing)
- **Consistency**: Foreign keys maintain data integrity
- **Isolation**: Session isolation prevents cross-session pollution
- **Durability**: In-memory only (no durability, by design)

---

## Current State

✅ **Database**: SQLite, session-local  
✅ **Tables**: todos (11), todo_deps (11)  
✅ **Schema**: Properly defined with constraints  
✅ **Data**: Fully populated from analysis document  
✅ **Integrity**: All referential constraints satisfied  
✅ **Ready**: Accepting updates and queries  

**Last Updated**: April 16, 2026, 18:08 UTC

---

## Related Documentation

- **System Overview**: `docs/todo-tracking-system.md` (full guide)
- **Analysis Source**: `docs/analysis-type-definition.md` (task requirements)
- **Remediation Plan**: `docs/type-system-remediation-plan.md` (execution)
- **Session Notes**: Session workspace (`plan.md`)
