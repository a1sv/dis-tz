<script setup>
import { computed } from 'vue'
import { useToolsStore } from '@/store/tools'
import { useUiStore } from '@/store/ui'
import { tools } from '@/data/master'
import { fmtTime } from '@/utils/time'
import ScreenShell from '@/components/ScreenShell.vue'
import WebFrame from '@/components/WebFrame.vue'

const toolsS = useToolsStore()
const ui = useUiStore()

const rows = computed(() =>
  tools.map((t) => {
    const s = toolsS.stocks[t.id]
    const total = s.onHand + s.warehouse
    const status =
      total < t.safety ? { t: 'критично', c: 'danger' } : s.warehouse <= 0 ? { t: 'заканчивается', c: 'warn' } : { t: 'норма', c: 'ok' }
    return { tool: t, s, status }
  }),
)

function supply(t) {
  if (toolsS.stocks[t.id].warehouse < t.safety) {
    ui.push(`Автозаказ на склад создан для ${t.name}`, 'ok')
    toolsS.createSupply(t.id)
  } else {
    ui.push(`${t.name}: остатка хватает для штатной работы`, 'ok')
  }
}
</script>

<template>
  <ScreenShell
    kick="Веб · Менеджер"
    desc="Остатки склада заказчика (1С) с интегрированным порогом страхового запаса. Автозаказ создаётся при остатке ниже страхового запаса."
  >
    <WebFrame title="Остатки на складе · интеграция 1С">
      <div class="web-tb"><h3>Склад заказчика</h3><div class="fr"><button class="fbtn on">Критические</button><button class="fbtn">Все</button></div></div>
      <div class="card">
        <table class="tbl">
          <tr><th>Артикул</th><th>Позиция</th><th>На участке</th><th>На складе</th><th>Страховой запас</th><th>Статус</th><th>Автозаказ в 1С</th></tr>
          <tr v-for="{ tool: t, s, status } in rows" :key="t.id">
            <td>{{ t.article }}</td>
            <td><b>{{ t.name }}</b></td>
            <td>{{ s.onHand }}</td>
            <td>{{ s.warehouse }}</td>
            <td>{{ t.safety }}</td>
            <td><span :class="['pill', status.c]">{{ status.t }}</span></td>
            <td><button class="btn accent sm" @click="supply(t)">СОЗДАТЬ ЗАКАЗ</button></td>
          </tr>
        </table>
        <div class="note">Порог срабатывания: суммарный остаток &lt; страхового запаса → автозаказ. Одна накладная на списание формируется на период.</div>
      </div>

      <div class="web-tb"><h3>Автозаказы на склад</h3></div>
      <div class="card">
        <table class="tbl">
          <tr><th>Инструмент</th><th>Кол-во</th><th>Статус</th><th></th></tr>
          <tr v-for="o in toolsS.supply" :key="o.id">
            <td><b>{{ tools.find((t) => t.id === o.toolId).name }}</b></td>
            <td>×{{ o.qty }}</td>
            <td><span :class="['pill', o.status === 'received' ? 'ok' : 'warn']">{{ o.status }}</span></td>
            <td>
              <button v-if="o.status !== 'received'" class="fbtn on" @click="toolsS.acceptSupply(o.id); ui.push('Поступление на склад принято', 'ok')">Поступило</button>
            </td>
          </tr>
        </table>
      </div>
    </WebFrame>
  </ScreenShell>
</template>