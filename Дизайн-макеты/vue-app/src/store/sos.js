import { defineStore } from 'pinia'
import { useSessionStore } from './session'
import { useLogStore } from './log'
import { sosChain, WS } from '@/data/master'
import { now, fmtTime } from '@/utils/time'

let uid = 0
const id = () => ++uid

const MAX_ACCEPT_MIN = 5

export const useSosStore = defineStore('sos', {
  state: () => ({
    events: [],
    accesses: [], // запросы доступа к резерву
  }),

  getters: {
    open(state) {
      return state.events.filter((e) => e.status === 'open' || e.status === 'accepted')
    },
    current() {
      return (ws = WS) => this.open.findLast((e) => e.ws === ws) || null
    },
    latest(state) {
      return (ws = WS) => [...state.events].reverse().find((e) => e.ws === ws) || null
    },
    addresser(state) {
      return (ev) => {
        if (!ev || ev.status === 'accepted') return ev?.acceptedBy
        const min = (now() - ev.startedAt) / 60000
        const idx = min >= MAX_ACCEPT_MIN ? 1 : 0
        return sosChain[idx]
      }
    },
    stopped(state) {
      return state.events.some((e) => e.ws === WS && (e.status === 'open' || e.status === 'accepted') && !e.canWork)
    },
  },

  actions: {
    create({ problem, canWork = true, note = '' } = {}) {
      const session = useSessionStore()
      const log = useLogStore()
      const ev = {
        id: id(), num: 100 + uid, ws: WS, problem, canWork, note,
        byId: session.loggedInId,
        startedAt: now(), status: 'open',
        acceptedBy: null, acceptedAt: null, resolvedAt: null, resumedAt: null,
        cancelledAt: null, offline: session.offline,
      }
      this.events.unshift(ev)
      if (!canWork) session.pausePrediction()
      log.add('sos', `SOS №${ev.num}: «${problem}» · ${canWork ? 'можно работать' : 'остановка'}`, { by: session.me?.fio })
      return ev
    },
    accept(evId, emp) {
      const ev = this.events.find((e) => e.id === evId)
      if (!ev) return
      ev.status = 'accepted'
      ev.acceptedBy = emp.id
      ev.acceptedAt = now()
      const log = useLogStore()
      log.add('sos', `SOS №${ev.num}: вызов принят — ${emp.fio}`)
    },
    resolve(evId, note = '') {
      const ev = this.events.find((e) => e.id === evId)
      if (!ev) return
      ev.resolvedAt = now()
      ev.resolveNote = note
      const log = useLogStore()
      log.add('sos', `SOS №${ev.num}: проблема устранена — можно возобновить работу`)
    },
    resume(evId) {
      const session = useSessionStore()
      const ev = this.events.find((e) => e.id === evId)
      if (!ev) return
      ev.status = 'resolved'
      ev.resumedAt = now()
      session.resumePrediction()
      const log = useLogStore()
      log.add('sos', `SOS №${ev.num}: работа возобновлена`)
    },
    cancel(evId) {
      const session = useSessionStore()
      const ev = this.events.find((e) => e.id === evId)
      if (!ev) return
      ev.status = 'cancelled'
      ev.cancelledAt = now()
      if (!ev.canWork) session.resumePrediction()
      const log = useLogStore()
      log.add('sos', `SOS №${ev.num}: отменён (ложная тревога)`)
    },
    idleMinutes(ev) {
      if (ev.resumedAt) return Math.round((ev.resumedAt - ev.startedAt) / 60000)
      return Math.round((now() - ev.startedAt) / 60000)
    },
    requestReserveAccess() {
      const session = useSessionStore()
      const log = useLogStore()
      const acc = { id: id(), at: now(), byId: session.loggedInId, status: 'pending' }
      this.accesses.unshift(acc)
      log.add('резерв', `Запрос доступа к защищённому резерву`, { by: session.me?.fio })
      return acc
    },
    approveAccess(accId, emp) {
      const acc = this.accesses.find((a) => a.id === accId)
      if (acc) {
        acc.status = 'approved'
        acc.approvedBy = emp?.id
        acc.approvedAt = now()
      }
    },
    denyAccess(accId) {
      const acc = this.accesses.find((a) => a.id === accId)
      if (acc) acc.status = 'denied'
    },
    accessApproved() {
      return this.accesses.some((a) => a.status === 'approved')
    },
  },
})