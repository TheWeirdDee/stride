'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function SessionCompletePage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
     
    router.replace(`/session/${params.id}`)
  }, [params.id, router])

  return null
}
