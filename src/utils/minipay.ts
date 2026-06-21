export function isMiniPay(): boolean {
  if (typeof window === 'undefined') return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(window as any).ethereum?.isMiniPay
}

/**
 * Force legacy (type-0) transactions for every wallet on Celo.
 *
 * Celo's EIP-1559 fee RPCs are flaky across wallets: MiniPay rejects
 * `eth_maxPriorityFeePerGas` / `eth_feeHistory` with `-32601 (not whitelisted)`,
 * and MetaMask often shows "Network fee Unavailable" and fails to submit. Legacy
 * txs price gas via `eth_gasPrice`, which works everywhere, so contract writes go
 * through reliably in both MiniPay and MetaMask.
 */
export function celoTxOverrides(): { type: 'legacy' } {
  return { type: 'legacy' }
}

/**
 * Best-effort "is this a desktop browser?" check — no MiniPay, no touch, and a
 * non-mobile user agent. Used to warn that GPS won't move without real walking,
 * and to point the user at Demo mode or MiniPay.
 */
export function isLikelyDesktop(): boolean {
  if (typeof window === 'undefined') return false
  if (isMiniPay()) return false
  const noTouch = (navigator.maxTouchPoints ?? 0) === 0
  const notMobileUA = !/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  return noTouch && notMobileUA
}

export function isDemoOn(): boolean {
  try { return typeof window !== 'undefined' && localStorage.getItem('stride_demo_mode') === '1' } catch { return false }
}

export function registerMiniPayHook() {
  if (typeof window === 'undefined') return
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).MiniPay = {
    onload: () => {
      console.log("Stride loaded in MiniPay")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).ethereum?.isMiniPay) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).ethereum.request({ method: 'eth_requestAccounts' })
      }
    },
    version: "1.0.0",
    appName: "Stride",
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).ethereum?.isMiniPay) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ethereum.request({ method: 'eth_requestAccounts' })
  }
}

