import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  usePlaybookByOccasion,
  useGeneratePlaybook,
  useOccasion,
} from '../api/hooks'
import Card from '../components/Card'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'

export default function PlaybookView() {
  const { occasionId } = useParams<{ occasionId: string }>()
  const navigate = useNavigate()
  const id = parseInt(occasionId || '0')

  const { data: occasion } = useOccasion(id)
  const {
    data: playbook,
    isLoading,
    error,
    refetch,
  } = usePlaybookByOccasion(id)
  const generateMutation = useGeneratePlaybook()

  const handleGenerate = async (force = false) => {
    try {
      const newPlaybook = await generateMutation.mutateAsync({
        occasionId: id,
        force,
      })
      if (newPlaybook) {
        refetch()
      }
    } catch (err) {
      console.error('Failed to generate playbook:', err)
    }
  }

  if (isLoading || generateMutation.isPending) return <Loading />
  if (error && !playbook)
    return (
      <ErrorState
        message="Failed to load playbook"
        onRetry={() => refetch()}
      />
    )

  if (!playbook) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            No Playbook Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Generate a playbook for this occasion to see recommendations.
          </p>
          <button
            onClick={() => handleGenerate()}
            disabled={generateMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Generate Playbook
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Playbook
        </h1>
        {occasion && (
          <p className="text-gray-600 dark:text-gray-400">
            {occasion.occasion_type} • {new Date(occasion.datetime_local).toLocaleString()}
          </p>
        )}
      </div>

      {playbook.look.message ? (
        <Card className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">{playbook.look.message}</p>
        </Card>
      ) : (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Outfit Options
          </h2>
          <div className="space-y-4">
            {playbook.look.outfits.map((outfit, idx) => (
              <Card key={idx}>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {outfit.title}
                </h3>
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Items:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    {outfit.items.map((item) => (
                      <li key={item.id}>{item.name}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {outfit.reasoning}
                </p>
                {outfit.risk_flags.length > 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900 rounded">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ Risk flags: {outfit.risk_flags.join(', ')}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Prep Timeline
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Day Before
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                {playbook.prep.day_before.map((task, idx) => (
                  <li key={idx}>{task}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Morning Of
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                {playbook.prep.morning_of.map((task, idx) => (
                  <li key={idx}>{task}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Pack
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                {playbook.prep.pack.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Presence Coaching
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Tips
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                {playbook.presence.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Scripts
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                {playbook.presence.scripts.map((script, idx) => (
                  <li key={idx}>{script}</li>
                ))}
              </ul>
            </div>
            {playbook.presence.notes && playbook.presence.notes.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Notes
                </h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  {playbook.presence.notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Beauty Notes
        </h2>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
          {playbook.beauty.notes.map((note, idx) => (
            <li key={idx}>{note}</li>
          ))}
        </ul>
      </Card>

      <div className="flex gap-4">
        <Link
          to={`/feedback/${playbook.occasion_id}/${playbook.id}`}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Submit Feedback
        </Link>
        <button
          onClick={() => handleGenerate(true)}
          disabled={generateMutation.isPending}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          Regenerate Playbook
        </button>
      </div>
    </div>
  )
}

