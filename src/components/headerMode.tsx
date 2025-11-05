import React from 'react'

export type HeaderMode = 'overlay' | 'solid'

type Ctx = {
  mode: HeaderMode
  setMode: (m: HeaderMode) => void
}

const HeaderModeContext = React.createContext<Ctx | null>(null)

export function HeaderModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<HeaderMode>('overlay')
  const value = React.useMemo(() => ({ mode, setMode }), [mode])
  return <HeaderModeContext.Provider value={value}>{children}</HeaderModeContext.Provider>
}

export function useHeaderMode() {
  const ctx = React.useContext(HeaderModeContext)
  if (!ctx) throw new Error('useHeaderMode must be used within HeaderModeProvider')
  return ctx
}

/**
 * Convenience hook: set header mode for the lifetime of this component.
 * Reverts to overlay on unmount unless some other component sets it.
 */
export function useHeaderStyle(desired: HeaderMode) {
  const { setMode } = useHeaderMode()
  React.useEffect(() => {
    setMode(desired)
    return () => setMode('overlay')
  }, [desired, setMode])
}
