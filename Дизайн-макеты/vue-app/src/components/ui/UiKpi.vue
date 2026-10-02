<script setup>
defineProps({
  label: { type: String, default: '' },
  value: { type: [String, Number], default: '' },
  unit: { type: String, default: '' },
  delta: { type: String, default: '' },
  deltaTone: { type: String, default: '' }, // up | down
  tone: { type: String, default: '' }, // ok | warn | danger | accent
})
</script>

<template>
  <div class="card kpi">
    <div class="label">{{ label }}</div>
    <div class="val" :style="tone ? { color: `var(--${tone})` } : {}">
      {{ value }}<span v-if="unit" style="font-size: 13px; color: var(--ink-3)">{{ unit }}</span>
    </div>
    <div v-if="delta" class="delta" :class="deltaTone">{{ delta }}</div>
  </div>
</template>
