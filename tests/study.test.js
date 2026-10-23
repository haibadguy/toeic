import test from 'node:test'
import assert from 'node:assert/strict'
import { buildQuizQuestions, progressOf, rateCard, shuffle } from '../src/lib/study.js'

function seededRng(seed = 1) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const card = (id, meaning = `nghĩa ${id}`) => ({ id, term: `từ ${id}`, meaning, status: 'unrated' })

test('shuffle trả về hoán vị và không thay đổi mảng gốc', () => {
  const input = [1, 2, 3, 4, 5]
  const output = shuffle(input, seededRng(7))
  assert.deepEqual(input, [1, 2, 3, 4, 5])
  assert.deepEqual([...output].sort(), [1, 2, 3, 4, 5])
})

test('shuffle ổn định với cùng seed', () => {
  const input = ['a', 'b', 'c', 'd', 'e']
  assert.deepEqual(shuffle(input, seededRng(42)), shuffle(input, seededRng(42)))
})

test('progressOf tính đúng số từ đã thuộc', () => {
  const cards = [{ status: 'known' }, { status: 'learning' }, { status: 'unrated' }, { status: 'known' }]
  assert.deepEqual(progressOf(cards), { total: 4, known: 2, percent: 50 })
  assert.deepEqual(progressOf([]), { total: 0, known: 0, percent: 0 })
})

test('rateCard với known chuyển sang thẻ kế tiếp', () => {
  const result = rateCard({ queue: ['a', 'b', 'c'], index: 0, repeatCounts: {}, cardId: 'a', status: 'known' })
  assert.equal(result.index, 1)
  assert.equal(result.finished, false)
  assert.deepEqual(result.queue, ['a', 'b', 'c'])
})

test('rateCard với learning chèn lại thẻ sau khoảng trống, không lặp ngay', () => {
  const result = rateCard({ queue: ['a', 'b', 'c', 'd'], index: 0, repeatCounts: {}, cardId: 'a', status: 'learning' })
  assert.equal(result.index, 1)
  assert.equal(result.queue[1], 'b')
  assert.equal(result.queue[3], 'a')
  assert.equal(result.queue.length, 5)
  assert.equal(result.repeatCounts.a, 1)
})

test('rateCard với learning ở thẻ cuối sẽ kết thúc phiên', () => {
  const result = rateCard({ queue: ['a'], index: 0, repeatCounts: {}, cardId: 'a', status: 'learning' })
  assert.equal(result.finished, true)
  assert.deepEqual(result.queue, ['a'])
})

test('rateCard tôn trọng giới hạn số lần học lại', () => {
  const result = rateCard({ queue: ['a', 'b', 'c', 'd'], index: 0, repeatCounts: { a: 2 }, cardId: 'a', status: 'learning' })
  assert.deepEqual(result.queue, ['a', 'b', 'c', 'd'])
  assert.equal(result.repeatCounts.a, 3)
})

test('buildQuizQuestions tạo 4 lựa chọn duy nhất cho mỗi câu', () => {
  const cards = [card('1'), card('2'), card('3'), card('4'), card('5')]
  const questions = buildQuizQuestions(cards, { rng: seededRng(3) })
  assert.equal(questions.length, 5)
  questions.forEach((question) => {
    assert.equal(question.options.length, 4)
    assert.ok(question.options.includes(question.answer))
    assert.equal(new Set(question.options).size, 4)
  })
})

test('buildQuizQuestions dùng toàn bộ từ có sẵn khi bộ nhỏ', () => {
  const questions = buildQuizQuestions([card('1'), card('2')], { rng: seededRng(5) })
  assert.equal(questions.length, 2)
  questions.forEach((question) => assert.equal(question.options.length, 2))
})

test('buildQuizQuestions trả về rỗng khi không đủ 2 từ', () => {
  assert.deepEqual(buildQuizQuestions([]), [])
  assert.deepEqual(buildQuizQuestions([card('1')]), [])
})

test('buildQuizQuestions loại nghĩa trùng khỏi phương án nhiễu', () => {
  const cards = [card('1', 'giống nhau'), card('2', 'giống nhau'), card('3', 'khác'), card('4', 'khác nữa')]
  const questions = buildQuizQuestions(cards, { rng: seededRng(9) })
  questions.forEach((question) => assert.equal(new Set(question.options).size, question.options.length))
})

test('buildQuizQuestions ổn định với cùng seed', () => {
  const cards = [card('1'), card('2'), card('3'), card('4')]
  assert.deepEqual(
    buildQuizQuestions(cards, { rng: seededRng(11) }),
    buildQuizQuestions(cards, { rng: seededRng(11) }),
  )
})
