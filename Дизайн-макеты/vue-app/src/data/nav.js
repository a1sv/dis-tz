export const navGroups = {
  op: [
    {
      title: 'Смена',
      items: [
        { id: 'start', label: 'Вход / начало смены', icon: 'start' },
        { id: 'receive', label: 'Приём рабочего места', icon: 'receive' },
        { id: 'work', label: 'Рабочий экран', icon: 'work' },
        { id: 'end', label: 'Завершение смены', icon: 'end' },
      ],
    },
    {
      title: 'Инструмент',
      items: [
        { id: 'change', label: 'Смена инструмента', icon: 'change' },
        { id: 'order', label: 'Заказать инструмент', icon: 'order' },
        { id: 'requests', label: 'Мои заявки', icon: 'requests' },
        { id: 'reserve', label: 'Аварийный резерв', icon: 'reserve' },
      ],
    },
    {
      title: 'Проблемы',
      items: [
        { id: 'problem', label: 'Сообщить о проблеме', icon: 'problem' },
        { id: 'sos', label: 'SOS · остановка', icon: 'sos' },
      ],
    },
    {
      title: 'Нормы',
      items: [{ id: 'norm', label: 'Предложить норму', icon: 'norm' }],
    },
  ],
  mgr: [
    { title: 'Обзор', items: [{ id: 'dash', label: 'Дашборд', icon: 'dash' }] },
    {
      title: 'Операции',
      items: [
        { id: 'requests', label: 'Заявки и доставка', icon: 'requests' },
        { id: 'sos', label: 'SOS и остановки', icon: 'sos' },
        { id: 'norms', label: 'Нормы и решения', icon: 'norms' },
        { id: 'analysis', label: 'Анализ стойкости', icon: 'analysis' },
        { id: 'reserve', label: 'Аварийный резерв', icon: 'reserve' },
      ],
    },
    {
      title: 'Склад и 1С',
      items: [
        { id: 'stock', label: 'Остатки (1С)', icon: 'stock' },
        { id: 'issue', label: 'Выдача инструмента', icon: 'issue' },
        { id: 'acts', label: 'Акты на списание', icon: 'acts' },
        { id: 'corrections', label: 'Корректировки', icon: 'corrections' },
      ],
    },
    {
      title: 'Техпроцесс',
      items: [
        { id: 'process', label: 'ТП и альтернативы', icon: 'process' },
        { id: 'tests', label: 'Испытания', icon: 'tests' },
      ],
    },
  ],
}

export const titles = {
  op: {
    start: { h: 'Вход · начало смены', u: 'Наладчик · УПС-3' },
    receive: { h: 'Приём рабочего места', u: 'Эпик 2 · Приём' },
    work: { h: 'Рабочий экран', u: 'Смена · деталь и операция' },
    end: { h: 'Завершение смены', u: 'Финал смены' },
    order: { h: 'Заказ инструмента', u: 'Эпик 4 · Заказ' },
    requests: { h: 'Мои заявки', u: 'Эпик 4 · Получение' },
    reserve: { h: 'Аварийный резерв', u: 'Эпик 4 · Резерв' },
    problem: { h: 'Сообщить о проблеме', u: 'Эпик 5 · Проблемы' },
    sos: { h: 'SOS · остановка', u: 'Эпик 5 · SOS' },
    norm: { h: 'Предложить норму', u: 'Эпик 7 · Нормы' },
    change: { h: 'Смена инструмента', u: 'Эпик 3 · Замена' },
  },
  mgr: {
    dash: { h: 'Дашборд', u: 'Менеджер · Обзор' },
    requests: { h: 'Заявки и доставка', u: 'МИС-03' },
    sos: { h: 'SOS и остановки', u: 'МИС-04' },
    norms: { h: 'Нормы и решения', u: 'МИС-01' },
    analysis: { h: 'Анализ стойкости', u: 'МИС-02' },
    reserve: { h: 'Аварийный резерв', u: 'МИС-05' },
    stock: { h: 'Остатки на складе', u: '1С · Склад' },
    issue: { h: 'Выдача инструмента', u: '1С · Выдача' },
    acts: { h: 'Акты на списание', u: '1С · Акты' },
    corrections: { h: 'Корректировки', u: 'МИС-06' },
    process: { h: 'Техпроцесс и альтернативы', u: 'Техпроцесс' },
    tests: { h: 'Испытания', u: 'Техпроцесс' },
  },
}

export const groupTitle = (role, id) => {
  const g = navGroups[role].find((x) => x.items.some((i) => i.id === id))
  return g ? g.title : ''
}

export const flatIds = (role) => navGroups[role].flatMap((g) => g.items.map((i) => i.id))