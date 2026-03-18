import { Link } from 'react-router-dom'
import Card from '../components/Card'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Welcome to Occasion OS
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your personal styling assistant for every occasion. Create occasions,
          build your closet, and get personalized playbooks with outfit
          recommendations, prep timelines, and presence coaching.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/occasions/new"
            className="block p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Create New Occasion
          </Link>
          <Link
            to="/closet"
            className="block p-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
          >
            Manage Closet
          </Link>
        </div>
      </Card>
    </div>
  )
}

