import test from 'node:test'
import assert from 'node:assert/strict'
import { LISTENING_SET, PREPOSITION_SET } from '../src/data/seed.js'
import {
  STORAGE_KEY,
  THEME_KEY,
  loadData,
  loadTheme,
  mergeSeedSets,
  normalizeData,
  parseBackup,
  saveData,
  saveTheme,
} from '../src/lib/storage.js'

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => { map.set(key, String(value)) },
    removeItem: (key) => { map.delete(key) },
    dump: () => Object.fromEntries(map),
  }
}

const demoSet = { id: 'demo', title: 'Demo', date: '2026-01-01', cards: [] }

test('loadData trả về dữ liệu mẫu khi chưa có gì trong storage', () => {
  const data = loadData(memoryStorage())
  assert.equal(data.sets.length, 3)
  assert.ok(data.sets.some((set) => set.id === LISTENING_SET.id))
  assert.ok(data.sets.some((set) => set.id === PREPOSITION_SET.id))
})

test('loadData trả về dữ liệu mẫu khi JSON hỏng', () => {
  const data = loadData(memoryStorage({ [STORAGE_KEY]: '{not json' }))
  assert.equal(data.sets.length, 3)
})

test('loadData trả về dữ liệu mẫu khi cấu trúc không hợp lệ', () => {
  assert.equal(loadData(memoryStorage({ [STORAGE_KEY]: '{"sets":"nope"}' })).sets.length, 3)
  assert.equal(loadData(memoryStorage({ [STORAGE_KEY]: 'null' })).sets.length, 3)
})

test('loadData tự thêm bộ seed còn thiếu mà không ghi đè dữ liệu cũ', () => {
  const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ sets: [demoSet] }) })
  const data = loadData(storage)
  assert.equal(data.sets.length, 3)
  assert.equal(data.sets[0].id, LISTENING_SET.id)
  assert.equal(data.sets[1].id, PREPOSITION_SET.id)
  assert.equal(data.sets[2].id, 'demo')
})

test('loadData không nhân đôi bộ seed đã có', () => {
  const storage = memoryStorage({
    [STORAGE_KEY]: JSON.stringify({ sets: [{ ...LISTENING_SET, cards: [] }] }),
  })
  const data = loadData(storage)
  assert.equal(data.sets.length, 2)
  assert.equal(data.sets.filter((set) => set.id === LISTENING_SET.id).length, 1)
})

test('mergeSeedSets trả về nguyên bản khi không thiếu bộ nào', () => {
  const data = { sets: [{ id: LISTENING_SET.id }, { id: PREPOSITION_SET.id }] }
  assert.equal(mergeSeedSets(data), data)
})

test('normalizeData loại bỏ set và thẻ không hợp lệ', () => {
  const data = normalizeData({
    sets: [
      { id: 'ok', title: '  ', date: '', cards: [{ term: 'a', meaning: 'b', status: 'weird' }, { term: 1, meaning: 'x' }] },
      { id: 42, cards: [] },
      { id: 'no-cards' },
    ],
  })
  assert.equal(data.sets.length, 1)
  assert.equal(data.sets[0].title, 'Bộ từ chưa đặt tên')
  assert.equal(data.sets[0].cards.length, 1)
  assert.equal(data.sets[0].cards[0].status, 'unrated')
  assert.ok(data.sets[0].cards[0].id)
})

test('normalizeData trả về null với dữ liệu không phải object', () => {
  assert.equal(normalizeData(null), null)
  assert.equal(normalizeData([]), null)
  assert.equal(normalizeData({}), null)
})

test('saveData ghi JSON vào storage', () => {
  const storage = memoryStorage()
  saveData({ sets: [] }, storage)
  assert.equal(storage.getItem(STORAGE_KEY), '{"sets":[]}')
})

test('saveData bỏ qua lỗi storage (chế độ riêng tư)', () => {
  const storage = { setItem: () => { throw new Error('quota') } }
  assert.doesNotThrow(() => saveData({ sets: [] }, storage))
})

test('parseBackup chấp nhận bản sao lưu hợp lệ và từ chối bản sai', () => {
  const data = parseBackup(JSON.stringify({ sets: [demoSet] }))
  assert.equal(data.sets.length, 1)
  assert.throws(() => parseBackup('{"sets":"nope"}'), /không hợp lệ/)
  assert.throws(() => parseBackup('{bad json'), /không hợp lệ/)
})

test('loadTheme và saveTheme lưu chế độ tối', () => {
  const storage = memoryStorage()
  assert.equal(loadTheme(storage), false)
  saveTheme(true, storage)
  assert.equal(storage.getItem(THEME_KEY), 'dark')
  assert.equal(loadTheme(storage), true)
  saveTheme(false, storage)
  assert.equal(loadTheme(storage), false)
})
