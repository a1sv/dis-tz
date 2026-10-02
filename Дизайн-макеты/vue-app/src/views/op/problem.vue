<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/store/session'
import { useSosStore } from '@/store/sos'
import { useLogStore } from '@/store/log'
import { useUiStore } from '@/store/ui'
import { problems } from '@/data/master'
import TabletFrame from '@/components/TabletFrame.vue'

const session = useSessionStore()
const sosStore = useSosStore()
const log = useLogStore()
const ui = useUiStore()
const router = useRouter()

const problem = ref(problems[2].id)
const canWork = ref(true)
const note = ref('')

function send() {
  const p = problems.find((x) => x.id === problem.value)
  if (canWork.value) {
    log.add('проблема', `«${p.name}» — работа продолжается${note.value ? ' · ' + note.value : ''}`, { by: session.me?.fio })
    ui.push('Проблема отправлена менеджеру', 'ok')
    router.push('/op/work')
  } else {
    const ev = sosStore.create({ problem: p.name, canWork: false, note: note.value })
    ui.push('Производство остановлено · запущен SOS', 'err')
    router.push('/op/sos')
  }
}
</script>

<template>
  <TabletFrame title="Сообщить о проблеме" sub="Если работу нельзя продолжить — запускается SOS">
    <div class="sc">
      <div class="hint">Выберите проблему:</div>
      <div v-for="p in problems" :key="p.id" class="opt" :class="{ sel: problem === p.id }" @click="problem = p.id">{{ p.name }}</div>
    </div>

    <div class="field">
      <label>Можно продолжать работу?</label>
      <div class="row">
        <button class="btn ok grow" :class="{ 'ghost': !canWork }" @click="canWork = true">ДА, РАБОТАЮ</button>
        <button class="btn danger grow" :class="{ 'ghost': canWork }" @click="canWork = false">НЕТ, СТОП</button>
      </div>
    </div>

    <div class="field">
      <label>Голосовое описание (необязательно)</label>
      <input v-model="note" class="input normal" :placeholder="'Например: ' + problems.find((p) => p.id === problem).name.toLowerCase()">
    </div>

    <div v-if="!canWork" class="warnbox">Если нельзя продолжить работу — при отправке сразу запустится SOS без второго нажатия.</div>

    <template #footer>
      <button class="btn accent big" @click="send">ОТПРАВИТЬ</button>
    </template>
  </TabletFrame>
</template>