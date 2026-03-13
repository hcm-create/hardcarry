import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { StoryboardCanvas } from '@/components/storyboard/storyboard-canvas'
import { LinkButton } from '@/components/ui/link-button'
import { ChevronLeft } from 'lucide-react'
import { Storyboard } from '@/types/database'

interface StoryboardPageProps { params: Promise<{ id: string }> }

export default async function StoryboardPage({ params }: StoryboardPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('storyboards').select('*').eq('id', id).single()
  if (!data) notFound()
  const storyboard = data as Storyboard

  return (
    <div className="flex flex-col h-full">
      <Header title={storyboard.name}><LinkButton href="/storyboards" variant="ghost" size="sm"><ChevronLeft className="h-4 w-4 mr-1" />All Storyboards</LinkButton></Header>
      <div className="flex-1"><StoryboardCanvas storyboardId={storyboard.id} /></div>
    </div>
  )
}
