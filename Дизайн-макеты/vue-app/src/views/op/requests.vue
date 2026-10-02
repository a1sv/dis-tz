<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRequestsStore } from '@/store/requests'
import { useSessionStore } from '@/store/session'
import { useToolsStore } from '@/store/tools'
import { useSosStore } from '@/store/sos'
import { useUiStore } from '@/store/ui'
import { tool as toolDef } from '@/data/master'
import { fmtTime } from '@/utils/time'
import TabletFrame from '@/components/TabletFrame.vue'

const requests = useRequestsStore()
const session = useSessionStore()
const toolsS = useToolsStore()
const sosStore = useSosStore()
const ui = useUiStore()
const router = useRouter()

const list = computed(() => requests.mine)

function statusBadge(r) {
  if (r.status === 'new') return { text: 'новая', cls: 'warn' }
  if (r.status === 'in_delivery' || r.status === 'delivered') return { text: 'в доставке', cls: 'info' }
  if (r.status === 'partial') return { text: 'частично', cls: 'gray' }
  if (r.status === 'fulfilled') return { text: 'выполнена', cls: 'ok' }
  return { text: r.status, cls: 'gray' }
}

function confirm(r, qty) {
  const rest = requests.receive(r.id, qty)
  ui.push(rest > 0 ? `Принято ${qty}, остаток ${rest} к доставке` : 'Заявка выполнена', 'ok')
}

function urgency(r) {
  requests.setUrgent(r.id, !r.urgent)
}
</script>

<template>
  <TabletFrame title="Мои заявки" sub="Заявки и получение">
    <div v-if="!list.length" class="sc tcenter" style="padding:18px">
      <b>Заявок пока нет</b>
      <div class="hint" style="margin-top:4px">Оформите заказ на рабочем экране или в разделе «Заказать инструмент».</div>
    </div>

    <div v-for="r in list" :key="r.id" class="sc">
      <div class="row">
        <div class="grow">
          <div class="row">
            <b>{{ toolDef(r.toolId)?.name }}</b>
            <span class="pill danger" v-if="r.urgent">СРОЧНО</span>
          </div>
          <span class="hint" style="display:block">заявка №{{ r.num }} · {{ fmtTime(r.createdAt) }} · рекомендация {{ r.recommended }}</span>
        </div>
        <span :class="['pill', statusBadge(r).cls]">{{ statusBadge(r).text }}</span>
      </div>

      <div class="row" style="margin-top:8px">
        <div class="tcenter grow"><span class="sc-label">Заказано</span><b>{{ r.qty }}</b></div>
        <div v-if="r.taken" class="tcenter grow"><span class="sc-label">В доставке</span><b>{{ r.taken }}</b></div>
        <div class="tcenter grow"><span class="sc-label">Принято</span><b class="ok-text">{{ r.received }}</b></div>
        <div v-if="r.qty - r.received > 0" class="tcenter grow"><span class="sc-label warn-text">Остаток</span><b class="warn-text">{{ r.qty - r.received }}</b></div>
      </div>

      <div class="toolbar" style="margin-top:8px">
        <button class="btn ok sm grow" v-if="r.status === 'delivered'" @click="confirm(r, r.taken)">ПОДТВЕРДИТЬ ПОЛУЧЕНИЕ</button>
        <button class="btn ok sm grow" v-else-if="r.status === 'partial' && r.taken - r.received > 0" @click="confirm(r, r.taken - r.received)">ПРИНЯТЬ ОСТАТОК</button>
        <button class="btn danger sm" v-if="r.status !== 'fulfilled' && r.status !== 'new'" @click="urgency(r)">НУЖНО СРОЧНО</button>
      </div>
    </div>

    <template #footer>
      <button class="btn accent big" @click="router.push('/op/order')">ЗАКАЗАТЬ ИНСТРУМЕНТ</button>
    </template>
  </TabletFrame>
</template>