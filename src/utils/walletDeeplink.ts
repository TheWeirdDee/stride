// Helpers for connecting a wallet on mobile browsers that have no injected
// provider (e.g. Safari/Chrome on a phone). We deep-link the user into a wallet
// app's in-app browser, where window.ethereum exists and the dapp can connect.

export function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent)
}

export function hasInjectedProvider(): boolean {
  return typeof window !== 'undefined' && !!(window as { ethereum?: unknown }).ethereum
}

function currentDapp(): { host: string; href: string } {
  if (typeof window === 'undefined') return { host: 'stride-pay.netlify.app', href: 'https://stride-pay.netlify.app' }
  return { host: window.location.host + window.location.pathname, href: window.location.href }
}

// Opens the current page inside MetaMask's in-app browser.
export function metamaskDeepLink(): string {
  return `https://metamask.app.link/dapp/${currentDapp().host}`
}

// Zerion's universal link to open an external URL in its in-app browser.
export function zerionDeepLink(): string {
  return `https://link.zerion.io/m/?url=${encodeURIComponent(currentDapp().href)}`
}
