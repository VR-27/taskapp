import { useState, useEffect } from 'react'

// API calls go to /api/ which Nginx proxies to the Flask backend
const API = '/api/tasks'

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px 80px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
    animation: 'fadeUp .5s ease both',
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
    fontWeight: 400,
    lineHeight: 1.1,
    marginBottom: '10px',
    letterSpacing: '-0.02em',
  },
  accent: { color: '#c8f56a' },
  subtitle: {
    fontSize: '14px',
    color: '#6b6b72',
    letterSpacing: '.04em',
    textTransform: 'uppercase',
  },
  card: {
    width: '100%',
    maxWidth: '540px',
    background: '#1a1a1f',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    overflow: 'hidden',
    animation: 'fadeUp .5s .1s ease both',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
    padding: '20px',
    borderBottom: '0.5px solid rgba(255,255,255,0.08)',
  },
  input: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#f0ede8',
    fontSize: '14px',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
  },
  addBtn: {
    background: '#c8f56a',
    color: '#0f0f11',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontWeight: 500,
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    flexShrink: 0,
    transition: 'opacity .15s',
  },
  taskList: {
    listStyle: 'none',
  },
  taskItem: (done, idx) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 20px',
    borderBottom: '0.5px solid rgba(255,255,255,0.05)',
    animation: `fadeUp .3s ${idx * 0.04}s ease both`,
    transition: 'background .15s',
  }),
  checkbox: (done) => ({
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: done ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
    background: done ? '#c8f56a' : 'transparent',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all .2s',
  }),
  checkMark: {
    color: '#0f0f11',
    fontSize: '11px',
    fontWeight: 700,
  },
  taskTitle: (done) => ({
    flex: 1,
    fontSize: '14px',
    color: done ? '#6b6b72' : '#f0ede8',
    textDecoration: done ? 'line-through' : 'none',
    textDecorationColor: 'rgba(107,107,114,0.6)',
    transition: 'all .2s',
  }),
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#6b6b72',
    cursor: 'pointer',
    fontSize: '18px',
    lineHeight: 1,
    padding: '2px 6px',
    borderRadius: '6px',
    transition: 'color .15s',
    fontFamily: 'monospace',
  },
  empty: {
    padding: '48px 20px',
    textAlign: 'center',
    color: '#6b6b72',
    fontSize: '14px',
  },
  stats: {
    padding: '14px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#6b6b72',
    borderTop: '0.5px solid rgba(255,255,255,0.05)',
  },
  error: {
    background: 'rgba(255,95,95,0.1)',
    border: '0.5px solid rgba(255,95,95,0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#ff5f5f',
    fontSize: '13px',
    marginBottom: '16px',
    width: '100%',
    maxWidth: '540px',
    textAlign: 'center',
  },
  loading: {
    color: '#6b6b72',
    fontSize: '14px',
    padding: '48px',
    textAlign: 'center',
  }
}

export default function App() {
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    try {
      setLoading(true)
      const res = await fetch(API)
      if (!res.ok) throw new Error('Could not load tasks')
      setTasks(await res.json())
      setError(null)
    } catch (e) {
      setError('Cannot reach the backend. Is Docker running?')
    } finally {
      setLoading(false)
    }
  }

  async function addTask() {
    if (!input.trim()) return
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input.trim() })
      })
      if (!res.ok) throw new Error()
      const task = await res.json()
      setTasks(prev => [task, ...prev])
      setInput('')
      setError(null)
    } catch {
      setError('Failed to add task.')
    }
  }

  async function toggleTask(id) {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'PATCH' })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setTasks(prev => prev.map(t => t.id === id ? updated : t))
    } catch {
      setError('Failed to update task.')
    }
  }

  async function deleteTask(id) {
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' })
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch {
      setError('Failed to delete task.')
    }
  }

  const done = tasks.filter(t => t.done).length

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>
          Task<span style={styles.accent}>App</span>
        </h1>
        <p style={styles.subtitle}>Dockerized · Flask · PostgreSQL · Nginx . v1.0</p>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.card}>
        {/* Input */}
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            value={input}
            placeholder="Add a new task..."
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <button style={styles.addBtn} onClick={addTask}>Add</button>
        </div>

        {/* Task list */}
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : tasks.length === 0 ? (
          <div style={styles.empty}>No tasks yet. Add one above ↑</div>
        ) : (
          <ul style={styles.taskList}>
            {tasks.map((task, idx) => (
              <li key={task.id} style={styles.taskItem(task.done, idx)}>
                <div
                  style={styles.checkbox(task.done)}
                  onClick={() => toggleTask(task.id)}
                >
                  {task.done && <span style={styles.checkMark}>✓</span>}
                </div>
                <span style={styles.taskTitle(task.done)}>{task.title}</span>
                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteTask(task.id)}
                  title="Delete"
                >×</button>
              </li>
            ))}
          </ul>
        )}

        {/* Stats footer */}
        {tasks.length > 0 && (
          <div style={styles.stats}>
            <span>{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</span>
            <span>{done} / {tasks.length} done</span>
          </div>
        )}
      </div>
    </div>
  )
}
