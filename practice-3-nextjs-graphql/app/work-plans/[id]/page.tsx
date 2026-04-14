export default function WorkPlanDetailPage({
  params,
}: {
  params: { id: string };
}): React.ReactElement {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <a href="/work-plans" className="text-blue-600 hover:text-blue-800 mb-6 block">
            ← Back to Work Plans
          </a>

          <h1 className="text-3xl font-bold mb-8">Work Plan #{params.id}</h1>

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Steps</h2>

            <div className="space-y-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Step {stepNum}: Prepare Assembly</h3>
                      <p className="text-gray-600 text-sm">
                        Follow the digital instructions to prepare the assembly
                      </p>
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                      Mark Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">💡 How This Works</h3>
            <ul className="text-gray-700 space-y-2 ml-4 list-disc">
              <li>
                <strong>Server Component:</strong> Initial page render fetches work plan from Hasura
              </li>
              <li>
                <strong>Client Component:</strong> Step cards are interactive with optimistic
                updates
              </li>
              <li>
                <strong>Real-time:</strong> GraphQL subscriptions keep steps in sync across all
                users
              </li>
              <li>
                <strong>Apollo Cache:</strong> Mutations update the local cache before server
                confirms
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
