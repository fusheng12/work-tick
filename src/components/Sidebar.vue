<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon-wrap">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
          </svg>
        </div>
        <span class="logo-text">WorkTick</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-group-label">主菜单</div>
      <router-link to="/" class="nav-item" exact-active-class="active">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
        <span class="nav-text">仪表盘</span>
      </router-link>
      <router-link to="/projects" class="nav-item" exact-active-class="active">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="2"/>
        </svg>
        <span class="nav-text">项目管理</span>
      </router-link>
      <router-link to="/active" class="nav-item" exact-active-class="active">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
        </svg>
        <span class="nav-text">正在工作</span>
      </router-link>
      <router-link to="/statistics" class="nav-item" exact-active-class="active">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
        </svg>
        <span class="nav-text">统计分析</span>
      </router-link>
      <router-link to="/calendar" class="nav-item" exact-active-class="active">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><rect x="7" y="13" width="3" height="3" rx="0.5" fill="currentColor" stroke="none"/>
        </svg>
        <span class="nav-text">工作日历</span>
      </router-link>
    </nav>

    <div v-if="timerStore.hasActiveSession" class="sidebar-timer" @click="$router.push('/active')">
      <div class="timer-mini">
        <span class="timer-dot" :class="{ running: timerStore.isRunning, paused: timerStore.isPaused }"></span>
        <span class="timer-text">{{ formatTime(timerStore.elapsedSeconds) }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useTimerStore } from '@/stores/timer'

const timerStore = useTimerStore()

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  height: 100vh;
  -webkit-app-region: drag;
  position: relative;
  z-index: 10;
}

.sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
}

.sidebar-header {
  padding: 24px 20px 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent), #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(79, 110, 247, 0.4);
}

.logo-icon {
  width: 20px;
  height: 20px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.sidebar-nav {
  padding: 8px 12px;
  flex: 1;
  -webkit-app-region: no-drag;
}

.nav-group-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.25);
  padding: 12px 12px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--sidebar-text);
  text-decoration: none;
  transition: var(--transition);
  margin-bottom: 2px;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--sidebar-text-hover);
}

.nav-item.active {
  background: var(--sidebar-active-bg);
  color: #fff;
}

.nav-item.active .nav-icon {
  filter: none;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  opacity: 0.7;
}

.nav-item:hover .nav-icon {
  opacity: 0.9;
}

.nav-item.active .nav-icon {
  opacity: 1;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-timer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.timer-mini {
  display: flex;
  align-items: center;
  gap: 10px;
}

.timer-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.timer-dot.running {
  background: var(--success);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  animation: pulse 2s infinite;
}

.timer-dot.paused {
  background: var(--warning);
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
}

.timer-text {
  font-family: 'SF Mono', 'Consolas', 'Courier New', monospace;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.05em;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
