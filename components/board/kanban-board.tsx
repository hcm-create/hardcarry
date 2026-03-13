'use client'

import { useState, useEffect, useCallback } from 'react'
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { createClient } from '@/lib/supabase/client'
import { Column, Card, ColumnWithCards } from '@/types/database'
import { BoardColumn } from './board-column'
import { BoardCard } from './board-card'
import { CardDialog } from './card-dialog'
import { ColumnDialog } from './column-dialog'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface KanbanBoardProps { boardId: string; userId: string }

export function KanbanBoard({ boardId, userId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<ColumnWithCards[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [cardDialogOpen, setCardDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Partial<Card> | null>(null)
  const [targetColumnId, setTargetColumnId] = useState<string>('')
  const [columnDialogOpen, setColumnDialogOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState<Partial<Column> | null>(null)
  const supabase = createClient()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const fetchBoard = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: columnsData } = await supabase.from('columns').select('*').eq('board_id', boardId).order('position')
      if (columnsData) {
        const columnsWithCards = await Promise.all(columnsData.map(async (col) => {
          const { data: cards } = await supabase.from('cards').select('*').eq('column_id', col.id).order('position')
          return { ...col, cards: cards || [] }
        }))
        setColumns(columnsWithCards)
      }
    } catch (error) { console.error('Error fetching board:', error) }
    finally { setIsLoading(false) }
  }, [boardId, supabase])

  useEffect(() => { fetchBoard() }, [fetchBoard])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const card = columns.flatMap((col) => col.cards).find((c) => c.id === active.id)
    if (card) setActiveCard(card)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string
    const activeColumn = columns.find((col) => col.cards.some((card) => card.id === activeId))
    const overColumn = columns.find((col) => col.id === overId || col.cards.some((card) => card.id === overId))
    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return
    setColumns((prev) => {
      const activeCards = [...activeColumn.cards]
      const overCards = [...overColumn.cards]
      const activeIndex = activeCards.findIndex((card) => card.id === activeId)
      const [movedCard] = activeCards.splice(activeIndex, 1)
      const overIndex = overCards.findIndex((card) => card.id === overId)
      if (overIndex >= 0) overCards.splice(overIndex, 0, { ...movedCard, column_id: overColumn.id })
      else overCards.push({ ...movedCard, column_id: overColumn.id })
      return prev.map((col) => {
        if (col.id === activeColumn.id) return { ...col, cards: activeCards }
        if (col.id === overColumn.id) return { ...col, cards: overCards }
        return col
      })
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string
    const activeColumn = columns.find((col) => col.cards.some((card) => card.id === activeId))
    if (!activeColumn) return
    const oldIndex = activeColumn.cards.findIndex((card) => card.id === activeId)
    const newIndex = activeColumn.cards.findIndex((card) => card.id === overId)
    if (oldIndex !== newIndex && newIndex >= 0) {
      const newCards = arrayMove(activeColumn.cards, oldIndex, newIndex)
      setColumns((prev) => prev.map((col) => col.id === activeColumn.id ? { ...col, cards: newCards } : col))
      await Promise.all(newCards.map((card, index) => supabase.from('cards').update({ position: index, column_id: activeColumn.id }).eq('id', card.id)))
    } else {
      const card = activeColumn.cards.find((c) => c.id === activeId)
      if (card) await supabase.from('cards').update({ column_id: activeColumn.id, position: oldIndex }).eq('id', card.id)
    }
  }

  const handleAddCard = (columnId: string) => { setTargetColumnId(columnId); setEditingCard(null); setCardDialogOpen(true) }
  const handleEditCard = (card: Card) => { setTargetColumnId(card.column_id); setEditingCard(card); setCardDialogOpen(true) }

  const handleSaveCard = async (cardData: Partial<Card>) => {
    try {
      if (cardData.id) {
        await supabase.from('cards').update({ title: cardData.title, description: cardData.description, due_date: cardData.due_date, tags: cardData.tags }).eq('id', cardData.id)
      } else {
        const column = columns.find((c) => c.id === cardData.column_id)
        const position = column ? column.cards.length : 0
        await supabase.from('cards').insert({ column_id: cardData.column_id!, title: cardData.title!, description: cardData.description, due_date: cardData.due_date, tags: cardData.tags || [], position, created_by: userId, assignees: [] })
      }
      fetchBoard()
    } catch (error) { console.error('Error saving card:', error) }
  }

  const handleDeleteCard = async (cardId: string) => { try { await supabase.from('cards').delete().eq('id', cardId); fetchBoard() } catch (error) { console.error('Error deleting card:', error) } }
  const handleAddColumn = () => { setEditingColumn(null); setColumnDialogOpen(true) }
  const handleEditColumn = (column: Column) => { setEditingColumn(column); setColumnDialogOpen(true) }

  const handleSaveColumn = async (columnData: Partial<Column>) => {
    try {
      if (columnData.id) await supabase.from('columns').update({ name: columnData.name, color: columnData.color }).eq('id', columnData.id)
      else await supabase.from('columns').insert({ board_id: boardId, name: columnData.name!, color: columnData.color || '#6b7280', position: columns.length })
      fetchBoard()
    } catch (error) { console.error('Error saving column:', error) }
  }

  const handleDeleteColumn = async (columnId: string) => { try { await supabase.from('columns').delete().eq('id', columnId); fetchBoard() } catch (error) { console.error('Error deleting column:', error) } }

  if (isLoading) return (<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>)

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <ScrollArea className="w-full">
          <div className="flex gap-4 p-6 min-h-[calc(100vh-130px)]">
            {columns.map((column) => (<BoardColumn key={column.id} column={column} cards={column.cards} onAddCard={handleAddCard} onEditCard={handleEditCard} onDeleteCard={handleDeleteCard} onEditColumn={handleEditColumn} onDeleteColumn={handleDeleteColumn} />))}
            <div className="w-72 flex-shrink-0"><Button variant="outline" className="w-full h-12 border-dashed" onClick={handleAddColumn}><Plus className="h-4 w-4 mr-2" />Add Column</Button></div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <DragOverlay>{activeCard && (<div className="w-64"><BoardCard card={activeCard} onEdit={() => {}} onDelete={() => {}} /></div>)}</DragOverlay>
      </DndContext>
      <CardDialog open={cardDialogOpen} onOpenChange={setCardDialogOpen} card={editingCard} onSave={handleSaveCard} columnId={targetColumnId} />
      <ColumnDialog open={columnDialogOpen} onOpenChange={setColumnDialogOpen} column={editingColumn} onSave={handleSaveColumn} />
    </>
  )
}
