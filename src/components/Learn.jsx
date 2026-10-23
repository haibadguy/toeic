import { useEffect, useRef, useState } from 'react'
import { rateCard, shuffle } from '../lib/study.js'

function speakTerm(term) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(term)
  utterance.lang = 'en-US'
  utterance.rate = 0.85
  window.speechSynthesis.speak(utterance)
}

export default function Learn({ set, cards, shuffled, updateSet, onBack }) {
  const [queue, setQueue] = useState(() => (shuffled ? shuffle(cards) : [...cards]))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [repeatCounts, setRepeatCounts] = useState({})
  const [finished, setFinished] = useState(false)
  const card = queue[index]

  const rate = (status) => {
    if (!card || finished) return
    updateSet(set.id, (current) => ({
      ...current,
      cards: current.cards.map((item) => (item.id === card.id ? { ...item, status } : item)),
    }))
    const next = rateCard({ queue, index, repeatCounts, cardId: card.id, status })
    setQueue(next.queue)
    setRepeatCounts(next.repeatCounts)
    setFlipped(false)
    if (next.finished) setFinished(true)
    else setIndex(next.index)
  }

  const goBack = () => {
    if (index === 0) return
    setIndex(index - 1)
    setFlipped(false)
  }

  const restart = () => {
    setQueue(shuffled ? shuffle(cards) : [...cards])
    setIndex(0)
    setFlipped(false)
    setFinished(false)
    setRepeatCounts({})
  }

  const handlers = useRef({})
  handlers.current = { rate, goBack, flip: () => setFlipped((value) => !value) }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return
      if (event.code === 'Space') {
        event.preventDefault()
        handlers.current.flip()
      } else if (event.key === 'ArrowRight') {
        handlers.current.rate('unrated')
      } else if (event.key === 'ArrowLeft') {
        handlers.current.goBack()
      } else if (event.key === '1') {
        handlers.current.rate('learning')
      } else if (event.key === '2') {
        handlers.current.rate('known')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (!cards.length) {
    return (
      <div className="learn-page">
        <button className="back-link" onClick={onBack}>← Về bộ từ</button>
        <div className="empty"><span>▱</span><h3>Bộ từ chưa có thẻ nào</h3><p>Thêm từ trước khi bắt đầu học.</p></div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="learn-page">
        <button className="back-link" onClick={onBack}>← Về bộ từ</button>
        <div className="complete">
          <div className="complete-icon">✓</div>
          <p className="eyebrow">PHIÊN HỌC HOÀN TẤT</p>
          <h1>Tốt lắm!</h1>
          <p>Bạn đã xem hết {queue.length} lượt thẻ trong bộ <b>{set.title}</b>.</p>
          <div className="complete-actions">
            <button className="primary-btn" onClick={restart}>Học lại</button>
            <button className="outline-btn" onClick={onBack}>Về bộ từ</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="learn-page">
      <div className="learn-top">
        <button className="back-link" onClick={onBack}>← Thoát phiên học</button>
        <span className="learn-title">{set.title}{shuffled && ' · Xáo trộn'}</span>
        <span>{index + 1} / {queue.length}</span>
      </div>
      <div className="learn-progress"><span style={{ width: `${((index + 1) / queue.length) * 100}%` }} /></div>
      <div className="flashcard-wrap">
        <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
          <div className="face front">
            <small>TỪ / CỤM TỪ</small>
            <div className="term-with-voice">
              <h1>{card.term}</h1>
              <button
                className="voice-btn"
                aria-label={`Nghe phát âm ${card.term}`}
                title="Nghe phát âm"
                onClick={(event) => { event.stopPropagation(); speakTerm(card.term) }}
              >🔊</button>
            </div>
            {card.ipa && <p className="card-ipa">{card.ipa}</p>}
            <span className="flip-hint">Nhấn để lật thẻ · Space</span>
          </div>
          <div className="face back">
            <small>NGHĨA TIẾNG VIỆT</small>
            <h2>{card.meaning}</h2>
            {card.example && <p>“{card.example}”</p>}
            <span className="flip-hint">Nhấn để lật thẻ</span>
          </div>
        </div>
      </div>
      <div className="learn-controls">
        <button className="review-btn learning" onClick={() => rate('learning')}><span>↻</span> Học lại <kbd>1</kbd></button>
        <button className="review-btn neutral" onClick={() => rate('unrated')}>Bỏ qua (chưa đánh giá) <kbd>→</kbd></button>
        <button className="review-btn known" onClick={() => rate('known')}>Đã thuộc <kbd>2</kbd></button>
      </div>
      <div className="shortcut-help">← Quay lại <i>·</i> Space Lật thẻ <i>·</i> → Bỏ qua <i>·</i> 1 Học lại <i>·</i> 2 Đã thuộc</div>
    </div>
  )
}
