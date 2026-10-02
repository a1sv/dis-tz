<script setup>
import { computed } from 'vue'
import { useSosStore } from '@/store/sos'
import { useToolsStore } from '@/store/tools'
import { useSessionStore } from '@/store/session'
import { useUiStore } from '@/store/ui'
import { employee, tools } from '@/data/master'
import { fmtTime } from '@/utils/time'
import ScreenShell from '@/components/ScreenShell.vue'
import WebFrame from '@/components/WebFrame.vue'

const sosStore = useSosStore()
const toolsS = useToolsStore()
const session = useSessionStore()
const ui = useUiStore()

const accesses = computed(() => sosStore.accesses)

function approve(acc) {
  sosStore.approveAccess(acc.id, session.managerMe || employee('od'))
  ui.push('Доступ к резерву согласован', 'ok')
}
function deny(acc) {
  sosStore.denyAccess(acc.id)
  ui.push('Доступ отклонён', 'ok')
}
</script>

<template>
  <ScreenShell
    kick="Веб · Менеджер / руководитель по иерархии"
    desc="Каждое предоставление доступа к защищённому резерву согласовывается. Код открытия не журналируется."
  >
    <WebFrame title="Аварийный резерв · доступ">
      <div class="web-tb"><h3>Запросы на доступ</h3></div>
      <div class="card">
        <table class="tbl">
          <tr><th>Время</th><th>Запросил</th><th>РМ</th><th>Статус</th><th>Решение</th></tr>
          <tr v-for="acc in accesses" :key="acc.id">
            <td>{{ fmtTime(acc.at) }}</td>
            <td>{{ employee(acc.byId)?.fio || '—' }}</td>
            <td>УПС-3</td>
            <td><span class="pill" :class="acc.status === 'approved' ? 'ok' : acc.status === 'denied' ? 'danger' : 'warn'">{{ acc.status }}</span></td>
            <td>
              <template v-if="acc.status === 'pending'">
                <button class="fbtn on" @click="approve(acc)">Согласовать</button>
                <button class="fbtn" @click="deny(acc)">Отклонить</button>
              </template>
              <span v-else class="hint">{{ employee(acc.approvedBy)?.fio }}</span>
            </td>
          </tr>
        </table>
        <div class="note" v-if="!accesses.length">Запросов нет. Наладчик запрашивает доступ в разделе «Аварийный резерв» на планшете.</div>
      </div>

      <div class="web-tb"><h3>Остатки защищённого резерва</h3></div>
      <div class="card">
        <table class="tbl">
          <tr><th>Позиция</th><th>В резерве</th><th>На рабочем месте</th></tr>
          <tr v-for="t in tools" :key="t.id">
            <td><b>{{ t.name }}</b></td>
            <td>{{ toolsS.stocks[t.id].reserve }}</td>
            <td>{{ toolsS.stocks[t.id].onHand }}</td>
          </tr>
        </table>
      </div>
    </WebFrame>
  </ScreenShell>
</template>