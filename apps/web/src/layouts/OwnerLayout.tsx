export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex md:w-64 md:flex-col bg-gray-100 border-r">
        <nav className="p-4">
          <p className="font-bold mb-4">Restaurant POS</p>
          <ul>
            <li>Dashboard</li>
            <li>Tables</li>
            <li>Menu</li>
            <li>Orders</li>
            <li>Bills</li>
            <li>Audit Logs</li>
            <li>Reports</li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}
