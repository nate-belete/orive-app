import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateOccasion } from '../api/hooks'
import Card from '../components/Card'
import FormField from '../components/FormField'
import ErrorState from '../components/ErrorState'

export default function OccasionCreate() {
  const navigate = useNavigate()
  const createMutation = useCreateOccasion()

  const [formData, setFormData] = useState({
    occasion_type: '',
    datetime_local: '',
    location: '',
    dress_code: '',
    weather_hint: '',
    budget: 0,
    comfort: 'medium',
    desired_outcome: 'confident',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const occasion = await createMutation.mutateAsync({
        ...formData,
        datetime_local: new Date(formData.datetime_local).toISOString(),
      })
      navigate(`/playbooks/${occasion.id}`)
    } catch (err) {
      console.error('Failed to create occasion:', err)
    }
  }

  if (createMutation.isError) {
    return <ErrorState message="Failed to create occasion" />
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Create New Occasion</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <FormField label="Occasion Type" required>
            <input
              type="text"
              value={formData.occasion_type}
              onChange={(e) => setFormData({ ...formData, occasion_type: e.target.value })}
              placeholder="e.g., interview, wedding, date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </FormField>

          <FormField label="Date & Time" required>
            <input
              type="datetime-local"
              value={formData.datetime_local}
              onChange={(e) => setFormData({ ...formData, datetime_local: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </FormField>

          <FormField label="Location">
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Downtown Office, Central Park"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </FormField>

          <FormField label="Dress Code">
            <input
              type="text"
              value={formData.dress_code}
              onChange={(e) => setFormData({ ...formData, dress_code: e.target.value })}
              placeholder="e.g., business casual, formal, smart casual"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </FormField>

          <FormField label="Weather Hint">
            <input
              type="text"
              value={formData.weather_hint}
              onChange={(e) => setFormData({ ...formData, weather_hint: e.target.value })}
              placeholder="e.g., sunny, rainy, cold"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </FormField>

          <FormField label="Budget">
            <input
              type="number"
              min="0"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </FormField>

          <FormField label="Comfort Level">
            <select
              value={formData.comfort}
              onChange={(e) => setFormData({ ...formData, comfort: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="low">Low (prioritize style)</option>
              <option value="medium">Medium (balanced)</option>
              <option value="high">High (prioritize comfort)</option>
            </select>
          </FormField>

          <FormField label="Desired Outcome">
            <input
              type="text"
              value={formData.desired_outcome}
              onChange={(e) => setFormData({ ...formData, desired_outcome: e.target.value })}
              placeholder="e.g., confident, authoritative, warm, elegant"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </FormField>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Occasion & Generate Playbook'}
          </button>
        </form>
      </Card>
    </div>
  )
}

