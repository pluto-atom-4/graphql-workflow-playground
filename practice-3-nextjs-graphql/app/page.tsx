import Link from "next/link";

export default function Home(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h1 className="text-5xl font-bold mb-6">Boltline Work Plans</h1>
          <p className="text-xl mb-12 opacity-90">
            Interview practice application for Stoke Space. Demonstrating Temporal, Kafka, Hasura
            GraphQL, and Next.js integration.
          </p>

          <div className="space-y-4">
            <Link
              href="/work-plans"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              View Work Plans
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Real-time Subscriptions</h3>
              <p className="opacity-80">
                Live updates to work plan status using GraphQL subscriptions
              </p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Optimistic Updates</h3>
              <p className="opacity-80">
                Instant UI feedback while Apollo Client sync with the backend
              </p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Server Components</h3>
              <p className="opacity-80">Next.js server components for fast initial data loading</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
