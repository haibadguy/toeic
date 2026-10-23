import test from 'node:test'
import assert from 'node:assert/strict'
import { detectDelimiter, parseDelimited, parseImport } from '../src/lib/csv.js'

test('detectDelimiter nhận diện dấu phẩy, chấm phẩy và tab', () => {
  assert.equal(detectDelimiter('english,meaning'), ',')
  assert.equal(detectDelimiter('english;meaning'), ';')
  assert.equal(detectDelimiter('english\tmeaning'), '\t')
})

test('parseDelimited giữ nguyên dấu phẩy trong ô được trích dẫn', () => {
  const rows = parseDelimited('english,meaning\n"gazing","ngắm, nhìn chăm chú"')
  assert.deepEqual(rows[1], ['gazing', 'ngắm, nhìn chăm chú'])
})

test('parseDelimited xử lý dấu ngoặc kép escape', () => {
  const rows = parseDelimited('english,meaning\nsay,"He said ""hi"""')
  assert.equal(rows[1][1], 'He said "hi"')
})

test('parseDelimited xử lý xuống dòng bên trong ô trích dẫn', () => {
  const rows = parseDelimited('english,meaning\nword,"dòng một\ndòng hai"')
  assert.equal(rows[1][1], 'dòng một\ndòng hai')
})

test('parseImport đọc CSV có header và cột tuỳ chọn', () => {
  const csv = [
    'english,meaning,ipa,example,part of speech,note',
    'abundant,dồi dào,/əˈbʌndənt/,An abundant supply.,adjective,ghi chú',
  ].join('\n')
  const cards = parseImport(csv)
  assert.equal(cards.length, 1)
  assert.equal(cards[0].term, 'abundant')
  assert.equal(cards[0].meaning, 'dồi dào')
  assert.equal(cards[0].ipa, '/əˈbʌndənt/')
  assert.equal(cards[0].example, 'An abundant supply.')
  assert.equal(cards[0].partOfSpeech, 'adjective')
  assert.equal(cards[0].note, 'ghi chú')
  assert.equal(cards[0].status, 'unrated')
  assert.ok(cards[0].id)
})

test('parseImport bỏ BOM và hỗ trợ CRLF', () => {
  const cards = parseImport('\uFEFFenglish,meaning\r\nabundant,dồi dào\r\n')
  assert.equal(cards.length, 1)
  assert.equal(cards[0].term, 'abundant')
})

test('parseImport hỗ trợ dấu chấm phẩy và tab', () => {
  assert.equal(parseImport('english;meaning\nabundant;dồi dào')[0].meaning, 'dồi dào')
  assert.equal(parseImport('english\tmeaning\nabundant\tdồi dào')[0].meaning, 'dồi dào')
})

test('parseImport dùng cột mặc định khi không có header', () => {
  const cards = parseImport('abundant,dồi dào,An abundant supply.')
  assert.equal(cards[0].term, 'abundant')
  assert.equal(cards[0].example, 'An abundant supply.')
})

test('parseImport loại bỏ từ trùng không phân biệt hoa thường', () => {
  const cards = parseImport('english,meaning\nAbundant,dồi dào\nabundant,phong phú')
  assert.equal(cards.length, 1)
  assert.equal(cards[0].meaning, 'dồi dào')
})

test('parseImport báo lỗi khi thiếu cột nghĩa', () => {
  assert.throws(() => parseImport('english,example\nabundant,An abundant supply.'), /nghĩa tiếng Việt/)
})

test('parseImport báo lỗi kèm số dòng khi thiếu từ hoặc nghĩa', () => {
  assert.throws(() => parseImport('english,meaning\nabundant,'), /Dòng 2/)
  assert.throws(() => parseImport('english,meaning\n,dồi dào'), /Dòng 2/)
})

test('parseImport báo lỗi với dữ liệu rỗng', () => {
  assert.throws(() => parseImport('   '), /không có dữ liệu/)
})
