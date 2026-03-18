import Link from 'next/link'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      {icon && (
        <div className="w-14 h-14 mx-auto bg-gold/10 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="font-body text-sm text-charcoal font-medium mb-1">{title}</p>
      {description && (
        <p className="font-body text-xs text-gray-400 mb-4 max-w-xs mx-auto">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary-gold text-sm">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button onClick={onAction} className="btn-primary-gold text-sm">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
