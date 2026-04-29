<template>
  <div class="statistics-page">
    <div class="page-header">
      <h1 class="page-title">统计分析</h1>
      <div class="range-selector">
        <button
          v-for="r in ranges"
          :key="r.value"
          class="range-btn"
          :class="{ active: selectedRange === r.value }"
          @click="changeRange(r.value)"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-card-header">
          <h3>每日工时</h3>
        </div>
        <StatChart :option="dailyChartOption" />
      </div>
      <div class="chart-card">
        <div class="chart-card-header">
          <h3>项目分布</h3>
        </div>
        <StatChart :option="projectPieOption" />
      </div>
    </div>

    <div class="chart-card full-width">
      <div class="chart-card-header">
        <h3>项目工时排行</h3>
      </div>
      <div class="rank-list">
        <div v-for="(p, i) in projectStats" :key="p.id" class="rank-item">
          <span class="rank-num" :class="{ top: i < 3 }">{{ i + 1 }}</span>
          <div class="rank-color-dot" :style="{ background: p.color }"></div>
          <span class="rank-name">{{ p.name }}</span>
          <div class="rank-bar-wrap">
            <div class="rank-bar" :style="{ width: barWidth(p.total_seconds), background: p.color }"></div>
          </div>
          <span class="rank-duration">{{ formatDuration(p.total_seconds) }}</span>
          <span class="rank-count">{{ p.session_count }}次</span>
        </div>
        <div v-if="projectStats.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <p>暂无数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StatChart from '@/components/StatChart.vue'

const ranges = [
  { label: '近7天', value: 7 },
  { label: '近30天', value: 30 },
  { label: '近90天', value: 90 },
]

const selectedRange = ref(7)
const dailyStats = ref<{ date: string; total_seconds: number; session_count: number }[]>([])
const projectStats = ref<{ id: number; name: string; color: string; total_seconds: number; session_count: number }[]>([])

onMounted(() => {
  loadData()
})

async function loadData() {
  dailyStats.value = await window.api.getDailyStats(selectedRange.value)
  projectStats.value = await window.api.getProjectStats(selectedRange.value)
}

function changeRange(days: number) {
  selectedRange.value = days
  loadData()
}

const dailyChartOption = computed(() => ({
  backgroundColor: 'transparent',
  grid: { top: 20, right: 20, bottom: 30, left: 50 },
  xAxis: {
    type: 'category' as const,
    data: dailyStats.value.map(d => d.date.slice(5)),
    axisLabel: { color: '#9ca3af', fontSize: 11 },
    axisLine: { lineStyle: { color: '#e8eaf0' } },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value' as const,
    minInterval: 3600,
    axisLabel: {
      color: '#9ca3af',
      fontSize: 11,
      formatter: (v: number) => `${Math.floor(v / 3600)}h`,
    },
    splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' as const } },
  },
  series: [{
    type: 'bar' as const,
    data: dailyStats.value.map(d => d.total_seconds),
    itemStyle: {
      color: {
        type: 'linear' as const,
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: '#4f6ef7' },
          { offset: 1, color: '#a78bfa' },
        ],
      },
      borderRadius: [6, 6, 0, 0],
    },
    barWidth: '50%',
  }],
  tooltip: {
    trigger: 'axis' as const,
    backgroundColor: '#fff',
    borderColor: '#e8eaf0',
    borderWidth: 1,
    textStyle: { color: '#1a1a2e', fontSize: 13 },
    formatter: (params: any) => {
      const s = params[0]
      const h = Math.floor(s.value / 3600)
      const m = Math.floor((s.value % 3600) / 60)
      return `${s.name}<br/>${h}小时${m}分钟`
    },
  },
}))

const projectPieOption = computed(() => {
  const data = projectStats.value
    .filter(p => p.total_seconds > 0)
    .map(p => ({ value: p.total_seconds, name: p.name, itemStyle: { color: p.color } }))

  return {
    backgroundColor: 'transparent',
    series: [{
      type: 'pie' as const,
      radius: ['45%', '72%'],
      center: ['50%', '50%'],
      data,
      label: { show: false },
      labelLine: { show: false },
      itemStyle: { borderColor: '#fff', borderWidth: 3, borderRadius: 6 },
      emphasis: {
        itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.1)' },
      },
    }],
    tooltip: {
      backgroundColor: '#fff',
      borderColor: '#e8eaf0',
      borderWidth: 1,
      textStyle: { color: '#1a1a2e', fontSize: 13 },
      formatter: (params: any) => {
        const h = Math.floor(params.value / 3600)
        const m = Math.floor((params.value % 3600) / 60)
        return `${params.name}: ${h}小时${m}分钟`
      },
    },
  }
})

function barWidth(seconds: number): string {
  const max = Math.max(...projectStats.value.map(p => p.total_seconds), 1)
  return `${(seconds / max) * 100}%`
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}小时${m > 0 ? m + '分钟' : ''}`
  return `${m}分钟`
}
</script>

<style scoped>
.statistics-page {
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

.range-selector {
  display: flex;
  gap: 4px;
  background: var(--bg-hover);
  padding: 3px;
  border-radius: var(--radius-sm);
}

.range-btn {
  padding: 6px 16px;
  border-radius: var(--radius-xs);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: var(--transition);
}

.range-btn.active {
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.range-btn:hover:not(.active) {
  color: var(--text-primary);
}

.charts-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.chart-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.chart-card:hover {
  box-shadow: var(--shadow);
}

.chart-card-header {
  margin-bottom: 12px;
}

.chart-card-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.full-width {
  width: 100%;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-xs);
  transition: background 0.15s;
}

.rank-item:hover {
  background: var(--bg-hover);
}

.rank-num {
  width: 24px;
  text-align: center;
  font-weight: 700;
  font-size: 13px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.rank-num.top {
  color: var(--accent);
}

.rank-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.rank-name {
  width: 120px;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 500;
}

.rank-bar-wrap {
  flex: 1;
  height: 8px;
  background: var(--bg-hover);
  border-radius: 4px;
  overflow: hidden;
}

.rank-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 4px;
}

.rank-duration {
  font-family: 'SF Mono', 'Consolas', monospace;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
  width: 80px;
  text-align: right;
  flex-shrink: 0;
  white-space: nowrap;
}

.rank-count {
  color: var(--text-muted);
  font-size: 12px;
  width: 40px;
  text-align: right;
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 32px;
}

.empty-state .empty-icon {
  font-size: 36px;
  margin-bottom: 12px;
  opacity: 0.4;
}

.empty-state p {
  font-size: 14px;
}
</style>
