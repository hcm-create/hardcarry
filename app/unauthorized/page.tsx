'use client'

import { useSearchParams } from 'next/navigation'
import { LinkButton } from '@/components/ui/link-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldX } from 'lucide-react'

export default function UnauthorizedPage() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')
  const isDomainError = reason === 'domain'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mb-2">
            <ShieldX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            {isDomainError 
              ? 'You must use a HardCarry Media Google Workspace account to sign in.'
              : 'Your email is not on the invite list for HardCarry Media.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isDomainError 
              ? 'Please sign in with your @hardcarry.media email address.'
              : 'This workspace is invite-only. Please contact your team administrator to request access.'}
          </p>
          <LinkButton href="/login" variant="outline" className="w-full">
            Back to Login
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  )
}
