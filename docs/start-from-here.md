# Research: Boltline by Stoke Space

## Quick Start for Contributors

⚠️ **Before you start coding**: Review the **[Code Quality Standards](./../.copilot/agents/quality-assurance.md)** to understand the QA requirements (ESLint, Prettier, npm audit) that all code must pass.

---

## Phone Screening Interview Preparation

You will have a phone screening interview this Wednesday for the position of **Senior Full Stack Software Developer**. Boltline is the commercial platform by Stoke Space.

---

## Understanding Boltline

### Overview

Boltline (formerly known as Fusion) is a cloud-based Iterative Hardware Engineering platform. While Stoke Space is a rocket company building the Nova launch vehicle, Boltline is their commercial SaaS product designed to help other hardware teams (aerospace, biotech, energy) move at "rocket speed" by unifying design, inventory, and manufacturing workflows.

### Key Facts about Boltline

#### The Problem

Traditional hardware teams use disconnected tools (spreadsheets, legacy ERPs) that don't track the "as-built" reality of complex hardware.

#### The Solution

Boltline acts as a "digital backbone" that integrates:

- **Parts Library & Inventory**: Full traceability of every nut and bolt using QR codes and augmented Bill of Materials (aBOMs)
- **Work Plans**: App-like digital instructions for technicians that capture real-time data on the shop floor
- **Automated Workflows**: No-code automation for supply chain and engineering processes
- **Commercial Growth**: The platform recently rebranded and reported 2x revenue growth in the first half of the fiscal year

---

## The Tech Stack

The Senior Full-Stack role you are interviewing for is specifically focused on this platform. You should be prepared to discuss:

| Component    | Technologies                                                                   |
| ------------ | ------------------------------------------------------------------------------ |
| Frontend     | React, TypeScript, Next.js                                                     |
| Backend/Data | GraphQL APIs, PostgreSQL                                                       |
| Culture      | Extreme Ownership, "first principles" thinking, high-cadence startup intensity |

---

## Interview Preparation Tips

Based on recent candidate experiences at Stoke Space:

- **The Initial Screen**: Expect a mix of behavioral questions ("Why Stoke Space?") and a review of your resume/background
- **The Technical Bar**: Past candidates have faced CoderPad challenges involving building mini-full-stack systems (e.g., React + Express/Node) within a tight 60-120 minute window
- **Focus Areas**: Be ready to talk about traceability, scalability, and how to build intuitive UIs for complex, real-world physical processes

---

## Core Frameworks & Their Roles

For your Senior Full-stack role, understanding how these frameworks interact is key. Boltline's architecture is built to handle complex, long-running hardware manufacturing workflows where data integrity and real-time updates are critical.

The Boltline stack leverages these tools to bridge the gap between high-level web interfaces and low-level physical production data.

### Framework Details

| Framework                     | Purpose                   | Key Function                                                                                                                                                                                                   |
| ----------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hasura & GraphQL**          | Primary Data Access Layer | Acts as the data access layer on top of PostgreSQL databases. Enables auto-generating CRUD endpoints and providing real-time subscriptions, essential for technicians to see live updates on the shop floor    |
| **Temporal**                  | Workflow Orchestration    | Handles durable execution of complex, multi-step workflows. Manages critical processes that cannot fail midway—such as multi-day test procedures, complex order approvals, or automated supply chain actions   |
| **Apache Kafka**              | Event Streaming Backbone  | Functions as the event backbone for the platform. Handles high-volume data streaming from manufacturing sensors, inventory changes, and system-wide events, ensuring microservices stay in sync asynchronously |
| **GitHub Actions & CircleCI** | CI/CD Pipeline            | Automates testing (unit, integration, E2E) and deployments to AWS/ECS. Reflects Boltline's engineering culture emphasizing Operational Excellence and "rocket speed" iteration                                 |

### Architecture Summary

| Layer                | Framework(s)             | Purpose                                                            |
| -------------------- | ------------------------ | ------------------------------------------------------------------ |
| API/Data             | Hasura, Apollo, GraphQL  | Rapidly delivering data to the React/Next.js frontend              |
| Orchestration        | Temporal                 | Ensuring complex manufacturing steps complete reliably             |
| Messaging            | Kafka                    | Real-time event streaming across the hardware lifecycle            |
| CI/CD                | GitHub Actions, CircleCI | Automating the "test-and-deploy" cycle for high developer velocity |
| Cloud/Infrastructure | AWS, ECS, Docker         | Scaling the cloud-based platform for commercial customers          |

---

## Practice Guides for Framework Familiarization

To help you prepare for your Senior Full-stack interview, here are three practice guides designed to mirror Boltline's core functionality: managing complex hardware lifecycles with high reliability.

### 1. Temporal & Kafka: Reliable Backend Workflow

This exercise simulates an "Order Fulfillment" process where a part is ordered, inventory is checked, and a "Shipment" event is broadcast.

**Environment Setup:**

- Run Temporal and Kafka locally using Docker Compose

**Define the Workflow (Temporal):**

- Create a ShipmentWorkflow that orchestrates activities: ValidateOrder, ReserveInventory, and EmitKafkaEvent
- Implement Retries: Configure the ReserveInventory activity with a retry policy (e.g., 3 attempts) to simulate handling transient database failures

**Integrate Kafka:**

- In the EmitKafkaEvent activity, use a Kafka producer (e.g., kafkajs for Node.js) to send a message to a shipment-events topic once the workflow reaches a "Validated" state

**Execute & Observe:**

- Start a Temporal Worker and trigger the workflow via a starter script
- Use the Temporal UI (usually localhost:8080) to watch the workflow progress and simulate a worker failure to see how Temporal maintains state

### 2. Hasura & GraphQL: The "Digital Backbone" (Inventory)

This mirrors Boltline's Part Library by creating a relational schema for parts and orders that updates in real-time.

**Schema Design (PostgreSQL):**

- Connect Hasura to a Postgres DB
- Create three tables: Parts (id, name, sku), Inventory (part_id, quantity, location), and Orders (id, part_id, status)

**Track Relationships:**

- In the Hasura Console, track the foreign key relationship between Orders.part_id and Parts.id

**Real-time Subscriptions:**

- In the Hasura GraphiQL tab, write a subscription to listen for changes in the Inventory table
- Manually update a quantity in the database and observe the subscription push the new data instantly

**Custom Business Logic (Actions):**

- Create a Hasura Action called placeOrder
- Point this action to a simple Node.js webhook that checks if quantity > 0 before inserting a row into the Orders table

### 3. Next.js & GraphQL: Technician "Work Plans"

This simulates the shop-floor UI where technicians follow digital instructions (Work Plans) and log data.

**Frontend Setup:**

- Initialize a Next.js project and install @apollo/client to connect to your Hasura instance

**Dynamic Rendering:**

- Fetch a list of "Steps" for a specific Work Plan using a GraphQL query
- Render these steps as a sequence of cards
- Use Next.js Server Components for the initial load and Client Components for interactive elements (like "Complete Step" buttons)

**State Synchronization:**

- Implement a "Log Data" form on a step (e.g., recording a torque value)
- On submit, trigger a GraphQL mutation to update the step's status in the database
- Use Optimistic UI updates in Apollo Client so the technician sees the "Checkmark" immediately before the database confirms the write

**Preparation Tip:**
During your interview, mention how Temporal ensures that if a technician's tablet dies mid-step, the "Work Plan" state is safely recovered rather than lost—a key selling point for Boltline's industrial reliability.

---
