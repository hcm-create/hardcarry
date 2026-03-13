import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Film, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { CreateStoryboardButton } from './create-storyboard-button'

const TEST_TEAM_ID = '00000000-0000-0000-0000-000000000001'
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'

export default async function StoryboardsPage() {
  const supabase = await createClient()
  const teamId = TEST_TEAM_ID
  const userId = TEST_USER_ID
  const { data: storyboards } = await supabase.from('storyboards').select('*, cards(title)').eq('team_id', teamId!).order('created_at', { ascending: false })

  return (
    <div className="flex flex-col h-full">
      <Header title="Storyboards"><CreateStoryboardButton teamId={teamId} userId={userId} /></Header>
      <div className="flex-1 p-6">
        {storyboards && storyboards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {storyboards.map((storyboard) => (
              <Link key={storyboard.id} href={`/storyboards/${storyboard.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center"><Film className="h-6 w-6 text-purple-500" /></div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="mt-4">{storyboard.name}</CardTitle>
                    <CardDescription>
                      {storyboard.cards ? <span>Linked to: {(storyboard.cards as { title: string }).title}</span> : <span>Created {new Date(storyboard.created_at).toLocaleDateString()}</span>}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="max-w-md mx-auto mt-12">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4"><Film className="h-8 w-8 text-purple-500" /></div>
              <CardTitle>No storyboards yet</CardTitle>
              <CardDescription>Create your first storyboard to plan your video scenes</CardDescription>
            </CardHeader>
            <div className="flex justify-center pb-6"><CreateStoryboardButton teamId={teamId} userId={userId} /></div>
          </Card>
        )}
      </div>
    </div>
  )
}
