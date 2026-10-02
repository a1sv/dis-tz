<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/store/session'
import { useToolsStore } from '@/store/tools'
import { useUiStore } from '@/store/ui'
import { fmtNum } from '@/utils/time'
import TabletFrame from '@/components/TabletFrame.vue'

const session = useSessionStore()
const toolsS = useToolsStore()
const ui = useUiStore()
const router = useRouter()

const result = ref(null)

const reads = computed(() => (result.value && result.value.reads) || session.activeReadings)
const finalCounters = computed(() => {
  // при закрытии используем последние введённые показания
  return session.lastCounters
})

function finish() {
  Object.keys(session.initialCounters).forEach((mid) => {
    if (session.lastCounters[mid] == null) session.lastCounters[mid] = session.initialCounters[mid]
  })
  // передача контроля Н42
  const toolsEl = Object.keys(toolsS.workloads)
  toolsEl.forEach((tid) => {
    if (toolsS.needsControl(tid)) toolsS.handOver(tid)
  })
  const prod = session.endShift()
  result.value = prod
  ui.push('Смена завершена · сеанс закрыт', 'ok')
}
</script>

<template>
  <TabletFrame title="Завершение смены" sub="Итоговые показания">
    <template #badge v-if="result"><span class="pill ok">Смена закрыта</span></template>

    <div v-for="r in reads" :key="r.machine.id" class="sc">
      <div class="row">
        <div class="grow"><span class="sc-label">{{ r.machine.name }} · {{ r.machine.part }}</span><b class="metric">{{ fmtNum(r.last ?? r.initial) }}</b></div>
        <div class="field" style="flex:1"><label>Конечное показание</label>
          <input
            v-if="!result"
            class="input"
            type="number"
            :value="session.lastCounters[r.machine.id]"
            @input="session.lastCounters[r.machine.id] = $event.target.value"
          >
          <b v-else class="metric ok-text">{{ fmtNum(session.lastCounters[r.machine.id]) }}</b>
        </div>
      </div>
      <div class="row" style="margin-top:6px">
        <b class="grow">Начало {{ r.initial }} · выпуск</b>
        <b class="metric-lg ok-text">{{ fmtNum(r.production) }} дет.</b>
      </div>
    </div>

    <div class="sc">
      <div class="row">
        <b class="grow">Обработано за смену</b>
        <b class="metric-xl ok-text">{{ fmtNum(session.shiftProduction) }} дет.</b>
      </div>
      <div v-if="result" class="okbox" style="margin-top:6px">
        Сеанс завершён. Показаны фотографии сотрудников · заявки и SOS сохраняются в системе.
      </div>
    </div>

    <div class="hint">Подтверждение завершает сеанс. Отдельная кнопка «Покинуть рабочее место» не нужна. Инструменты, требующие контроля (Н42), передаются следующему наладчику.</div>

    <template #footer>
      <template v-if="result">
        <button class="btn primary big" @click="router.push('/op/start')">НОВАЯ СМЕНА</button>
      </template>
      <template v-else>
        <button class="btn ghost" @click="router.push('/op/work')">ОТМЕНА</button>
        <button class="btn primary big" @click="finish">ЗАВЕРШИТЬ СМЕНУ</button>
      </template>
    </template>
  </TabletFrame>
</template>