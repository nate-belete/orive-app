interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({
  message = 'Something went wrong',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="text-center py-16" role="alert">
      <div className="w-14 h-14 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
        <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <p className="font-body text-sm text-charcoal font-medium mb-1">{message}</p>
      <p className="font-body text-xs text-gray-400 mb-4">Please try again or check your connection.</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary-gold text-sm">
          Try Again
        </button>
      )}
    </div>
  )
}
