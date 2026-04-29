export default function StatusBadge({ status }: { status: string }) {
  const normalized = status.trim().toLowerCase()
  const palette: Record<string, string> = {
    available: 'bg-[#eef3ee] text-[#2b372b] border-[#d8dbd8]',
    occupied: 'bg-[#fff1de] text-[#70470d] border-[#ffd8a8]',
    reserved: 'bg-[#fff8d8] text-[#705f03] border-[#f1de8a]',
    attention: 'bg-[#ffe9e9] text-[#8f1111] border-[#f3b5b5]',
    paid: 'bg-[#e9f6ea] text-[#1f6b22] border-[#b9e0bc]',
    voided: 'bg-[#ffe9e9] text-[#8f1111] border-[#f3b5b5]',
    pending: 'bg-[#eef3ee] text-[#2b372b] border-[#d8dbd8]',
    senttokitchen: 'bg-[#e8f2ff] text-[#0c4f8f] border-[#b8d7ff]'
  }

  const style = palette[normalized] ?? 'bg-[var(--color-surface-low)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]'

  return (
    <span className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-semibold capitalize ${style}`}>
      {status}
    </span>
  )
}
