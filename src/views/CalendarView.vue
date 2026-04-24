<template>
  <div class="calendar-page">
    <div class="page-header">
      <h1 class="page-title">工作日历</h1>
      <div class="month-nav">
        <button class="nav-btn" @click="prevMonth">&lsaquo;</button>
        <span class="month-label">{{ monthLabel }}</span>
        <button class="nav-btn" @click="nextMonth">&rsaquo;</button>
        <button class="today-btn" @click="goToday">今天</button>
      </div>
    </div>

    <div class="calendar-card">
      <div class="weekday-header">
        <span v-for="d in weekdays" :key="d">{{ d }}</span>
      </div>
      <div class="calendar-grid">
        <div
          v-for="(cell, idx) in calendarDays"
          :key="idx"
          class="day-cell"
          :class="{
            'other-month': !cell.isCurrentMonth,
            today: cell.isToday,
            'has-work': cell.isCurrentMonth && dayMap[cell.date],
            selected: cell.date === selectedDay,
          }"
          @click="selectDay(cell)"
        >
          <div class="day-number" :class="{ 'today-badge': cell.isToday }">{{ cell.day }}</div>
          <template v-if="cell.isCurrentMonth && dayMap[cell.date]">
            <div class="day-content">
              <div class="day-duration">{{ formatDuration(dayMap[cell.date].total_seconds) }}</div>
              <div class="day-sessions">{{ dayMap[cell.date].session_count }}次</div>
              <div class="project-dots">
                <span
                  v-for="p in dayMap[cell.date].projects"
                  :key="p.project_id"
                  class="project-dot"
                  :style="{ background: p.project_color }"
                ></span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="selectedDayData" class="day-detail-card">
      <div class="day-detail-header">
        <h3>{{ selectedDayData.dateLabel }} 工作详情</h3>
        <button class="day-detail-close" @click="selectedDay = null">&times;</button>
      </div>
      <div class="day-detail-summary">
        <div class="summary-item">
          <span>总工时</span>
          <span>{{ formatDurationCN(selectedDayData.total_seconds) }}</span>
        </div>
        <div class="summary-item">
          <span>工作次数</span>
          <span>{{ selectedDayData.session_count }}次</span>
        </div>
      </div>
      <div class="day-detail-projects">
        <div v-for="p in groupedTasks" :key="p.project_id" class="project-group">
          <div class="project-group-header">
            <div class="project-color-bar" :style="{ background: p.project_color }"></div>
            <span class="project-group-name">{{ p.project_name }}</span>
            <span class="project-duration">{{ formatDurationCN(p.total_seconds) }}</span>
          </div>
          <div v-for="t in p.tasks" :key="t.task_id || t.task_title" class="task-row">
            <span class="task-title">{{ t.task_title || '未关联任务' }}</span>
            <span class="task-status" :class="t.task_status">{{ statusLabel(t.task_status) }}</span>
            <span class="task-meta">{{ formatDurationCN(t.total_seconds) }} · {{ t.session_count }}次</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface CalendarRow {
  date: string
  project_id: number
  project_name: string
  project_color: string
  task_id: number | null
  task_title: string | null
  task_status: string | null
  total_seconds: number
  session_count: number
}

interface DayData {
  total_seconds: number
  session_count: number
  projects: { project_id: number; project_name: string; project_color: string; total_seconds: number; session_count: number }[]
  tasks: { task_id: number | null; task_title: string | null; task_status: string | null; project_id: number; project_name: string; project_color: string; total_seconds: number; session_count: number }[]
}

interface CalendarDay {
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}

const weekdays = ['一', '二', '三', '四', '五', '六', '日']

const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)
const calendarData = ref<CalendarRow[]>([])
const selectedDay = ref<string | null>(null)

const monthLabel = computed(() => `${currentYear.value}年${currentMonth.value}月`)

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startDow = (firstDay.getDay() + 6) % 7 // Mon=0
  const daysInMonth = lastDay.getDate()

  const days: CalendarDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Previous month padding
  const prevMonthLast = new Date(year, month - 1, 0).getDate()
  for (let i = startDow - 1; i >= 0; i--) {
    days.push({ date: '', day: prevMonthLast - i, isCurrentMonth: false, isToday: false })
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d)
    date.setHours(0, 0, 0, 0)
    const isoDate = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
    days.push({
      date: isoDate,
      day: d,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
    })
  }

  // Next month padding
  const targetCells = startDow <= 4 ? 35 : 42
  const remaining = targetCells - days.length
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: '', day: d, isCurrentMonth: false, isToday: false })
  }

  return days
})

const dayMap = computed(() => {
  const map: Record<string, DayData> = {}
  for (const row of calendarData.value) {
    if (!map[row.date]) {
      map[row.date] = { total_seconds: 0, session_count: 0, projects: [], tasks: [] }
    }
    const day = map[row.date]
    day.total_seconds += row.total_seconds
    day.session_count += row.session_count
    day.tasks.push({
      task_id: row.task_id,
      task_title: row.task_title,
      task_status: row.task_status,
      project_id: row.project_id,
      project_name: row.project_name,
      project_color: row.project_color,
      total_seconds: row.total_seconds,
      session_count: row.session_count,
    })
    // Aggregate project-level data
    const existingProject = day.projects.find(p => p.project_id === row.project_id)
    if (existingProject) {
      existingProject.total_seconds += row.total_seconds
      existingProject.session_count += row.session_count
    } else {
      day.projects.push({
        project_id: row.project_id,
        project_name: row.project_name,
        project_color: row.project_color,
        total_seconds: row.total_seconds,
        session_count: row.session_count,
      })
    }
  }
  return map
})

const selectedDayData = computed(() => {
  if (!selectedDay.value) return null
  const info = dayMap.value[selectedDay.value]
  if (!info) return null
  const parts = selectedDay.value.split('-')
  return {
    date: selectedDay.value,
    dateLabel: `${parseInt(parts[1])}月${parseInt(parts[2])}日`,
    total_seconds: info.total_seconds,
    session_count: info.session_count,
    tasks: [...info.tasks].sort((a, b) => b.total_seconds - a.total_seconds),
  }
})

const groupedTasks = computed(() => {
  if (!selectedDayData.value) return []
  const groups: { project_id: number; project_name: string; project_color: string; total_seconds: number; session_count: number; tasks: { task_id: number | null; task_title: string | null; task_status: string | null; total_seconds: number; session_count: number }[] }[] = []
  for (const t of selectedDayData.value.tasks) {
    const g = groups.find(p => p.project_id === t.project_id)
    if (g) {
      g.total_seconds += t.total_seconds
      g.session_count += t.session_count
      g.tasks.push({ task_id: t.task_id, task_title: t.task_title, task_status: t.task_status, total_seconds: t.total_seconds, session_count: t.session_count })
    } else {
      groups.push({
        project_id: t.project_id,
        project_name: t.project_name,
        project_color: t.project_color,
        total_seconds: t.total_seconds,
        session_count: t.session_count,
        tasks: [{ task_id: t.task_id, task_title: t.task_title, task_status: t.task_status, total_seconds: t.total_seconds, session_count: t.session_count }],
      })
    }
  }
  return groups.sort((a, b) => b.total_seconds - a.total_seconds)
})

onMounted(() => {
  loadData()
})

async function loadData() {
  selectedDay.value = null
  calendarData.value = await window.api.getCalendarData(currentYear.value, currentMonth.value)
}

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
  loadData()
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
  loadData()
}

function goToday() {
  const n = new Date()
  currentYear.value = n.getFullYear()
  currentMonth.value = n.getMonth() + 1
  loadData()
}

function selectDay(cell: CalendarDay) {
  if (!cell.isCurrentMonth || !cell.date) return
  selectedDay.value = selectedDay.value === cell.date ? null : cell.date
}

function formatDuration(seconds: number): string {
  if (!seconds) return '0h'
  return (seconds / 3600).toFixed(1) + 'h'
}

function formatDurationCN(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}小时${m > 0 ? m + '分钟' : ''}`
  return `${m}分钟`
}

function statusLabel(status: string | null): string {
  const map: Record<string, string> = { todo: '待办', in_progress: '进行中', completed: '已完成', shelved: '已搁置' }
  return status ? (map[status] || status) : '未知'
}
</script>

<style scoped>
.calendar-page {
  max-width: 1000px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.month-label {
  font-size: 18px;
  font-weight: 600;
  min-width: 120px;
  text-align: center;
  color: var(--text-primary);
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.nav-btn:hover {
  background: var(--bg-hover);
  border-color: var(--accent);
  color: var(--accent);
}

.today-btn {
  padding: 6px 16px;
  border-radius: var(--radius-xs);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-hover);
  border: none;
  cursor: pointer;
  transition: var(--transition);
  margin-left: 4px;
}

.today-btn:hover {
  color: var(--accent);
  background: var(--accent-light);
}

.calendar-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.weekday-header span {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  padding: 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  min-height: 90px;
  padding: 8px;
  border-radius: var(--radius-xs);
  border: 1px solid transparent;
  transition: var(--transition);
  cursor: pointer;
  position: relative;
}

.day-cell:hover {
  background: var(--bg-hover);
}

.day-cell.other-month {
  opacity: 0.25;
  pointer-events: none;
}

.day-cell.today {
  background: var(--accent-light);
  border-color: var(--accent);
}

.day-cell.has-work {
  background: rgba(79, 110, 247, 0.03);
}

.day-cell.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}

.day-number {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  text-align: center;
}

.day-number.today-badge {
  background: var(--accent);
  color: #fff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.day-duration {
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
}

.day-sessions {
  font-size: 11px;
  color: var(--text-muted);
}

.project-dots {
  display: flex;
  gap: 3px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.project-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Day detail panel */
.day-detail-card {
  margin-top: 16px;
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  animation: slideUp 0.2s ease;
}

.day-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.day-detail-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.day-detail-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  font-size: 18px;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.day-detail-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.day-detail-summary {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item span:first-child {
  font-size: 12px;
  color: var(--text-muted);
}

.summary-item span:last-child {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
}

.day-detail-projects {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-group {
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
  padding: 12px;
}

.project-group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.project-color-bar {
  width: 4px;
  height: 20px;
  border-radius: 2px;
  flex-shrink: 0;
}

.project-group-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.project-duration {
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  flex-shrink: 0;
}

.task-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 6px 14px;
  border-radius: var(--radius-xs);
  transition: background 0.15s;
}

.task-row:hover {
  background: var(--bg-card);
}

.task-title {
  flex: 1;
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-meta {
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.task-status {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}

.task-status.completed {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.task-status.in_progress {
  background: var(--warning-light);
  color: #d97706;
}

.task-status.todo {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.task-status.shelved {
  background: rgba(0, 0, 0, 0.04);
  color: var(--text-muted);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
