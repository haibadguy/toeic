const LABELS = { known: 'Đã thuộc', learning: 'Học lại', unrated: 'Chưa đánh giá' }

export default function Status({ status }) {
  return <span className={`status ${status}`}>{LABELS[status] || LABELS.unrated}</span>
}
