export const WS = 'УПС-3'
export const LINE = 'Линия 1'

export const employees = [
  { id: 'ak', fio: 'Крылов А.В.', initials: 'АК', role: 'op', pass: '1111' },
  { id: 'sp', fio: 'Смирнов П.А.', initials: 'СП', role: 'op', pass: '2222' },
  { id: 'vt', fio: 'Васнев Т.О.', initials: 'ВТ', role: 'op', pass: '3333' },
  { id: 'dm', fio: 'Дроздов М.И.', initials: 'ДМ', role: 'op', pass: '4444' },
  { id: 'od', fio: 'Орлов Д.К.', initials: 'ОД', role: 'mgr', title: 'Менеджер ИС', pass: '0000' },
  { id: 'vn', fio: 'Волков Н.Е.', initials: 'ВН', role: 'mgr', title: 'Ст. менеджер' },
  { id: 'rk', fio: 'Рябов К.С.', initials: 'РК', role: 'mgr', title: 'Руководитель направления' },
]

export const byId = (list, id) => list.find((e) => e.id === id) || null
export const employee = (id) => byId(employees, id)

export const graphics = [employee('ak'), employee('sp'), employee('vt'), employee('dm')]

export const parts = [
  {
    id: '1151', name: 'Картер 1151', counterStart: 1271,
    ops: [{ id: '15', name: 'Точение фланца' }, { id: '25', name: 'Нарезание резьбы' }],
  },
  {
    id: '1188', name: 'Картер 1188', counterStart: 2004,
    ops: [{ id: '15', name: 'Точение фланца' }, { id: '25', name: 'Нарезание резьбы' }],
  },
]

export const machines = [
  { id: 'm3', name: 'Станок 3', ws: WS, line: LINE, part: '1151', op: '15', mainTool: 'd6', counterStart: 1271 },
  { id: 'm4', name: 'Станок 4', ws: WS, line: LINE, part: '1188', op: '25', mainTool: 'tap10', counterStart: 2004 },
]

export const tools = [
  {
    id: 'd6', name: 'Сверло Ø6,0 HSS', short: 'Сверло Ø6,0', article: '1064-001', type: 'drill', unit: 'шт',
    norm: 600, warnAt: 450, need: 10, safety: 18, price: 120, onHand: 3, warehouse: 7, reserve: 5, pos: 4,
    alts: [{ id: 'd6tin', name: 'Сверло Ø6,0 TIN-Co', article: '1064-118', condition: null }],
  },
  {
    id: 'tap10', name: 'Метчик М10', short: 'Метчик М10', article: '4408-102', type: 'tap', unit: 'шт',
    norm: 480, warnAt: 360, need: 6, safety: 15, price: 210, onHand: 1, warehouse: 22, reserve: 4, pos: 2,
    alts: [{ id: 'tapT', name: 'Метчик М10 TIN', article: '4408-110', condition: null }],
  },
  {
    id: 'plate', name: 'Пластина SNMM 120408', short: 'Пластина SNMM', article: '8804', type: 'insert', unit: 'шт',
    norm: 900, warnAt: 675, need: 12, safety: 16, price: 95, onHand: 12, warehouse: 14, reserve: 8, pos: 2,
    alts: [{ id: 'plB', name: 'Пластина SNMM 420408', article: '8804-B', condition: 'только если СОЖ > 4%' }],
  },
]

export const tool = (id) => byId(tools, id)

export const storageGood = 'Шкаф А (Годный)'

export const sosChain = [
  employee('od'),
  employee('vn'),
  employee('rk'),
]

export const problems = [
  { id: 'speed', name: 'Станок не набирает обороты' },
  { id: 'fit', name: 'Инструмент не входит в патрон' },
  { id: 'hole', name: 'Отверстие «рвёт» / негодное отверстие' },
  { id: 'coolant', name: 'СОЖ не подаётся' },
]

export const reasons = [
  'ХАРАКТЕРНЫЙ ИЗНОС',
  'ПОЛОМКА',
  'СКОЛ',
  'ПРОБЛЕМА / СООБЩИТЬ',
]

export const normReasons = [
  'Плохие заготовки',
  'Изменение режима обработки',
  'Новый инструмент / покрытие',
]