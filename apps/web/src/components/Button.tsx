interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[rgba(11,111,189,0.18)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-[0.98]'
  
  const variants = {
    primary: 'border border-transparent bg-[var(--color-primary)] text-white shadow-[var(--shadow-card)] hover:bg-[var(--color-primary-active)]',
    secondary: 'border border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]',
    success: 'border border-transparent bg-[var(--color-success)] text-white shadow-[var(--shadow-card)] hover:brightness-95',
    danger: 'border border-transparent bg-[var(--color-danger)] text-white hover:brightness-95',
    ghost: 'border border-transparent bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
  }
  
  const sizes = {
    sm: 'h-9 px-3 text-sm rounded-[var(--radius-button)]',
    md: 'h-10 px-4 text-sm rounded-[var(--radius-button)]',
    lg: 'h-11 px-5 text-base rounded-[var(--radius-button)]'
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
