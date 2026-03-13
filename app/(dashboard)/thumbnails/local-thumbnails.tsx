'use client'

import { useState, useEffect } from 'react'
import { ThumbnailCard } from './thumbnail-card'
import { Button } from '@/components/ui/button'
import { HardDrive, Trash2 } from 'lucide-react'

interface LocalThumbnail {
  id: string
  title: string
  video_topic: string | null
  image_url: string
  created_at: string
  savedToDb: boolean
}

export function LocalThumbnails() {
  const [localThumbnails, setLocalThumbnails] = useState<LocalThumbnail[]>([])
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    const stored = localStorage.getItem('localThumbnails')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const unsaved = parsed.filter((t: LocalThumbnail) => !t.savedToDb)
        setLocalThumbnails(unsaved)
      } catch { setLocalThumbnails([]) }
    }
  }, [])

  const clearLocalThumbnails = () => { localStorage.removeItem('localThumbnails'); setLocalThumbnails([]) }
  const removeLocalThumbnail = (id: string) => {
    const stored = localStorage.getItem('localThumbnails')
    if (stored) {
      const parsed = JSON.parse(stored)
      const filtered = parsed.filter((t: LocalThumbnail) => t.id !== id)
      localStorage.setItem('localThumbnails', JSON.stringify(filtered))
      setLocalThumbnails(localThumbnails.filter(t => t.id !== id))
    }
  }

  if (!hasMounted || localThumbnails.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <HardDrive className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-foreground">Saved Locally</h2>
        <span className="text-sm text-muted-foreground">{localThumbnails.length} thumbnail{localThumbnails.length !== 1 ? 's' : ''} (not synced to cloud)</span>
        <Button variant="ghost" size="sm" onClick={clearLocalThumbnails} className="ml-auto text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4 mr-1" />Clear All</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {localThumbnails.map((thumbnail) => (<ThumbnailCard key={thumbnail.id} thumbnail={{ ...thumbnail, prompt: null, status: 'local' }} onDelete={() => removeLocalThumbnail(thumbnail.id)} isLocal />))}
      </div>
    </div>
  )
}
