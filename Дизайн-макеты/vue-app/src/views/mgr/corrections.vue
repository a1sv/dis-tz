<script setup>
import { ref, computed } from 'vue'
import { useLogStore } from '@/store/log'
import { useToolsStore } from '@/store/tools'
import { useUiStore } from '@/store/ui'
import { tool as toolDef } from '@/data/master'
import { fmtTime } from '@/utils/time'
import ScreenShell from '@/components/ScreenShell.vue'
import WebFrame from '@/components/WebFrame.vue'

const log = useLogStore()
const toolsS = useToolsStore()
const ui = useUiStore()

const entries = computed(() => log.all)
const paper = ref('')

function cancel(entry) {
  const refId = entry.meta.refId
  if (!refId) {
    ui.push('Это событие нельзя отменить', 'warn')
    return
  }
  toolsS.cancelReplacement(refId)
  ui.push('Замена отменена · запас восстановлен', 'ok')
}
</script>

<template>
  <ScreenShell
    kick="Веб · Менеджер"
    desc="Общий журнал событий, отмена ошибочных замен, перенос бумажных записей без повторных движений."
  >
    <WebFrame title="Корректировки и журнал">
      <div class="web-tb"><h3>Общий журнал · последние события</h3><span class="pill info">УПС-3 · УПС-5</span></div>
      <div class="card">
        <table class="tbl">
          <tr><th>Время</th><th>Тип</th><th>Событие</th><th></th></tr>
          <tr v-for="e in entries.slice(0, 30)" :key="e.id">
            <td>{{ fmtTime(e.at) }}</td>
            <td><span class="pill gray">{{ e.type }}</span></td>
            <td>{{ e.text }}</td>
            <td>
              <button v-if="e.type === 'замена'" class="fbtn danger" @click="cancel(e)">Отменить</button>
            </td>
          </tr>
        </table>
      </div>

      <div class="web-tb"><h3>Перенос бумажного бланка</h3></div>
      <div class="card">
        <div class="field">
          <label>Записи из бумажного бланка смены</label>
          <textarea v-model="paper" rows="3" class="input normal" style="width:100%" placeholder="Сверло Ø6,0 ×2 (подпись)…"></textarea>
        </div>
        <button class="btn primary sm" style="margin-top:8px" @click="paper.trim() && log.add('перенос бумаги', 'Перенос в учёт: ' + paper.trim()); paper=''; ui.push('Записи перенесены без дублей', 'ok')">ПЕРЕНЕСТИ В УЧЁТ</button>
      </div>
    </WebFrame>
  </ScreenShell>
</template>