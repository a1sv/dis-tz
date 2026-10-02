<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/store/session'
import { useToolsStore } from '@/store/tools'
import { useUiStore } from '@/store/ui'
import { tools, machines, storageGood } from '@/data/master'
import TabletFrame from '@/components/TabletFrame.vue'

const session = useSessionStore()
const toolsS = useToolsStore()
const ui = useUiStore()
const router = useRouter()

const accepted = ref({})
const counters = ref({})
const init = () => {
  tools.forEach((t) => (accepted.value[t.id] = toolsS.stocks[t.id].onHand))
  machines.forEach((m) => (counters.value[m.id] = m.counterStart))
}
init()

const done = computed(() => session.receptionDone)
const reads = computed(() => session.activeReadings)

function save() {
  tools.forEach((t) => toolsS.adjustStock(t.id, Number(accepted.value[t.id]) || 0))
  machines.forEach((m) => session.setInitialCounter(m.id, counters.value[m.id]))
  session.startShift()
  ui.push('Приём выполнен · Годные остатки приняты', 'ok')
  router.push('/op/work')
}
</script>

<template>
  <TabletFrame title="Приём рабочего места" sub="Годный инструмент · начальные показания">
    <!-- Уже принято -->
    <div v-if="done" class="sc tcenter" style="padding:18px">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="40" height="40" class="ok-text" style="margin:0 auto"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
      <b>Приём рабочего места завершён</b>
      <div class="tlist" style="text-align:left;margin-top:8px">
        <div v-for="r in reads" :key="r.machine.id" class="titem">
          <div class="info"><b>{{ r.machine.name }} · {{ r.machine.part }} / оп. {{ r.machine.op }}</b>
            <span>начало {{ r.initial }} · выпуск {{ r.production }} дет.</span></div>
          <span class="pill ok">ок</span>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Годный инструмент -->
      <div class="sc">
        <span class="sc-label">Место хранения · {{ storageGood }}</span>
        <div v-for="t in tools" :key="t.id" class="titem">
          <div class="photo">{{ t.short[0] }}</div>
          <div class="info"><b>{{ t.name }}</b><span>на рабочем месте</span></div>
          <div class="nums">
            <button class="kbd" style="padding:6px 12px" @click="accepted[t.id] = Math.max(0, (Number(accepted[t.id]) || 0) - 1)">−</button>
            <b class="metric" style="min-width:34px;text-align:center">{{ accepted[t.id] ?? 0 }}</b>
            <button class="kbd" style="padding:6px 12px" @click="accepted[t.id] = (Number(accepted[t.id]) || 0) + 1">+</button>
          </div>
        </div>
        <div class="hint" style="margin-top:6px">Если количество не совпадает с учётом — измените и сохранится расхождение.</div>
      </div>

      <!-- Начальные показания -->
      <div class="sc">
        <span class="sc-label">Начальные показания счётчиков</span>
        <div v-for="m in machines" :key="m.id" class="field" style="margin-top:8px">
          <label>{{ m.name }} · деталь {{ m.part }} (оп. {{ m.op }})</label>
          <input v-model="counters[m.id]" class="input" type="number" @input="counters[m.id] = $event.target.value">
        </div>
        <div class="hint">Система сама посчитает разницу, вводить выпуск вручную не нужно.</div>
      </div>
    </template>

    <template #footer>
      <template v-if="done">
        <button class="btn primary big" @click="router.push('/op/work')">К РАБОЧЕМУ ЭКРАНУ</button>
      </template>
      <template v-else>
        <button class="btn ghost">Указать расхождение отдельно</button>
        <button class="btn ok big" @click="save">ПРИСТУПИТЬ К РАБОТЕ</button>
      </template>
    </template>
  </TabletFrame>
</template>