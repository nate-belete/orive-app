import { Link } from 'react-router-dom'
import { useOccasions, useFeedback } from '../api/hooks'
import Card from '../components/Card'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'

export default function History() {
  const { data: occasions, isLoading: occasionsLoading, error: occasionsError } = useOccasions()
  const { data: feedback, isLoading: feedbackLoading } = useFeedback()

  if (occasionsLoading || feedbackLoading) return <Loading />
  if (occasionsError) return <ErrorState message="Failed to load history" />

  const getFeedbackForOccasion = (occasionId: number) => {
    return feedback?.filter((f) => f.occasion_id === occasionId) || []
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">History</h1>

      {occasions && occasions.length === 0 ? (
        <Card>
          <p className="text-gray-600 dark:text-gray-400">
            No occasions yet. <Link to="/occasions/new" className="text-blue-600 hover:underline">Create your first occasion</Link>.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {occasions?.map((occasion) => {
            const occasionFeedback = getFeedbackForOccasion(occasion.id)
            return (
              <Card key={occasion.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {occasion.occasion_type}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(occasion.datetime_local).toLocaleString()}
                    </p>
                    {occasion.location && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📍 {occasion.location}
                      </p>
                    )}
                    {occasion.dress_code && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        👔 {occasion.dress_code}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Desired outcome: {occasion.desired_outcome}
                    </p>

                    {occasionFeedback.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          Feedback ({occasionFeedback.length})
                        </h3>
                        {occasionFeedback.map((f) => (
                          <div
                            key={f.id}
                            className="mb-2 p-3 bg-gray-50 dark:bg-gray-700 rounded"
                          >
                            <div className="flex items-center gap-4 mb-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Confidence: {f.confidence_rating}/5
                              </span>
                              {f.wore_it && (
                                <span className="text-sm text-green-600 dark:text-green-400">
                                  ✓ Wore it
                                </span>
                              )}
                              {f.would_repeat && (
                                <span className="text-sm text-blue-600 dark:text-blue-400">
                                  ✓ Would repeat
                                </span>
                              )}
                            </div>
                            {f.notes && (
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {f.notes}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {new Date(f.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Link
                      to={`/playbooks/${occasion.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      View Playbook
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

