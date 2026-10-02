import { defineStore } from 'pinia'
import { useLogStore } from './log'
import { tools, tool, machines, employee, reasons } from '@/data/master'
import { now, fmtTime, percent } from '@/utils/time'

let uid = 0
const id = () => ++uid

function initStocks() {
  const stocks = {}
  tools.forEach((t) => {
    stocks[t.id] = { onHand: t.onHand, warehouse: t.warehouse, reserve: t.reserve }
  })
  return stocks
}

function initWorkloads() {
  const w = {}
  tools.forEach((t) => {
    w[t.id] = Math.round(t.norm * (Math.random() * 0.32 + 0.18))
  })
  /* стартовый сценарий: сверло уже близко к предупреждению */
  w['d6'] = 328
  w['tap10'] = 196
  w['plate'] = 12
  return w
}

export const useToolsStore = defineStore('tools', {
  state: () => ({
    stocks: initStocks(),
    workloads: initWorkloads(),
    controlled: {},
    transfers: {},
    tempNorms: {},
    history: [],
    supply: [],
  }),

  getters: {
    var(state) {
      return (toolId) => {
        const t = tool(toolId)
        const norm = state.tempNorms[toolId]?.value ?? t.norm
        return { t, norm }
      }
    },
    stock(state) {
      return (toolId) => state.stocks[toolId]
    },
    workload(state) {
      return (toolId) => state.workloads[toolId] ?? 0
    },
    norm(state) {
      return (toolId) => state.tempNorms[toolId]?.value ?? tool(toolId).norm
    },
    hasTemp(state) {
      return (toolId) => !!state.tempNorms[toolId]
    },
    needsControl(state) {
      return (toolId) => {
        const t = tool(toolId)
        return (state.workloads[toolId] ?? 0) >= t.warnAt && !state.controlled[toolId]
      }
    },
    transferredControl(state) {
      return (toolId) => !!state.transfers[toolId]
    },
    forecast() {
      return (toolId, machineId, session) => {
        const t = tool(toolId)
        const fact = this.workload(toolId)
        const untilWarn = Math.max(0, t.warnAt - fact)
        if (session.sosPaused || !session.session) return { parts: untilWarn, tempo: 0 }
        const machine = machineId ? machines.find((m) => m.id === machineId) : null
        if (!machine) return { parts: untilWarn, tempo: 0 }
        const initial = session.initialCounters[machine.id]
        const last = session.lastCounters[machine.id]
        const elapsedMin = (now() - session.session.startedAt) / 60000
        const done = (last ?? initial) - (initial ?? last)
        const tempo = elapsedMin > 1 && done > 0 ? done / elapsedMin : 0
        const endMin = session.session && (now() - session.session.startedAt) / 60000
        if (session.session && endMin < 1) return { parts: untilWarn, tempo }
        const shiftLenMin = 480
        const remainMin = Math.max(0, shiftLenMin - (now() - session.session.startedAt) / 60000)
        const projected = tempo > 0 ? Math.round(tempo * remainMin) : 0
        const parts = Math.min(untilWarn, Math.max(0, projected))
        return { parts, tempo, crosses: projected > untilWarn }
      }
    },
  },

  actions: {
    addProduction(machineId, delta) {
      const m = machines.find((x) => x.id === machineId)
      if (m && delta > 0) this.workloads[m.mainTool] = (this.workloads[m.mainTool] ?? 0) + delta
    },

    control(toolId) {
      const log = useLogStore()
      this.controlled[toolId] = { at: now() }
      delete this.transfers[toolId]
      log.add('контроль', `${tool(toolId).name}: контроль подтверждён (Н42)`)
    },
    handOver(toolId) {
      this.transfers[toolId] = true
    },
    takeControl(toolId) {
      delete this.transfers[toolId]
    },

    replace(toolId, { qty = 1, reason = reasons[0], byId = null, counter = null } = {}) {
      const s = this.stocks[toolId]
      const q = Math.max(1, qty)
      const took = Math.min(s.onHand, q)
      s.onHand -= took
      const rec = {
        id: id(), toolId, at: now(), byId, reason, qty: took,
        workload: this.workloads[toolId] ?? 0, counter,
      }
      this.history.push(rec)
      this.workloads[toolId] = 0
      delete this.controlled[toolId]
      delete this.transfers[toolId]
      const log = useLogStore()
      log.add('замена', `${tool(toolId).name} ×${took} · ${reason} · наработка ${rec.workload}`, { by: employee(byId)?.fio, refId: rec.id })
      return rec
    },
    cancelReplacement(refId) {
      const rec = this.history.find((r) => r.id === refId)
      if (!rec) return
      this.history = this.history.filter((r) => r.id !== refId)
      this.stocks[rec.toolId].onHand += rec.qty
      const log = useLogStore()
      log.add('отмена', `Отменена замена ${tool(rec.toolId).name} · запас восстановлен (+${rec.qty})`)
    },

    receive(toolId, qty) {
      this.stocks[toolId].onHand += qty
      const log = useLogStore()
      log.add('получение', `${tool(toolId).name} +${qty} на рабочее место`)
    },
    adjustStock(toolId, target) {
      const s = this.stocks[toolId]
      const diff = target - s.onHand
      if (diff === 0) return
      s.onHand = Math.max(0, target)
      const log = useLogStore()
      log.add('приём', `${tool(toolId).name}: фактическое количество ${s.onHand} (перед сменой)`)
    },
    deliverFromWarehouse(toolId, qty) {
      const s = this.stocks[toolId]
      const q = Math.min(s.warehouse, qty)
      s.warehouse -= q
      s.onHand += q
      const log = useLogStore()
      log.add('выдача', `${tool(toolId).name}: со склада → рабочее место (+${q})`)
    },
    reserveReceive(toolId, qty) {
      const s = this.stocks[toolId]
      const q = Math.min(s.reserve, qty)
      s.reserve -= q
      s.onHand += q
      const log = useLogStore()
      log.add('резерв', `${tool(toolId).name}: получено из защищённого резерва (+${q})`)
    },

    createSupply(toolId) {
      const t = tool(toolId)
      const qty = t.safety * 2
      this.supply.push({ id: id(), toolId, qty, status: 'created', createdAt: now() })
      const log = useLogStore()
      log.add('заказ 1С', `Создан автозаказ на склад: ${t.name} ×${qty}`)
    },
    acceptSupply(orderId) {
      const o = this.supply.find((x) => x.id === orderId)
      if (!o || o.status !== 'created') return
      this.stocks[o.toolId].warehouse += o.qty
      o.status = 'received'
      const log = useLogStore()
      log.add('поступление', `${tool(o.toolId).name} на склад +${o.qty} (автозаказ)`)
    },

    setTempNorm(toolId, value) {
      this.tempNorms[toolId] = { value, since: now() }
    },
    clearTempNorm(toolId) {
      delete this.tempNorms[toolId]
    },

    badge(toolId) {
      const s = this.stocks[toolId]
      if (s.onHand <= 0) return { text: 'нет в наличии', cls: 'danger' }
      if (s.onHand <= 1) return { text: 'заканчивается', cls: 'warn' }
      return { text: `${s.onHand} шт`, cls: 'ok' }
    },
  },
})