<script setup>
import { ref, computed } from 'vue'
import { useSessionStore } from '@/store/session'
import { useUiStore } from '@/store/ui'
import { useLogStore } from '@/store/log'
import { tools, parts, employees } from '@/data/master'
import { fmtTime } from '@/utils/time'
import ScreenShell from '@/components/ScreenShell.vue'
import WebFrame from '@/components/WebFrame.vue'

const session = useSessionStore()
const ui = useUiStore()
const log = useLogStore()

const tests = ref([
  { id: 1, tool: 'Пластина SNMM 8804 (партия B)', op: 'Оп. 25 — резьба', operator: 'Васнев Т.О.', result: '480 дет., качество ок', status: 'ok', decided: 'Как основной' },
  { id: 2, tool: 'Сверло Ø6,0 TIN-Co', op: 'Оп. 15', operator: 'Крылов А.В.', result: '', status: 'active', decided: '' },
])

const createTool = ref('d6')
const createOp = ref('15')
const createEmp = ref('ak')
const values = ref({})
const b = ref('')

const empByName = (id) => employees.find((e) => e.id === id)?.fio

function createTest() {
  const t = tools.find((x) => x.id === createTool.value)
  tests.value.unshift({
    id: Date.now(),
    tool: t.name,
    op: `Оп. ${createOp.value}`,
    operator: empByName(createEmp.value),
    result: '',
    status: 'active',
    decided: '',
  })
  ui.push('Задание на испытание создано', 'ok')
}

function decide(row, decision) {
  row.decided = decision
  row.status = decision === 0 ? 'rejected' : 'ok'
  const label = ['Не внедряем', 'Как альтернативу', 'Как основной'][decision + 1]
  row.decided = label
  log.add('испытание', `Испытание «${row.tool}»: ${label}`)
  ui.push(`Утверждено: ${label}`, 'ok')
}
</script>

<template>
  <ScreenShell
    kick="Веб · Менеджер"
    desc="Задания на испытание инструмента, фиксация результатов наладчиком и утверждение: основной / альтернатива / не внедряем."
  >
    <WebFrame title="Испытания">
      <div class="web-tb"><h3>Активные испытания</h3><div class="fr"><button class="btn primary sm" @click="createTest">СОЗДАТЬ ИСПЫТАНИЕ</button></div></div>
      <div class="card">
        <div class="row" style="padding:6px 0">
          <select class="input normal" style="flex:1" v-model="createTool">
            <option v-for="t in tools" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
          <select class="input normal" style="width:110px" v-model="createOp">
            <option value="15">Оп. 15</option><option value="25">Оп. 25</option>
          </select>
          <select class="input normal" style="flex:1" v-model="createEmp">
            <option v-for="e in employees.filter((x) => x.role === 'op')" :key="e.id" :value="e.id">{{ e.fio }}</option>
          </select>
        </div>
      </div>
      <div class="card" style="margin-top:10px">
        <table class="tbl">
          <tr><th>Испытание</th><th>Операция</th><th>Наладчик</th><th>Результат</th><th>Утверждение</th></tr>
          <tr v-for="row in tests" :key="row.id">
            <td><b>{{ row.tool }}</b></td>
            <td>{{ row.op }}</td>
            <td>{{ row.operator }}</td>
            <td>
              <input v-model="row.result" class="input normal" style="width:100%" placeholder="деталей, качество">
            </td>
            <td>
              <template v-if="row.status === 'active'">
                <button class="fbtn on" @click="decide(row, 1)">Как основной</button>
                <button class="fbtn" @click="decide(row, 0)">Как альтернативу</button>
                <button class="fbtn" @click="decide(row, -1)">Не внедряем</button>
              </template>
              <span v-else class="pill ok">{{ row.decided }}</span>
            </td>
          </tr>
        </table>
        <div class="note">Результат фиксирует наладчик на планшете (количество деталей, качество, фото), решение — технолог/менеджер.</div>
      </div>
    </WebFrame>
  </ScreenShell>
</template>