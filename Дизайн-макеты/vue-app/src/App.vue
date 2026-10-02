<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/store/session'
import { useToolsStore } from '@/store/tools'
import { useRequestsStore } from '@/store/requests'
import { useSosStore } from '@/store/sos'
import { useLogStore } from '@/store/log'
import { useUiStore } from '@/store/ui'
import { navGroups, groupTitle } from '@/data/nav'
import UiIcon from '@/components/ui/UiIcon.vue'

const session = useSessionStore()
const toolsS = useToolsStore()
const requests = useRequestsStore()
const sosStore = useSosStore()
const log = useLogStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()

onMounted(() => {
  log.seed()
  if (!requests.requests.length) {
    const r = requests.create('d6')
    requests.take(r.id, r.qty)
    requests.delivered(r.id)
    const r2 = requests.create('tap10')
    requests.take(r2.id, r2.qty)
    requests.delivered(r2.id)
    r2.urgent = true
  }
  if (!sosStore.events.length) {
    const old = sosStore.create({ problem: 'Отверстие «рвёт» / негодное отверстие', canWork: false })
    old.startedAt = Date.now() - 60 * 60000
    sosStore.accept(old.id, { id: 'od', fio: 'Орлов Д.К.' })
    sosStore.resolve(old.id)
    sosStore.resume(old.id)
    old.resumedAt = Date.now() - 50 * 60000
  }
})

const role = computed(() => route.meta.role || 'op')
const currentId = computed(() => route.meta.id || 'work')
const groups = computed(() => navGroups[role.value])
const crumb = computed(() => groupTitle(role.value, currentId.value))
const needManagerGate = computed(() => role.value === 'mgr' && !session.manager)
const pass = ref('')
const gateInput = ref(null)

function isActive(id) {
  return currentId.value === id
}

function switchRole(r) {
  router.push({ path: `/${r}/dash` })
}

function tryManager() {
  if (session.managerLogin(pass.value)) {
    pass.value = ''
  }
}
</script>

<template>
  <div class="app">
    <aside class="side">
      <div class="logo"><b>DtTS · Инструментальный Сервис</b><br><span>ООО «РТС» · MVP</span></div>
      <div class="role-tabs">
        <button :class="{ active: role === 'op' }" @click="switchRole('op')">Наладчик</button>
        <button :class="{ active: role === 'mgr' }" @click="switchRole('mgr')">Менеджер</button>
      </div>
      <nav class="nav">
        <template v-for="group in groups" :key="group.title">
          <div class="group">{{ group.title }}</div>
          <router-link
            v-for="item in group.items"
            :key="item.id"
            :to="`/${role}/${item.id}`"
            :class="{ active: isActive(item.id) }"
          >
            <UiIcon :name="item.icon" class="nav-ico" />
            <span>{{ item.label }}</span>
          </router-link>
        </template>
      </nav>
      <div class="session-chip">
        <template v-if="role === 'op'">
          <template v-if="session.shiftStarted && session.me">{{ session.me.fio }} · смена №{{ session.shiftNo }}</template>
          <template v-else>Смена не открыта</template>
        </template>
        <template v-else>{{ session.manager ? 'Орлов Д.К. · Менеджер ИС' : 'Требуется вход менеджера' }}</template>
      </div>
    </aside>

    <main class="main">
      <div class="topbar">
        <div class="crumb">DtTS · {{ crumb }}</div>
        <h1>{{ route.meta.h }}</h1>
        <div class="us-tag">{{ route.meta.u }}</div>
        <div class="navbtns">
          <button v-if="role === 'op' && session.shiftStarted" class="danger" @click="router.push('/op/end')">Завершить смену</button>
          <button v-if="role === 'op' && !session.shiftStarted" @click="router.push('/op/start')">Начать смену</button>
        </div>
      </div>

      <div v-if="needManagerGate" class="gate">
        <div class="sc tcenter" style="max-width: 400px; margin: auto; padding: 24px">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="38" height="38" style="margin: 0 auto; color: var(--brand)"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
          <b>Вход менеджера</b>
          <p class="hint" style="margin: 6px 0">Демо-пароль: <b>0000</b></p>
          <div class="field" style="margin-top: 8px">
            <input ref="gateInput" v-model="pass" class="input" type="password" placeholder="Пароль менеджера" @keyup.enter="tryManager">
            <button class="btn primary big" @click="tryManager">ВОЙТИ В КАБИНЕТ</button>
          </div>
        </div>
      </div>

      <router-view v-else v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <TransitionGroup name="toast" tag="div" class="toasts">
      <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="t.type" role="status" aria-live="polite">
        <span class="toast-ico">{{ t.type === 'ok' ? '✓' : t.type === 'err' ? '✕' : '!' }}</span>
        <span>{{ t.text }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.session-chip {
  margin: 6px 12px 12px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  color: var(--ink-2);
  font-size: 12px;
  border-radius: var(--r-md);
  background: var(--surface-2);
}
.toast-ico {
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
}
</style>
