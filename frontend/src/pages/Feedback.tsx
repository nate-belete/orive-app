import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCreateFeedback } from '../api/hooks'
import Card from '../components/Card'
import FormField from '../components/FormField'
import Loading from '../components/Loading'

export default function Feedback() {
  const { occasionId, playbookId } = useParams<{
    occasionId: string
    playbookId: string
  }>()
  const navigate = useNavigate()
  const createMutation = useCreateFeedback()

  const [formData, setFormData] = useState({
    wore_it: false,
    confidence_rating: 3,
    notes: '',
    would_repeat: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync({
        occasion_id: parseInt(occasionId || '0'),
        playbook_id: parseInt(playbookId || '0'),
        ...formData,
      })
      navigate('/history')
    } catch (err) {
      console.error('Failed to submit feedback:', err)
    }
  }

  if (createMutation.isPending) return <Loading />

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Submit Feedback
      </h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <FormField label="Did you wear the recommended outfit?">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.wore_it}
                onChange={(e) =>
                  setFormData({ ...formData, wore_it: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Yes, I wore it</span>
            </label>
          </FormField>

          <FormField label="Confidence Rating (1-5)">
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.confidence_rating}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confidence_rating: parseInt(e.target.value),
                  })
                }
                className="flex-1"
              />
              <span className="text-gray-700 dark:text-gray-300 w-8 text-center">
                {formData.confidence_rating}
              </span>
            </div>
          </FormField>

          <FormField label="Notes">
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={5}
              placeholder="How did it go? What worked? What didn't?"
            />
          </FormField>

          <FormField label="Would you repeat this outfit?">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.would_repeat}
                onChange={(e) =>
                  setFormData({ ...formData, would_repeat: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Yes, I would repeat it</span>
            </label>
          </FormField>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </Card>
    </div>
  )
}

