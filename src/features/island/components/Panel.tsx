import { motion, useIsPresent } from 'motion/react'
import { type ComponentProps, useEffect, useLayoutEffect, useRef } from 'react'
import type { islandContentSwap } from '../../../shared/lib/motion'

type Props = ComponentProps<typeof motion.div> & {
  name: string
  swap: ReturnType<typeof islandContentSwap>
  onEnter: (name: string, panel: HTMLDivElement) => void
}

/** One of the island's states. While it fades out it can't be focused or clicked. */
export function Panel({ name, swap, onEnter, children, ...rest }: Props) {
  const present = useIsPresent()
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (ref.current) onEnter(name, ref.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- once, on mount
  // passive, so it runs after the island's layout effect has moved focus out
  useEffect(() => {
    if (ref.current) ref.current.inert = !present
  }, [present])
  return (
    <motion.div ref={ref} data-panel={name} {...swap} {...rest}>
      {children}
    </motion.div>
  )
}
