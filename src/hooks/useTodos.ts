import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export type Priority = 'low' | 'medium' | 'high'
export type Category = 'work' | 'personal' | 'shopping' | 'health' | 'other'

export interface Todo {
  id: string
  text: string
  completed: boolean
  dueDate?: string
  category: Category
  priority: Priority
  created_at: string
  updated_at: string
}

export function useTodos(userId: string | undefined) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setTodos([])
      setLoading(false)
      return
    }

    fetchTodos()
  }, [userId])

  const fetchTodos = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedTodos = data.map(todo => ({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        dueDate: todo.due_date || undefined,
        category: todo.category,
        priority: todo.priority,
        created_at: todo.created_at,
        updated_at: todo.updated_at
      }))

      setTodos(formattedTodos)
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (text: string, dueDate?: string, category: Category = 'personal', priority: Priority = 'medium') => {
    if (!userId) return

    try {
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

      const newTodo: Todo = {
        id: data.id,
        text: data.text,
        completed: data.completed,
        dueDate: data.due_date || undefined,
        category: data.category,
        priority: data.priority,
        created_at: data.created_at,
        updated_at: data.updated_at
      }

      setTodos(prev => [newTodo, ...prev])
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  const updateTodo = async (id: string, updates: Partial<Pick<Todo, 'text' | 'completed' | 'dueDate' | 'category' | 'priority'>>) => {
    if (!userId) return
    
    try {
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
        .eq('user_id', userId)

      if (error) throw error

      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, ...updates } : todo
      ))
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const deleteTodo = async (id: string) => {
    if (!userId) return
    
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error

      setTodos(prev => prev.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  return {
    todos,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    refetch: fetchTodos
  }
}
