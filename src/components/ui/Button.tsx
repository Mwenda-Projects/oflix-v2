import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'whatsapp' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-body font-semibold rounded-ios transition-all duration-200 active:scale-95 cursor-pointer border-none',
        {
          'bg-brand text-white hover:bg-brand-dark shadow-ios-glow': variant === 'primary',
          'bg-transparent text-light-text dark:text-dark-text border border-light-border dark:border-dark-border hover:border-brand hover:text-brand': variant === 'secondary',
          'text-white': variant === 'whatsapp',
          'bg-transparent text-light-muted dark:text-dark-muted hover:text-brand': variant === 'ghost',
        },
        {
          'text-xs px-3 py-2': size === 'sm',
          'text-sm px-5 py-2.5': size === 'md',
          'text-base px-8 py-4': size === 'lg',
        },
        variant === 'whatsapp' && 'bg-[#25D366]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
