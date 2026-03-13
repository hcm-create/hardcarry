'use client'

import { useState, useEffect } from 'react'
import { CalendarEvent } from '@/types/database'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'

interface EventDialogProps { open: boolean; onOpenChange: (open: boolean) => void; event: CalendarEvent | null; date: Date | null; onSave: (event: Partial<CalendarEvent>) => void; onDelete: (eventId: string) => void }

const platforms = [{ value: 'youtube', label: 'YouTube' }, { value: 'instagram', label: 'Instagram' }, { value: 'tiktok', label: 'TikTok' }, { value: 'facebook', label: 'Facebook' }]
const statuses = [{ value: 'draft', label: 'Draft' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'published', label: 'Published' }]

export function EventDialog({ open, onOpenChange, event, date, onSave, onDelete }: EventDialogProps) {
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [platform, setPlatform] = useState('')
  const [status, setStatus] = useState('scheduled')

  useEffect(() => {
    if (event) { setTitle(event.title); setEventDate(event.date); setPlatform(event.platform || ''); setStatus(event.status) }
    else { setTitle(''); setEventDate(date ? format(date, 'yyyy-MM-dd') : ''); setPlatform(''); setStatus('scheduled') }
  }, [event, date, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !eventDate) return
    onSave({ ...event, title: title.trim(), date: eventDate, platform: platform || null, status: status as 'draft' | 'scheduled' | 'published' })
    onOpenChange(false)
  }

  const handleDelete = () => { if (event?.id) { onDelete(event.id); onOpenChange(false) } }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{event ? 'Edit Event' : 'New Event'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter event title..." autoFocus /></div>
          <div className="space-y-2"><Label htmlFor="date">Date</Label><Input id="date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="platform">Platform</Label><Select value={platform} onValueChange={(v) => setPlatform(v || '')}><SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger><SelectContent>{platforms.map((p) => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={status} onValueChange={(v) => setStatus(v || 'scheduled')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent></Select></div>
          <div className="flex justify-between pt-4">
            {event?.id ? (<Button type="button" variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>) : (<div />)}
            <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={!title.trim() || !eventDate}>{event ? 'Save Changes' : 'Create Event'}</Button></div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
