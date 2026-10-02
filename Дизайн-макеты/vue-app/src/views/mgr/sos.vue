<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSosStore } from '@/store/sos'
import { useSessionStore } from '@/store/session'
import { useUiStore } from '@/store/ui'
import { employee } from '@/data/master'
import { fmtTime, fmtDur } from '@/utils/time'
import ScreenShell from '@/components/ScreenShell.vue'
import WebFrame from '@/components/WebFrame.vue'

const sosStore = useSosStore()
const session = useSessionStore()
const ui = useUiStore()
const router = useRouter()

const active = computed(() => sosStore.open)
const history = computed(() => sosStore.events.filter((e) => !['open', 'accepted'].includes(e.status)))

function accept(ev) {
  sosStore.accept(ev.id, session.managerMe || employee('od'))
  ui.push(`SOS №${ev.num}: вызов принят`, 'ok')
}
function resolve(ev) {
  sosStore.resolve(ev.id, 'устранено менеджером')
  ui.push(`SOS №${ev.num}: проблема устранена — ждём возобновления`, 'ok')
}
</script>

<template>
  <ScreenShell
    kick="Веб · Менеджер / ответственный по SOS"
    desc="Явное принятие вызова, цепочка эскалации, отметка устранения. Общая остановка считается до фактического возобновления работы наладчиком."
  >
    <WebFrame title="SOS и остановки" :badge="`Активных: ${active.length}`">
      <div class="web-tb"><h3>Активные вызовы</h3></div>
      <div v-for="ev in active" :key="ev.id" class="card" style="border:2px solid var(--danger);margin-bottom:12px">
        <div class="row">
          <span class="pill danger">SOS №{{ ev.num }}</span>
          <span class="pill gray">УПС-3 · Линия 1</span>
          <span style="margin-left:auto" class="hint">Начало: {{ fmtTime(ev.startedAt) }} · длится {{ fmtDur(sosStore.idleMinutes(ev)) }}</span>
        </div>
        <div class="row" style="margin-top:8px"><b>{{ ev.problem }}</b></div>
        <div class="row">
          <span class="hint">Отправил: {{ employee(ev.byId)?.fio || '—' }}</span>
          <span v-if="ev.offline" class="pill warn">сохранён локально (нет связи)</span>
        </div>

        <template v-if="ev.status === 'open'">
          <div class="row" style="margin-top:8px">
            <button class="btn ok sm" @click="accept(ev)">ПРИНЯТЬ ВЫЗОВ</button>
            <span class="hint">цепочка: адресат сейчас — следующий по иерархии</span>
          </div>
        </template>
        <template v-if="ev.status === 'accepted'">
          <div class="okbox" style="margin-top:8px">Вызов принят: {{ employee(ev.acceptedBy)?.fio }} в {{ fmtTime(ev.acceptedAt) }}</div>
          <div class="row" style="margin-top:8px">
            <button class="btn ok sm" @click="resolve(ev)">ПРОБЛЕМА УСТРАНЕНА</button>
          </div>
        </template>
      </div>

      <div class="web-tb"><h3>История</h3></div>
      <div class="card">
        <table class="tbl">
          <tr><th>№</th><th>Проблема</th><th>Начало</th><th>Возобновление</th><th>Длительность</th><th>Итог</th></tr>
          <tr v-for="ev in history" :key="ev.id">
            <td>{{ ev.num }}</td>
            <td>{{ ev.problem }}</td>
            <td>{{ fmtTime(ev.startedAt) }}</td>
            <td>{{ fmtTime(ev.resumedAt) }}</td>
            <td>{{ fmtDur(ev.resumedAt ? sosStore.idleMinutes(ev) : null) }}</td>
            <td><span :class="['pill', ev.status === 'cancelled' ? 'gray' : 'ok']">{{ ev.status === 'cancelled' ? 'отменён' : 'завершён' }}</span></td>
          </tr>
        </table>
      </div>
    </WebFrame>
  </ScreenShell>
</template>