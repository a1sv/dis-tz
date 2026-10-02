<script setup>
import { ref, computed } from 'vue'
import { useSessionStore } from '@/store/session'
import { useSosStore } from '@/store/sos'
import { useUiStore } from '@/store/ui'
import { problems, sosChain, employee } from '@/data/master'
import { fmtTime, fmtDur } from '@/utils/time'
import TabletFrame from '@/components/TabletFrame.vue'

const session = useSessionStore()
const sosStore = useSosStore()
const ui = useUiStore()

const problem = ref(problems[2].name)
const offline = ref(false)
const counter = ref('')

const ev = computed(() => sosStore.latest())
const addresser = computed(() => sosStore.addresser(ev.value))
const idle = computed(() => (ev.value ? sosStore.idleMinutes(ev.value) : 0))

function trigger() {
  session.offline = offline.value
  const newEv = sosStore.create({ problem: problem.value, canWork: true })
  ui.push(offline.value ? 'SOS сохранён локально (нет связи)' : `SOS №${newEv.num} отправлен`, 'warn')
}

function acceptWait() {
  ui.push('Вызов уже передан ответственному', 'warn')
  // В MVP принять может только менеджер
}

function resume() {
  if (ev.value.status === 'resolved') {
    if (counter.value) session.recordReading(session.machine?.id, counter.value)
    sosStore.resume(ev.value.id)
    ui.push('Работа возобновлена', 'ok')
    counter.value = ''
  }
}

function cancelSos() {
  sosStore.cancel(ev.value.id)
  ui.push('SOS отменён · уведомления прекращены', 'ok')
}
</script>

<template>
<TabletFrame
    :title="ev ? 'SOS №' + ev.num : 'SOS · остановка'"
    :sub="ev ? (ev.status === 'open' ? 'Вызов не принят' : ev.status === 'accepted' ? 'Вызов принят' : ev.status === 'resolved' ? 'Возобновление' : 'Отменён') : 'Срочный вызов специалиста'"
    :tone="ev ? 'warn' : ''"
    ><template #badge>
      <span v-if="ev" :class="['pill', ev.status === 'resolved' ? 'ok' : 'warn']">{{ ev.status.toUpperCase() }}</span>
    </template>

    <!-- Запуск SOS -->
    <div v-if="!ev" class="sos-screen">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="52" height="52" style="margin:0 auto"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>
      <b>ВЫЗВАТЬ СПЕЦИАЛИСТА</b>
      <div class="hint" style="opacity:.85;margin-top:6px">Остановите оборудование и нажмите кнопку.<br>Прогноз наработки будет приостановлен.</div>
    </div>

    <!-- Статус открытого вызова -->
    <div v-else-if="ev.status === 'open'" class="sc">
      <span class="sc-label">Цепочка ответственных</span>
      <div v-for="(e, i) in sosChain" :key="e.id" class="titem">
        <div class="photo">{{ e.initials }}</div>
        <div class="info"><b>{{ e.fio }}</b><span>{{ e.title }}</span></div>
        <span class="pill" :class="sosChain.indexOf(addresser) === i ? 'warn' : 'gray'">
          {{ sosChain.indexOf(addresser) === i ? 'текущий адресат' : 'далее' }}
        </span>
      </div>
      <div class="hint" style="margin-top:6px">Передача непринятого вызова ответственному следующего уровня происходит автоматически.</div>
    </div>

    <!-- Принят / устранена -->
    <div v-else-if="ev.status === 'accepted' || ev.status === 'resolved'" class="sc ok-border" style="border-width: 2px">
      <div class="row"><span class="pill ok">ВЫЗОВ ПРИНЯТ</span></div>
      <div class="titem" style="border:none;padding:6px 0">
        <div class="photo p2">{{ employee(ev.acceptedBy)?.initials }}</div>
        <div class="info"><b>{{ employee(ev.acceptedBy)?.fio }} · {{ employee(ev.acceptedBy)?.title }}</b><span>Принял вызов в {{ fmtTime(ev.acceptedAt) }}</span></div>
      </div>
      <template v-if="ev.status === 'resolved'">
        <div class="okbox">«ПРОБЛЕМА УСТРАНЕНА — МОЖНО ВОЗОБНОВИТЬ РАБОТУ» (отметка менеджера)</div>
      </template>
    </div>

    <!-- Отменён -->
    <div v-else class="sc tcenter">
      <span class="pill gray">SOS отменён</span>
      <p class="hint" style="margin-top:8px">Эскалация прекращена, участники уведомлены. Возвращается прежнее рабочее состояние.</p>
    </div>

    <div v-if="ev" class="sc">
      <div class="row"><div class="grow"><b>{{ ev.problem }}</b><span class="hint" style="display:block">с {{ fmtTime(ev.startedAt) }} · остановка {{ fmtDur(idle) }}</span></div></div>
      <div v-if="ev.offline" class="warnbox" style="margin-top:6px">Вызов сохранён на планшете (нет связи). <b>Позвоните менеджеру: +7 900 000-00-00</b></div>
    </div>

    <div v-if="ev && ev.status === 'resolved'" class="field">
      <label>Показание счётчика при возобновлении</label>
      <input v-model="counter" class="input" type="number" placeholder="1 655">
    </div>

    <template #footer>
      <template v-if="ev">
        <template v-if="ev.status === 'resolved'">
          <button class="btn ok big" @click="resume">РАБОТА ВОЗОБНОВЛЕНА</button>
        </template>
        <template v-else>
          <div class="row">
            <button class="btn warn grow big" v-if="ev.status === 'open'" @click="trigger">СИМУЛЯЦИЯ НОВОГО</button>
            <button class="btn ghost grow" @click="cancelSos">ОТМЕНИТЬ SOS</button>
          </div>
        </template>
      </template>
      <template v-else>
        <button class="btn warn big" @click="trigger">ВЫЗВАТЬ СПЕЦИАЛИСТА</button>
        <button class="btn ghost sm" @click="offline = !offline">{{ offline ? '✓ Имитация: нет связи' : 'Имитация: нет связи' }}</button>
      </template>
    </template>
  </TabletFrame>
</template>