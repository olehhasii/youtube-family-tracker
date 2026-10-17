import type { Status } from '../../model'

/** The CSS colour token for each Status (defined in src/index.css). */
export const STATUS_COLOR: Record<Status, string> = {
  paid: 'var(--color-paid)',
  dueSoon: 'var(--color-due-soon)',
  overdue: 'var(--color-overdue)',
  unknown: 'var(--color-unknown)',
  exempt: 'var(--color-exempt)',
}
