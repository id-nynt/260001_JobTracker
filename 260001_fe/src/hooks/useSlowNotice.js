import { useEffect, useState } from 'react'

/** True once `active` has been true for `delayMs`, e.g. to explain a request that is taking long. */
export function useSlowNotice(active, delayMs = 4000) {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (!active) {
      setSlow(false)
      return undefined
    }
    const timer = setTimeout(() => setSlow(true), delayMs)
    return () => clearTimeout(timer)
  }, [active, delayMs])

  return slow
}
