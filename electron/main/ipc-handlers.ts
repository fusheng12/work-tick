import { ipcMain } from 'electron'
import * as projects from '../database/projects'
import * as tasks from '../database/tasks'
import * as sessions from '../database/sessions'
import * as milestones from '../database/milestones'
import { getDb } from '../database'

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

export function registerIpcHandlers() {
  // --- Projects ---
  ipcMain.handle('projects:getAll', () => projects.getAllProjects())
  ipcMain.handle('projects:getById', (_, id: number) => projects.getProjectById(id))
  ipcMain.handle('projects:create', (_, data) => projects.createProject(data))
  ipcMain.handle('projects:update', (_, id: number, data) => projects.updateProject(id, data))
  ipcMain.handle('projects:delete', (_, id: number) => projects.deleteProject(id))

  // --- Tasks ---
  ipcMain.handle('tasks:getByProject', (_, projectId: number) => tasks.getTasksByProject(projectId))
  ipcMain.handle('tasks:getById', (_, id: number) => tasks.getTaskById(id))
  ipcMain.handle('tasks:create', (_, data) => tasks.createTask(data))
  ipcMain.handle('tasks:update', (_, id: number, data) => tasks.updateTask(id, data))
  ipcMain.handle('tasks:delete', (_, id: number) => tasks.deleteTask(id))

  // --- Sessions ---
  ipcMain.handle('sessions:getAll', (_, projectId?: number, taskId?: number) => sessions.getAllSessions(projectId, taskId))
  ipcMain.handle('sessions:getActive', () => sessions.getActiveSession())
  ipcMain.handle('sessions:start', (_, taskId: number) => sessions.startSession(taskId))
  ipcMain.handle('sessions:pause', (_, id: number) => sessions.pauseSession(id))
  ipcMain.handle('sessions:resume', (_, id: number) => sessions.resumeSession(id))
  ipcMain.handle('sessions:stop', (_, id: number, taskStatus?: string) => sessions.stopSession(id, taskStatus))

  // --- Milestones ---
  ipcMain.handle('milestones:getAll', (_, taskId?: number, projectId?: number) =>
    milestones.getMilestones(taskId, projectId)
  )
  ipcMain.handle('milestones:add', (_, data) => milestones.addMilestone(data))
  ipcMain.handle('milestones:delete', (_, id: number) => milestones.deleteMilestone(id))

  // --- Statistics ---
  ipcMain.handle('stats:daily', (_, days: number) => {
    return queryAll(`
      SELECT date(start_time) as date,
             SUM(duration) as total_seconds,
             COUNT(*) as session_count
      FROM sessions
      WHERE status = 'completed'
        AND start_time >= date('now', 'localtime', '-' || ? || ' days')
      GROUP BY date(start_time)
      ORDER BY date ASC
    `, [days])
  })

  ipcMain.handle('stats:projects', (_, days: number) => {
    return queryAll(`
      SELECT p.id, p.name, p.color,
             COALESCE(SUM(s.duration), 0) as total_seconds,
             COUNT(s.id) as session_count
      FROM projects p
      LEFT JOIN sessions s ON s.project_id = p.id
        AND s.status = 'completed'
        AND s.start_time >= date('now', 'localtime', '-' || ? || ' days')
      WHERE p.status = 'active'
      GROUP BY p.id
      ORDER BY total_seconds DESC
    `, [days])
  })

  ipcMain.handle('stats:todaySummary', () => {
    const today = queryAll(`
      SELECT COALESCE(SUM(duration), 0) as total_seconds,
             COUNT(*) as session_count
      FROM sessions
      WHERE status = 'completed'
        AND date(start_time) = date('now', 'localtime')
    `)[0]

    const activeProjects = queryAll(`
      SELECT COUNT(DISTINCT project_id) as count
      FROM sessions
      WHERE status = 'completed'
        AND date(start_time) = date('now', 'localtime')
    `)[0]

    const completedTasks = queryAll(`
      SELECT COUNT(*) as count
      FROM tasks
      WHERE status = 'completed'
        AND date(updated_at) = date('now', 'localtime')
    `)[0]

    return {
      total_seconds: today?.total_seconds || 0,
      session_count: today?.session_count || 0,
      activeProjects: activeProjects?.count || 0,
      completedTasks: completedTasks?.count || 0,
    }
  })

  ipcMain.handle('stats:calendar', (_, year: number, month: number) => {
    const monthStr = month.toString().padStart(2, '0')
    const startDate = `${year}-${monthStr}-01`
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    const nextMonthStr = nextMonth.toString().padStart(2, '0')
    const endDate = `${nextYear}-${nextMonthStr}-01`

    return queryAll(`
      WITH latest AS (
        SELECT date(start_time) AS date, project_id, task_id, task_status,
               ROW_NUMBER() OVER (PARTITION BY date(start_time), project_id, task_id ORDER BY start_time DESC) AS rn
        FROM sessions
        WHERE status = 'completed'
          AND start_time >= ? AND start_time < ?
      )
      SELECT agg.date,
             agg.project_id, p.name AS project_name, p.color AS project_color,
             agg.task_id, t.title AS task_title, l.task_status,
             agg.total_seconds, agg.session_count
      FROM (
        SELECT date(start_time) AS date,
               project_id, task_id,
               SUM(duration) AS total_seconds, COUNT(*) AS session_count
        FROM sessions
        WHERE status = 'completed'
          AND start_time >= ? AND start_time < ?
        GROUP BY date(start_time), project_id, task_id
      ) agg
      INNER JOIN projects p ON p.id = agg.project_id
      LEFT JOIN tasks t ON t.id = agg.task_id
      LEFT JOIN latest l ON l.date = agg.date AND l.project_id = agg.project_id AND l.task_id = agg.task_id AND l.rn = 1
      ORDER BY agg.date ASC, agg.total_seconds DESC
    `, [startDate, endDate, startDate, endDate])
  })
}
