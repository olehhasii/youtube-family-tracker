// The black pill at the bottom of the Board. One component owns all its states: at rest, menu, about and toast.
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react'
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Board } from '../../data'
import { RADIUS, islandContentSwap, islandEntrance, islandSpring, letterRoll } from '../../ui/motion'
import { StatusRing } from '../board/StatusRing'
import { toLanguage } from '../board/locale'
import { describeHeadline } from './describe-headline'
import { useCurrentToast } from './toast'

const REPO_URL = 'https://github.com/olehhasii/youtube-family-tracker'

type Mode = 'rest' | 'menu' | 'about'
type IslandView = Mode | 'toast'

type Props = {
  /** undefined while the Board loads or when it failed; the island then shows only its buttons. */
  board: Board | undefined
}

export function Island({ board }: Props) {
  const { t, i18n } = useTranslation()
  const lng = toLanguage(i18n.resolvedLanguage)
  const reduce = useReducedMotion()
  const toast = useCurrentToast()
  // `from` picks where focus lands: going back focuses the button that led forward
  const [{ mode, from }, setView] = useState<{ mode: Mode; from: IslandView | null }>({ mode: 'rest', from: null })
  const go = (next: Mode) => setView({ mode: next, from: mode })
  const shown: IslandView = toast ? 'toast' : mode // a toast covers whatever is open, which comes back after it

  const root = useRef<HTMLElement>(null)
  // Whether focus is in the island. A focused button that is removed with its content may blur
  // (with nowhere to go) or not, so only a blur that leaves a still-mounted element counts as leaving.
  const focusWithin = useRef(false)
  const lastIslandView = useRef(shown)
  const focusOnEnter = useRef<IslandView | null>(null)
  const focusInto = (panel: Element) => {
    panel.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    focusOnEnter.current = null
  }
  // When the content swaps under the user's focus, focus the new content. It may mount in a later
  // commit (AnimatePresence), so the island holds focus until the panel takes it in `onEnter`.
  useLayoutEffect(() => {
    if (lastIslandView.current === shown) return
    lastIslandView.current = shown
    const island = root.current
    const active = document.activeElement
    if (!island || !focusWithin.current || (active !== document.body && !island.contains(active))) return
    island.focus()
    focusOnEnter.current = shown
    const entered = island.querySelector(`[data-panel="${shown}"]`)
    if (entered) focusInto(entered)
  }, [shown])
  const onEnter = (name: IslandView, panel: HTMLDivElement) => {
    if (focusOnEnter.current === name) focusInto(panel)
  }

  const back = () => go(mode === 'about' ? 'menu' : 'rest')
  const swap = islandContentSwap(reduce)
  const entrance = islandEntrance(reduce)
  const paying = board?.rows.filter((r) => r.standing.status !== 'exempt') ?? []
  const headline = board && describeHeadline(paying.map((r) => ({ name: r.member.name, standing: r.standing })), lng)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-safe">
      {/* outside the morphing content, so screen readers hear every toast */}
      <p role="status" className="sr-only">
        {/* keyed, so a repeat of the same text is still a change screen readers announce */}
        {toast && <span key={toast.id}>{toast.text}</span>}
      </p>
      <motion.section
        ref={root}
        layout={!reduce}
        {...entrance}
        transition={{ ...entrance.transition, layout: islandSpring }}
        tabIndex={-1} // holds focus while a toast covers the buttons
        aria-label={t('island.label')}
        onFocus={() => (focusWithin.current = true)}
        onBlur={(e) => {
          const target = e.target as HTMLElement
          if (!e.currentTarget.contains(e.relatedTarget) && target.isConnected && !target.closest('[inert]')) focusWithin.current = false
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && mode !== 'rest') back() // also under a toast, for what comes back after it
        }}
        className="pointer-events-auto max-w-full overflow-hidden border border-white/10 bg-black p-1.5 text-sm text-white shadow-[0_10px_40px_rgb(0_0_0/0.6)] outline-none"
        style={{ borderRadius: RADIUS.island }} // inline so Motion can correct it while the island morphs
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {shown === 'toast' && (
            <Panel key={`toast-${toast!.id}`} name="toast" swap={swap} onEnter={onEnter} className="flex items-center gap-3 pr-4" aria-hidden>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-paid text-black">
                <IconCheck />
              </span>
              <span className="min-w-0 truncate">{toast!.text}</span>
            </Panel>
          )}

          {shown === 'rest' && (
            <Panel key="rest" name="rest" swap={swap} onEnter={onEnter} className="flex items-center gap-2">
              {board && headline && (
                <div className="flex min-w-0 items-center gap-2.5 pr-2 pl-0.5">
                  <StatusRing
                    statuses={paying.map((r) => ({ id: r.member.id, status: r.standing.status }))}
                    size={38}
                    stroke={4}
                    label={t('board.ringLabel', { paidUp: board.summary.paidUp, paying: board.summary.paying })}
                  />
                  <div className="min-w-0 leading-tight">
                    <p className="text-[11px] text-white/50">{headline.label}</p>
                    <p className="truncate font-medium">{headline.text}</p>
                  </div>
                </div>
              )}
              <LanguageButton />
              <button
                data-autofocus
                className="grid size-10 shrink-0 place-items-center rounded-full bg-island-blue press-round"
                aria-label={t('island.menu')}
                onClick={() => go('menu')}
              >
                <IconDots />
              </button>
            </Panel>
          )}

          {shown === 'menu' && (
            <Panel key="menu" name="menu" swap={swap} onEnter={onEnter} className="flex items-center gap-1" role="group" aria-label={t('island.menu')}>
              <BackButton data-autofocus={from !== 'about' || undefined} onClick={back} />
              <IconButton data-autofocus={from === 'about' || undefined} label={t('island.about')} onClick={() => go('about')}>
                <IconInfo />
              </IconButton>
              <a href={REPO_URL} target="_blank" rel="noreferrer" aria-label={t('island.github')} title="GitHub" className={ICON_BUTTON}>
                <IconCode />
              </a>
            </Panel>
          )}

          {shown === 'about' && (
            <Panel key="about" name="about" swap={swap} onEnter={onEnter} className="flex w-80 max-w-full flex-col items-start gap-3 p-2.5">
              <p className="leading-relaxed text-white/80">{t('island.aboutText')}</p>
              <BackButton data-autofocus onClick={back} />
            </Panel>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  )
}

type PanelProps = React.ComponentProps<typeof motion.div> & {
  name: IslandView
  swap: ReturnType<typeof islandContentSwap>
  onEnter: (name: IslandView, panel: HTMLDivElement) => void
}

/** One state's content. While it fades out it can't be focused or clicked. */
function Panel({ name, swap, onEnter, children, ...rest }: PanelProps & { children: ReactNode }) {
  const present = useIsPresent()
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (ref.current) onEnter(name, ref.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- once, on mount
  // set after the island has moved focus out (passive effects run after its layout effect)
  useEffect(() => {
    if (ref.current) ref.current.inert = !present
  }, [present])
  return (
    <motion.div ref={ref} data-panel={name} {...swap} {...rest}>
      {children}
    </motion.div>
  )
}

/** Shows the current language and switches to the other one; the letters roll on change. */
function LanguageButton() {
  const { t, i18n } = useTranslation()
  const lng = toLanguage(i18n.resolvedLanguage)
  const roll = letterRoll(useReducedMotion())
  const code = lng === 'uk' ? 'UA' : 'EN'
  return (
    <button
      className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-[13px] font-semibold press-round"
      aria-label={t('island.switchLanguage', { current: code })} // starts with the visible letters, so voice control can say them
      onClick={() => void i18n.changeLanguage(lng === 'uk' ? 'en' : 'uk')}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={lng} {...roll} aria-hidden>
          {code}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

function BackButton(props: React.ComponentProps<'button'>) {
  const { t } = useTranslation()
  return (
    <button className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white/10 pr-4 pl-3 press" {...props}>
      <IconBack /> {t('island.back')}
    </button>
  )
}

const ICON_BUTTON = 'grid size-10 place-items-center rounded-full press-round hover-fine:bg-white/10'

function IconButton({ label, children, ...rest }: React.ComponentProps<'button'> & { label: string }) {
  return (
    <button className={ICON_BUTTON} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  )
}

const svg = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const
const IconBack = () => (<svg {...svg} width={16} height={16}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>)
const IconDots = () => (<svg {...svg}><circle cx="5" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="19" cy="12" r="1.2" fill="currentColor" /></svg>)
const IconInfo = () => (<svg {...svg}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg>)
const IconCode = () => (<svg {...svg}><path d="m16 18 6-6-6-6M8 6l-6 6 6 6" /></svg>)
const IconCheck = () => (<svg {...svg} strokeWidth={3}><path d="M20 6 9 17l-5-5" /></svg>)
