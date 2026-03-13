'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'

interface CreateBoardButtonProps { teamId: string }

const defaultColumns = [
  { name: 'New Ideas (Gray Zone)', color: '#6b7280', position: 0 },
  { name: 'Ready For Development (Yellow Zone)', color: '#eab308', position: 1 },
  { name: 'Greenlit', color: '#22c55e', position: 2 },
  { name: 'Backlogged', color: '#8b5cf6', position: 3 },
]

export function CreateBoardButton({ teamId }: CreateBoardButtonProps) {
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
      const { data: board, error: boardError } = await supabase.from('boards').insert({ team_id: teamId, name: name.trim() }).select().single()
      if (boardError) throw boardError
      const columnsToInsert = defaultColumns.map((col) => ({ ...col, board_id: board.id }))
      await supabase.from('columns').insert(columnsToInsert)
      setOpen(false)
      setName('')
      router.push(`/boards/${board.id}`)
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : JSON.stringify(error, null, 2)
      console.error('Error creating board:', error)
      alert(`Failed to create board: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}><Plus className="h-4 w-4 mr-2" />New Board</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create New Board</DialogTitle></DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="name">Board Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Content Ideation Board" autoFocus /></div>
          <p className="text-sm text-muted-foreground">Your board will be created with default columns: New Ideas, Ready For Development, Greenlit, and Backlogged.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>{isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create Board</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
