<script setup>
import { computed } from 'vue'
import { useRequestsStore } from '@/store/requests'
import { useToolsStore } from '@/store/tools'
import { useUiStore } from '@/store/ui'
import { useSessionStore } from '@/store/session'
import { tool as toolDef } from '@/data/master'
import { fmtTime } from '@/utils/time'
import ScreenShell from '@/components/ScreenShell.vue'
import WebFrame from '@/components/WebFrame.vue'

const requests = useRequestsStore()
const toolsS = useToolsStore()
const ui = useUiStore()
const session = useSessionStore()

const list = computed(() => requests.mine)

function take(r) {
  requests.take(r.id, r.takenQty || r.qty)
  ui.push(`Заявка №${r.num}: взято в доставку`, 'ok')
}
function delivered(r) {
  requests.delivered(r.id)
  ui.push(`Заявка №${r.num}: доставлена, ждёт подтверждения наладчика`, 'ok')
}
function receiveHere(r) {
  requests.receive(r.id, r.taken)
  ui.push(`Заявка №${r.num}: инструмент принят (${r.taken} шт)`, 'ok')
}

function badge(r) {
  const map = {
    new: { t: 'новая', c: 'warn' },
    in_delivery: { t: 'в доставке', c: 'info' },
    delivered: { t: 'ждут подтверждения', c: 'info' },
    partial: { t: 'частично', c: 'gray' },
    fulfilled: { t: 'выполнена', c: 'ok' },
  }
  return map[r.status] || { t: r.status, c: 'gray' }
}
</script>

<template>
  <ScreenShell
    kick="Веб · Менеджер"
    desc="Заявки наладчиков: рекомендация и указанное количество, статус доставки, срочность. Получение подтверждает наладчик на планшете."
  >
    <WebFrame title="Заявки и доставка" :badge="`Активных: ${list.filter((r) => r.status !== 'fulfilled').length}`">
      <div class="web-tb"><h3>Заявки</h3></div>
      <div class="card">
        <table class="tbl">
          <tr><th>№</th><th>Позиция</th><th>Рекоменд.</th><th>Указано</th><th>Принято</th><th>Срочно</th><th>Статус</th><th>Действие</th></tr>
          <tr v-for="r in list" :key="r.id">
            <td>{{ r.num }}</td>
            <td><b>{{ toolDef(r.toolId)?.name }}</b><br><span class="hint">годных на месте: {{ toolsS.stocks[r.toolId].onHand }}</span></td>
            <td>{{ r.recommended }}</td>
            <td>{{ r.qty }}</td>
            <td>{{ r.received }}</td>
            <td><span class="pill danger" v-if="r.urgent">СРОЧНО</span><span v-else>-</span></td>
            <td><span :class="['pill', badge(r).c]">{{ badge(r).t }}</span></td>
            <td>
              <template v-if="r.status === 'new'">
                <input class="input normal" type="number" style="width:64px;display:inline-block" v-model.number="r.takenQty" placeholder="кол-во">
                <button class="fbtn on" @click="take(r)">Взять в доставку</button>
              </template>
              <template v-else-if="r.status === 'in_delivery'">
                <button class="fbtn on" @click="delivered(r)">Доставлено</button>
              </template>
              <template v-else-if="r.status === 'delivered'">
                <button class="fbtn" @click="receiveHere(r)">Принять за оператора</button>
                <span class="hint">ждёт подтверждения в планшете</span>
              </template>
              <template v-else>
                <span class="hint">{{ r.status === 'partial' ? `остаток ${r.qty - r.received}` : '' }}</span>
              </template>
            </td>
          </tr>
        </table>
        <div class="note" v-if="!list.length">Заявок нет. Наладчик создаёт заявки с рабочего экрана («Заказать инструмент»).</div>
      </div>
    </WebFrame>
  </ScreenShell>
</template>