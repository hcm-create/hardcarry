import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageIcon } from 'lucide-react'
import { CreateThumbnailButton } from './create-thumbnail-button'
import { ThumbnailCard } from './thumbnail-card'
import { LocalThumbnails } from './local-thumbnails'

const TEST_TEAM_ID = '00000000-0000-0000-0000-000000000001'

interface Thumbnail {
  id: string
  title: string
  video_topic: string | null
  prompt: string | null
  image_url: string | null
  status: string
  created_at: string
}

function groupThumbnailsByDate(thumbnails: Thumbnail[]) {
  const groups: Record<string, Thumbnail[]> = {}
  for (const thumbnail of thumbnails) {
    const date = new Date(thumbnail.created_at)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    let dateKey: string
    if (date.toDateString() === today.toDateString()) { dateKey = 'Today' }
    else if (date.toDateString() === yesterday.toDateString()) { dateKey = 'Yesterday' }
    else { dateKey = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined }) }
    if (!groups[dateKey]) { groups[dateKey] = [] }
    groups[dateKey].push(thumbnail)
  }
  return groups
}

export default async function ThumbnailsPage() {
  const supabase = await createClient()
  const teamId = TEST_TEAM_ID
  const { data: thumbnails } = await supabase.from('thumbnails').select('*').eq('team_id', teamId).order('created_at', { ascending: false })
  const { data: headshots } = await supabase.from('headshots').select('*').eq('team_id', teamId)
  const groupedThumbnails = thumbnails ? groupThumbnailsByDate(thumbnails) : {}
  const dateGroups = Object.keys(groupedThumbnails)

  return (
    <div className="flex flex-col h-full">
      <Header title="Thumbnails"><CreateThumbnailButton teamId={teamId} headshots={headshots || []} /></Header>
      <div className="flex-1 p-6 overflow-auto">
        <LocalThumbnails />
        {thumbnails && thumbnails.length > 0 ? (
          <div className="space-y-8">
            {dateGroups.map((dateKey) => (
              <div key={dateKey}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-foreground">{dateKey}</h2>
                  <span className="text-sm text-muted-foreground">{groupedThumbnails[dateKey].length} thumbnail{groupedThumbnails[dateKey].length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groupedThumbnails[dateKey].map((thumbnail) => (<ThumbnailCard key={thumbnail.id} thumbnail={thumbnail} />))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="max-w-md mx-auto mt-12">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4"><ImageIcon className="h-8 w-8 text-orange-500" /></div>
              <CardTitle>No thumbnails yet</CardTitle>
              <CardDescription>Generate your first YouTube thumbnail using AI</CardDescription>
            </CardHeader>
            <div className="flex justify-center pb-6"><CreateThumbnailButton teamId={teamId} headshots={headshots || []} /></div>
          </Card>
        )}
      </div>
    </div>
  )
}
