import { useState, useEffect } from 'react'
import { database } from '../lib/database'

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
      const todos = await database.fetchTodos(userId)
      setTodos(todos)
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (text: string, dueDate?: string, category: Category = 'personal', priority: Priority = 'medium') => {
    if (!userId) return

    try {
      const newTodo = await database.addTodo(userId, text, dueDate, category, priority)
      setTodos(prev => [newTodo, ...prev])
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  const updateTodo = async (id: string, updates: Partial<Pick<Todo, 'text' | 'completed' | 'dueDate' | 'category' | 'priority'>>) => {
    try {
      await database.updateTodo(id, updates)
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, ...updates } : todo
      ))
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      await database.deleteTodo(id)
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
