# Practice 3: Next.js & GraphQL — Work Plans UI Guide

## Overview

In this exercise, you'll build a **full-stack React/Next.js frontend** that consumes the Hasura GraphQL API. You'll learn how to:

- Fetch data from GraphQL using Apollo Client
- Implement optimistic updates for instant user feedback
- Set up real-time subscriptions to stay in sync
- Build server and client components with Next.js 13+
- Handle loading and error states gracefully
- Write component tests with React Testing Library
- Deploy to production

**Key Technologies**: React, Next.js, TypeScript, Apollo Client, Tailwind CSS

**Time to Complete**: 2–3 hours

---

## Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed
- pnpm installed
- Practice 2 (Hasura) running and accessible at `http://localhost:8080/graphql`
- Familiarity with React hooks and TypeScript
- Basic understanding of GraphQL queries and mutations

---

## Step 1: Start the Development Environment

Navigate to the practice-3 directory:

```bash
cd practice-3-nextjs-graphql
pnpm install
```

Then start the development server:

```bash
pnpm dev
```

This starts a Next.js dev server at `http://localhost:3000`.

---

## Step 2: Understand the Project Structure

```
practice-3-nextjs-graphql/
├── app/
│   ├── layout.tsx              # Root layout (server component)
│   ├── page.tsx                # Home page
│   ├── work-plans/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # List work plans
│   │   └── [id]/
│   │       └── page.tsx        # Single work plan detail
│   └── api/
│       └── graphql.ts          # API route (optional, for proxy)
├── components/
│   ├── WorkPlanList.tsx        # Client component: list
│   ├── WorkPlanDetail.tsx      # Client component: detail view
│   ├── StepCard.tsx            # Client component: single step
│   └── StepForm.tsx            # Client component: form to update step
├── lib/
│   ├── apolloClient.ts         # Apollo Client setup
│   ├── graphql/
│   │   ├── queries.ts          # GraphQL query strings
│   │   └── mutations.ts        # GraphQL mutation strings
│   └── types.ts                # TypeScript types (mirrors Hasura schema)
├── hooks/
│   └── useWorkPlan.ts          # Custom hook for work plan data
├── tests/
│   ├── components.test.tsx     # Component tests
│   └── integration.test.ts     # End-to-end tests
├── public/
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── package.json
```

**Key distinction**:

- **Server Components** (default): Fetch data on the server, render HTML, send to client
- **Client Components** (`'use client'`): Run in the browser, handle interactivity and real-time updates
- **API Routes**: Optional; useful for proxying GraphQL to hide the Hasura URL from the client

---

## Step 3: Configure Apollo Client

Apollo Client is the GraphQL client library. Open `lib/apolloClient.ts`:

```typescript
import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = new HttpLink({
  uri: "http://localhost:8080/graphql", // Hasura endpoint
  credentials: "include", // Include cookies if using auth
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:8080/graphql", // WebSocket endpoint for subscriptions
  })
);

// Use WebSocket for subscriptions, HTTP for other operations
const link = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === "OperationDefinition" && def.operation === "subscription";
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
```

This configures Apollo to:

- Use HTTP for queries and mutations
- Use WebSocket for subscriptions (for real-time updates)
- Cache results in memory for fast access

---

## Step 4: Define GraphQL Queries

Open `lib/graphql/queries.ts` and write queries to fetch data from Hasura:

```typescript
import { gql } from "@apollo/client";

export const GET_WORK_PLANS = gql`
  query GetWorkPlans {
    work_plan(limit: 50) {
      id
      order_id
      technician_id
      status
      created_at
    }
  }
`;

export const GET_WORK_PLAN_DETAIL = gql`
  query GetWorkPlanDetail($id: uuid!) {
    work_plan_by_pk(id: $id) {
      id
      order_id
      technician_id
      status
      created_at
      work_steps {
        id
        step_number
        description
        status
        completed_at
      }
    }
  }
`;
```

These are GraphQL queries written as template strings (using `gql`). Apollo caches the results.

---

## Step 5: Define GraphQL Mutations

Open `lib/graphql/mutations.ts` and write mutations to update data:

```typescript
import { gql } from "@apollo/client";

export const UPDATE_STEP_STATUS = gql`
  mutation UpdateStepStatus($stepId: uuid!, $status: work_step_status_enum!) {
    update_work_step_by_pk(pk_columns: { id: $stepId }, _set: { status: $status }) {
      id
      step_number
      status
      completed_at
    }
  }
`;

export const CREATE_WORK_STEP = gql`
  mutation CreateWorkStep($workPlanId: uuid!, $stepNumber: Int!, $description: String!) {
    insert_work_step_one(
      object: {
        work_plan_id: $workPlanId
        step_number: $stepNumber
        description: $description
        status: "pending"
      }
    ) {
      id
      step_number
      description
      status
    }
  }
`;
```

Mutations modify data in the backend and return the result for cache updates.

---

## Step 6: Create TypeScript Types

Open `lib/types.ts` and define types matching your Hasura schema:

```typescript
export interface WorkPlan {
  id: string;
  order_id: string;
  technician_id: string;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  work_steps?: WorkStep[];
}

export interface WorkStep {
  id: string;
  step_number: number;
  description: string;
  status: "pending" | "in_progress" | "completed";
  completed_at?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  total_amount: number;
  status: "pending" | "validated" | "shipped";
  created_at: string;
}
```

These types provide type safety throughout your components.

---

## Step 7: Build a Server Component to Fetch Initial Data

Create `app/work-plans/page.tsx` as a server component:

```typescript
import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';
import WorkPlanList from '@/components/WorkPlanList';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:8080/graphql',
    credentials: 'include',
  }),
  cache: new InMemoryCache(),
});

export default async function WorkPlansPage() {
  const { data } = await client.query({
    query: gql`
      query GetWorkPlans {
        work_plan(limit: 50) {
          id
          order_id
          technician_id
          status
          created_at
        }
      }
    `,
  });

  return <WorkPlanList initialData={data.work_plan} />;
}
```

**Why server component?**

- Fetch data at build time or request time
- Never expose the Hasura URL to the client
- Faster initial page load (HTML is ready when client receives it)
- Use client components for interactivity

---

## Step 8: Build a Client Component for Interactivity

Create `components/WorkPlanList.tsx` as a client component:

```typescript
'use client';

import { useQuery } from '@apollo/client';
import { GET_WORK_PLANS } from '@/lib/graphql/queries';
import { WorkPlan } from '@/lib/types';
import Link from 'next/link';

interface Props {
  initialData: WorkPlan[];
}

export default function WorkPlanList({ initialData }: Props) {
  const { data, loading, error, refetch } = useQuery(GET_WORK_PLANS);

  const workPlans = data?.work_plan ?? initialData;

  if (error) {
    return <div className="error">Error loading work plans: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Work Plans</h1>

      {loading && <p>Loading...</p>}

      <div className="grid gap-4">
        {workPlans.map((plan: WorkPlan) => (
          <Link
            key={plan.id}
            href={`/work-plans/${plan.id}`}
            className="p-4 border rounded hover:bg-gray-100"
          >
            <h2 className="font-bold">{plan.order_id}</h2>
            <p className="text-sm text-gray-600">Technician: {plan.technician_id}</p>
            <p className="text-sm text-gray-600">Status: {plan.status}</p>
          </Link>
        ))}
      </div>

      <button
        onClick={() => refetch()}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh
      </button>
    </div>
  );
}
```

**Key patterns**:

- `useQuery()` fetches data and watches for updates
- `data` contains the query result once loaded
- `loading` indicates if data is still being fetched
- `refetch()` manually re-fetch from the server

---

## Step 9: Build a Detail Page with Subscriptions

Create `components/WorkPlanDetail.tsx`:

```typescript
'use client';

import { useQuery, useSubscription } from '@apollo/client';
import { GET_WORK_PLAN_DETAIL } from '@/lib/graphql/queries';
import { WorkPlan, WorkStep } from '@/lib/types';
import StepCard from './StepCard';

interface Props {
  workPlanId: string;
}

export default function WorkPlanDetail({ workPlanId }: Props) {
  // Fetch initial data with query
  const { data, loading, error } = useQuery(GET_WORK_PLAN_DETAIL, {
    variables: { id: workPlanId },
  });

  // Subscribe to real-time updates
  const { data: subData } = useSubscription(GET_WORK_PLAN_DETAIL, {
    variables: { id: workPlanId },
  });

  const workPlan: WorkPlan = subData?.work_plan_by_pk ?? data?.work_plan_by_pk;

  if (loading) return <div>Loading work plan...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!workPlan) return <div>Work plan not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">{workPlan.order_id}</h1>
      <p className="text-gray-600 mb-6">
        Assigned to: {workPlan.technician_id} | Status: {workPlan.status}
      </p>

      <h2 className="text-2xl font-bold mb-4">Steps</h2>
      <div className="grid gap-4">
        {workPlan.work_steps?.map((step: WorkStep) => (
          <StepCard
            key={step.id}
            step={step}
            workPlanId={workPlanId}
          />
        ))}
      </div>
    </div>
  );
}
```

**Key concepts**:

- `useQuery()` fetches initial data (from HTTP)
- `useSubscription()` watches for real-time changes (via WebSocket)
- Apollo merges subscription updates into the cache
- UI updates automatically when data changes

---

## Step 10: Handle Optimistic Updates

Create `components/StepCard.tsx` with optimistic updates:

```typescript
'use client';

import { useMutation } from '@apollo/client';
import { UPDATE_STEP_STATUS } from '@/lib/graphql/mutations';
import { GET_WORK_PLAN_DETAIL } from '@/lib/graphql/queries';
import { WorkStep } from '@/lib/types';

interface Props {
  step: WorkStep;
  workPlanId: string;
}

export default function StepCard({ step, workPlanId }: Props) {
  const [updateStatus, { loading }] = useMutation(UPDATE_STEP_STATUS, {
    // Optimistic update: show the result immediately
    optimisticResponse: {
      update_work_step_by_pk: {
        __typename: 'work_step',
        id: step.id,
        step_number: step.step_number,
        status: 'in_progress',
        completed_at: null,
      },
    },
    // Update cache after mutation succeeds
    update(cache, { data }) {
      cache.modify({
        fields: {
          work_plan_by_pk() {
            // Apollo will refetch if needed
            return undefined;
          },
        },
      });
    },
  });

  const handleMarkComplete = async () => {
    try {
      await updateStatus({
        variables: {
          stepId: step.id,
          status: 'completed',
        },
      });
    } catch (error) {
      console.error('Failed to update step:', error);
    }
  };

  return (
    <div className="p-4 border rounded hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold">Step {step.step_number}</h3>
          <p className="text-sm text-gray-700">{step.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            Status: <span className="font-semibold">{step.status}</span>
          </p>
        </div>

        <button
          onClick={handleMarkComplete}
          disabled={loading || step.status === 'completed'}
          className={`px-3 py-1 rounded text-white ${
            step.status === 'completed'
              ? 'bg-green-500'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {step.status === 'completed' ? '✓ Done' : 'Mark Complete'}
        </button>
      </div>
    </div>
  );
}
```

**Optimistic Updates**:

- `optimisticResponse` shows the expected result immediately (no spinner)
- User sees "✓ Done" before the server responds
- If mutation fails, Apollo reverts to the previous state
- On slow networks, users feel instant feedback—critical for shop floor WiFi

---

## Step 11: Create a Custom Hook for Data Fetching

Create `hooks/useWorkPlan.ts`:

```typescript
import { useQuery, useSubscription } from "@apollo/client";
import { GET_WORK_PLAN_DETAIL } from "@/lib/graphql/queries";
import { WorkPlan } from "@/lib/types";

export function useWorkPlan(workPlanId: string) {
  const {
    data,
    loading: queryLoading,
    error: queryError,
  } = useQuery(GET_WORK_PLAN_DETAIL, { variables: { id: workPlanId } });

  const { data: subData, loading: subLoading } = useSubscription(GET_WORK_PLAN_DETAIL, {
    variables: { id: workPlanId },
  });

  const workPlan: WorkPlan | null = subData?.work_plan_by_pk ?? data?.work_plan_by_pk ?? null;

  return {
    workPlan,
    loading: queryLoading || subLoading,
    error: queryError,
  };
}
```

This hook abstracts the query + subscription logic, making components cleaner.

---

## Step 12: Write Component Tests

Create `tests/components.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { GET_WORK_PLAN_DETAIL } from '@/lib/graphql/queries';
import WorkPlanDetail from '@/components/WorkPlanDetail';

const mockWorkPlanData = {
  work_plan_by_pk: {
    id: 'wp-123',
    order_id: 'order-456',
    technician_id: 'tech-789',
    status: 'in_progress',
    work_steps: [
      {
        id: 'step-1',
        step_number: 1,
        description: 'Inspect parts',
        status: 'completed',
        completed_at: '2026-04-13T10:00:00Z',
      },
      {
        id: 'step-2',
        step_number: 2,
        description: 'Assemble unit',
        status: 'in_progress',
        completed_at: null,
      },
    ],
  },
};

describe('WorkPlanDetail', () => {
  it('renders work plan details', async () => {
    const mocks = [
      {
        request: { query: GET_WORK_PLAN_DETAIL, variables: { id: 'wp-123' } },
        result: { data: mockWorkPlanData },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <WorkPlanDetail workPlanId="wp-123" />
      </MockedProvider>
    );

    // Wait for data to load
    const heading = await screen.findByText('order-456');
    expect(heading).toBeInTheDocument();

    // Check that steps are rendered
    expect(screen.getByText('Inspect parts')).toBeInTheDocument();
    expect(screen.getByText('Assemble unit')).toBeInTheDocument();
  });

  it('displays step status correctly', async () => {
    const mocks = [
      {
        request: { query: GET_WORK_PLAN_DETAIL, variables: { id: 'wp-123' } },
        result: { data: mockWorkPlanData },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <WorkPlanDetail workPlanId="wp-123" />
      </MockedProvider>
    );

    const completedButton = await screen.findByText('✓ Done');
    expect(completedButton).toBeInTheDocument();
    expect(completedButton).toBeDisabled();
  });
});
```

**Testing patterns**:

- `MockedProvider` provides a mock Apollo client for tests
- Mock GraphQL responses to test without a live server
- Use `screen.findByText()` to wait for async data

**Run tests**:

```bash
pnpm test
```

---

## Step 13: Handle Loading and Error States

Update `components/WorkPlanList.tsx` to handle all states:

```typescript
'use client';

import { useQuery } from '@apollo/client';
import { GET_WORK_PLANS } from '@/lib/graphql/queries';

export default function WorkPlanList({ initialData }) {
  const { data, loading, error, refetch, networkStatus } = useQuery(
    GET_WORK_PLANS,
    { notifyOnNetworkStatusChange: true }
  );

  // Network status: 1 = loading, 2 = setVariables, 3 = fetchMore, 4 = refetch, 7 = poll
  const isRefetching = networkStatus === 4;

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded">
        <h2 className="text-red-900 font-bold">Error Loading Work Plans</h2>
        <p className="text-red-700">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  const workPlans = data?.work_plan ?? initialData;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Work Plans</h1>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isRefetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && !initialData && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          <p className="mt-4 text-gray-600">Loading work plans...</p>
        </div>
      )}

      <div className="grid gap-4">
        {workPlans.map((plan) => (
          <WorkPlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
```

**Patterns**:

- Show skeleton loaders while fetching (or reuse initial data)
- Display error messages with retry button
- Disable buttons during network operations
- Use `networkStatus` to distinguish initial load from refetch

---

## Step 14: Set Up Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT=ws://localhost:8080/graphql
```

Update `lib/apolloClient.ts` to use these:

```typescript
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  credentials: "include",
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT,
  })
);
```

---

## Step 15: Build and Deploy

**Development**:

```bash
pnpm dev
```

**Production Build**:

```bash
pnpm build
pnpm start
```

**Deploy to Vercel** (recommended for Next.js):

```bash
npm i -g vercel
vercel
```

In Vercel settings:

1. Add environment variables from `.env.local`
2. Ensure GraphQL endpoints are publicly accessible (or use API proxy)
3. Deploy

---

## Step 16: Add Error Boundaries

Create `components/ErrorBoundary.tsx`:

```typescript
'use client';

import { ReactNode } from 'react';

export default function ErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: (error: Error) => ReactNode;
}) {
  try {
    return <>{children}</>;
  } catch (error) {
    return <>{fallback(error as Error)}</>;
  }
}
```

Wrap components that might error:

```typescript
<ErrorBoundary
  fallback={(error) => (
    <div className="p-6 bg-red-50 border border-red-200 rounded">
      <h2 className="text-red-900 font-bold">Something went wrong</h2>
      <p className="text-red-700">{error.message}</p>
    </div>
  )}
>
  <WorkPlanDetail workPlanId={id} />
</ErrorBoundary>
```

---

## Step 17: Monitor Performance

Add Apollo DevTools for debugging:

1. Install the [Apollo DevTools browser extension](https://www.apollographql.com/docs/react/development-testing/developer-tools/)
2. Open DevTools in your browser
3. Go to **Apollo** tab to see:
   - All queries and mutations
   - Cache state
   - Network activity
   - Subscription status

---

## Step 18: Implement Pagination

Fetch large datasets in pages:

```typescript
export const GET_WORK_PLANS_PAGINATED = gql`
  query GetWorkPlansPaginated($limit: Int!, $offset: Int!) {
    work_plan(limit: $limit, offset: $offset, order_by: { created_at: desc }) {
      id
      order_id
      status
    }
    work_plan_aggregate {
      aggregate {
        count
      }
    }
  }
`;
```

In component:

```typescript
const [page, setPage] = useState(0);
const pageSize = 10;

const { data } = useQuery(GET_WORK_PLANS_PAGINATED, {
  variables: { limit: pageSize, offset: page * pageSize },
});

const totalPages = Math.ceil(
  data?.work_plan_aggregate?.aggregate?.count / pageSize
);

return (
  <>
    {/* Render work plans */}

    <div className="flex gap-2 mt-6">
      <button
        onClick={() => setPage(p => p - 1)}
        disabled={page === 0}
      >
        Previous
      </button>
      <span>Page {page + 1} of {totalPages}</span>
      <button
        onClick={() => setPage(p => p + 1)}
        disabled={page >= totalPages - 1}
      >
        Next
      </button>
    </div>
  </>
);
```

---

## Key Takeaways

✅ **Server components fetch, client components interact**: Separate concerns for efficiency

✅ **Apollo Client handles caching**: No need to manually manage state for most queries

✅ **Optimistic updates improve UX**: Users feel instant feedback on slow networks

✅ **Subscriptions keep data in sync**: No polling; changes stream via WebSocket in real-time

✅ **Error boundaries prevent full-page crashes**: Graceful degradation for connectivity issues

✅ **Custom hooks abstract logic**: Reusable, testable, cleaner components

✅ **TypeScript provides safety**: Catch errors at build time, not runtime

---

## Troubleshooting

**Apollo not connecting to Hasura?**

- Verify Hasura is running: `docker-compose ps` in practice-2
- Check the endpoint URL in `.env.local`
- Ensure CORS is enabled on Hasura (it is by default)

**Subscriptions not updating?**

- Verify WebSocket endpoint is accessible: `ws://localhost:8080/graphql`
- Check browser console for WebSocket errors
- Try a fresh browser tab (clear cookies if auth headers are set)

**Tests failing?**

- Ensure all Apollo queries are mocked in tests
- Check that mock response structure matches query expectations
- Use `MockedProvider` for all test renders

**Performance issues?**

- Check Apollo DevTools for unnecessary re-queries
- Use `cache-first` fetch policy for stable data
- Implement pagination for large datasets
- Debounce search inputs with `useDeferredValue`

---

## Interview Talking Points

When discussing this exercise in your interview:

> "In Practice 3, I built a React/Next.js frontend that consumes the Hasura GraphQL API. The key architectural choice was separating **server components** (fetch data on the server) from **client components** (handle interactivity). This gives us the best of both worlds: fast initial load and responsive UI."

> "I leveraged **optimistic updates** to improve UX. When a technician marks a work step complete on the shop floor with spotty WiFi, they see the ✓ immediately, even if the network request is slow. If it fails, Apollo reverts gracefully. This is critical for manufacturing workflows where technicians expect instant feedback."

> "I set up **real-time subscriptions** via WebSocket so technicians on different devices see each other's progress instantly. When one person marks a step complete, everyone else's screen updates in real-time—no polling, no delay. On Boltline, this coordination is essential for multi-person assembly jobs."

> "I also wrote **component tests** with React Testing Library and mocked Apollo responses. This lets me verify UI behavior without hitting the live GraphQL server, making tests fast and reliable."

> "For production, I'd deploy to Vercel (native Next.js support) and proxy the Hasura endpoint through an API route to avoid exposing the internal GraphQL URL."

---

## Next Steps

Congratulations! You've completed all three practice exercises. You now understand:

1. **Temporal & Kafka**: How to build resilient, fault-tolerant workflows
2. **Hasura & GraphQL**: How to generate a scalable, real-time API from a relational schema
3. **Next.js & Apollo**: How to build a modern frontend with optimistic updates and subscriptions

These are the exact patterns Boltline uses. In your interview, tie them together:

> "The three practices mimic Boltline's architecture: Temporal orchestrates multi-step manufacturing workflows, Hasura exposes the inventory and work plan data via GraphQL, and Next.js renders a responsive UI. The key insight is that each layer has a single responsibility, and they communicate via well-defined interfaces (GraphQL contracts, Kafka events). This makes the system scalable, testable, and resilient to failures."

Good luck with your interview!
