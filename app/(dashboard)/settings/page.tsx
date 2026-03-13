import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { TeamSettings } from '@/components/settings/team-settings'

const TEST_TEAM_ID = '00000000-0000-0000-0000-000000000001'
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'

export default async function SettingsPage() {
  const supabase = await createClient()
  const team = { id: TEST_TEAM_ID, name: 'HardCarry Media', created_at: new Date().toISOString() }
  const isAdmin = true
  const { data: members } = await supabase.from('team_members').select('*').eq('team_id', team.id).order('created_at')

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" />
      <div className="flex-1 overflow-auto"><TeamSettings team={team} members={members || []} currentUserId={TEST_USER_ID} isAdmin={isAdmin} /></div>
    </div>
  )
}
