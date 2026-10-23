import { formatDate } from '../lib/date.js'

export default function Review({ cards, data, onLearn, onQuiz }) {
  const due = cards.filter((card) => card.status !== 'known')
  const grouped = data.sets
    .map((set) => ({ set, cards: due.filter((card) => card.setId === set.id) }))
    .filter((item) => item.cards.length)

  return (
    <div className="container">
      <div className="page-heading">
        <p className="eyebrow">ÔN TẬP TẬP TRUNG</p>
        <h1>Những từ cần nhớ thêm</h1>
        <p>Gom các từ chưa thuộc từ nhiều bộ để bạn ôn nhanh mỗi ngày.</p>
      </div>
      <div className="review-summary">
        <strong>{due.length}</strong>
        <span>từ cần ôn</span>
        <div className="summary-bar"><span style={{ width: `${cards.length ? ((cards.length - due.length) / cards.length) * 100 : 0}%` }} /></div>
        <span>{cards.length - due.length}/{cards.length} đã thuộc</span>
      </div>
      {grouped.length ? grouped.map(({ set, cards: setCards }) => (
        <section className="review-group" key={set.id}>
          <div>
            <h3>{set.title}</h3>
            <p>{setCards.length} từ cần ôn · {formatDate(set.date)}</p>
          </div>
          <div className="review-actions">
            <button className="outline-btn" onClick={() => onLearn(set, setCards, false)}>Học {setCards.length} từ</button>
            <button className="outline-btn" onClick={() => onLearn(set, setCards, true)}>Xáo trộn</button>
            {setCards.length >= 2 && <button className="outline-btn" onClick={() => onQuiz(set, setCards)}>Quiz</button>}
          </div>
          <div className="review-words">
            {setCards.slice(0, 8).map((card) => <span key={card.id}>{card.term}</span>)}
            {setCards.length > 8 && <span>+{setCards.length - 8} từ</span>}
          </div>
        </section>
      )) : (
        <div className="empty"><span>✓</span><h3>Bạn đã ôn hết!</h3><p>Tất cả từ hiện tại đều đã được đánh dấu đã thuộc.</p></div>
      )}
    </div>
  )
}
