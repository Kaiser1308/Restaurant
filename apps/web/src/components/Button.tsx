interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold tracking-[0.01em] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]'
  
  const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:brightness-95 focus:ring-[var(--color-primary)] shadow-[0_10px_22px_-12px_rgba(255,69,0,0.75)]',
    secondary: 'bg-[var(--color-secondary-container)] text-[var(--color-on-surface)] border border-[#ffd7b5] hover:bg-[#ffe8d0] focus:ring-[var(--color-secondary)]',
    danger: 'bg-[var(--color-error)] text-white hover:brightness-95 focus:ring-[var(--color-error)]',
    ghost: 'bg-transparent text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-low)] focus:ring-[var(--color-outline)]'
  }
  
  const sizes = {
    sm: 'h-11 px-3 text-sm rounded-[var(--radius-button)]',
    md: 'h-11 px-4 text-sm rounded-[var(--radius-button)]',
    lg: 'h-12 px-6 text-base rounded-[var(--radius-button)]'
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
