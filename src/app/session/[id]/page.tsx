interface SessionPageProps {
  params: Promise<{ id: string }>
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 max-w-md mx-auto my-12">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
        Active Session
      </h1>
      <p className="text-zinc-600 dark:text-zinc-300 font-mono text-sm mb-4">
        ID: {id}
      </p>
      <p className="text-zinc-500 dark:text-zinc-400 mb-6">
        Live Mapbox route tracking with real-time speed, distance, and duration tracking.
      </p>
      <span className="inline-flex items-center rounded-md bg-rose-50 dark:bg-rose-900/30 px-3 py-1 text-sm font-medium text-rose-700 dark:text-rose-400 ring-1 ring-inset ring-rose-700/10 dark:ring-rose-400/20">
        Placeholder Screen
      </span>
    </div>
  )
}
