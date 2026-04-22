import { getDb, saveDatabase } from './index'
import { getTaskById } from './tasks'

export interface Session {
  id: number
  project_id: number
  task_id: number | null
  start_time: string
  end_time: string | null
  duration: number
  status: string
  created_at: string
}

function queryAll(sql: string, params?: any[]): any[] {
  const db = getDb()
  const stmt = db.prepare(sql)
  if (params) stmt.bind(params)
  const results: any[] = []
  while (stmt.step()) {
    results.push(JSON.parse(JSON.stringify(stmt.getAsObject())))
  }
  stmt.free()
  return results
}

function queryOne(sql: string, params?: any[]): any | undefined {
  const results = queryAll(sql, params)
  return results[0]
}

export function getAllSessions(projectId?: number, taskId?: number): Session[] {
  if (taskId) {
    return queryAll('SELECT * FROM sessions WHERE task_id = ? ORDER BY start_time DESC', [taskId]) as Session[]
  }
  if (projectId) {
    return queryAll('SELECT * FROM sessions WHERE project_id = ? ORDER BY start_time DESC', [projectId]) as Session[]
  }
  return queryAll('SELECT * FROM sessions ORDER BY start_time DESC') as Session[]
}

export function getActiveSession(): Session | undefined {
  return queryOne("SELECT * FROM sessions WHERE status IN ('running', 'paused') ORDER BY start_time DESC LIMIT 1") as Session | undefined
}

export function startSession(taskId: number): Session {
  const task = getTaskById(taskId)
  if (!task) throw new Error('Task not found')
  const db = getDb()
  db.run(
    "INSERT INTO sessions (project_id, task_id, start_time, status) VALUES (?, ?, datetime('now', 'localtime'), 'running')",
    [task.project_id, taskId]
  )
  const id = queryOne('SELECT last_insert_rowid() as id').id
  saveDatabase()
  return queryOne('SELECT * FROM sessions WHERE id = ?', [id]) as Session
}

export function pauseSession(id: number): Session {
  const db = getDb()
  const session = queryOne('SELECT * FROM sessions WHERE id = ?', [id]) as Session
  const elapsed = Math.floor((Date.now() - new Date(session.start_time).getTime()) / 1000)
  db.run('UPDATE sessions SET status = ?, duration = ? WHERE id = ?', ['paused', elapsed, id])
  saveDatabase()
  return queryOne('SELECT * FROM sessions WHERE id = ?', [id]) as Session
}

export function resumeSession(id: number): Session {
  const db = getDb()
  db.run("UPDATE sessions SET start_time = datetime('now', 'localtime'), status = 'running' WHERE id = ?", [id])
  saveDatabase()
  return queryOne('SELECT * FROM sessions WHERE id = ?', [id]) as Session
}

export function stopSession(id: number): Session {
  const db = getDb()
  const session = queryOne('SELECT * FROM sessions WHERE id = ?', [id]) as Session

  let totalDuration = session.duration
  if (session.status === 'running') {
    totalDuration += Math.floor((Date.now() - new Date(session.start_time).getTime()) / 1000)
  }

  db.run("UPDATE sessions SET status = 'completed', duration = ?, end_time = datetime('now', 'localtime') WHERE id = ?", [totalDuration, id])
  saveDatabase()
  return queryOne('SELECT * FROM sessions WHERE id = ?', [id]) as Session
}
