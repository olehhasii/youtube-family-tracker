import type { Status } from '../../model/types'

export const STATUS_COLOR: Record<Status, string> = {
  paid: 'var(--color-paid)',
  dueSoon: 'var(--color-due-soon)',
  overdue: 'var(--color-overdue)',
  unknown: 'var(--color-unknown)',
  exempt: 'var(--color-exempt)',
}
