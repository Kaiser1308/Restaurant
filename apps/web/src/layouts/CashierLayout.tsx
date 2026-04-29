export default function CashierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex md:w-64 md:flex-col bg-gray-100 border-r">
        <nav className="p-4">Cashier Nav</nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}
