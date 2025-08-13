import { supabase } from './supabase'
import type { Todo, Priority, Category } from '../hooks/useTodos'

const isLocalDev = import.meta.env.DEV && import.meta.env.VITE_USE_LOCAL_DB === 'true'
const LOCAL_API_BASE = 'http://localhost:3001/api'

export const database = {
  async fetchTodos(userId: string): Promise<Todo[]> {
    if (isLocalDev) {
      try {
        const response = await fetch(`${LOCAL_API_BASE}/todos/${userId}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return await response.json()
      } catch (error) {
        console.error('Error fetching todos from local API:', error)
        return []
      }
    } else {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return data.map(todo => ({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        dueDate: todo.due_date || undefined,
        category: todo.category,
        priority: todo.priority,
        created_at: todo.created_at,
        updated_at: todo.updated_at
      }))
    }
  },

  async addTodo(userId: string, text: string, dueDate?: string, category: Category = 'personal', priority: Priority = 'medium'): Promise<Todo> {
    if (isLocalDev) {
      try {
        const response = await fetch(`${LOCAL_API_BASE}/todos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            text,
            dueDate,
            category,
            priority
          })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        return await response.json()
      } catch (error) {
        console.error('Error adding todo via local API:', error)
        throw error
      }
    } else {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          user_id: userId,
          text,
          due_date: dueDate || null,
          category,
          priority,
          completed: false
        })
        .select()
        .single()
      
      if (error) throw error
      
      return {
        id: data.id,
        text: data.text,
        completed: data.completed,
        dueDate: data.due_date || undefined,
        category: data.category,
        priority: data.priority,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    }
  },

  async updateTodo(id: string, updates: Partial<Pick<Todo, 'text' | 'completed' | 'dueDate' | 'category' | 'priority'>>): Promise<void> {
    if (isLocalDev) {
      try {
        const response = await fetch(`${LOCAL_API_BASE}/todos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates)
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (error) {
        console.error('Error updating todo via local API:', error)
        throw error
      }
    } else {
      const { error } = await supabase
        .from('todos')
        .update({
          text: updates.text,
          completed: updates.completed,
          due_date: updates.dueDate || null,
          category: updates.category,
          priority: updates.priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
    }
  },

  async deleteTodo(id: string): Promise<void> {
    if (isLocalDev) {
      try {
        const response = await fetch(`${LOCAL_API_BASE}/todos/${id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (error) {
        console.error('Error deleting todo via local API:', error)
        throw error
      }
    } else {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  }
}
