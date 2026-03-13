'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, GripVertical, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface BoardCardProps { card: Card; onEdit: (card: Card) => void; onDelete: (cardId: string) => void }

const platformColors: Record<string, string> = {
  youtube: 'bg-red-500/20 text-red-400 border-red-500/30',
  instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  tiktok: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  twitter: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'long form': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'premium ep': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'full squad': 'bg-green-500/20 text-green-400 border-green-500/30',
}

export function BoardCard({ card, onEdit, onDelete }: BoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const formatDate = (dateStr: string) => { const date = new Date(dateStr); return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }

  return (
    <div ref={setNodeRef} style={style} className={cn("group bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-colors", isDragging && "opacity-50 shadow-lg")} onClick={() => onEdit(card)}>
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" onClick={(e) => e.stopPropagation()}><GripVertical className="h-4 w-4 text-muted-foreground" /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm leading-tight">{card.title}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} render={<Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />}><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(card) }}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(card.id) }} className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {card.description && (<p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.description}</p>)}
          {card.tags && card.tags.length > 0 && (<div className="flex flex-wrap gap-1 mt-2">{card.tags.map((tag) => (<Badge key={tag} variant="outline" className={cn("text-[10px] px-1.5 py-0", platformColors[tag.toLowerCase()] || 'bg-muted')}>{tag}</Badge>))}</div>)}
          <div className="flex items-center justify-between mt-3">
            {card.due_date ? (<div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /><span>{formatDate(card.due_date)}</span></div>) : (<span className="text-xs text-muted-foreground">No due date</span>)}
            {card.assignees && card.assignees.length > 0 && (<div className="flex -space-x-1">{card.assignees.slice(0, 3).map((assignee, i) => (<Avatar key={i} className="h-5 w-5 border-2 border-card"><AvatarFallback className="text-[8px]">{assignee.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>))}{card.assignees.length > 3 && (<div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[8px] border-2 border-card">+{card.assignees.length - 3}</div>)}</div>)}
          </div>
        </div>
      </div>
    </div>
  )
}
