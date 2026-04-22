import { getDb, saveDatabase } from './index'

export interface Project {
  id: number
  name: string
  description: string
  color: string
  status: string
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

export function getAllProjects(): Project[] {
  return queryAll('SELECT * FROM projects ORDER BY created_at DESC') as Project[]
}

export function getProjectById(id: number): Project | undefined {
  return queryOne('SELECT * FROM projects WHERE id = ?', [id]) as Project | undefined
}

export function createProject(data: { name: string; description: string; color: string }): Project {
  const db = getDb()
  db.run('INSERT INTO projects (name, description, color) VALUES (?, ?, ?)', [data.name, data.description, data.color])
  const id = queryOne('SELECT last_insert_rowid() as id').id
  saveDatabase()
  return getProjectById(id)!
}

export function updateProject(
  id: number,
  data: { name?: string; description?: string; color?: string; status?: string }
): Project {
  const db = getDb()
  const fields: string[] = []
  const values: any[] = []

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name) }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
  if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color) }
  if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status) }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now', 'localtime')")
    values.push(id)
    db.run(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values)
    saveDatabase()
  }

  return getProjectById(id)!
}

export function deleteProject(id: number): void {
  const db = getDb()
  db.run('DELETE FROM projects WHERE id = ?', [id])
  saveDatabase()
}
