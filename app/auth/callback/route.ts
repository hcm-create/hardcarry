import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_DOMAINS = [
  'hardcarry.media',
  // Add more allowed Google Workspace domains here
]

function isAllowedDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return ALLOWED_DOMAINS.includes(domain)
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user && user.email) {
      // Check if user's email domain is allowed
      if (!isAllowedDomain(user.email)) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/unauthorized?reason=domain`)
      }

      // Check if user is an invited team member
      const { data: membership } = await supabase
        .from('team_members')
        .select('id, team_id, status')
        .eq('email', user.email)
        .single()

      if (membership) {
        // Update membership to active and link user_id
        if (membership.status === 'pending') {
          await supabase
            .from('team_members')
            .update({ 
              user_id: user.id, 
              status: 'active' 
            })
            .eq('id', membership.id)
        }
        
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        // User is not invited - sign them out and redirect to unauthorized page
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/unauthorized`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
