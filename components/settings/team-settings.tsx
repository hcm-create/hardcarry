'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TeamMember } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Plus, Loader2, Trash2, Mail, Shield, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TeamSettingsProps { team: { id: string; name: string; created_at: string }; members: TeamMember[]; currentUserId: string; isAdmin: boolean }

export function TeamSettings({ team, members, currentUserId, isAdmin }: TeamSettingsProps) {
  const [teamName, setTeamName] = useState(team.name)
  const [isSavingTeam, setIsSavingTeam] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member')
  const [isInviting, setIsInviting] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSaveTeamName = async () => {
    if (!teamName.trim() || teamName === team.name) return
    setIsSavingTeam(true)
    try { await supabase.from('teams').update({ name: teamName.trim() }).eq('id', team.id); router.refresh() }
    catch (error) { console.error('Error updating team:', error) }
    finally { setIsSavingTeam(false) }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setIsInviting(true)
    try { await supabase.from('team_members').insert({ team_id: team.id, email: inviteEmail.trim().toLowerCase(), role: inviteRole, invited_by: currentUserId, status: 'pending' }); setInviteEmail(''); setInviteRole('member'); setInviteDialogOpen(false); router.refresh() }
    catch (error) { console.error('Error inviting member:', error) }
    finally { setIsInviting(false) }
  }

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'member') => { try { await supabase.from('team_members').update({ role: newRole }).eq('id', memberId); router.refresh() } catch (error) { console.error('Error updating role:', error) } }
  const handleRemoveMember = async (memberId: string) => { try { await supabase.from('team_members').delete().eq('id', memberId); router.refresh() } catch (error) { console.error('Error removing member:', error) } }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader><CardTitle>Team Settings</CardTitle><CardDescription>Manage your team name and preferences</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <div className="flex gap-2">
              <Input id="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} disabled={!isAdmin} />
              {isAdmin && (<Button onClick={handleSaveTeamName} disabled={!teamName.trim() || teamName === team.name || isSavingTeam}>{isSavingTeam && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>)}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Created on {new Date(team.created_at).toLocaleDateString()}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Team Members</CardTitle><CardDescription>{members.length} member{members.length !== 1 ? 's' : ''} in your team</CardDescription></div>
            {isAdmin && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger render={<Button />}><Plus className="h-4 w-4 mr-2" />Invite Member</DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
                  <form onSubmit={handleInviteMember} className="space-y-4">
                    <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@example.com" autoFocus /></div>
                    <div className="space-y-2"><Label htmlFor="role">Role</Label><Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'admin' | 'member')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="member">Member</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select><p className="text-xs text-muted-foreground">Admins can invite/remove members and manage team settings</p></div>
                    <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={!inviteEmail.trim() || isInviting}>{isInviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Send Invite</Button></div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10"><AvatarFallback>{member.email.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <div>
                    <div className="flex items-center gap-2"><p className="font-medium">{member.email}</p>{member.user_id === currentUserId && (<Badge variant="outline" className="text-xs">You</Badge>)}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {member.status === 'pending' ? (<Badge variant="secondary" className="text-xs"><Mail className="h-3 w-3 mr-1" />Pending</Badge>) : (<Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">{member.role === 'admin' ? (<Shield className="h-3 w-3 mr-1" />) : (<User className="h-3 w-3 mr-1" />)}{member.role}</Badge>)}
                    </div>
                  </div>
                </div>
                {isAdmin && member.user_id !== currentUserId && (
                  <div className="flex items-center gap-2">
                    <Select value={member.role} onValueChange={(v) => handleUpdateRole(member.id, v as 'admin' | 'member')}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="member">Member</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleRemoveMember(member.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {!isAdmin && (<p className="text-sm text-muted-foreground text-center">Contact a team admin to make changes to team settings</p>)}
    </div>
  )
}
