<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToolsStore } from '@/store/tools'
import { useUiStore } from '@/store/ui'
import { parts, machines, tools } from '@/data/master'
import { percent } from '@/utils/time'
import ScreenShell from '@/components/ScreenShell.vue'
import WebFrame from '@/components/WebFrame.vue'

const toolsS = useToolsStore()
const ui = useUiStore()
const router = useRouter()

const partId = ref('1151')
const opId = ref('15')
const altName = ref('')

const currentPart = computed(() => parts.find((p) => p.id === partId.value))
const currentMachine = computed(() => machines.find((x) => x.part === partId.value && x.op === opId.value))
const mainId = computed(() => currentMachine.value?.mainTool || '')
const mainInfo = computed(() => {
  const id = mainId.value
  return id
    ? { workload: toolsS.workload(id), pct: Math.round(percent(toolsS.workload(id), toolsS.norm(id))) }
    : { workload: 0, pct: 0 }
})
const rows = computed(() => {
  const m = currentMachine.value
  const main = tools.find((t) => t.id === m?.mainTool)
  const alts = localStorage.getItem('dtts-alts')
  const extra = alts ? JSON.parse(alts).filter((a) => a.part === partId.value && a.op === opId.value) : []
  const list = [
    { label: 'Основной', tool: main?.name, article: main?.article, condition: '—', active: true, ok: true },
    ...(main?.alts || []).map((a, i) => ({ label: `Альт. №${i + 1}`, tool: a.name, article: a.article, condition: a.condition || '—', active: !a.condition, ok: !a.condition })),
    ...extra,
  ]
  return list
})

function saveExtra(list) {
  const alts = JSON.parse(localStorage.getItem('dtts-alts') || '[]')
  alts.push(...list)
  localStorage.setItem('dtts-alts', JSON.stringify(alts))
}

function addAlt() {
  if (!altName.value.trim()) {
    ui.push('Укажите название альтернативы', 'err')
    return
  }
  saveExtra([{ part: partId.value, op: opId.value, label: 'Альтернатива', tool: altName.value, article: '—', condition: '—', active: true, ok: true }])
  altName.value = ''
  ui.push('Альтернатива добавлена', 'ok')
}
</script>

<template>
  <ScreenShell
    kick="Веб · Менеджер"
    desc="Для каждой операции: основной инструмент и альтернативы с приоритетом и условиями применения."
  >
    <WebFrame title="Техпроцесс и альтернативы">
      <div class="web-tb">
        <h3>Картер 1151 · Оп. 15 — Точение фланца</h3>
        <div class="fr">
          <select class="input normal" style="max-width:170px" v-model="partId">
            <option v-for="p in parts" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <select class="input normal" style="max-width:170px" v-model="opId">
            <option v-for="o in currentPart?.ops" :key="o.id" :value="o.id">Оп. {{ o.id }} — {{ o.name }}</option>
          </select>
        </div>
      </div>

      <div class="card">
        <table class="tbl">
          <tr><th>Приоритет</th><th>Инструмент</th><th>Артикул</th><th>Условия применения</th><th>Статус</th></tr>
          <tr v-for="r in rows" :key="r.tool + r.label">
            <td><span :class="['pill', r.label === 'Основной' ? 'gray' : 'info']">{{ r.label }}</span></td>
            <td><b>{{ r.tool }}</b></td>
            <td>{{ r.article }}</td>
            <td>{{ r.condition }}</td>
            <td><span :class="['pill', r.active ? 'ok' : 'warn']">{{ r.active ? 'активен' : 'заблокировано' }}</span></td>
          </tr>
        </table>
      </div>

      <div class="card" style="margin-top:10px">
        <div class="row">
          <input v-model="altName" class="input normal" style="flex:1" placeholder="Новая альтернатива (например, Сверло Ø6,0 SNMM)">
          <button class="btn accent sm" @click="addAlt">ДОБАВИТЬ</button>
        </div>
        <div class="hint" style="margin-top:6px">Сигнал системы считается автоматически: если основная пластина закончится через N деталей, альтернатива с условием «СОЖ > 4%» при текущей 3,5% остаётся заблокированной.</div>
      </div>

      <div class="note">{{ currentPart?.name }} · Оп. {{ opId }} · основной инструмент наработал {{ mainInfo.workload }} дет. ({{ mainInfo.pct }}% нормы).</div>
    </WebFrame>
  </ScreenShell>
</template>