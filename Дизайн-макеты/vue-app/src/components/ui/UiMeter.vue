<script setup>
defineProps({
  value: { type: Number, default: 0 }, // 0..100
  tone: { type: String, default: 'brand' }, // brand | warn | danger | ok
})
</script>

<template>
  <div class="meter">
    <i
      :style="{
        width: Math.max(0, Math.min(100, value)) + '%',
        background: `var(--${tone})`,
      }"
    ></i>
  </div>
</template>
