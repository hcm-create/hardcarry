'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MoreVertical, Download, Trash2, Eye, Copy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Thumbnail { id: string; title: string; video_topic: string | null; prompt: string | null; image_url: string | null; status: string; created_at: string }
interface ThumbnailCardProps { thumbnail: Thumbnail; isLocal?: boolean; onDelete?: () => void }

export function ThumbnailCard({ thumbnail, isLocal, onDelete }: ThumbnailCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDownload = () => {
    if (!thumbnail.image_url) return
    const link = document.createElement('a')
    link.href = thumbnail.image_url
    link.download = `${thumbnail.title || 'thumbnail'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyUrl = async () => { if (thumbnail.image_url) await navigator.clipboard.writeText(thumbnail.image_url) }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this thumbnail?')) return
    if (isLocal && onDelete) { onDelete(); return }
    setIsDeleting(true)
    try {
      const { error } = await supabase.from('thumbnails').delete().eq('id', thumbnail.id)
      if (error) throw error
      router.refresh()
    } catch (err) { console.error('Failed to delete:', err); alert('Failed to delete thumbnail') }
    finally { setIsDeleting(false) }
  }

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <>
      <Card className="overflow-hidden group">
        <div className="relative aspect-video bg-muted">
          {thumbnail.image_url ? (<img src={thumbnail.image_url} alt={thumbnail.title} className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewOpen(true)} />) : (<div className="w-full h-full flex items-center justify-center text-muted-foreground">{thumbnail.status === 'generating' ? 'Generating...' : 'No image'}</div>)}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="secondary" size="icon" className="h-8 w-8" />}><MoreVertical className="h-4 w-4" /></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPreviewOpen(true)}><Eye className="h-4 w-4 mr-2" />Preview</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload} disabled={!thumbnail.image_url}><Download className="h-4 w-4 mr-2" />Download</DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyUrl} disabled={!thumbnail.image_url}><Copy className="h-4 w-4 mr-2" />Copy Image</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-sm truncate" title={thumbnail.title}>{thumbnail.title}</h3>
          {thumbnail.video_topic && thumbnail.video_topic !== thumbnail.title && (<p className="text-xs text-muted-foreground truncate mt-0.5" title={thumbnail.video_topic}>{thumbnail.video_topic}</p>)}
          <p className="text-xs text-muted-foreground mt-1">{formatTime(thumbnail.created_at)}</p>
        </CardContent>
      </Card>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>{thumbnail.title}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {thumbnail.image_url && (<div className="rounded-lg overflow-hidden border"><img src={thumbnail.image_url} alt={thumbnail.title} className="w-full" /></div>)}
            {thumbnail.video_topic && (<div><p className="text-sm font-medium">Video Topic</p><p className="text-sm text-muted-foreground">{thumbnail.video_topic}</p></div>)}
            {thumbnail.prompt && (<div><p className="text-sm font-medium">Prompt Used</p><p className="text-sm text-muted-foreground whitespace-pre-wrap">{thumbnail.prompt}</p></div>)}
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={handleDownload}><Download className="h-4 w-4 mr-2" />Download</Button><Button onClick={() => setPreviewOpen(false)}>Close</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
