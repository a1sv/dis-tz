import { defineStore } from 'pinia'
import { useToolsStore } from './tools'
import { useLogStore } from './log'
import { tools, tool, employee } from '@/data/master'
import { now } from '@/utils/time'

let uid = 0
const id = () => ++uid

export const useNormsStore = defineStore('norms', {
  state: () => ({
    proposals: [],
  }),

  getters: {
    pending(state) {
      return state.proposals.filter((p) => p.status === 'pending')
    },
    byTool(state) {
      return (toolId) => state.proposals.find((p) => p.toolId === toolId && p.status === 'pending')
    },
  },

  actions: {
    propose(toolId, value, reason) {
      const toolsS = useToolsStore()
      const log = useLogStore()
      const existing = this.byTool(toolId)
      if (existing) return existing
      toolsS.setTempNorm(toolId, value)
      const rec = {
        id: id(), toolId, value, reason, byId: null,
        status: 'pending', applied: true, createdAt: now(),
        decidedBy: null, decidedAt: null, decision: null, comment: '',
      }
      this.proposals.unshift(rec)
      log.add('норма', `Предложена временная норма ${tool(toolId).name}: ${value} (${reason}) · Н32`)
      return rec
    },
    decide(prId, decision, value = null, comment = '') {
      const pr = this.proposals.find((p) => p.id === prId)
      if (!pr) return
      const toolsS = useToolsStore()
      if (decision === 'approve') {
        toolsS.tempNorms[pr.toolId] = { value: pr.value, since: now() }
        pr.decision = 'approve'
      } else if (decision === 'other') {
        toolsS.setTempNorm(pr.toolId, value)
        pr.decision = 'other'
        pr.value = value
      } else {
        toolsS.clearTempNorm(pr.toolId)
        pr.decision = 'revert'
      }
      pr.status = 'decided'
      pr.decidedBy = employee('od')?.id
      pr.decidedAt = now()
      pr.comment = comment
      const log = useLogStore()
      log.add('норма', `Решение по норме ${tool(pr.toolId).name}: ${this.decisionLabel(pr)}`)
    },
    decisionLabel(pr) {
      if (pr.decision === 'approve') return `подтверждено ${pr.value}`
      if (pr.decision === 'other') return `временная ${pr.value}`
      if (pr.decision === 'revert') return 'возвращена обычная'
      return 'на рассмотрении'
    },
  },
})