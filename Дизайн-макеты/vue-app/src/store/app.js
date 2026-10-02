import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    role: 'op',
  }),
  actions: {
    setRole(role) {
      this.role = role
    },
  },
})