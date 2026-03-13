export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: { id: string; name: string; created_at: string }
        Insert: { id?: string; name: string; created_at?: string }
        Update: { id?: string; name?: string; created_at?: string }
      }
      team_members: {
        Row: { id: string; team_id: string; user_id: string | null; email: string; role: 'admin' | 'member'; invited_by: string | null; created_at: string; status: 'pending' | 'active' }
        Insert: { id?: string; team_id: string; user_id?: string | null; email: string; role?: 'admin' | 'member'; invited_by?: string | null; created_at?: string; status?: 'pending' | 'active' }
        Update: { id?: string; team_id?: string; user_id?: string | null; email?: string; role?: 'admin' | 'member'; invited_by?: string | null; created_at?: string; status?: 'pending' | 'active' }
      }
      boards: {
        Row: { id: string; team_id: string; name: string; created_at: string }
        Insert: { id?: string; team_id: string; name: string; created_at?: string }
        Update: { id?: string; team_id?: string; name?: string; created_at?: string }
      }
      columns: {
        Row: { id: string; board_id: string; name: string; color: string; position: number }
        Insert: { id?: string; board_id: string; name: string; color?: string; position: number }
        Update: { id?: string; board_id?: string; name?: string; color?: string; position?: number }
      }
      cards: {
        Row: { id: string; column_id: string; title: string; description: string | null; due_date: string | null; position: number; created_by: string; tags: string[]; assignees: string[]; created_at: string }
        Insert: { id?: string; column_id: string; title: string; description?: string | null; due_date?: string | null; position: number; created_by: string; tags?: string[]; assignees?: string[]; created_at?: string }
        Update: { id?: string; column_id?: string; title?: string; description?: string | null; due_date?: string | null; position?: number; created_by?: string; tags?: string[]; assignees?: string[]; created_at?: string }
      }
      storyboards: {
        Row: { id: string; team_id: string; name: string; card_id: string | null; created_by: string; created_at: string }
        Insert: { id?: string; team_id: string; name: string; card_id?: string | null; created_by: string; created_at?: string }
        Update: { id?: string; team_id?: string; name?: string; card_id?: string | null; created_by?: string; created_at?: string }
      }
      storyboard_frames: {
        Row: { id: string; storyboard_id: string; position_x: number; position_y: number; width: number; height: number; content_type: 'image' | 'sketch' | 'text'; content_json: Json; image_url: string | null; created_at: string }
        Insert: { id?: string; storyboard_id: string; position_x: number; position_y: number; width?: number; height?: number; content_type: 'image' | 'sketch' | 'text'; content_json?: Json; image_url?: string | null; created_at?: string }
        Update: { id?: string; storyboard_id?: string; position_x?: number; position_y?: number; width?: number; height?: number; content_type?: 'image' | 'sketch' | 'text'; content_json?: Json; image_url?: string | null; created_at?: string }
      }
      calendar_events: {
        Row: { id: string; team_id: string; card_id: string | null; title: string; date: string; platform: string | null; status: 'scheduled' | 'published' | 'draft'; created_by: string; created_at: string }
        Insert: { id?: string; team_id: string; card_id?: string | null; title: string; date: string; platform?: string | null; status?: 'scheduled' | 'published' | 'draft'; created_by: string; created_at?: string }
        Update: { id?: string; team_id?: string; card_id?: string | null; title?: string; date?: string; platform?: string | null; status?: 'scheduled' | 'published' | 'draft'; created_by?: string; created_at?: string }
      }
    }
  }
}

export type Team = Database['public']['Tables']['teams']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type Board = Database['public']['Tables']['boards']['Row']
export type Column = Database['public']['Tables']['columns']['Row']
export type Card = Database['public']['Tables']['cards']['Row']
export type Storyboard = Database['public']['Tables']['storyboards']['Row']
export type StoryboardFrame = Database['public']['Tables']['storyboard_frames']['Row']
export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']

export type ColumnWithCards = Column & { cards: Card[] }
export type BoardWithColumns = Board & { columns: ColumnWithCards[] }
