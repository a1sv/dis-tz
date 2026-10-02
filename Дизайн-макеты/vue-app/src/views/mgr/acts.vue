<script setup>
import { useToolsStore } from '@/store/tools'
import { useUiStore } from '@/store/ui'
import { useLogStore } from '@/store/log'
import { tool as toolDef, reasons } from '@/data/master'
import { fmtTime } from '@/utils/time'
import ScreenShell from '@/components/ScreenShell.vue'
import WebFrame from '@/components/WebFrame.vue'

const toolsS = useToolsStore()
const ui = useUiStore()
const log = useLogStore()

function changeReason(r, reason) {
  r.reason = reason
  const t = toolDef(r.toolId)
  log.add('акт', `Причина списания ${t.name} изменена на «${reason}»`)
  ui.push('Причина списания изменена', 'ok')
}

function export1c() {
  const t = toolsS.history.length
  ui.push(t ? `Накладная на списание сформирована (${t} позиций) для 1С` : 'Нет незакрытых списаний', t ? 'ok' : 'warn')
  log.add('экспорт', `Экспорт в 1С: накладная на списание`)
}
</script>

<template>
  <ScreenShell
    kick="Веб · Менеджер"
    desc="Незакрытые списания (замены, зафиксированные наладчиками), корректировка причины и экспорт в 1С."
  >
    <WebFrame title="Акты на списание · 1С">
      <div class="web-tb"><h3>Незакрытые списания</h3><div class="fr"><button class="btn primary sm" @click="export1c">ЭКСПОРТ В 1С</button></div></div>
      <div class="card">
        <table class="tbl">
          <tr><th>Замена</th><th>Позиция</th><th>Кол-во</th><th>Стойкость</th><th>Причина</th><th>Действие</th></tr>
          <tr v-for="r in [...toolsS.history].reverse()" :key="r.id">
            <td>{{ fmtTime(r.at) }}</td>
            <td><b>{{ toolDef(r.toolId)?.name }}</b></td>
            <td>{{ r.qty }}</td>
            <td>{{ r.workload }} дет.</td>
            <td>
              <select class="input normal" style="padding:4px" :value="r.reason" @change="changeReason(r, $event.target.value)">
                <option v-for="x in reasons" :key="x" :value="x">{{ x }}</option>
              </select>
            </td>
            <td><button class="fbtn">Открыть</button></td>
          </tr>
        </table>
        <div class="note" v-if="!toolsS.history.length">Списаний пока нет — они появятся после замен, зарегистрированных наладчиком.</div>
      </div>
    </WebFrame>
  </ScreenShell>
</template>