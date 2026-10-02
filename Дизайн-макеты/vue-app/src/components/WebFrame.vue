<script setup>
defineProps({
  title: { type: String, default: '' },
  badge: { type: String, default: '' },
  showSearch: { type: Boolean, default: false },
  topStyle: { type: Object, default: () => ({}) },
})
</script>

<template>
  <div class="web">
    <div class="web-top" :style="topStyle">
      <b>{{ title }}</b>
      <span v-if="badge" class="pill ok" style="background: var(--brand-50); color: var(--brand-700)">{{ badge }}</span>
      <div v-if="showSearch" class="search">Поиск по заявкам, станкам, наладчикам…</div>
      <slot name="top" />
    </div>
    <div class="web-main"><slot /></div>
  </div>
</template>
