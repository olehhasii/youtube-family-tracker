import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Board } from '../../data/board'
import { useAdmin, useSignOut } from '../../data/hooks/use-auth'
import { RADIUS, islandContentSwap, islandEntrance, islandSpring } from '../../shared/lib/motion'
import { useIslandToast, useSettleToast, useToast } from '../../shared/toast/use-toast'
import { BackButton } from './components/BackButton'
import { MenuContent } from './components/MenuContent'
import { Panel } from './components/Panel'
import { RestContent } from './components/RestContent'
import { SignInForm } from './components/SignInForm'
import { ToastContent } from './components/ToastContent'
import { useIslandFocus } from './hooks/use-island-focus'

type Mode = 'rest' | 'menu' | 'about' | 'signIn'

export function Island({ board }: { board: Board | undefined }) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const { toast, runAction, setPaused } = useIslandToast()
  const showToast = useToast()
  const settleToast = useSettleToast()
  const admin = useAdmin()
  const signOut = useSignOut()
  const [{ mode, from }, setView] = useState<{ mode: Mode; from: Mode | null }>({ mode: 'rest', from: null })
  const go = (next: Mode) => setView({ mode: next, from: mode })
  const shown = toast ? 'toast' : mode // a toast covers whatever is open, which comes back after it
  const { root, onEnter, onFocus, onBlur } = useIslandFocus({ viewKey: toast ? `toast-${toast.id}` : mode, shown, hasAction: !!toast?.action })

  const back = () => go(mode === 'menu' ? 'rest' : 'menu')
  const signedIn = () => {
    go('rest')
    showToast(t('island.signedIn'))
  }
  const leave = async () => {
    try {
      await settleToast() // a removal waiting on its undo toast still needs the Admin's rights
      await signOut.mutateAsync()
      go('rest')
      showToast(t('island.signedOut'))
    } catch {
      showToast(t('island.signOutFailed'), { tone: 'error' })
    }
  }

  const swap = islandContentSwap(reduce)
  const entrance = islandEntrance(reduce)
  const panel = { swap, onEnter }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-safe">
      {/* outside the morphing content so every toast is heard; keyed so a repeated text still counts as a change */}
      <p role="status" className="sr-only">
        {toast && <span key={toast.id}>{toast.text}</span>}
      </p>
      <motion.section
        ref={root}
        layout={!reduce}
        {...entrance}
        transition={{ ...entrance.transition, layout: islandSpring }}
        tabIndex={-1} // holds focus while a toast covers the buttons
        aria-label={t('island.label')}
        onFocus={(e) => {
          onFocus()
          // only keyboard focus holds the timer: a tap leaves focus behind on phones, which would hold it forever
          if (e.target.matches(':focus-visible')) setPaused(true)
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
          onBlur(e)
        }}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(root.current?.contains(document.activeElement) ?? false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && mode !== 'rest') back() // also under a toast, for what comes back after it
        }}
        className="pointer-events-auto max-w-full overflow-hidden border border-island-fg/5 bg-island p-1.5 text-sm text-island-fg shadow-island outline-none"
        style={{ borderRadius: RADIUS.island }} // inline so Motion can correct it while the island morphs
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {toast && (
            <Panel key={`toast-${toast.id}`} name="toast" {...panel} className={`flex items-center gap-3 ${toast.action ? '' : 'pr-4'}`}>
              <ToastContent toast={toast} onAction={runAction} />
            </Panel>
          )}

          {shown === 'rest' && (
            <Panel key="rest" name="rest" {...panel} className="flex items-center gap-2">
              <RestContent board={board} onOpenMenu={() => go('menu')} />
            </Panel>
          )}

          {shown === 'menu' && (
            <Panel key="menu" name="menu" {...panel} className="flex items-center gap-1" role="group" aria-label={t('island.menu')}>
              <MenuContent
                admin={admin}
                from={from}
                onBack={back}
                onAbout={() => go('about')}
                onSignIn={() => go('signIn')}
                onSignOut={() => void leave()}
              />
            </Panel>
          )}

          {shown === 'about' && (
            <Panel key="about" name="about" {...panel} className="flex w-80 max-w-full flex-col items-start gap-3 p-2.5">
              <p className="leading-relaxed text-island-fg/80">{t('island.aboutText')}</p>
              <BackButton data-autofocus onClick={back} />
            </Panel>
          )}

          {shown === 'signIn' && (
            <Panel key="signIn" name="signIn" {...panel} className="w-80 max-w-full p-2.5">
              <SignInForm onSignedIn={signedIn} back={<BackButton type="button" onClick={back} />} />
            </Panel>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  )
}
