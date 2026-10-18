import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar } from '../../../shared/ui/Avatar'
import { shrinkImage } from '../helpers/shrink-image'

type Props = {
  memberId: string
  name: string
  /** The photo the Member has now. */
  currentUrl: string | null
  /** A new photo, null to remove the current one, undefined to keep it. */
  photo: Blob | null | undefined
  onChange: (photo: Blob | null | undefined) => void
}

export function PhotoField({ memberId, name, currentUrl, photo, onChange }: Props) {
  const { t } = useTranslation()
  const [unreadable, setUnreadable] = useState(false)
  // a data URL (the shrunk photo is small) needs no revoking, unlike an object URL
  const [preview, setPreview] = useState<string | null>(null)

  const shown = photo === undefined ? currentUrl : preview
  const pick = async (file: File | undefined) => {
    if (!file) return
    setUnreadable(false)
    try {
      const shrunk = await shrinkImage(file)
      setPreview(await dataUrl(shrunk))
      onChange(shrunk)
    } catch {
      setUnreadable(true)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar id={memberId} name={name || '?'} url={shown} size={64} />
      <div className="flex flex-col items-start gap-1">
        <label className="cursor-pointer rounded-full bg-fg/10 px-4 py-2 text-sm font-semibold press has-focus-visible:outline-2 has-focus-visible:outline-fg">
          {shown ? t('member.changePhoto') : t('member.choosePhoto')}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => void pick(e.target.files?.[0])} />
        </label>
        {shown && (
          // undefined when there was never a photo, so saving doesn't touch storage at all
          <button type="button" className="px-4 py-1 text-sm text-muted press" onClick={() => {
              setPreview(null)
              onChange(currentUrl ? null : undefined)
            }}>
            {t('member.removePhoto')}
          </button>
        )}
        {unreadable && (
          <p role="alert" className="px-1 text-sm text-overdue">
            {t('member.photoUnreadable')}
          </p>
        )}
      </div>
    </div>
  )
}

const dataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
