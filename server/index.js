require('dotenv').config({ path: '../.env' })
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const config = require('./config')

const app = express()
const port = config.server.port

app.use(cors())
app.use(express.json())

const pool = new Pool(config.database)

app.get('/api/todos/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    
    const todos = result.rows.map(row => ({
      id: row.id,
      text: row.text,
      completed: row.completed,
      dueDate: row.due_date || undefined,
      category: row.category,
      priority: row.priority,
      created_at: row.created_at,
      updated_at: row.updated_at
    }))
    
    res.json(todos)
  } catch (error) {
    console.error('Error fetching todos:', error)
    res.status(500).json({ error: 'Failed to fetch todos' })
  }
})

app.post('/api/todos', async (req, res) => {
  try {
    const { userId, text, dueDate, category = 'personal', priority = 'medium' } = req.body
    
    const result = await pool.query(
      'INSERT INTO todos (user_id, text, due_date, category, priority, completed) VALUES ($1, $2, $3, $4, $5, false) RETURNING *',
      [userId, text, dueDate || null, category, priority]
    )
    
    const todo = {
      id: result.rows[0].id,
      text: result.rows[0].text,
      completed: result.rows[0].completed,
      dueDate: result.rows[0].due_date || undefined,
      category: result.rows[0].category,
      priority: result.rows[0].priority,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at
    }
    
    res.json(todo)
  } catch (error) {
    console.error('Error adding todo:', error)
    res.status(500).json({ error: 'Failed to add todo' })
  }
})

app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { text, completed, dueDate, category, priority, userId } = req.body
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }
    
    await pool.query(
      'UPDATE todos SET text = COALESCE($1, text), completed = COALESCE($2, completed), due_date = COALESCE($3, due_date), category = COALESCE($4, category), priority = COALESCE($5, priority), updated_at = NOW() WHERE id = $6 AND user_id = $7',
      [text || null, completed !== undefined ? completed : null, dueDate || null, category || null, priority || null, id, userId]
    )
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error updating todo:', error)
    res.status(500).json({ error: 'Failed to update todo' })
  }
})

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.query
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }
    
    await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, userId])
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting todo:', error)
    res.status(500).json({ error: 'Failed to delete todo' })
  }
})

app.listen(port, () => {
  console.log(`Local API server running at http://localhost:${port}`)
})
