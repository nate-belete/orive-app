'use client'

import { useState } from 'react'
import { useClosetItems, useCreateClosetItem, useDeleteClosetItem } from '@/lib/api/hooks'
import Card from '../components/Card'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'
import type { ClosetItemCreate } from '@/lib/api/types'

const CATEGORIES = ['top', 'bottom', 'outerwear', 'shoes', 'accessory']
const SEASONS = ['all', 'summer', 'winter', 'spring', 'fall']

export default function ClosetPage() {
  const { data: items, isLoading, error, refetch } = useClosetItems()
  const createMutation = useCreateClosetItem()
  const deleteMutation = useDeleteClosetItem()

  const [formData, setFormData] = useState<ClosetItemCreate>({
    name: '',
    category: 'top',
    color: '',
    formality: 3,
    season: 'all',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync(formData)
      setFormData({
        name: '',
        category: 'top',
        color: '',
        formality: 3,
        season: 'all',
        notes: '',
      })
    } catch (err) {
      console.error('Failed to create item:', err)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (err) {
        console.error('Failed to delete item:', err)
      }
    }
  }

  if (isLoading) return <Loading />
  if (error) return <ErrorState message="Failed to load closet items" onRetry={() => refetch()} />

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">My Closet</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Item</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Formality (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.formality}
                onChange={(e) => setFormData({ ...formData, formality: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Season
              </label>
              <select
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {SEASONS.map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Item'}
            </button>
          </form>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Items ({items?.length || 0})
          </h2>
          {items && items.length === 0 ? (
            <Card>
              <p className="text-gray-600 dark:text-gray-400">
                No items in your closet yet. Add your first item!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {items?.map((item) => (
                <Card key={item.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.category} • {item.color} • Formality: {item.formality}/5 • {item.season}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{item.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

