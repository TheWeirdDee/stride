// Client-side notifications. Without a paid push service we can't deliver while
// the app is fully closed, but we CAN: ask permission, fire reminders while the
// app is open/backgrounded, and show them via the service worker so they look
// native. Good enough for "X min left to finish your commitment" nudges.

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  try {
    return (await Notification.requestPermission()) === 'granted'
  } catch {
    return false
  }
}

export function notify(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return
  const opts: NotificationOptions = { body, icon: '/icon.svg', badge: '/icon.svg' }
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => reg.showNotification(title, opts))
        .catch(() => { new Notification(title, opts) })
    } else {
      new Notification(title, opts)
    }
  } catch { /* ignore */ }
}

// Respect the Settings toggles (default on if unset).
export function prefAllows(key: 'sessionReminders' | 'weeklyDigest'): boolean {
  try {
    const p = JSON.parse(localStorage.getItem('stride_prefs') || '{}')
    return p[key] !== false
  } catch {
    return true
  }
}
