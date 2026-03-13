import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LinkButton } from '@/components/ui/link-button'
import { LayoutDashboard, Film, Calendar, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const TEST_TEAM_ID = '00000000-0000-0000-0000-000000000001'

export default async function DashboardPage() {
  const supabase = await createClient()
  const teamId = TEST_TEAM_ID

  const [boardsResult, storyboardsResult, eventsResult] = await Promise.all([
    supabase.from('boards').select('id', { count: 'exact' }).eq('team_id', teamId!),
    supabase.from('storyboards').select('id', { count: 'exact' }).eq('team_id', teamId!),
    supabase.from('calendar_events').select('id', { count: 'exact' }).eq('team_id', teamId!),
  ])

  const stats = [
    { name: 'Boards', value: boardsResult.count || 0, icon: LayoutDashboard, href: '/boards', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { name: 'Storyboards', value: storyboardsResult.count || 0, icon: Film, href: '/storyboards', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { name: 'Scheduled', value: eventsResult.count || 0, icon: Calendar, href: '/calendar', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  ]

  const { data: recentBoards } = await supabase.from('boards').select('*').eq('team_id', teamId!).order('created_at', { ascending: false }).limit(3)

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Link key={stat.name} href={stat.href}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
                </CardHeader>
                <CardContent><div className="text-3xl font-bold">{stat.value}</div></CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Recent Boards</CardTitle><CardDescription>Your latest ideation boards</CardDescription></div>
              <LinkButton href="/boards" size="sm"><Plus className="h-4 w-4 mr-1" />New Board</LinkButton>
            </CardHeader>
            <CardContent>
              {recentBoards && recentBoards.length > 0 ? (
                <div className="space-y-3">
                  {recentBoards.map((board) => (
                    <Link key={board.id} href={`/boards/${board.id}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><LayoutDashboard className="h-5 w-5 text-primary" /></div>
                        <div><p className="font-medium">{board.name}</p><p className="text-xs text-muted-foreground">Created {new Date(board.created_at).toLocaleDateString()}</p></div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground"><LayoutDashboard className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No boards yet</p></div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle><CardDescription>Get started with common tasks</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <LinkButton href="/boards" variant="outline" className="w-full justify-start h-auto py-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3"><LayoutDashboard className="h-5 w-5 text-blue-500" /></div>
                <div className="text-left"><p className="font-medium">Create Ideation Board</p><p className="text-xs text-muted-foreground">Brainstorm new content ideas</p></div>
              </LinkButton>
              <LinkButton href="/storyboards" variant="outline" className="w-full justify-start h-auto py-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mr-3"><Film className="h-5 w-5 text-purple-500" /></div>
                <div className="text-left"><p className="font-medium">New Storyboard</p><p className="text-xs text-muted-foreground">Plan your video scenes</p></div>
              </LinkButton>
              <LinkButton href="/calendar" variant="outline" className="w-full justify-start h-auto py-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mr-3"><Calendar className="h-5 w-5 text-green-500" /></div>
                <div className="text-left"><p className="font-medium">Schedule Content</p><p className="text-xs text-muted-foreground">Plan your publishing calendar</p></div>
              </LinkButton>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
