import { defineStore } from 'pinia'

let uid = 0

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
  }),
  actions: {
    push(text, type = 'ok') {
      const id = ++uid
      this.toasts.push({ id, text, type })
      setTimeout(() => this.remove(id), 3200)
    },
    remove(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
  },
})