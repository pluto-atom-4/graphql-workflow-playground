# Practice 2: Hasura & GraphQL — Digital Backbone Guide

## Overview

In this exercise, you'll build a **real-time GraphQL API** using Hasura and PostgreSQL. You'll learn how to:
- Design a relational schema for hardware workflows
- Leverage Hasura's auto-generated CRUD operations
- Set up GraphQL subscriptions for real-time updates
- Create custom GraphQL Actions for business logic validation
- Implement row-level security (permissions)
- Test queries, mutations, and subscriptions

**Key Technologies**: PostgreSQL, Hasura, GraphQL, SQL

**Time to Complete**: 2–3 hours

---

## Prerequisites

Before starting, ensure you have:
- Docker & Docker Compose installed
- GraphQL IDE installed (GraphiQL or Insomnia)
- Basic SQL knowledge
- Familiarity with GraphQL (queries, mutations, subscriptions)
- The project structure from `CLAUDE.md`

---

## Step 1: Start PostgreSQL and Hasura

Navigate to the practice-2 directory and start services:

```bash
cd practice-2-hasura-graphql
docker-compose up -d
```

**What this does**:
- Starts a **PostgreSQL database** for your schema
- Starts a **Hasura GraphQL Engine** that auto-generates a GraphQL API
- Exposes GraphQL at `http://localhost:8080/graphql`
- Exposes Hasura console at `http://localhost:8080`

**Verify services**:
```bash
docker-compose ps
```

You should see healthy containers for `postgres` and `hasura`.

---

## Step 2: Access the Hasura Console

Open your browser and navigate to:

```
http://localhost:8080
```

You'll see:
- **API Explorer** (left): Interactive GraphQL playground
- **Data** (top menu): Table creation and schema management
- **SQL** (top menu): Direct SQL execution
- **Actions** (top menu): Custom business logic endpoints

The Hasura console is your primary interface for this exercise.

---

## Step 3: Design the Database Schema

You'll create a schema for a hardware manufacturing workflow. The entities are:

```
Part (hardware component)
├── id: UUID
├── sku: String (unique)
├── name: String
└── description: Text

Inventory (quantity tracking)
├── id: UUID
├── part_id: FK → Part
├── quantity: Integer
└── warehouse_location: String

Order (customer order)
├── id: UUID
├── customer_id: String
├── total_amount: Decimal
└── status: Enum (pending, validated, shipped)

OrderItem (items in an order)
├── id: UUID
├── order_id: FK → Order
├── part_id: FK → Part
├── quantity: Integer
└── unit_price: Decimal

WorkPlan (technician work instructions)
├── id: UUID
├── order_id: FK → Order
├── technician_id: String
└── status: Enum (pending, in_progress, completed)

WorkStep (individual steps in a work plan)
├── id: UUID
├── work_plan_id: FK → WorkPlan
├── step_number: Integer
├── description: Text
├── status: Enum (pending, in_progress, completed)
└── completed_at: Timestamp
```

---

## Step 4: Create Tables via Hasura Console

In the Hasura console, go to **Data** > **Create Table**.

Create the **Part** table:

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | Primary Key, Default: gen_random_uuid() |
| sku | String | Unique |
| name | String | Not null |
| description | Text | Nullable |
| created_at | Timestamp | Default: now() |

After creating, click **Create Table**.

---

## Step 5: Create Additional Tables

Repeat the process for:

**Inventory**:
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | Primary Key |
| part_id | UUID | FK → part(id), Not null |
| quantity | Integer | Not null, Default: 0 |
| warehouse_location | String | Nullable |

**Order**:
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | Primary Key |
| customer_id | String | Not null |
| total_amount | Numeric | Not null |
| status | Enum (pending, validated, shipped) | Default: 'pending' |
| created_at | Timestamp | Default: now() |

**OrderItem**:
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | Primary Key |
| order_id | UUID | FK → order(id), Not null |
| part_id | UUID | FK → part(id), Not null |
| quantity | Integer | Not null |
| unit_price | Numeric | Not null |

**WorkPlan**:
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | Primary Key |
| order_id | UUID | FK → order(id), Not null |
| technician_id | String | Not null |
| status | Enum (pending, in_progress, completed) | Default: 'pending' |
| created_at | Timestamp | Default: now() |

**WorkStep**:
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | Primary Key |
| work_plan_id | UUID | FK → work_plan(id), Not null |
| step_number | Integer | Not null |
| description | Text | Not null |
| status | Enum (pending, in_progress, completed) | Default: 'pending' |
| completed_at | Timestamp | Nullable |

---

## Step 6: Track Foreign Key Relationships

Once all tables are created, Hasura needs to know about relationships. Go to **Data** > **[Table Name]** > **Relationships**.

For **OrderItem**, add relationships:
- **order** (many-to-one): `order_id` → `order(id)`
- **part** (many-to-one): `part_id` → `part(id)`

For **Inventory**, add:
- **part** (many-to-one): `part_id` → `part(id)`

For **WorkPlan**, add:
- **order** (many-to-one): `order_id` → `order(id)`
- **work_steps** (one-to-many): `id` ← `work_step.work_plan_id`

For **WorkStep**, add:
- **work_plan** (many-to-one): `work_plan_id` → `work_plan(id)`

---

## Step 7: Test Auto-Generated Queries

Open the **API Explorer** (GraphQL IDE in Hasura console) and test a query:

```graphql
query GetParts {
  part(limit: 10) {
    id
    sku
    name
    description
  }
}
```

Click **Execute**. If no error appears, Hasura auto-generated this query!

---

## Step 8: Insert Test Data via GraphQL Mutation

In the API Explorer, run a mutation to insert a part:

```graphql
mutation CreatePart {
  insert_part_one(object: {
    sku: "PART-001"
    name: "Fastener Kit"
    description: "M6 bolts and washers"
  }) {
    id
    sku
    name
  }
}
```

This returns the created part with its auto-generated UUID.

Create a few more parts for testing.

---

## Step 9: Insert an Order with Items

Create an order and its items in one mutation:

```graphql
mutation CreateOrderWithItems {
  insert_order_one(object: {
    customer_id: "CUST-123"
    total_amount: 2500
    status: "pending"
    order_items: {
      data: [
        { part_id: "PART-UUID-1", quantity: 5, unit_price: 100 }
        { part_id: "PART-UUID-2", quantity: 10, unit_price: 250 }
      ]
    }
  }) {
    id
    customer_id
    total_amount
    order_items {
      id
      part_id
      quantity
      unit_price
    }
  }
}
```

Hasura supports nested inserts via relationships!

---

## Step 10: Create a GraphQL Subscription

Subscriptions let you watch for real-time changes. In the API Explorer:

```graphql
subscription WatchWorkStepUpdates {
  work_step(where: { status: { _eq: "in_progress" } }) {
    id
    step_number
    description
    status
    completed_at
  }
}
```

Click **Execute** to subscribe. In another browser tab, update a work step's status to `in_progress`, and you'll see the subscription trigger in real-time.

---

## Step 11: Create a Custom GraphQL Action

Custom Actions let you implement business logic (like validation) that the auto-generated API can't express.

Go to **Actions** > **Create** and create an action called `ValidateOrder`:

**Action Definition**:
```
GraphQL Type: Mutation
Handler: Webhook
```

**Inputs**:
```graphql
input ValidateOrderInput {
  order_id: uuid!
}
```

**Output**:
```graphql
type ValidateOrderPayload {
  success: Boolean!
  message: String!
  order_id: uuid!
}
```

**Webhook Handler**: Point to your backend (e.g., `http://localhost:3000/validate-order`)

---

## Step 12: Implement a Webhook Handler

In your backend (Node.js with Express), handle the webhook:

```typescript
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

app.post('/validate-order', async (req: Request, res: Response) => {
  const { input } = req.body;
  const { order_id } = input;

  try {
    // Query the order from Hasura
    const query = `
      query {
        order_by_pk(id: "${order_id}") {
          id
          total_amount
          order_items {
            quantity
            unit_price
          }
        }
      }
    `;
    
    // Validate: ensure total_amount equals sum of items
    const order = await fetchFromHasura(query);
    const itemsTotal = order.order_items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unit_price,
      0
    );

    if (order.total_amount !== itemsTotal) {
      return res.json({
        success: false,
        message: 'Order total does not match item sum',
        order_id,
      });
    }

    // Update order status to validated
    const mutation = `
      mutation {
        update_order_by_pk(pk_columns: { id: "${order_id}" }, _set: { status: "validated" }) {
          id
          status
        }
      }
    `;
    await fetchFromHasura(mutation);

    res.json({
      success: true,
      message: 'Order validated successfully',
      order_id,
    });
  } catch (error) {
    res.json({
      success: false,
      message: (error as Error).message,
      order_id,
    });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## Step 13: Call the Custom Action from GraphQL

Now you can call your custom action via GraphQL:

```graphql
mutation ValidateMyOrder {
  ValidateOrder(input: { order_id: "ORDER-UUID" }) {
    success
    message
    order_id
  }
}
```

Hasura executes the webhook and returns the result.

---

## Step 14: Set Up Permissions (Row-Level Security)

Hasura can enforce permissions at the row level. Go to **Data** > **[Table]** > **Permissions**.

For the **WorkPlan** table, create a role `technician`:

**Select Permission** (read access):
```
With custom check:
{ "technician_id": { "_eq": "X-Hasura-User-Id" } }
```

This means technicians can only see work plans assigned to them (from the `X-Hasura-User-Id` header).

For **Insert Permission**, allow only:
```json
{ "X-Hasura-User-Id": { "_eq": "X-Hasura-User-Id" } }
```

Now pass the header with each request:
```bash
curl -H "X-Hasura-User-Id: tech-456" \
  -H "X-Hasura-Role: technician" \
  http://localhost:8080/v1/graphql \
  -d '{...query...}'
```

Only rows with `technician_id = tech-456` will be visible.

---

## Step 15: Write SQL to Populate Test Data

Go to **SQL** in the Hasura console and run:

```sql
-- Insert parts
INSERT INTO part (sku, name, description) VALUES
  ('PART-001', 'Fastener Kit', 'M6 bolts and washers'),
  ('PART-002', 'Wire Harness', 'Pre-assembled wiring'),
  ('PART-003', 'Control Module', 'PCB with firmware');

-- Insert inventory
INSERT INTO inventory (part_id, quantity, warehouse_location) 
SELECT id, 100, 'Bin A-1' FROM part WHERE sku = 'PART-001'
UNION ALL
SELECT id, 50, 'Bin A-2' FROM part WHERE sku = 'PART-002'
UNION ALL
SELECT id, 25, 'Bin B-1' FROM part WHERE sku = 'PART-003';

-- Insert an order
INSERT INTO "order" (customer_id, total_amount, status) VALUES
  ('CUST-001', 5000, 'pending');

-- Insert order items
INSERT INTO order_item (order_id, part_id, quantity, unit_price)
SELECT 
  (SELECT id FROM "order" WHERE customer_id = 'CUST-001' LIMIT 1),
  (SELECT id FROM part WHERE sku = 'PART-001'),
  5, 100
UNION ALL
SELECT 
  (SELECT id FROM "order" WHERE customer_id = 'CUST-001' LIMIT 1),
  (SELECT id FROM part WHERE sku = 'PART-002'),
  3, 250;
```

---

## Step 16: Query Nested Data

Use the API Explorer to fetch nested data:

```graphql
query GetOrderWithItems {
  order(limit: 5) {
    id
    customer_id
    total_amount
    status
    created_at
    order_items {
      id
      part {
        sku
        name
      }
      quantity
      unit_price
    }
  }
}
```

Hasura joins automatically via the relationships you set up.

---

## Step 17: Test a Complex Subscription

Set up a subscription to watch all changes to a specific work plan:

```graphql
subscription WatchWorkPlan($workPlanId: uuid!) {
  work_plan_by_pk(id: $workPlanId) {
    id
    technician_id
    status
    work_steps {
      id
      step_number
      description
      status
      completed_at
    }
  }
}
```

Variables:
```json
{
  "workPlanId": "WORK-PLAN-UUID"
}
```

Execute, then update a work step in another window and watch the subscription update in real-time.

---

## Step 18: Export the GraphQL Schema

Hasura publishes your complete schema. Download it via:

```bash
curl -H "X-Hasura-Admin-Secret: myadminsecret" \
  http://localhost:8080/v1/graphql \
  -d '{"query": "{__schema{types{name kind fields{name type{kind name}}}}}"}' \
  | jq . > schema.json
```

This is useful for code generation (Practice 3 will use this).

---

## Step 19: Test Error Handling

Try invalid mutations to verify error handling:

```graphql
mutation InvalidOrder {
  insert_order_one(object: {
    customer_id: "CUST-INVALID"
    total_amount: null  # Not null violated
  }) {
    id
  }
}
```

Hasura returns a validation error. This is a chance to understand error responses and how your frontend will handle them.

---

## Step 20: Build for Production

To build a production-ready Hasura instance:

1. **Set the admin secret**:
   ```bash
   export HASURA_GRAPHQL_ADMIN_SECRET="strong-secret-key"
   docker-compose up -d
   ```

2. **Enable HTTPS** (via reverse proxy like Nginx)

3. **Set up a replica database** for read-heavy subscriptions

4. **Enable query logging** for monitoring:
   ```bash
   export HASURA_GRAPHQL_LOG_LEVEL="info"
   ```

---

## Key Takeaways

✅ **Hasura generates CRUD operations**: No need to hand-write GraphQL resolvers for basic queries/mutations

✅ **Relationships are automatic**: Foreign keys become GraphQL relationships; nested queries work out of the box

✅ **Subscriptions are real-time**: Changes in the database trigger subscription updates without polling

✅ **Custom Actions bridge gaps**: Use webhooks for business logic Hasura can't express

✅ **Permissions are granular**: Row-level security is configured declaratively, not in code

✅ **The schema is your contract**: Clients use the GraphQL schema to understand the API shape

---

## Troubleshooting

**No tables showing in Hasura?**
- Ensure `postgres` container is running: `docker-compose ps`
- Check the database connection in Hasura console: **Data** > **Manage** > check connection string

**Relationship not appearing?**
- Create the foreign key first in SQL: `ALTER TABLE order_item ADD CONSTRAINT fk_part FOREIGN KEY (part_id) REFERENCES part(id);`
- Then refresh the Hasura console

**Subscription not updating in real-time?**
- Ensure WebSocket support is enabled (it is by default)
- Try the update in the same browser tab to rule out permission issues

**Custom Action webhook not triggering?**
- Verify the webhook URL is reachable from inside the Docker network: use `http://host.docker.internal:3000` on Mac/Windows, or the service name on Linux

**Admin secret not working?**
- Restart Hasura after setting `HASURA_GRAPHQL_ADMIN_SECRET`: `docker-compose down && docker-compose up -d`

---

## Interview Talking Points

When discussing this exercise in your interview:

> "In Practice 2, I built a real-time GraphQL API using Hasura. The key insight is that **Hasura automatically generates CRUD endpoints** from your PostgreSQL schema—no hand-written resolvers needed. This accelerates development significantly; what would take weeks to build manually in a custom GraphQL server, Hasura gives you in minutes."

> "I leveraged **relationships** to enable nested queries. For example, I can fetch an order with all its line items and their part details in a single query, and Hasura handles the joins automatically. This is powerful for the frontend."

> "For business logic that GraphQL can't express (like validation), I implemented **custom Actions** that call webhooks. This lets me keep complex logic in my backend while exposing a clean GraphQL interface."

> "I also set up **subscriptions** for real-time updates. On Boltline, when a technician marks a work step complete, other devices see that change instantly via subscription—critical for multi-technician coordination on the shop floor."

> "Lastly, I configured **row-level permissions** so technicians only see work plans assigned to them, enforced at the database level. This is more secure than filtering in application code."

---

## Next Steps

Once you've completed this exercise:
1. Move to **Practice 3: Next.js & GraphQL** to build the frontend
2. You'll use this Hasura API as your backend from Practice 3's Apollo Client
