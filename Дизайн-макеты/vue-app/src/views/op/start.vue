<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/store/session'
import { useUiStore } from '@/store/ui'
import { graphics, parts, machines } from '@/data/master'
import TabletFrame from '@/components/TabletFrame.vue'

const session = useSessionStore()
const ui = useUiStore()
const router = useRouter()

const selected = ref(null)
const pass = ref('')
const selPart = ref('1151')
const selOp = ref('15')

const stage = computed(() => {
  if (session.shiftStarted) return 'active'
  if (session.prevSession && !session.loggedInId) return 'prev'
  if (!session.loggedInId) return 'login'
  return 'task'
})

function choose(emp) {
  selected.value = emp
  pass.value = ''
}

function login() {
  if (!selected.value) return
  if (session.login(selected.value.id, pass.value)) {
    ui.push(`Вошли: ${selected.value.fio}`, 'ok')
  } else {
    ui.push('Неверный пароль', 'err')
  }
}

function takeOver() {
  session.loggedInId = session.prevSession.empId
  session.prevSession = null
  ui.push('Сеанс продолжается под прежним сотрудником', 'ok')
}

function finishPrev() {
  session.completePrevSession()
  ui.push('Чужой сеанс завершён', 'ok')
}

function pickTask(partId, opId) {
  selPart.value = partId
  selOp.value = opId
  session.chooseTask(partId, opId)
  ui.push('Задание выбрано', 'ok')
}

const taskMachine = computed(() => machines.find((m) => m.id === session.task?.machineId))
</script>

<template>
  <TabletFrame title="Вход · начало смены" sub="Рабочее место УПС-3 · Линия 1">
    <!-- Смена уже открыта -->
    <div v-if="stage === 'active'" class="sc tcenter" style="padding:18px">
      <div class="photo" style="width:64px;height:64px;margin:0 auto 10px;border-radius:14px">{{ session.me?.initials }}</div>
      <b class="metric">Смена №{{ session.shiftNo }} открыта</b>
      <p class="hint" style="margin:6px 0">{{ session.me?.fio }}</p>
      <div class="okbox" style="margin-top:8px">Приём рабочего места выполнен. Можно приступать к работе.</div>
    </div>

    <!-- Открыт чужой сеанс -->
    <div v-else-if="stage === 'prev'" class="sc tcenter">
      <div class="photo" style="width:64px;height:64px;margin:0 auto 10px;border-radius:14px;">{{ session.prevSession.initials }}</div>
      <b class="metric">Открыт сеанс: {{ session.prevSession.fio }}</b>
      <p class="hint" style="margin:4px 0 2px">Смена не завершена сотрудником.</p>
      <p class="hint" style="margin:0">Проверить фактическое время ухода.</p>
      <div class="divider"></div>
      <div class="hint tcenter">Запросить пароль предыдущего сотрудника не нужно.</div>
    </div>

    <!-- Выбор сотрудника -->
    <div v-else-if="stage === 'login'" class="sc tcenter">
      <div class="grid2">
<div
          v-for="emp in graphics"
          :key="emp.id"
          class="sc tcenter"
          :class="{ selected: selected && selected.id === emp.id }"
          @click="choose(emp)"
        >
          <div :class="['photo', emp.id === 'sp' ? 'p2' : emp.id === 'dm' ? 'p3' : '']" style="margin: 0 auto 8px">{{ emp.initials }}</div>
          <b>{{ emp.fio }}</b>
        </div>
      </div>
    </div>

    <!-- Выбор задания -->
    <div v-else class="sc tcenter">
      <div class="hint">Выберите задание:</div>
      <div
        v-for="part in parts"
        :key="part.id"
        class="opt"
        :class="{ sel: selPart === part.id }"
        style="margin-top:8px"
        @click="pickTask(part.id, selOp)"
      >
        <div class="photo" :class="{ p2: part.id !== '1151' }">{{ part.id }}</div>
        <div class="grow">
          <b>{{ part.name }}</b>
          <span class="hint" style="display:block">Операция: {{ part.ops.find((o) => o.id === selOp).name }}</span>
        </div>
        <span class="pill gray">Сч. {{ part.counterStart }}</span>
      </div>
      <div class="hint" style="margin-top:8px">Операция выбирается на рабочем экране переключателем ОП.</div>
    </div>

    <template #footer>
      <template v-if="stage === 'login'">
        <div class="field">
          <label>Пароль</label>
          <input v-model="pass" class="input" type="password" placeholder="••••" @keyup.enter="login">
        </div>
        <button class="btn primary big" :disabled="!selected" @click="login">ВОЙТИ</button>
      </template>

      <template v-else-if="stage === 'prev'">
        <button class="btn ghost big" @click="takeOver">Авторизоваться в нём</button>
        <button class="btn accent big" @click="finishPrev">ЗАВЕРШИТЬ СЕАНС</button>
      </template>

      <template v-else-if="stage === 'task'">
        <div class="sc brand-border">
          <div class="row">
            <div class="grow">
              <b>{{ parts.find((p) => p.id === selPart).name }}</b>
              <span class="hint" style="display:block">Оп. {{ selOp }} · {{ taskMachine?.name || 'Станок 3' }}</span>
            </div>
            <span class="pill ok">Задание принято</span>
          </div>
        </div>
        <button class="btn primary big" @click="router.push('/op/receive')">ДАЛЕЕ — ПРИЁМ РАБОЧЕГО МЕСТА</button>
      </template>

      <template v-else>
        <button class="btn primary big" @click="router.push('/op/work')">К РАБОЧЕМУ ЭКРАНУ</button>
      </template>
    </template>
  </TabletFrame>
</template>