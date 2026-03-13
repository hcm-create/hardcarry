import { Header } from '@/components/layout/header'
import { ContentCalendar } from '@/components/calendar/content-calendar'

const TEST_TEAM_ID = '00000000-0000-0000-0000-000000000001'
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'

export default async function CalendarPage() {
  const teamId = TEST_TEAM_ID
  const userId = TEST_USER_ID

  return (
    <div className="flex flex-col h-full">
      <Header title="Content Calendar" />
      <div className="flex-1 overflow-hidden"><ContentCalendar teamId={teamId} userId={userId} /></div>
    </div>
  )
}
