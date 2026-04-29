export default function Modal({ children, open }: { children: React.ReactNode; open: boolean }) {
  if (!open) return null
  return <div>{children}</div>
}
