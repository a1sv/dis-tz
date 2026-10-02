<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/store/session'
import { useToolsStore } from '@/store/tools'
import { useSosStore } from '@/store/sos'
import { useRequestsStore } from '@/store/requests'
import { useUiStore } from '@/store/ui'
import { tools } from '@/data/master'
import TabletFrame from '@/components/TabletFrame.vue'

const session = useSessionStore()
const toolsS = useToolsStore()
const sosStore = useSosStore()
const requests = useRequestsStore()
const ui = useUiStore()
const router = useRouter()

const code = ref('')
const number = ref('7')
const toolId = ref('d6')
const qty = ref(2)
const pad = ['7', '8', '9', '4', '5', '6', '1', '2', '3']

const approved = computed(() => sosStore.accessApproved())
const lastPend = computed(() => sosStore.accesses.find((a) => a.status === 'pending'))
const reserveQty = computed(() => toolsS.stocks[toolId.value].reserve)

function requestAccess() {
  sosStore.requestReserveAccess()
  ui.push('Запрос доступа отправлен менеджеру', 'ok')
}

function press(k) {
  if (code.value.length < 6) code.value += k
}

function receiveFromReserve() {
  const q = Math.min(qty.value, reserveQty.value, Math.max(1, qty.value))
  toolsS.reserveReceive(toolId.value, q)
  const open = requests.openFor(toolId.value)
  if (open) {
    open.received += q
    open.status = open.received >= open.qty ? 'fulfilled' : 'partial'
  }
  ui.push(`Получено из резерва: ${q} шт · засчитано в заявку`, 'ok')
  code.value = ''
}
</script>

<template>
  <TabletFrame title="Аварийное получение" sub="Защищённый резерв · код доступа">
    <template #badge>
      <span v-if="approved" class="pill ok">Доступ согласован</span>
      <span v-else-if="lastPend" class="pill warn">Ожидает согласования</span>
      <span v-else class="pill gray">не запрошен</span>
    </template>

    <div class="sc">
      <div class="tcenter"><span class="pill info">Согласование</span></div>
      <div class="row" style="margin-top:8px">
        <div class="grow"><b>Запросить доступ к резерву</b></div>
        <button class="btn primary sm" @click="requestAccess" :disabled="!!lastPend || approved">ЗАПРОС</button>
      </div>
      <div class="divider"></div>
      <div class="hint">Согласовывает менеджер либо руководитель по иерархии; допускается по телефону. Принятие SOS не является разрешением открыть хранилище.</div>
    </div>

    <div v-if="approved" class="sc ok-border">
      <span class="sc-label">Код доступа (не журналируется)</span>
      <div class="numpad" style="margin-top:6px">
        <button v-for="k in pad" :key="k" class="kbd" @click="press(k)">{{ k }}</button>
      </div>
      <div class="tcenter" style="margin-top:8px">
        <b class="metric" style="letter-spacing: 6px">{{ code || '······' }}</b>
      </div>
    </div>

    <div v-if="approved" class="field">
      <label>Инструмент из резерва</label>
      <div v-for="t in tools" :key="t.id" class="opt" :class="{ sel: toolId === t.id }" @click="toolId = t.id">
        <div class="grow"><b>{{ t.name }}</b><span class="hint" style="display:block">в резерве: {{ toolsS.stocks[t.id].reserve }} шт</span></div>
        <b>{{ t.id === toolId ? qty : toolsS.stocks[t.id].reserve }}</b>
      </div>
      <div class="numpad" style="margin-top:6px">
        <button class="kbd" @click="qty = Math.max(1, qty - 1)">−</button>
        <input class="input" style="text-align:center" type="number" v-model="qty">
        <button class="kbd" @click="qty = qty + 1">+</button>
      </div>
    </div>

    <template #footer>
      <button v-if="approved" class="btn danger big" @click="receiveFromReserve">ПОЛУЧИТЬ ИЗ РЕЗЕРВА</button>
      <button v-else class="btn ghost big" @click="router.push('/op/work')">НАЗАД К РАБОТЕ</button>
    </template>
  </TabletFrame>
</template>