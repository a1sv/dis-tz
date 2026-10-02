<script setup>
import { ref } from 'vue'
import { useNormsStore } from '@/store/norms'
import { useToolsStore } from '@/store/tools'
import { useSessionStore } from '@/store/session'
import { useUiStore } from '@/store/ui'
import { tool as toolDef } from '@/data/master'
import { fmtTime } from '@/utils/time'
import ScreenShell from '@/components/ScreenShell.vue'
import WebFrame from '@/components/WebFrame.vue'

const norms = useNormsStore()
const toolsS = useToolsStore()
const session = useSessionStore()
const ui = useUiStore()

const otherValue = ref(0)

function decide(pr, decision) {
  norms.decide(
    pr.id,
    decision,
    decision === 'other' ? Math.max(1, Number(otherValue.value) || pr.value) : null,
    decision === 'approve' ? 'Согласовано для текущей партии' : '',
  )
  ui.push(`Решение по норме ${toolDef(pr.toolId).name} принято`, 'ok')
}
</script>

<template>
  <ScreenShell
    kick="Веб · Менеджер"
    desc="Три действия по предложению наладчика: подтвердить, установить другую временную норму или вернуть обычную. Решение сразу применяется к расчётам."
  >
    <WebFrame title="Нормы стойкости · решения" :badge="`Ожидают: ${norms.pending.length}`">
      <div class="web-tb"><h3>Предложения на рассмотрении</h3></div>
      <div class="card">
        <table class="tbl">
          <tr><th>Инструмент · операция</th><th>Обычная</th><th>Предложено</th><th>Причина</th><th>Решение</th></tr>
          <tr v-for="pr in norms.pending" :key="pr.id">
            <td><b>{{ toolDef(pr.toolId)?.name }}</b><br><span class="hint">оп. рабочего места</span></td>
            <td>{{ toolsS.norm(pr.toolId) === pr.value ? '—' : toolsS.norm(pr.toolId) }}</td>
            <td><b class="warn-text">{{ pr.value }}</b></td>
            <td>{{ pr.reason }}</td>
            <td>
              <div class="row">
                <button class="fbtn on" @click="decide(pr, 'approve')">Подтвердить {{ pr.value }}</button>
                <button class="fbtn" @click="decide(pr, 'other')">Временная</button>
                <button class="fbtn" @click="decide(pr, 'revert')">Вернуть</button>
                <input class="input normal" type="number" style="width:66px" v-model="otherValue" placeholder="н/в">
              </div>
            </td>
          </tr>
        </table>
        <div class="note" v-if="!norms.pending.length">Ожидающих предложений нет. Наладчик может предложить норму на планшете.</div>
      </div>

      <div class="web-tb"><h3>История решений</h3></div>
      <div class="card">
        <table class="tbl">
          <tr><th>Инструмент</th><th>Решение</th><th>Время</th></tr>
          <tr v-for="pr in norms.proposals.filter((p) => p.status === 'decided')" :key="pr.id">
            <td>{{ toolDef(pr.toolId)?.name }}</td>
            <td><span class="pill ok">{{ norms.decisionLabel(pr) }}</span></td>
            <td>{{ fmtTime(pr.decidedAt) }}</td>
          </tr>
        </table>
      </div>
    </WebFrame>
  </ScreenShell>
</template>