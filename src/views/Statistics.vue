<template>
  <div class="statistics-page">
    <h1 class="page-title">统计分析</h1>

    <div class="range-selector">
      <button
        v-for="r in ranges"
        :key="r.value"
        class="btn"
        :class="selectedRange === r.value ? 'btn-primary' : 'btn-ghost'"
        @click="changeRange(r.value)"
      >
        {{ r.label }}
      </button>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <h3>每日工时</h3>
        <StatChart :option="dailyChartOption" />
      </div>
      <div class="chart-card">
        <h3>项目分布</h3>
        <StatChart :option="projectPieOption" />
      </div>
    </div>

    <div class="chart-card full-width">
      <h3>项目工时排行</h3>
      <div class="rank-list">
        <div v-for="(p, i) in projectStats" :key="p.id" class="rank-item">
          <span class="rank-num">{{ i + 1 }}</span>
          <div class="color-dot" :style="{ background: p.color }"></div>
          <span class="rank-name">{{ p.name }}</span>
          <div class="rank-bar-wrap">
            <div class="rank-bar" :style="{ width: barWidth(p.total_seconds), background: p.color }"></div>
          </div>
          <span class="rank-duration">{{ formatDuration(p.total_seconds) }}</span>
          <span class="rank-count">{{ p.session_count }}次</span>
        </div>
        <div v-if="projectStats.length === 0" class="empty">暂无数据</div>
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
    axisLabel: { color: '#6b7280' },
    axisLine: { lineStyle: { color: '#e5e7eb' } },
  },
  yAxis: {
    type: 'value' as const,
    axisLabel: {
      color: '#6b7280',
      formatter: (v: number) => `${Math.floor(v / 3600)}h`,
    },
    splitLine: { lineStyle: { color: '#e5e7eb' } },
  },
  series: [{
    type: 'bar' as const,
    data: dailyStats.value.map(d => d.total_seconds),
    itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
  }],
  tooltip: {
    trigger: 'axis' as const,
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
      radius: ['40%', '70%'],
      data,
      label: { color: '#1f2937' },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' } },
    }],
    tooltip: {
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

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
}

.range-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
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
}

.chart-card h3 {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.full-width {
  width: 100%;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.rank-num {
  width: 24px;
  text-align: center;
  font-weight: 700;
  color: var(--text-muted);
}

.rank-num:first-child {
  color: var(--accent);
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.rank-name {
  width: 120px;
  flex-shrink: 0;
}

.rank-bar-wrap {
  flex: 1;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.rank-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s;
}

.rank-duration {
  font-family: 'Consolas', monospace;
  font-weight: 600;
  color: var(--accent);
  width: 80px;
  text-align: right;
}

.rank-count {
  color: var(--text-muted);
  font-size: 12px;
  width: 40px;
  text-align: right;
}

.empty {
  text-align: center;
  color: var(--text-muted);
  padding: 24px;
}
</style>
