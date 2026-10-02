<script setup>
import { ref, computed } from 'vue'
import { useToolsStore } from '@/store/tools'
import { useUiStore } from '@/store/ui'
import { useSessionStore } from '@/store/session'
import { employee, tools, employees } from '@/data/master'
import ScreenShell from '@/components/ScreenShell.vue'
import WebFrame from '@/components/WebFrame.vue'

const toolsS = useToolsStore()
const ui = useUiStore()
const session = useSessionStore()

const toolId = ref('d6')
const empId = ref('ak')
const qty = ref(1)
const ops = employees.filter((e) => e.role === 'op')

const tool = computed(() => tools.find((t) => t.id === toolId.value))
const onHand = computed(() => toolsS.stocks[toolId.value].onHand)

function issue() {
  const q = Math.min(qty.value, toolsS.stocks[toolId.value].warehouse)
  toolsS.deliverFromWarehouse(toolId.value, q)
  ui.push(`${tool.value.name} ×${q} выдано наладчику ${employee(empId.value).fio}`, 'ok')
  qty.value = 1
}
</script>

<template>
  <ScreenShell
    kick="Веб · Менеджер"
    desc="Выдача инструмента наладчику: выбор из справочника, получатель из числа наладчиков. Журнал действий ведётся автоматически."
  >
    <WebFrame title="Выдача инструмента">
      <div class="grid3">
        <div class="card">
          <div class="sc-label">1. Инструмент · со склада</div>
          <div v-for="t in tools" :key="t.id" class="opt" :class="{ sel: toolId === t.id }" @click="toolId = t.id">
            <div class="grow"><b>{{ t.name }}</b><span class="hint" style="display:block">склад: {{ toolsS.stocks[t.id].warehouse }} шт</span></div>
          </div>
        </div>
        <div class="card">
          <div class="sc-label">2. Наладчик</div>
          <div v-for="e in ops" :key="e.id" class="opt" :class="{ sel: empId === e.id }" @click="empId = e.id">
            <div class="photo">{{ e.initials }}</div>
            <div class="grow"><b>{{ e.fio }}</b><span class="hint" style="display:block">УПС-3 · Линия 1</span></div>
          </div>
        </div>
        <div class="card">
          <div class="sc-label">3. Оформить выдачу</div>
          <div class="numpad" style="margin-top:8px">
            <button class="kbd" @click="qty = Math.max(1, qty - 1)">−</button>
            <input class="input" style="text-align:center" type="number" v-model="qty">
            <button class="kbd" @click="qty = qty + 1">+</button>
          </div>
          <button class="btn accent" style="margin-top:10px;width:100%" @click="issue">ВЫДАТЬ</button>
          <div class="hint" style="margin-top:6px">На рабочем месте станет: {{ onHand + Math.min(qty, toolsS.stocks[toolId].warehouse) }} шт. Запись уйдёт в журнал.</div>
        </div>
      </div>
      <div class="note">Возможность «отозвать» инструмент доступна, если наладчик уволен или перестал работать.</div>
    </WebFrame>
  </ScreenShell>
</template>