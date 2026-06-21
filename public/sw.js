// Stride service worker — minimal: makes the app installable and gives an
// offline fallback for navigations. Deliberately does NOT cache Next.js build
// chunks (those are hashed and best fetched fresh to avoid stale UI).
const CACHE = 'stride-v1'
const SHELL = ['/', '/explore', '/manifest.webmanifest', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  // Network-first for page navigations, with an offline fallback to the shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then((r) => r || caches.match('/explore') || caches.match('/')))
    )
  }
})
