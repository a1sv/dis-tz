<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/store/session'
import { useToolsStore } from '@/store/tools'
import { useUiStore } from '@/store/ui'
import { reasons, tool as toolDef } from '@/data/master'
import TabletFrame from '@/components/TabletFrame.vue'

const session = useSessionStore()
const toolsS = useToolsStore()
const ui = useUiStore()
const router = useRouter()

const toolId = computed(() => session.machine?.mainTool || 'd6')
const t = computed(() => toolDef(toolId.value))
const reason = ref(reasons[0])
const qty = ref(1)
const counter = ref('')

function save() {
  if (toolsS.stocks[toolId.value].onHand <= 0) {
    ui.push('Нет годного инструмента на рабочем месте — закажите', 'err')
    return
  }
  const value = counter.value ? session.lastCounters[session.machine?.id] : ''
  toolsS.replace(toolId.value, { qty: Math.max(1, qty.value), reason: reason.value, byId: session.loggedInId })
  ui.push(`Замена сохранена · запас теперь ${toolsS.stocks[toolId.value].onHand} шт`, 'ok')
  counter.value = ''
  router.push('/op/work')
}
</script>

<template>
  <TabletFrame title="Смена инструмента" :sub="`${t?.name} · поз. ${t?.pos}`">
    <template #badge>
      <span :class="['pill', toolsS.stocks[toolId].onHand > 0 ? 'ok' : 'danger']">Годных: {{ toolsS.stocks[toolId].onHand }} шт</span>
    </template>

    <div class="sc">
      <div class="row">
        <div class="grow"><span class="sc-label">Снятый экземпляр · наработка</span><b class="metric">{{ toolsS.workload(toolId) }} дет.</b></div>
        <div class="tcenter"><span class="sc-label">Норма</span><b>{{ toolsS.norm(toolId) }}</b></div>
      </div>
      <div class="field" style="margin-top:8px">
        <label>Показание счётчика в момент замены</label>
        <input v-model="counter" :placeholder="String(session.lastCounters[session.machine?.id] ?? '')" class="input" type="number">
      </div>
    </div>

    <div class="field">
      <label>Причина замены</label>
      <div v-for="r in reasons" :key="r" class="opt" :class="{ sel: reason === r }" @click="reason = r">{{ r }}</div>
    </div>

    <div class="field">
      <label>Количество</label>
      <div class="numpad">
        <button class="kbd" @click="qty = Math.max(1, qty - 1)">−</button>
        <input class="input" style="text-align:center" type="number" v-model="qty">
        <button class="kbd" @click="qty = qty + 1">+</button>
      </div>
    </div>

    <div class="okbox" style="margin-top:6px">Годный запас уменьшится на {{ qty }} шт. Наработка нового экземпляра начнётся с нуля. Снятый инструмент — в место негодного.</div>

    <template #footer>
      <button class="btn ghost" @click="router.push('/op/work')">ОТМЕНА</button>
      <button class="btn primary big" @click="save">СОХРАНИТЬ ЗАМЕНУ</button>
    </template>
  </TabletFrame>
</template>