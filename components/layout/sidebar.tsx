'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, LayoutDashboard, Film, Calendar, Settings, LogOut, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface SidebarProps { user: { email?: string; user_metadata?: { avatar_url?: string; full_name?: string } } | null; teamName?: string }

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Boards', href: '/boards', icon: LayoutDashboard },
  { name: 'Storyboards', href: '/storyboards', icon: Film },
  { name: 'Thumbnails', href: '/thumbnails', icon: ImageIcon },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
]

export function Sidebar({ user, teamName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => { alert('Sign out disabled for testing') }

  const initials = user?.user_metadata?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase() || user?.email?.[0].toUpperCase() || '?'

  return (
    <aside className={cn("flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "justify-center")}>
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"><Image src="/logo.png" alt="HardCarry Media" width={32} height={32} className="object-contain" /></div>
          {!collapsed && (<span className="font-semibold text-sidebar-foreground truncate">HardCarry</span>)}
        </div>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (<Link key={item.name} href={item.href} title={collapsed ? item.name : undefined} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50", collapsed && "justify-center px-2")}><item.icon className="h-5 w-5 flex-shrink-0" />{!collapsed && <span>{item.name}</span>}</Link>)
        })}
      </nav>
      <div className="p-2">
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className={cn("w-full justify-center text-muted-foreground hover:text-foreground", !collapsed && "justify-start px-3")}>
          {collapsed ? (<ChevronRight className="h-4 w-4" />) : (<><ChevronLeft className="h-4 w-4 mr-2" /><span>Collapse</span></>)}
        </Button>
      </div>
      <Separator />
      <div className="p-2 space-y-1">
        <Link href="/settings" title={collapsed ? "Settings" : undefined} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === '/settings' ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50", collapsed && "justify-center px-2")}>
          <Settings className="h-5 w-5" />{!collapsed && <span>Settings</span>}
        </Link>
      </div>
      <Separator />
      <div className="p-3">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar className="h-8 w-8 flex-shrink-0"><AvatarImage src={user?.user_metadata?.avatar_url} /><AvatarFallback className="text-xs">{initials}</AvatarFallback></Avatar>
          {!collapsed && (<div className="flex-1 min-w-0"><p className="text-sm font-medium text-sidebar-foreground truncate">{user?.user_metadata?.full_name || user?.email}</p><p className="text-xs text-muted-foreground truncate">{user?.email}</p></div>)}
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out" className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", !collapsed && "flex-shrink-0")}><LogOut className="h-4 w-4" /></Button>
        </div>
      </div>
    </aside>
  )
}
