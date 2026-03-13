import { Sidebar } from '@/components/layout/sidebar'

// Test user for development - remove when enabling auth
const TEST_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@hardcarry.media',
  user_metadata: {
    full_name: 'Test User',
    avatar_url: undefined,
  },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth disabled for testing - using mock user
  const user = TEST_USER
  const teamName = 'HardCarry Media'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={user} teamName={teamName} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
