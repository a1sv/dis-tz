<script setup>
defineProps({
  tone: { type: String, default: 'gray' }, // ok | warn | danger | info | gray
})
</script>

<template>
  <span class="pill" :class="tone"><slot /></span>
</template>
