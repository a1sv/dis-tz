<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  min: { type: Number, default: 1 },
  keys: { type: Array, default: () => ['7', '8', '9', '4', '5', '6', '1', '2', '3'] },
  mode: { type: String, default: 'stepper' }, // stepper | keypad
})

const emit = defineEmits(['update:modelValue'])

const val = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

function dec() {
  val.value = Math.max(props.min, val.value - 1)
}
function inc() {
  val.value = val.value + 1
}
function press(k) {
  emit('press', k)
}
</script>

<template>
  <div v-if="mode === 'stepper'" class="numpad">
    <button class="kbd" @click="dec">−</button>
    <input class="input" style="text-align: center" type="number" v-model="val" />
    <button class="kbd" @click="inc">+</button>
  </div>
  <div v-else class="numpad">
    <button v-for="k in keys" :key="k" class="kbd" @click="press(k)">{{ k }}</button>
  </div>
</template>
