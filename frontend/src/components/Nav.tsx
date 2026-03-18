import { Link, useLocation } from 'react-router-dom'

export default function Nav() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/closet', label: 'Closet' },
    { path: '/occasions/new', label: 'New Occasion' },
    { path: '/history', label: 'History' },
  ]

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              Occasion OS
            </Link>
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

