<script setup>
defineProps({
  title: { type: String, default: '' },
  sub: { type: String, default: '' },
  tone: { type: String, default: '' }, // '' | warn | danger
  tbStyle: { type: Object, default: () => ({}) },
  tabStyle: { type: Object, default: () => ({}) },
})
</script>

<template>
  <div class="tab" :style="tabStyle">
    <div class="tb" :class="tone ? `tone-${tone}` : ''" :style="tbStyle">
      <div class="tt">
        <b>{{ title }}</b>
        <span>{{ sub }}</span>
      </div>
      <slot name="badge" />
    </div>
    <div class="body"><slot /></div>
    <div v-if="$slots.footer" class="bb"><slot name="footer" /></div>
  </div>
</template>
