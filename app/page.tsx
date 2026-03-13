import { redirect } from 'next/navigation'

export default async function Home() {
  // Auth disabled for testing - redirect directly to dashboard
  redirect('/dashboard')
}
