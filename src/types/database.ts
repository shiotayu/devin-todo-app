export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string
          user_id: string
          text: string
          completed: boolean
          due_date: string | null
          category: 'work' | 'personal' | 'shopping' | 'health' | 'other'
          priority: 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          completed?: boolean
          due_date?: string | null
          category: 'work' | 'personal' | 'shopping' | 'health' | 'other'
          priority: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          completed?: boolean
          due_date?: string | null
          category?: 'work' | 'personal' | 'shopping' | 'health' | 'other'
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
