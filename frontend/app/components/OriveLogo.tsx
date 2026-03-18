import Link from 'next/link'

interface OriveLogoProps {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function OriveLogo({
  href = '/',
  size = 'md',
  className = '',
}: OriveLogoProps) {
  const sizeClasses = {
    sm: 'text-lg tracking-[0.12em]',
    md: 'text-xl tracking-[0.15em]',
    lg: 'text-2xl tracking-[0.18em]',
  }

  return (
    <Link
      href={href}
      className={`font-heading font-normal text-charcoal ${sizeClasses[size]} ${className}`}
    >
      ORIVÉ
    </Link>
  )
}
