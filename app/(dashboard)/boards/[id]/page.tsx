import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BoardHeader } from '@/components/board/board-header'
import { KanbanBoard } from '@/components/board/kanban-board'
import { Board } from '@/types/database'

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'

interface BoardPageProps {
  params: Promise<{ id: string }>
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('boards').select('*').eq('id', id).single()
  if (!data) notFound()
  const board = data as Board

  return (
    <div className="flex flex-col h-full">
      <BoardHeader boardId={board.id} boardName={board.name} />
      <KanbanBoard boardId={board.id} userId={TEST_USER_ID} />
    </div>
  )
}
