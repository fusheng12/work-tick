<template>
  <div ref="chartRef" class="stat-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  option: Record<string, any>
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

onMounted(() => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value, 'dark')
    chart.setOption(props.option)
  }
})

onUnmounted(() => {
  chart?.dispose()
})

watch(() => props.option, (newOption) => {
  chart?.setOption(newOption, true)
}, { deep: true })
</script>

<style scoped>
.stat-chart {
  width: 100%;
  height: 300px;
}
</style>
