<script setup>
defineProps({
  title: { type: String, default: '' },
  text: { type: String, default: '' },
})
</script>

<template>
  <div class="sc tcenter" style="padding: 28px 16px">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      width="40"
      height="40"
      style="margin: 0 auto; color: var(--ink-3)"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
      />
    </svg>
    <b v-if="title" style="display: block; margin-top: 10px; font-size: 15px">{{ title }}</b>
    <p v-if="text" class="hint" style="margin: 6px 0 0">{{ text }}</p>
    <slot />
  </div>
</template>
