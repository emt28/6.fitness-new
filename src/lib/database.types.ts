export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      athletes: {
        Row: {
          id: string
          name: string
          date_of_birth: string
          dominant_hand: 'left' | 'right' | 'ambidextrous'
          wtn: number
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          date_of_birth: string
          dominant_hand: 'left' | 'right' | 'ambidextrous'
          wtn: number
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          date_of_birth?: string
          dominant_hand?: 'left' | 'right' | 'ambidextrous'
          wtn?: number
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          action: string
          user_id: string
          details: string
          timestamp: string
        }
        Insert: {
          id?: string
          action: string
          user_id: string
          details: string
          timestamp?: string
        }
        Update: {
          id?: string
          action?: string
          user_id?: string
          details?: string
          timestamp?: string
        }
      }
      // Add other table definitions as needed
    }
  }
}