<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/store/session'
import { useToolsStore } from '@/store/tools'
import { useSosStore } from '@/store/sos'
import { useUiStore } from '@/store/ui'
import { tool as toolDef } from '@/data/master'
import { fmtNum, percent } from '@/utils/time'
import TabletFrame from '@/components/TabletFrame.vue'

const session = useSessionStore()
const toolsS = useToolsStore()
const sosStore = useSosStore()
const ui = useUiStore()
const router = useRouter()

const reading = ref('')

const toolId = computed(() => session.machine?.mainTool || 'd6')
const t = computed(() => toolDef(toolId.value))
const fact = computed(() => toolsS.workload(toolId.value))
const norm = computed(() => toolsS.norm(toolId.value))
const stock = computed(() => toolsS.stocks[toolId.value])
const needsControl = computed(() => toolsS.needsControl(toolId.value))
const fc = computed(() => toolsS.forecast(toolId.value, session.machine?.id, session))
const sos = computed(() => sosStore.current())
const pctFact = computed(() => percent(fact.value, norm.value))
const pctForecast = computed(() => percent(fc.value.parts, norm.value))

function submitReading() {
  if (!session.machine) return
  if (!reading.value) return
  const delta = session.recordReading(session.machine.id, reading.value)
  if (delta === false) {
    ui.push('Показание не может быть меньше текущего', 'err')
    return
  }
  const last = session.lastCounters[session.machine.id]
  reading.value = ''
  ui.push(`Показание ${fmtNum(last)} · выпуск +${delta}`, 'ok')
}
</script>

<template>
  <TabletFrame v-if="!session.shiftStarted" title="Смена не открыта" sub="Начните смену, чтобы работать">
    <div class="sc tcenter" style="padding:18px">
      <b>Начало смены ещё не выполнено</b>
      <button class="btn primary big" style="margin-top:10px" @click="router.push('/op/start')">НАЧАТЬ СМЕНУ</button>
    </div>
  </TabletFrame>

  <TabletFrame v-else
    :title="session.part?.name || 'Задание'"
    :sub="`${session.op?.name} · ${session.machine?.name}`">
    <template #badge>
      <span v-if="!sos" class="pill ok">Работа идёт</span>
      <span v-else class="pill danger">SOS · остановка</span>
    </template>

    <div class="sc">
      <div class="row">
        <div class="grow"><span class="sc-label">Счётчик станка</span><div class="metric">{{ fmtNum(session.lastCounters[session.machine?.id]) }}</div></div>
        <div class="tcenter"><span class="sc-label">Выпуск смены</span><div class="metric ok-text">{{ fmtNum(session.shiftProduction) }}</div></div>
        <div class="tcenter"><span class="sc-label">План смены</span><div class="metric">{{ fmtNum(session.plan) }}</div></div>
      </div>
      <div class="row" style="margin-top:8px">
        <input v-model="reading" class="input normal" style="flex:1" type="number" placeholder="Новое показание…" @keyup.enter="submitReading">
        <button class="btn primary sm" @click="submitReading">ВНЕСТИ</button>
      </div>
      <div class="hint" style="margin-top:4px">Осталось до плана: {{ fmtNum(session.remaining) }} дет.</div>
    </div>

    <div v-if="needsControl" class="sc redflash" style="border:2px solid var(--danger)">
      <div class="row"><span class="pill danger">ПРОГНОЗ · КОНТРОЛЬ ИНСТРУМЕНТА</span></div>
      <div class="row" style="margin-top:6px">
        <b class="grow">Наработка {{ fact }} из нормы {{ norm }} дет.</b>
        <button class="btn danger sm" @click="toolsS.control(toolId); ui.push('Контроль подтверждён (Н42)', 'ok')">КОНТРОЛИРУЮ</button>
      </div>
    </div>
    <div v-else-if="sos" class="warnbox" style="cursor:pointer" @click="router.push('/op/sos')">
      Остановка по SOS. Перейти к статусу вызова →
    </div>

    <div class="sc">
      <div class="row">
        <div class="grow"><b>{{ t?.name }}</b><span class="hint" style="display:block">Основной инструмент · позиция {{ t?.pos }}</span></div>
        <span :class="['pill', toolsS.badge(toolId).cls]">{{ toolsS.badge(toolId).text }}</span>
      </div>
      <div class="divider"></div>
      <div class="row"><span class="hint">Факт {{ fact }} дет. · прогноз ещё {{ fc.parts }} до контроля</span></div>
      <div class="row" style="gap:16px">
        <div class="grow">
          <div class="meter"><i :style="{ width: pctFact + '%', background: needsControl ? 'var(--danger)' : 'var(--brand)' }"></i></div>
          <div class="hint">Факт · {{ fact }} дет.</div>
        </div>
        <div class="grow">
          <div class="meter"><i :style="{ width: pctForecast + '%', background: 'var(--warn)', border: '1.5px dashed #c08a00' }"></i></div>
          <div class="hint">Прогноз · до контроля {{ fc.parts }} дет.</div>
        </div>
      </div>
      <div class="hint" style="margin-top:6px">
        Норма стойкости {{ norm }}
        <template v-if="toolsS.hasTemp(toolId)"><b> · временная (Н32)</b></template>
      </div>
    </div>

    <div class="sc">
      <h5>Мой инструмент</h5>
      <div class="titem">
        <div class="photo">{{ (t?.short || t?.name || 'Т')[0] }}</div>
        <div class="info"><b>{{ t?.name }}</b><span>Осталось годных на месте</span></div>
        <div class="tcenter"><b>{{ stock?.onHand }}</b><div class="hint">шт</div></div>
      </div>
    </div>

    <template #footer>
      <div class="toolbar">
        <button class="btn primary sm grow" @click="router.push('/op/change')">СМЕНА ИНСТРУМЕНТА</button>
        <button class="btn accent sm grow" @click="router.push('/op/order')">ЗАКАЗАТЬ</button>
        <button class="btn ghost sm" @click="router.push('/op/problem')">СООБЩИТЬ</button>
        <button class="btn danger sm" @click="router.push('/op/sos')">ВЫЗВАТЬ СПЕЦ.</button>
      </div>
    </template>
  </TabletFrame>
</template>