'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/types/database'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CardDialogProps { open: boolean; onOpenChange: (open: boolean) => void; card: Partial<Card> | null; onSave: (card: Partial<Card>) => void; columnId: string }

const platformOptions = [
  { value: 'YouTube', color: 'bg-red-500/20 text-red-400' },
  { value: 'Instagram', color: 'bg-pink-500/20 text-pink-400' },
  { value: 'TikTok', color: 'bg-cyan-500/20 text-cyan-400' },
  { value: 'Twitter', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'Long Form', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'Premium Ep', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'Full Squad', color: 'bg-green-500/20 text-green-400' },
]

export function CardDialog({ open, onOpenChange, card, onSave, columnId }: CardDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    if (card) { setTitle(card.title || ''); setDescription(card.description || ''); setDueDate(card.due_date || ''); setTags(card.tags || []) }
    else { setTitle(''); setDescription(''); setDueDate(''); setTags([]) }
  }, [card, open])

  const toggleTag = (tag: string) => { setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]) }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ ...card, title: title.trim(), description: description.trim() || null, due_date: dueDate || null, tags, column_id: card?.column_id || columnId })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{card?.id ? 'Edit Card' : 'New Card'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter card title..." autoFocus /></div>
          <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a description..." rows={3} /></div>
          <div className="space-y-2"><Label htmlFor="dueDate">Due Date</Label><Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {platformOptions.map((platform) => (<button key={platform.value} type="button" onClick={() => toggleTag(platform.value)} className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border", tags.includes(platform.value) ? `${platform.color} border-current` : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80")}>{platform.value}{tags.includes(platform.value) && (<X className="h-3 w-3" />)}</button>))}
            </div>
          </div>
          {tags.length > 0 && (<div className="flex flex-wrap gap-1">{tags.map((tag) => (<Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>))}</div>)}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!title.trim()}>{card?.id ? 'Save Changes' : 'Create Card'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
