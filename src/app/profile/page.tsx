export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 max-w-md mx-auto my-12">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
        Your Profile
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-6">
        Scaffolding user stats, activity heatmaps, and past commitments history.
      </p>
      <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-sm font-medium text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/20">
        Placeholder Screen
      </span>
    </div>
  )
}
