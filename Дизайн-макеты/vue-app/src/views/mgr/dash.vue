<script setup>
import { computed } from 'vue'
import { useSessionStore } from '@/store/session'
import { useToolsStore } from '@/store/tools'
import { useRequestsStore } from '@/store/requests'
import { useSosStore } from '@/store/sos'
import { useNormsStore } from '@/store/norms'
import { useLogStore } from '@/store/log'
import { tool as toolDef, tools } from '@/data/master'
import { fmtTime, fmtDur, fmtNum, percent } from '@/utils/time'
import ScreenShell from '@/components/ScreenShell.vue'
import WebFrame from '@/components/WebFrame.vue'
import UiKpi from '@/components/ui/UiKpi.vue'

const session = useSessionStore()
const toolsS = useToolsStore()
const requests = useRequestsStore()
const sosStore = useSosStore()
const norms = useNormsStore()
const log = useLogStore()

const openRequests = computed(() => requests.requests.filter((r) => !['fulfilled', 'closed'].includes(r.status)))
const activeSos = computed(() => sosStore.open)
const pendingNorms = computed(() => norms.pending)
const allot = computed(() =>
  tools.reduce((a, t) => a + requests.recommendation(t.id), 0)
)
const idleTotal = computed(() =>
  sosStore.events.filter((e) => e.resumedAt).reduce((a, e) => a + sosStore.idleMinutes(e), 0)
)
const history = computed(() => toolsS.history)
const avgStoikost = computed(() => {
  const h = history.value.slice(-5)
  if (!h.length) return 610
  return Math.round(h.reduce((a, r) => a + r.workload, 0) / h.length)
})

const chartBars = computed(() => {
  const h = history.value.slice(-8)
  if (!h.length) {
    return [
      { h: 30, cls: '' }, { h: 45, cls: '' }, { h: 40, cls: '' },
      { h: 62, cls: 'warn' }, { h: 55, cls: '' }, { h: 78, cls: 'danger' },
      { h: 70, cls: 'ok' }, { h: 92, cls: 'ok' },
    ]
  }
  return h.map((r) => {
    const norm = toolDef(r.toolId).norm
    const cls = r.reason.includes('ПОЛОМКА') || r.reason.includes('СКОЛ') ? 'danger' : r.workload >= norm ? 'ok' : 'warn'
    return { h: percent(r.workload, norm), cls }
  })
})

const events = computed(() => log.all.slice(0, 8))
</script>

<template>
  <ScreenShell
    kick="Веб · Роль: Менеджер / Руководитель"
    desc="Живые метрики производства: стойкость инструмента, открытые заявки, остановки по SOS, ожидающие решения нормы, прогноз расхода."
  >
    <WebFrame title="DtTS · Инструментальный Сервис" badge="Менеджер" show-search>
      <div class="web-tb"><h3>Обзор в реальном времени</h3><div class="fr"><button class="fbtn on">Сейчас</button></div></div>
<div class="grid4">
        <UiKpi label="Фактическая стойкость" :value="avgStoikost" unit=" дет." delta="среднее по заменам" delta-tone="up" />
        <UiKpi label="Число открытых заявок" :value="openRequests.length" tone="accent" delta="в работе" :delta-tone="openRequests.length ? 'down' : 'up'" />
        <UiKpi label="Активные SOS" :value="activeSos.length" tone="danger" delta="с остановкой" delta-tone="down" />
        <UiKpi label="Нормы на рассмотрении" :value="pendingNorms.length" tone="warn" delta="Н32" delta-tone="down" />
        <UiKpi label="Прогноз расхода (период)" :value="allot" unit=" шт" delta="по рекомендациям" delta-tone="up" />
        <UiKpi label="Выпуск текущей смены" :value="fmtNum(session.shiftProduction)" unit=" дет." :delta="`план ${fmtNum(session.plan)}`" delta-tone="up" />
      </div>

      <div class="web-tb"><h3>Тренд стойкости — Сверло Ø6,0 (УПС-3)</h3></div>
      <div class="card">
        <div class="chart" style="height:140px">
          <div v-for="(b, i) in chartBars" :key="i" class="bar" :class="b.cls" :style="{ height: b.h + '%' }"></div>
        </div>
        <div class="row" style="margin-top:6px">
          <span class="pill gray">норма {{ toolDef('d6').norm }} дет.</span>
          <span class="pill danger">замена до предупреждения — отдельный признак</span>
          <span class="pill ok">сверх нормы</span>
        </div>
      </div>

      <div class="web-tb"><h3>Последние события</h3></div>
      <div class="card">
        <table class="tbl">
          <tr><th>Время</th><th>Тип</th><th>Событие</th></tr>
          <tr v-for="e in events" :key="e.id">
            <td>{{ fmtTime(e.at) }}</td>
            <td><span class="pill gray">{{ e.type }}</span></td>
            <td>{{ e.text }}</td>
          </tr>
        </table>
      </div>
    </WebFrame>
  </ScreenShell>
</template>