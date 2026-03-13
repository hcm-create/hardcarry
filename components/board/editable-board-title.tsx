'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface EditableBoardTitleProps { boardId: string; initialTitle: string }

export function EditableBoardTitle({ boardId, initialTitle }: EditableBoardTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { if (isEditing && inputRef.current) { inputRef.current.focus(); inputRef.current.select() } }, [isEditing])

  const handleSave = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle || trimmedTitle === initialTitle) { setTitle(initialTitle); setIsEditing(false); return }
    setIsSaving(true)
    try {
      const { error } = await supabase.from('boards').update({ name: trimmedTitle }).eq('id', boardId)
      if (error) throw error
      setIsEditing(false)
      router.refresh()
    } catch (error) { console.error('Error updating board title:', error); setTitle(initialTitle) }
    finally { setIsSaving(false) }
  }

  const handleCancel = () => { setTitle(initialTitle); setIsEditing(false) }
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSave(); else if (e.key === 'Escape') handleCancel() }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input ref={inputRef} value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleSave} disabled={isSaving} className="text-xl font-semibold h-9 w-64" />
        <Button size="icon" variant="ghost" onClick={handleSave} disabled={isSaving} className="h-8 w-8"><Check className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" onClick={handleCancel} disabled={isSaving} className="h-8 w-8"><X className="h-4 w-4" /></Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <h1 className="text-xl font-semibold">{initialTitle}</h1>
      <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)} className={cn("h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity", "text-muted-foreground hover:text-foreground")}><Pencil className="h-4 w-4" /></Button>
    </div>
  )
}
