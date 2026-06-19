export function isMiniPay(): boolean {
  if (typeof window === 'undefined') return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(window as any).ethereum?.isMiniPay
}

/**
 * MiniPay's in-app provider only whitelists a limited set of JSON-RPC methods.
 * viem's default EIP-1559 flow calls `eth_maxPriorityFeePerGas` / `eth_feeHistory`,
 * which MiniPay rejects with `-32601: rpc method is not whitelisted`. Forcing a
 * legacy transaction makes viem price gas via `eth_gasPrice` (whitelisted), so
 * contract writes go through. Returns {} for normal wallets so MetaMask etc. are
 * unchanged.
 */
export function miniPayTxOverrides(): { type: 'legacy' } | Record<string, never> {
  return isMiniPay() ? { type: 'legacy' } : {}
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

