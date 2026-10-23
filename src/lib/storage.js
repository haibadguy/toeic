import { DEMO, SEED_SETS } from '../data/seed.js'
import { today } from './date.js'
import { createId } from './id.js'

export const STORAGE_KEY = 'vocab-daily-data'
export const THEME_KEY = 'vocab-daily-theme'

const STATUSES = ['known', 'learning', 'unrated']

const clone = (value) => (typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)))

const isCard = (card) => card && typeof card === 'object' && typeof card.term === 'string' && typeof card.meaning === 'string'

export function normalizeData(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.sets)) return null
  const sets = value.sets
    .filter((set) => set && typeof set === 'object' && typeof set.id === 'string' && Array.isArray(set.cards))
    .map((set) => ({
      ...set,
      title: typeof set.title === 'string' && set.title.trim() ? set.title : 'Bộ từ chưa đặt tên',
      date: typeof set.date === 'string' && set.date ? set.date : today(),
      cards: set.cards.filter(isCard).map((card) => ({
        ...card,
        id: typeof card.id === 'string' && card.id ? card.id : createId(),
        status: STATUSES.includes(card.status) ? card.status : 'unrated',
      })),
    }))
  return { ...value, sets }
}

export function mergeSeedSets(data, seeds = SEED_SETS) {
  const existing = new Set(data.sets.map((set) => set.id))
  const additions = seeds.filter((set) => !existing.has(set.id)).map(clone)
  return additions.length ? { ...data, sets: [...additions, ...data.sets] } : data
}

export function loadData(storage = globalThis.localStorage) {
  try {
    const saved = storage?.getItem(STORAGE_KEY)
    if (!saved) return clone(DEMO)
    const parsed = normalizeData(JSON.parse(saved))
    if (!parsed) return clone(DEMO)
    return mergeSeedSets(parsed)
  } catch {
    return clone(DEMO)
  }
}

export function saveData(data, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Ignore quota / privacy-mode errors: the app keeps working in memory.
  }
}

export function loadTheme(storage = globalThis.localStorage) {
  try {
    return storage?.getItem(THEME_KEY) === 'dark'
  } catch {
    return false
  }
}

export function saveTheme(dark, storage = globalThis.localStorage) {
  try {
    storage?.setItem(THEME_KEY, dark ? 'dark' : 'light')
  } catch {
    // Ignore storage errors.
  }
}

export function parseBackup(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Bản sao lưu không hợp lệ.')
  }
  const data = normalizeData(parsed)
  if (!data) throw new Error('Bản sao lưu không hợp lệ.')
  return data
}
