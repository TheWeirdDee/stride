export function isMiniPay(): boolean {
  if (typeof window === 'undefined') return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(window as any).ethereum?.isMiniPay
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

