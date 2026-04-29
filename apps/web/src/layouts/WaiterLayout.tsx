export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <main>{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="flex justify-around py-2">Waiter Nav</div>
      </nav>
    </div>
  )
}
