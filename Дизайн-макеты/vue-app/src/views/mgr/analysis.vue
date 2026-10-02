<script setup>
import { computed } from 'vue'
import { useToolsStore } from '@/store/tools'
import { useSessionStore } from '@/store/session'
import { tool as toolDef } from '@/data/master'
import { fmtTime, percent } from '@/utils/time'
import ScreenShell from '@/components/ScreenShell.vue'
import WebFrame from '@/components/WebFrame.vue'

const toolsS = useToolsStore()
const session = useSessionStore()

const history = computed(() => toolsS.history)

const bars = computed(() =>
  history.value.slice(-8).map((r) => ({
    h: Math.round(percent(r.workload, toolDef(r.toolId).norm)),
    cls: r.reason.includes('ПОЛОМКА') || r.reason.includes('СКОЛ') ? 'danger' : r.workload >= toolDef(r.toolId).norm ? 'ok' : '',
    tool: toolDef(r.toolId),
  })),
)
</script>

<template>
  <ScreenShell
    kick="Веб · Менеджер"
    desc="Фактическая стойкость по завершённым заменам рядом с нормой. По каждой точке — время, причина, наработка."
  >
    <WebFrame title="Анализ стойкости">
      <div class="web-tb"><h3>Факт vs действовавшая норма</h3>
        <div class="fr"><button class="fbtn on">УПС-3</button><button class="fbtn">Все места</button></div>
      </div>
      <div class="card">
        <div class="chart" style="height:160px">
          <div v-for="(b, i) in bars" :key="i" class="bar" :class="b.cls" :style="{ height: Math.max(4, b.h) + '%' }"></div>
        </div>
        <div class="row" style="margin-top:6px">
          <span class="pill gray">норма — 100%</span>
          <span class="pill danger">поломка / скол</span>
          <span class="pill ok">сверх нормы</span>
        </div>
      </div>

      <div class="web-tb"><h3>Замены (точки)</h3></div>
      <div class="card">
        <table class="tbl">
          <tr><th>Время</th><th>Инструмент</th><th>Стойкость</th><th>Норма</th><th>Причина</th></tr>
          <tr v-for="r in [...history].reverse()" :key="r.id">
            <td>{{ fmtTime(r.at) }}</td>
            <td><b>{{ toolDef(r.toolId)?.name }}</b></td>
            <td><b>{{ r.workload }} дет.</b></td>
            <td>{{ toolDef(r.toolId)?.norm }}</td>
            <td>{{ r.reason }}</td>
          </tr>
        </table>
        <div class="note" v-if="!history.length">Замены появятся после регистрации наладчиком на планшете.</div>
      </div>
    </WebFrame>
  </ScreenShell>
</template>