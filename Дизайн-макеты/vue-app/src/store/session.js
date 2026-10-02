import { defineStore } from 'pinia'
import { useToolsStore } from './tools'
import { useLogStore } from './log'
import { machines, parts, tool, employee, WS } from '@/data/master'
import { now, fmtTime, fmtNum } from '@/utils/time'

export const useSessionStore = defineStore('session', {
  state: () => ({
    manager: false,
    loggedInId: null,
    prevSession: {
      empId: 'sp',
      fio: 'Смирнов П.А.',
      initials: 'СП',
      startedAt: now() - 1000 * 60 * 90,
    },
    session: null,
    task: null,
    plan: 600,
    receptionDone: false,
    acceptedStock: {},
    initialCounters: {},
    lastCounters: {},
    production: {},
    sosPaused: false,
    offline: false,
    shiftNo: 2,
  }),

  getters: {
    me(state) {
      return state.loggedInId ? employee(state.loggedInId) : null
    },
    managerMe(state) {
      return state.manager ? employee('od') : null
    },
    machine(state) {
      if (!state.task) return null
      return machines.find((m) => m.id === state.task.machineId) || null
    },
    part() {
      if (!this.task) return null
      return parts.find((p) => p.id === this.task.partId) || null
    },
    op() {
      const part = this.part
      if (!part) return null
      return part.ops.find((o) => o.id === this.task.opId) || null
    },
    shiftProduction(state) {
      return Object.values(state.production).reduce((a, b) => a + (b || 0), 0)
    },
    remaining(state) {
      return Math.max(0, state.plan - this.shiftProduction)
    },
    shiftStarted(state) {
      return !!state.session
    },
    activeReadings(state) {
      return Object.keys(state.initialCounters).map((mid) => ({
        machine: machines.find((m) => m.id === mid),
        initial: state.initialCounters[mid],
        last: state.lastCounters[mid] ?? state.initialCounters[mid],
        production: state.production[mid] ?? 0,
      }))
    },
  },

  actions: {
    managerLogin(pass) {
      if (pass === '0000') {
        this.manager = true
        return true
      }
      return false
    },
    login(empId, pass) {
      const e = employee(empId)
      if (e && e.role === 'op' && e.pass === pass) {
        this.loggedInId = empId
        return true
      }
      return false
    },
    completePrevSession() {
      if (!this.prevSession) return
      const log = useLogStore()
      log.add('сеанс', `Сеанс сотрудника завершён автоматически`, { by: employee(this.prevSession.empId)?.fio })
      this.prevSession = null
    },
    chooseTask(partId, opId) {
      const m = machines.find((x) => x.part === partId && x.op === opId)
      this.task = { partId, opId, machineId: m ? m.id : machines[0].id }
      const machine = this.machine
      if (machine && this.initialCounters[machine.id] == null) {
        this.initialCounters[machine.id] = machine.counterStart
        this.lastCounters[machine.id] = machine.counterStart
        this.production[machine.id] = 0
      }
      return this.task
    },
    startShift() {
      const log = useLogStore()
      this.session = { startedAt: now(), empId: this.loggedInId, no: this.shiftNo }
      this.receptionDone = true
      log.add('смена', `Смена №${this.shiftNo} открыта`, { by: this.me?.fio })
      return this.session
    },
    recordReading(machineId, value) {
      const v = Number(String(value).replace(/\s/g, ''))
      if (!Number.isFinite(v)) return false
      const last = this.lastCounters[machineId] ?? this.initialCounters[machineId] ?? v
      if (v < last) return false
      const delta = v - last
      this.lastCounters[machineId] = v
      if (this.initialCounters[machineId] == null) this.initialCounters[machineId] = last
      this.production[machineId] = (this.production[machineId] ?? 0) + delta
      const tools = useToolsStore()
      if (delta > 0) tools.addProduction(machineId, delta)
      if (this.session) {
        const log = useLogStore()
        log.add('показание', `Показание ${machines.find((m) => m.id === machineId).name}: ${fmtNum(v)}`, { by: this.me?.fio })
      }
      return delta
    },
    setInitialCounter(machineId, value) {
      const v = Number(String(value).replace(/\s/g, ''))
      if (!Number.isFinite(v)) return
      this.initialCounters[machineId] = v
      this.lastCounters[machineId] = v
      this.production[machineId] = 0
    },
    pausePrediction() {
      this.sosPaused = true
    },
    resumePrediction() {
      this.sosPaused = false
    },
    endShift() {
      const log = useLogStore()
      const prod = { ...this.production }
      this.session = null
      this.prevSession = null
      this.receptionDone = false
      this.task = null
      this.shiftNo += 1
      this.sosPaused = false
      log.add('смена', `Смена закрыта · обработано ${fmtNum(Object.values(prod).reduce((a, b) => a + b, 0))} деталей`, { by: this.me?.fio })
      return prod
    },
  },
})