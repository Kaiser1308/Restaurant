export default function FormActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-outline-variant)] pt-4 sm:flex-row sm:justify-end">
      {children}
    </div>
  )
}
