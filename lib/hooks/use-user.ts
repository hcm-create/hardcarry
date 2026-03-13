'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { TeamMember, Team } from '@/types/database'

interface UserWithTeam { user: User | null; membership: TeamMember | null; team: Team | null; isLoading: boolean }

export function useUser(): UserWithTeam {
  const [user, setUser] = useState<User | null>(null)
  const [membership, setMembership] = useState<TeamMember | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
          const { data: membershipData } = await supabase.from('team_members').select('*, teams(*)').eq('user_id', user.id).eq('status', 'active').single()
          if (membershipData) {
            const { teams, ...member } = membershipData as TeamMember & { teams: Team }
            setMembership(member)
            setTeam(teams)
          }
        }
      } catch (error) { console.error('Error fetching user:', error) }
      finally { setIsLoading(false) }
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) { setMembership(null); setTeam(null) }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return { user, membership, team, isLoading }
}
