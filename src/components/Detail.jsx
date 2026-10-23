import { useState } from 'react'
import { formatDate } from '../lib/date.js'
import { createId } from '../lib/id.js'
import Status from './Status.jsx'

const EMPTY_FORM = { term: '', meaning: '', ipa: '', example: '', note: '' }

export default function Detail({ set, updateSet, onLearn, onQuiz, onBack }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const updateField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  const reset = () => { setEditing(null); setForm(EMPTY_FORM) }

  const startEdit = (card) => {
    setEditing(card.id)
    setForm({
      term: card.term,
      meaning: card.meaning,
      ipa: card.ipa || '',
      example: card.example || '',
      note: card.note || '',
    })
  }

  const save = () => {
    const term = form.term.trim()
    const meaning = form.meaning.trim()
    if (!term || !meaning) return
    const fields = {
      term,
      meaning,
      ipa: form.ipa.trim(),
      example: form.example.trim(),
      note: form.note.trim(),
    }
    updateSet(set.id, (current) => ({
      ...current,
      cards: editing
        ? current.cards.map((card) => (card.id === editing ? { ...card, ...fields } : card))
        : [...current.cards, { id: createId(), status: 'unrated', ...fields }],
    }))
    reset()
  }

  const remove = (id) => updateSet(set.id, (current) => ({ ...current, cards: current.cards.filter((card) => card.id !== id) }))
  const known = set.cards.filter((card) => card.status === 'known').length

  return (
    <div className="container">
      <button className="back-link" onClick={onBack}>← Bộ từ của tôi</button>
      <div className="detail-heading">
        <div>
          <span className="date-badge">{formatDate(set.date)}</span>
          <h1>{set.title}</h1>
          <p>{set.cards.length} từ · {known} đã thuộc</p>
        </div>
        <div className="learn-options">
          <button className="primary-btn" onClick={() => onLearn(false)} disabled={!set.cards.length}>▶ Bắt đầu học</button>
          <button className="outline-btn" onClick={() => onLearn(true)} disabled={!set.cards.length}>⤨ Học xáo trộn</button>
          <button className="outline-btn" onClick={onQuiz} disabled={set.cards.length < 2}>✎ Làm quiz</button>
        </div>
      </div>
      <div className="detail-layout">
        <section className="panel">
          <div className="table-head"><span>TỪ / CỤM TỪ</span><span>NGHĨA TIẾNG VIỆT</span><span>TRẠNG THÁI</span><span /></div>
          {set.cards.map((card) => (
            <div className="word-row" key={card.id}>
              <div className="word-term">
                <strong>{card.term}</strong>
                {card.ipa && <small className="word-ipa">{card.ipa}</small>}
              </div>
              <div className="word-meaning">
                <span>{card.meaning}</span>
                {card.example && <small className="word-example">{card.example}</small>}
              </div>
              <Status status={card.status} />
              <span className="row-actions">
                <button onClick={() => startEdit(card)}>Sửa</button>
                <button onClick={() => remove(card.id)}>Xóa</button>
              </span>
            </div>
          ))}
          {!set.cards.length && <p className="muted">Bộ từ chưa có thẻ nào.</p>}
        </section>
        <section className="panel add-form">
          <h3>{editing ? 'Sửa từ' : 'Thêm từ mới'}</h3>
          <input placeholder="Từ / cụm từ tiếng Anh" value={form.term} onChange={updateField('term')} />
          <input placeholder="Nghĩa tiếng Việt" value={form.meaning} onChange={updateField('meaning')} />
          <input placeholder="Phiên âm (không bắt buộc)" value={form.ipa} onChange={updateField('ipa')} />
          <input placeholder="Ví dụ (không bắt buộc)" value={form.example} onChange={updateField('example')} />
          <input placeholder="Ghi chú (không bắt buộc)" value={form.note} onChange={updateField('note')} />
          <button className="primary-btn full" onClick={save} disabled={!form.term.trim() || !form.meaning.trim()}>{editing ? 'Lưu thay đổi' : 'Thêm vào bộ'}</button>
          {editing && <button className="text-btn" onClick={reset}>Hủy sửa</button>}
        </section>
      </div>
    </div>
  )
}
