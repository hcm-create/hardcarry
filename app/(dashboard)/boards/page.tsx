import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutDashboard, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { CreateBoardButton } from './create-board-button'

const TEST_TEAM_ID = '00000000-0000-0000-0000-000000000001'

export default async function BoardsPage() {
  const supabase = await createClient()
  const teamId = TEST_TEAM_ID
  const { data: boards } = await supabase.from('boards').select('*').eq('team_id', teamId!).order('created_at', { ascending: false })

  return (
    <div className="flex flex-col h-full">
      <Header title="Boards"><CreateBoardButton teamId={teamId!} /></Header>
      <div className="flex-1 p-6">
        {boards && boards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <Link key={board.id} href={`/boards/${board.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center"><LayoutDashboard className="h-6 w-6 text-primary" /></div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="mt-4">{board.name}</CardTitle>
                    <CardDescription>Created {new Date(board.created_at).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="max-w-md mx-auto mt-12">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"><LayoutDashboard className="h-8 w-8 text-primary" /></div>
              <CardTitle>No boards yet</CardTitle>
              <CardDescription>Create your first ideation board to start brainstorming content ideas</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center"><CreateBoardButton teamId={teamId!} /></CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
