import type { FormEvent } from 'react'

/** Props that replace the browser's validation message, which follows the browser's language instead of the app's. */
export const validationMessage = (message: string) => ({
  onInvalid: (e: FormEvent<HTMLInputElement>) => e.currentTarget.setCustomValidity(message),
  onInput: (e: FormEvent<HTMLInputElement>) => e.currentTarget.setCustomValidity(''),
})
