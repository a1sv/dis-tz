<script setup>
defineProps({
  kick: { type: String, required: true },
  desc: { type: String, required: true },
  caption: { type: String, default: '' },
})
</script>

<template>
  <div>
    <div class="screen-head">
      <div class="kick">{{ kick }}</div>
      <p>{{ desc }}</p>
    </div>
    <div class="stage">
      <div class="frames">
        <div v-if="caption" class="caption">{{ caption }}</div>
        <slot />
      </div>
    </div>
  </div>
</template>