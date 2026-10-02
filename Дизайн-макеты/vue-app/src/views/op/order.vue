<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/store/session'
import { useToolsStore } from '@/store/tools'
import { useRequestsStore } from '@/store/requests'
import { useUiStore } from '@/store/ui'
import { tools } from '@/data/master'
import TabletFrame from '@/components/TabletFrame.vue'

const session = useSessionStore()
const toolsS = useToolsStore()
const requests = useRequestsStore()
const ui = useUiStore()
const router = useRouter()

const toolId = ref(session.machine?.mainTool || 'd6')
const qty = ref(1)
const urgent = ref(false)

const t = computed(() => tools.find((x) => x.id === toolId.value))
const recommend = computed(() => requests.recommendation(toolId.value))
const open = computed(() => requests.openFor(toolId.value))

watch(recommend, (r) => {
  if (!open.value) qty.value = Math.max(1, r)
}, { immediate: true })

function submit() {
  const r = requests.create(toolId.value, urgent.value)
  r.qty = Math.max(1, qty.value)
  ui.push(`Заявка №${r.num} отправлена менеджеру (×${r.qty})`, 'ok')
  router.push('/op/requests')
}

function increase() {
  const r = open.value
  if (r) {
    r.qty += 1
    ui.push(`Заявка №${r.num} увеличена до ${r.qty}`, 'ok')
  }
}
</script>

<template>
  <TabletFrame title="Заказать инструмент" sub="Период: текущая + следующая смена">
    <template #badge><span class="pill warn">Рекомендация {{ recommend }}</span></template>

    <div class="field">
      <label>Инструмент</label>
      <div v-for="x in tools" :key="x.id" class="opt" :class="{ sel: toolId === x.id }" @click="toolId = x.id">
        <div class="grow"><b>{{ x.name }}</b><span class="hint" style="display:block">Годных: {{ toolsS.stocks[x.id].onHand }} · в заявке: {{ requests.incoming(x.id) }}</span></div>
      </div>
    </div>

    <div class="sc">
      <div class="row">
        <div class="tcenter grow"><span class="sc-label">Потребность</span><b>{{ t?.need }}</b></div>
        <div class="tcenter grow"><span class="sc-label">Годный остаток</span><b>{{ toolsS.stocks[toolId].onHand }}</b></div>
        <div class="tcenter grow"><span class="sc-label">В заявке</span><b>{{ requests.incoming(toolId) }}</b></div>
        <div class="tcenter grow"><span class="sc-label accent-text">Рекомендация</span><b class="accent-text metric">{{ recommend }}</b></div>
      </div>
    </div>

    <div class="field">
      <label>Количество (может быть больше рекомендации)</label>
      <div class="numpad">
        <button class="kbd" @click="qty = Math.max(1, qty - 1)">−</button>
        <input class="input" style="text-align:center" type="number" v-model="qty">
        <button class="kbd" @click="qty = qty + 1">+</button>
      </div>
    </div>

    <div v-if="open" class="okbox">Заявка №{{ open.num }} уже открыта — увеличить без дубля.</div>

    <template #footer>
      <template v-if="open">
        <button class="btn accent big" @click="increase">УВЕЛИЧИТЬ И УВЕДОМИТЬ</button>
      </template>
      <template v-else>
        <button class="btn accent big" @click="submit">ОТПРАВИТЬ ЗАЯВКУ МЕНЕДЖЕРУ</button>
        <button class="btn ghost sm" @click="urgent = !urgent">{{ urgent ? '✓ Нужно срочно' : 'Нужно срочно' }}</button>
      </template>
    </template>
  </TabletFrame>
</template>