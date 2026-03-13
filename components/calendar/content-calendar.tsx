'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CalendarEvent } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import { EventDialog } from './event-dialog'

interface ContentCalendarProps { teamId: string; userId: string }

const platformColors: Record<string, string> = { youtube: 'bg-red-500', instagram: 'bg-pink-500', tiktok: 'bg-cyan-500', facebook: 'bg-blue-600' }
const statusColors: Record<string, string> = { draft: 'bg-muted-foreground', scheduled: 'bg-yellow-500', published: 'bg-green-500' }

export function ContentCalendar({ teamId, userId }: ContentCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('month')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const supabase = createClient()

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const start = view === 'month' ? startOfWeek(startOfMonth(currentDate)) : startOfWeek(currentDate)
      const end = view === 'month' ? endOfWeek(endOfMonth(currentDate)) : endOfWeek(currentDate)
      const { data } = await supabase.from('calendar_events').select('*').eq('team_id', teamId).gte('date', format(start, 'yyyy-MM-dd')).lte('date', format(end, 'yyyy-MM-dd')).order('date')
      if (data) setEvents(data)
    } catch (error) { console.error('Error fetching events:', error) }
    finally { setIsLoading(false) }
  }, [teamId, currentDate, view, supabase])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const navigatePrev = () => { if (view === 'month') setCurrentDate(subMonths(currentDate, 1)); else setCurrentDate(subWeeks(currentDate, 1)) }
  const navigateNext = () => { if (view === 'month') setCurrentDate(addMonths(currentDate, 1)); else setCurrentDate(addWeeks(currentDate, 1)) }
  const goToToday = () => { setCurrentDate(new Date()) }

  const getDaysToDisplay = () => {
    if (view === 'month') { const start = startOfWeek(startOfMonth(currentDate)); const end = endOfWeek(endOfMonth(currentDate)); return eachDayOfInterval({ start, end }) }
    else { const start = startOfWeek(currentDate); const end = endOfWeek(currentDate); return eachDayOfInterval({ start, end }) }
  }

  const getEventsForDay = (day: Date) => events.filter((event) => { const [year, month, dayOfMonth] = event.date.split('-').map(Number); const eventDate = new Date(year, month - 1, dayOfMonth); return isSameDay(eventDate, day) })
  const handleDayClick = (day: Date) => { setSelectedDate(day); setEditingEvent(null); setDialogOpen(true) }
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => { e.stopPropagation(); setEditingEvent(event); const [year, month, dayOfMonth] = event.date.split('-').map(Number); setSelectedDate(new Date(year, month - 1, dayOfMonth)); setDialogOpen(true) }

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      if (eventData.id) await supabase.from('calendar_events').update({ title: eventData.title, date: eventData.date, platform: eventData.platform, status: eventData.status }).eq('id', eventData.id)
      else await supabase.from('calendar_events').insert({ team_id: teamId, title: eventData.title!, date: eventData.date!, platform: eventData.platform, status: eventData.status || 'scheduled', created_by: userId })
      fetchEvents()
    } catch (error) { console.error('Error saving event:', error) }
  }

  const handleDeleteEvent = async (eventId: string) => { try { await supabase.from('calendar_events').delete().eq('id', eventId); fetchEvents() } catch (error) { console.error('Error deleting event:', error) } }

  const days = getDaysToDisplay()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (isLoading) return (<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>)

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={navigatePrev}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={navigateNext}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <h2 className="text-xl font-semibold">{view === 'month' ? format(currentDate, 'MMMM yyyy') : `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}</h2>
          <Button variant="ghost" size="sm" onClick={goToToday}>Today</Button>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={view} onValueChange={(v) => setView(v as 'month' | 'week')}><TabsList><TabsTrigger value="month">Month</TabsTrigger><TabsTrigger value="week">Week</TabsTrigger></TabsList></Tabs>
          <Button onClick={() => { setSelectedDate(new Date()); setEditingEvent(null); setDialogOpen(true) }}><Plus className="h-4 w-4 mr-2" />Add Event</Button>
        </div>
      </div>
      <div className="flex-1 border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-muted/50">{weekDays.map((day) => (<div key={day} className="px-2 py-3 text-center text-sm font-medium text-muted-foreground border-b border-border">{day}</div>))}</div>
        <div className={cn("grid grid-cols-7", view === 'month' ? "grid-rows-5" : "grid-rows-1")} style={{ height: view === 'month' ? 'calc(100% - 44px)' : '100%' }}>
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            return (
              <div key={index} className={cn("border-b border-r border-border p-1 cursor-pointer hover:bg-muted/30 transition-colors", !isCurrentMonth && view === 'month' && "bg-muted/20", view === 'week' && "min-h-[400px]")} onClick={() => handleDayClick(day)}>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-sm w-7 h-7 flex items-center justify-center rounded-full", isToday(day) && "bg-primary text-primary-foreground", !isCurrentMonth && view === 'month' && "text-muted-foreground")}>{format(day, 'd')}</span>
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, view === 'month' ? 3 : 10).map((event) => (
                    <div key={event.id} className={cn("text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80", platformColors[event.platform?.toLowerCase() || ''] || 'bg-muted')} onClick={(e) => handleEventClick(event, e)}>
                      <div className="flex items-center gap-1"><div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", statusColors[event.status])} /><span className="truncate text-white">{event.title}</span></div>
                    </div>
                  ))}
                  {dayEvents.length > (view === 'month' ? 3 : 10) && (<div className="text-xs text-muted-foreground px-1">+{dayEvents.length - (view === 'month' ? 3 : 10)} more</div>)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2"><span>Platforms:</span>{Object.entries(platformColors).map(([platform, color]) => (<Badge key={platform} className={cn(color, 'text-white capitalize')}>{platform}</Badge>))}</div>
        <div className="flex items-center gap-2"><span>Status:</span>{Object.entries(statusColors).map(([status, color]) => (<div key={status} className="flex items-center gap-1"><div className={cn('w-2 h-2 rounded-full', color)} /><span className="capitalize">{status}</span></div>))}</div>
      </div>
      <EventDialog open={dialogOpen} onOpenChange={setDialogOpen} event={editingEvent} date={selectedDate} onSave={handleSaveEvent} onDelete={handleDeleteEvent} />
    </div>
  )
}
