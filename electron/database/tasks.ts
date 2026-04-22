import { getDb, saveDatabase } from './index'

export interface Task {
  id: number
  project_id: number
  title: string
  description: string
  status: string
  priority: string
  created_at: string
  updated_at: string
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

export function getTasksByProject(projectId: number): Task[] {
  return queryAll('SELECT * FROM tasks WHERE project_id = ? ORDER BY priority DESC, created_at DESC', [projectId]) as Task[]
}

export function getTaskById(id: number): Task | undefined {
  return queryOne('SELECT * FROM tasks WHERE id = ?', [id]) as Task | undefined
}

export function createTask(data: { project_id: number; title: string; description?: string; priority?: string }): Task {
  const db = getDb()
  db.run(
    'INSERT INTO tasks (project_id, title, description, priority) VALUES (?, ?, ?, ?)',
    [data.project_id, data.title, data.description || '', data.priority || 'medium']
  )
  const id = queryOne('SELECT last_insert_rowid() as id').id
  saveDatabase()
  return getTaskById(id)!
}

export function updateTask(id: number, data: { title?: string; description?: string; status?: string; priority?: string }): Task {
  const db = getDb()
  const fields: string[] = []
  const values: any[] = []

  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
  if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status) }
  if (data.priority !== undefined) { fields.push('priority = ?'); values.push(data.priority) }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now', 'localtime')")
    values.push(id)
    db.run(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values)
    saveDatabase()
  }

  return getTaskById(id)!
}

export function deleteTask(id: number): void {
  const db = getDb()
  db.run('DELETE FROM tasks WHERE id = ?', [id])
  saveDatabase()
}
