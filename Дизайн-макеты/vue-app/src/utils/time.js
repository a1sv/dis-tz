export const now = () => Date.now()

export const fmtTime = (ts) => {
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export const fmtDur = (minutes) => {
  if (minutes == null || Number.isNaN(minutes)) return '—'
  const m = Math.round(minutes)
  if (m < 60) return `${m} мин`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r ? `${h} ч ${r} мин` : `${h} ч`
}

export const fmtNum = (n) => (n ?? 0).toLocaleString('ru-RU')

export const percent = (value, of) => (of > 0 ? Math.max(0, Math.min(100, (value / of) * 100)) : 0)