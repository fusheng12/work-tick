import { getDb, saveDatabase } from './index'

export interface Milestone {
  id: number
  task_id: number | null
  session_id: number | null
  project_id: number
  content: string
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

export function getMilestones(taskId?: number, projectId?: number): Milestone[] {
  let sql = 'SELECT * FROM milestones WHERE 1=1'
  const params: any[] = []

  if (taskId) {
    sql += ' AND task_id = ?'
    params.push(taskId)
  }
  if (projectId) {
    sql += ' AND project_id = ?'
    params.push(projectId)
  }
  sql += ' ORDER BY created_at DESC'

  return queryAll(sql, params) as Milestone[]
}

export function addMilestone(data: { taskId: number; projectId: number; content: string }): Milestone {
  const db = getDb()
  db.run('INSERT INTO milestones (task_id, project_id, content) VALUES (?, ?, ?)', [data.taskId, data.projectId, data.content])
  const id = queryOne('SELECT last_insert_rowid() as id').id
  saveDatabase()
  return queryOne('SELECT * FROM milestones WHERE id = ?', [id]) as Milestone
}

export function deleteMilestone(id: number): void {
  const db = getDb()
  db.run('DELETE FROM milestones WHERE id = ?', [id])
  saveDatabase()
}
