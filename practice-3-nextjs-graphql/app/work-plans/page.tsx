export default function WorkPlansPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Work Plans</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3].map((id) => (
              <div
                key={id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <h2 className="text-xl font-semibold mb-2">Work Plan #{id}</h2>
                <p className="text-gray-600 mb-4">
                  Sample work plan demonstrating real-time updates and optimistic mutations
                </p>
                <a
                  href={`/work-plans/${id}`}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  View Details
                </a>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">📝 About This Page</h3>
            <p className="text-gray-700">
              This page demonstrates a Server Component that fetches work plan data from Hasura
              GraphQL. In a production app, this would query real data and display technician work
              plans for the shop floor.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
