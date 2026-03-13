'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'

interface CreateStoryboardButtonProps { teamId: string; userId: string }

export function CreateStoryboardButton({ teamId, userId }: CreateStoryboardButtonProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsLoading(true)
    try {
      const { data: storyboard, error } = await supabase.from('storyboards').insert({ team_id: teamId, name: name.trim(), created_by: userId }).select().single()
      if (error) throw error
      setOpen(false)
      setName('')
      router.push(`/storyboards/${storyboard.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error creating storyboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}><Plus className="h-4 w-4 mr-2" />New Storyboard</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create New Storyboard</DialogTitle></DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="name">Storyboard Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Episode 1 Storyboard" autoFocus /></div>
          <p className="text-sm text-muted-foreground">You can add image frames, sketch frames, and text annotations to your storyboard.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>{isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create Storyboard</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
