'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Column, Card } from '@/types/database'
import { BoardCard } from './board-card'
import { Button } from '@/components/ui/button'
import { Plus, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface BoardColumnProps { column: Column; cards: Card[]; onAddCard: (columnId: string) => void; onEditCard: (card: Card) => void; onDeleteCard: (cardId: string) => void; onEditColumn: (column: Column) => void; onDeleteColumn: (columnId: string) => void }

export function BoardColumn({ column, cards, onAddCard, onEditCard, onDeleteCard, onEditColumn, onDeleteColumn }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      <div className="flex items-center justify-between px-2 py-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
          <h3 className="font-medium text-sm">{column.name}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{cards.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddCard(column.id)}><Plus className="h-4 w-4" /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7" />}><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditColumn(column)}>Edit Column</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteColumn(column.id)} className="text-destructive">Delete Column</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div ref={setNodeRef} className={cn("flex-1 rounded-lg p-2 transition-colors min-h-[200px]", isOver ? "bg-primary/10" : "bg-muted/30")}>
        <ScrollArea className="h-[calc(100vh-220px)]">
          <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 pr-2">
              {cards.map((card) => (<BoardCard key={card.id} card={card} onEdit={onEditCard} onDelete={onDeleteCard} />))}
            </div>
          </SortableContext>
          {cards.length === 0 && (<button onClick={() => onAddCard(column.id)} className="w-full p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg text-muted-foreground text-sm hover:border-primary/50 hover:text-primary transition-colors">+ Add a card</button>)}
        </ScrollArea>
      </div>
    </div>
  )
}
