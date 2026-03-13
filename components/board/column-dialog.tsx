'use client'

import { useState, useEffect } from 'react'
import { Column } from '@/types/database'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ColumnDialogProps { open: boolean; onOpenChange: (open: boolean) => void; column: Partial<Column> | null; onSave: (column: Partial<Column>) => void }

const colorOptions = [
  { value: '#6b7280', name: 'Gray' }, { value: '#ef4444', name: 'Red' }, { value: '#f97316', name: 'Orange' },
  { value: '#eab308', name: 'Yellow' }, { value: '#22c55e', name: 'Green' }, { value: '#06b6d4', name: 'Cyan' },
  { value: '#3b82f6', name: 'Blue' }, { value: '#8b5cf6', name: 'Purple' }, { value: '#ec4899', name: 'Pink' },
]

export function ColumnDialog({ open, onOpenChange, column, onSave }: ColumnDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6b7280')

  useEffect(() => {
    if (column) { setName(column.name || ''); setColor(column.color || '#6b7280') }
    else { setName(''); setColor('#6b7280') }
  }, [column, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ ...column, name: name.trim(), color })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{column?.id ? 'Edit Column' : 'New Column'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., New Ideas, In Progress..." autoFocus /></div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option) => (<button key={option.value} type="button" onClick={() => setColor(option.value)} className={cn("w-8 h-8 rounded-full transition-all", color === option.value ? "ring-2 ring-offset-2 ring-offset-background ring-primary" : "hover:scale-110")} style={{ backgroundColor: option.value }} title={option.name} />))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim()}>{column?.id ? 'Save Changes' : 'Create Column'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
