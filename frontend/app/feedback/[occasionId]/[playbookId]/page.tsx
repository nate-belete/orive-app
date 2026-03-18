'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCreateFeedback } from '@/lib/api/hooks'
import Card from '../../../components/Card'
import Loading from '../../../components/Loading'

export default function FeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const createMutation = useCreateFeedback()

  const occasionId = parseInt(params.occasionId as string)
  const playbookId = parseInt(params.playbookId as string)

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
        occasion_id: occasionId,
        playbook_id: playbookId,
        ...formData,
      })
      router.push('/history')
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
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.wore_it}
                onChange={(e) =>
                  setFormData({ ...formData, wore_it: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Did you wear the recommended outfit?</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confidence Rating (1-5)
            </label>
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
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={5}
              placeholder="How did it go? What worked? What didn't?"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.would_repeat}
                onChange={(e) =>
                  setFormData({ ...formData, would_repeat: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Would you repeat this outfit?</span>
            </label>
          </div>

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

