import { LinkButton } from '@/components/ui/link-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mb-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            Something went wrong during sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please try signing in again. If the problem persists, contact support.
          </p>
          <LinkButton href="/login" className="w-full">
            Try Again
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  )
}
