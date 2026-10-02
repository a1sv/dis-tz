import { defineStore } from 'pinia'
import { useToolsStore } from './tools'
import { useLogStore } from './log'
import { useSessionStore } from './session'
import { tools, tool } from '@/data/master'
import { now } from '@/utils/time'

let uid = 0
const id = () => ++uid

export const useRequestsStore = defineStore('requests', {
  state: () => ({
    requests: [],
  }),

  getters: {
    openFor(state) {
      return (toolId) =>
        state.requests.find((r) => r.toolId === toolId && r.status !== 'fulfilled' && r.status !== 'closed')
    },
    incoming(state) {
      return (toolId) =>
        state.requests
          .filter((r) => r.toolId === toolId && r.status !== 'fulfilled' && r.status !== 'closed')
          .reduce((a, r) => a + (r.qty - r.received), 0)
    },
    recommendation() {
      return (toolId) => {
        const t = tool(toolId)
        const stocks = useToolsStore().stocks[toolId]
        return Math.max(0, t.need - stocks.onHand - this.incoming(toolId))
      }
    },
    mine(state) {
      return state.requests
    },
  },

  actions: {
    create(toolId, urgent = false) {
      const toolsS = useToolsStore()
      const log = useLogStore()
      const session = useSessionStore()
      const existing = this.openFor(toolId)
      if (existing) return existing
      const recommended = this.recommendation(toolId)
      const rec = {
        id: id(),
        num: 3400 + uid,
        toolId,
        qty: Math.max(1, recommended || 1),
        recommended,
        status: 'new',
        urgent,
        byId: session.loggedInId,
        createdAt: now(),
        taken: 0,
        received: 0,
      }
      this.requests.unshift(rec)
      log.add('заявка', `Заявка №${rec.num}: ${tool(toolId).name} ×${rec.qty} (рекомендация ${recommended})`)
      return rec
    },
    increase(reqId) {
      const r = this.requests.find((x) => x.id === reqId)
      if (!r) return
      r.qty += 1
      const log = useLogStore()
      log.add('заявка', `Заявка №${r.num}: увеличена до ${r.qty}`)
    },
    setUrgent(reqId, urgent) {
      const r = this.requests.find((x) => x.id === reqId)
      if (r) r.urgent = urgent
    },
    take(reqId, qty) {
      const r = this.requests.find((x) => x.id === reqId)
      if (!r) return
      r.taken = qty
      r.status = 'in_delivery'
      const log = useLogStore()
      log.add('доставка', `Заявка №${r.num}: менеджер взял в доставку ${qty} из ${r.qty}`)
    },
    delivered(reqId) {
      const r = this.requests.find((x) => x.id === reqId)
      if (r && r.status === 'in_delivery') r.status = 'delivered'
    },
    receive(reqId, qty = null) {
      const r = this.requests.find((x) => x.id === reqId)
      if (!r) return
      const q = qty ?? r.taken
      const toolsS = useToolsStore()
      toolsS.receive(r.toolId, q)
      r.received += q
      const rest = r.qty - r.received
      r.status = rest <= 0 ? 'fulfilled' : 'partial'
      const log = useLogStore()
      log.add('получение', `Заявка №${r.num}: принято ${q} из ${r.qty}${rest > 0 ? `, остаток ${rest}` : ''}`)
      return rest
    },
    markUrgentDelivery(reqId) {
      this.setUrgent(reqId, true)
      this.requests.find((r) => r.id === reqId).urgent = true
    },
  },
})