import { formatDate } from '../lib/date.js'
import { progressOf } from '../lib/study.js'

export default function SetCard({ set, open, onDelete }) {
  const { percent } = progressOf(set.cards)
  return (
    <article className="set-card">
      <div className="set-card-top">
        <span className="date-badge">{formatDate(set.date)}</span>
        <button className="more" title="Xóa bộ từ" aria-label={`Xóa bộ từ ${set.title}`} onClick={() => onDelete(set)}>🗑</button>
      </div>
      <h3>{set.title}</h3>
      <p>{set.cards.length} từ vựng</p>
      <div className="progress"><span style={{ width: `${percent}%` }} /></div>
      <div className="card-footer">
        <span>{percent}% đã thuộc</span>
        <button onClick={() => open('detail', set.id)}>Mở bộ từ →</button>
      </div>
    </article>
  )
}
