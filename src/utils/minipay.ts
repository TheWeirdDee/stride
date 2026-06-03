export function isMiniPay(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).ethereum?.isMiniPay
}

export function registerMiniPayHook() {
  if (typeof window === 'undefined') return
  if ((window as any).ethereum?.isMiniPay) {
    (window as any).ethereum.request({ method: 'eth_requestAccounts' })
  }
}
