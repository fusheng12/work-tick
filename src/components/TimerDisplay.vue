<template>
  <div class="timer-display">
    <div class="timer-value">{{ formatted }}</div>
    <div class="timer-label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  seconds: number
  label?: string
}>()

const formatted = computed(() => {
  const h = Math.floor(props.seconds / 3600)
  const m = Math.floor((props.seconds % 3600) / 60)
  const s = props.seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})
</script>

<style scoped>
.timer-display {
  text-align: center;
  padding: 16px 0;
}

.timer-value {
  font-family: 'SF Mono', 'Consolas', 'Courier New', monospace;
  font-size: 72px;
  font-weight: 700;
  letter-spacing: 6px;
  color: var(--text-primary);
  line-height: 1;
  position: relative;
}

.timer-label {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 12px;
  font-weight: 500;
  letter-spacing: 0.05em;
}
</style>
