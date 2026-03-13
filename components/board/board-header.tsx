'use client'

import { Search, ChevronLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { LinkButton } from '@/components/ui/link-button'
import { EditableBoardTitle } from './editable-board-title'

interface BoardHeaderProps { boardId: string; boardName: string }

export function BoardHeader({ boardId, boardName }: BoardHeaderProps) {
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background">
      <EditableBoardTitle boardId={boardId} initialTitle={boardName} />
      <div className="flex items-center gap-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." className="w-64 pl-9 bg-muted/50" /></div>
        <LinkButton href="/boards" variant="ghost" size="sm"><ChevronLeft className="h-4 w-4 mr-1" />All Boards</LinkButton>
      </div>
    </header>
  )
}
