<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/store/session'
import { useToolsStore } from '@/store/tools'
import { useNormsStore } from '@/store/norms'
import { useUiStore } from '@/store/ui'
import { normReasons, tool as toolDef } from '@/data/master'
import TabletFrame from '@/components/TabletFrame.vue'

const session = useSessionStore()
const toolsS = useToolsStore()
const norms = useNormsStore()
const ui = useUiStore()
const router = useRouter()

const toolId = computed(() => session.machine?.mainTool || 'd6')
const t = computed(() => toolDef(toolId.value))
const value = ref(420)
const reason = ref(normReasons[0])
const proposal = computed(() => norms.byTool(toolId.value))

function propose() {
  const v = Math.max(1, Number(value.value) || 1)
  const pr = norms.propose(toolId.value, v, reason.value)
  ui.push(`Временная норма ${v} применена (Н32) · ждёт подтверждения`, 'ok')
  router.push('/op/work')
}

function revertNorm() {
  toolsS.clearTempNorm(toolId.value)
  ui.push('Возвращена обычная норма', 'ok')
}
</script>

<template>
  <TabletFrame title="Норма инструмента" :sub="`${t?.name}`">
    <template #badge>
      <span v-if="proposal" class="pill warn">Ожидает подтверждения</span>
      <span v-else class="pill gray">действует обычная</span>
    </template>

    <div class="sc">
      <div class="row">
        <div class="grow"><span class="sc-label">Обычная норма</span><b class="metric">{{ toolsS.norm(toolId) }}</b></div>
        <div class="field" style="flex:1"><label>Новая норма (дет./инстр.)</label><input v-model="value" class="input" type="number"></div>
      </div>
      <div class="hint" style="margin-top:4px">Текущая норма с учётом временной: <b>{{ toolsS.tempNorms[toolId]?.value ?? toolsS.norm(toolId) }}</b></div>
    </div>

    <div class="field">
      <label>Причина</label>
      <div v-for="r in normReasons" :key="r" class="opt" :class="{ sel: reason === r }" @click="reason = r">{{ r }}</div>
    </div>

    <div v-if="proposal" class="sc">
      <div class="row"><span class="pill warn">Предложение {{ proposal.value }} дет.</span></div>
      <div class="row" style="margin-top:6px"><span class="hint grow">Причина: {{ proposal.reason }} · Н32</span></div>
      <template v-if="proposal.status === 'decided'">
        <div class="divider"></div>
        <div class="okbox">Решение менеджера: <b>{{ norms.decisionLabel(proposal) }}</b>{{ proposal.comment ? ' · ' + proposal.comment : '' }}</div>
      </template>
    </div>

    <template #footer>
      <template v-if="proposal && proposal.status === 'decided'">
        <button class="btn ghost big" @click="revertNorm">ВЕРНУТЬ ОБЫЧНУЮ НОРМУ</button>
        <button class="btn accent big" @click="router.push('/op/work')">ЗАКРЫТЬ</button>
      </template>
      <template v-else-if="proposal">
        <button class="btn ghost big" @click="router.push('/op/work')">НАЗАД</button>
      </template>
      <template v-else>
        <button class="btn accent big" @click="propose">СКОРРЕКТИРОВАТЬ НОРМУ</button>
      </template>
    </template>
  </TabletFrame>
</template>