import { useEffect, useState } from 'react'

/** The current time, refreshed as each minute starts. */
export function useMinute() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setTimeout(() => setNow(new Date()), 60_000 - (now.getTime() % 60_000))
    return () => clearTimeout(id)
  }, [now])
  return now
}
