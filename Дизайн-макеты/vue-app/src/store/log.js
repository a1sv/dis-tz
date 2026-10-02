import { defineStore } from 'pinia'
import { now, fmtTime } from '@/utils/time'

let uid = 0
const id = () => ++uid

export const useLogStore = defineStore('log', {
  state: () => ({
    entries: [],
  }),

  getters: {
    all(state) {
      return [...state.entries].reverse()
    },
  },

  actions: {
    add(type, text, meta = {}) {
      this.entries.push({ id: ++uid, at: now(), type, text: String(text), meta })
    },
    seed() {
      if (this.entries.length) return
      this.add('смена', 'Смена №1 открыта · Смирнов П.А.')
      this.add('показание', 'Начальное показание 1 271')
      this.add('замена', 'Сверло Ø6,0 HSS ×1 · ХАРАКТЕРНЫЙ ИЗНОС · наработка 610')
    },
  },
})