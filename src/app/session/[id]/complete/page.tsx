interface SessionCompletePageProps {
  params: Promise<{ id: string }>
}

export default async function SessionCompletePage({ params }: SessionCompletePageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 max-w-md mx-auto my-12">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
        Session Complete!
      </h1>
      <p className="text-zinc-600 dark:text-zinc-300 font-mono text-sm mb-4">
        ID: {id}
      </p>
      <p className="text-zinc-500 dark:text-zinc-400 mb-6">
        Submit verifier proof on-chain to unlock your staked cUSD plus bonus pool reward payouts.
      </p>
      <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-900/30 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-700/10 dark:ring-amber-400/20">
        Placeholder Screen
      </span>
    </div>
  )
}
