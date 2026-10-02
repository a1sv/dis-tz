<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | accent | danger | ok | warn | ghost
  size: { type: String, default: 'md' }, // sm | md | lg
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[variant, size === 'sm' ? 'sm' : size === 'lg' ? 'big' : '']"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
