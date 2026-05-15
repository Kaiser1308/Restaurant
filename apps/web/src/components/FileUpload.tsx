interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export default function FileUpload({ label, className = '', ...props }: FileUploadProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? <label className="text-sm font-semibold text-[var(--color-on-surface)]">{label}</label> : null}
      <input
        type="file"
        className={`h-10 rounded-[var(--radius-button)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] px-3 py-2 text-sm ${className}`}
        {...props}
      />
    </div>
  )
}
