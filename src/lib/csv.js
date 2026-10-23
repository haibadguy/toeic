import { createId } from './id.js'

const HEADER_ALIASES = {
  term: ['english', 'term', 'word', 'từ', 'vocabulary'],
  meaning: ['meaning', 'vietnamese', 'translation', 'nghĩa'],
  example: ['example', 'ví dụ'],
  ipa: ['ipa', 'pronunciation', 'phiên âm'],
  partOfSpeech: ['part of speech', 'type', 'loại từ'],
  note: ['note', 'ghi chú'],
}
const OPTIONAL_FIELDS = ['example', 'ipa', 'partOfSpeech', 'note']
const DEFAULT_HEADERS = ['english', 'meaning', 'example', 'ipa', 'part of speech', 'note']
const ALL_ALIASES = Object.values(HEADER_ALIASES).flat()

export function detectDelimiter(text) {
  const firstLine = (text || '').split(/\r?\n/, 1)[0] || ''
  if (firstLine.includes('\t')) return '\t'
  if (firstLine.includes(';')) return ';'
  return ','
}

// RFC 4180 style parser: supports quoted cells, escaped quotes ("") and
// delimiters / newlines inside quotes.
export function parseDelimited(text, delimiter = ',') {
  const source = (text || '').replace(/^\uFEFF/, '')
  const rows = []
  let row = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i]
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"'
          i += 1
        } else {
          quoted = false
        }
      } else {
        cell += char
      }
      continue
    }
    if (char === '"') {
      quoted = true
    } else if (char === delimiter) {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (char !== '\r') {
      cell += char
    }
  }
  row.push(cell)
  rows.push(row)
  return rows
}

export function parseImport(text) {
  if (!text || !text.trim()) throw new Error('File không có dữ liệu.')
  const delimiter = detectDelimiter(text)
  const parsed = parseDelimited(text, delimiter)
    .map((row) => row.map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell !== ''))
  if (!parsed.length) throw new Error('File không có dữ liệu.')

  const header = parsed[0].map((cell) => cell.toLowerCase())
  const hasHeader = header.some((cell) => ALL_ALIASES.includes(cell))
  const headers = hasHeader ? header : DEFAULT_HEADERS
  const body = hasHeader ? parsed.slice(1) : parsed
  const indexOf = (key) => headers.findIndex((cell) => HEADER_ALIASES[key].includes(cell))

  const meaningIndex = indexOf('meaning')
  if (meaningIndex < 0) throw new Error('Không tìm thấy cột nghĩa tiếng Việt.')
  const termIndex = indexOf('term')
  const termColumn = termIndex >= 0 ? termIndex : 0

  const cards = body.map((row, index) => {
    const line = index + (hasHeader ? 2 : 1)
    const term = (row[termColumn] || '').trim()
    const meaning = (row[meaningIndex] || '').trim()
    if (!term || !meaning) throw new Error(`Dòng ${line} thiếu từ hoặc nghĩa.`)
    const card = { id: createId(), term, meaning, status: 'unrated' }
    OPTIONAL_FIELDS.forEach((key) => {
      const column = indexOf(key)
      if (column >= 0 && row[column]) card[key] = row[column].trim()
    })
    return card
  })

  const seen = new Set()
  return cards.filter((card) => {
    const key = card.term.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
