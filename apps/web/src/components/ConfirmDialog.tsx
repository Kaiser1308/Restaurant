import Button from './Button'
import Modal from './Modal'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  disabled = false,
  children,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  description?: string
  confirmLabel: string
  cancelLabel: string
  confirmVariant?: 'primary' | 'danger'
  disabled?: boolean
  children?: React.ReactNode
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Modal open={open}>
      <div className="space-y-4">
        <div>
          <p className="text-lg font-bold">{title}</p>
          {description ? <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{description}</p> : null}
        </div>
        {children}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={confirmVariant} className="flex-1" disabled={disabled} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
