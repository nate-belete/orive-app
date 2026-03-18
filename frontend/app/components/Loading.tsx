interface LoadingProps {
  message?: string
}

export default function Loading({ message }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16" role="status" aria-label="Loading">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gold mb-3" />
      {message && (
        <p className="font-body text-sm text-gray-400">{message}</p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  )
}
