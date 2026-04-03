import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-ios-lg p-6',
        hover && 'hover:shadow-ios-md hover:-translate-y-1 transition-all duration-300 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
