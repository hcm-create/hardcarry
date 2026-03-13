'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface HeaderProps { title: string; children?: React.ReactNode }

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="w-64 pl-9 bg-muted/50" />
        </div>
        {children}
      </div>
    </header>
  )
}
