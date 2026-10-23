import { useEffect, useMemo, useRef, useState } from 'react'
import { buildQuizQuestions } from '../lib/study.js'

export default function Quiz({ set, cards, updateSet, onBack }) {
  const [round, setRound] = useState(0)
  const questions = useMemo(() => buildQuizQuestions(cards), [cards, round])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const question = questions[index]

  const choose = (option) => {
    if (!question || selected !== null || !option) return
    setSelected(option)
    if (option === question.answer) {
      setScore((value) => value + 1)
      updateSet(set.id, (current) => ({
        ...current,
        cards: current.cards.map((card) => (card.id === question.cardId ? { ...card, status: 'known' } : card)),
      }))
    }
  }

  const next = () => {
    if (selected === null || finished) return
    if (index === questions.length - 1) setFinished(true)
    else {
      setIndex(index + 1)
      setSelected(null)
    }
  }

  const restart = () => {
    setRound((value) => value + 1)
    setIndex(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  const handlers = useRef({})
  handlers.current = { choose, next }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return
      if (event.key === 'Enter') handlers.current.next()
      const optionIndex = Number(event.key) - 1
      if (optionIndex >= 0 && optionIndex < 4) handlers.current.choose(questions[index]?.options[optionIndex])
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [questions, index])

  if (!questions.length) {
    return (
      <div className="learn-page">
        <button className="back-link" onClick={onBack}>← Về bộ từ</button>
        <div className="empty"><span>▱</span><h3>Chưa đủ từ để làm quiz</h3><p>Cần ít nhất 2 từ trong bộ để tạo câu hỏi trắc nghiệm.</p></div>
      </div>
    )
  }

  if (finished) {
    const percent = Math.round((score / questions.length) * 100)
    return (
      <div className="learn-page">
        <button className="back-link" onClick={onBack}>← Về bộ từ</button>
        <div className="complete">
          <div className="complete-icon">✓</div>
          <p className="eyebrow">HOÀN THÀNH QUIZ</p>
          <h1>{score} / {questions.length}</h1>
          <p>Bạn trả lời đúng <b>{percent}%</b> câu hỏi trong bộ <b>{set.title}</b>.</p>
          <p className="quiz-note">Các từ trả lời đúng đã được đánh dấu “Đã thuộc”.</p>
          <div className="complete-actions">
            <button className="primary-btn" onClick={restart}>Làm lại</button>
            <button className="outline-btn" onClick={onBack}>Về bộ từ</button>
          </div>
        </div>
      </div>
    )
  }

  const optionClass = (option) => {
    if (selected === null) return 'quiz-option'
    if (option === question.answer) return 'quiz-option correct'
    if (option === selected) return 'quiz-option wrong'
    return 'quiz-option dimmed'
  }

  return (
    <div className="learn-page quiz-page">
      <div className="learn-top">
        <button className="back-link" onClick={onBack}>← Thoát quiz</button>
        <span className="learn-title">{set.title} · Quiz</span>
        <span>{index + 1} / {questions.length}</span>
      </div>
      <div className="learn-progress"><span style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
      <div className="quiz-card">
        <small>CHỌN NGHĨA ĐÚNG</small>
        <h1>{question.term}</h1>
        {question.ipa && <p className="card-ipa">{question.ipa}</p>}
        <div className="quiz-options">
          {question.options.map((option, optionIndex) => (
            <button
              key={option}
              className={optionClass(option)}
              disabled={selected !== null}
              onClick={() => choose(option)}
            >
              <kbd>{optionIndex + 1}</kbd>
              <span>{option}</span>
            </button>
          ))}
        </div>
        {selected !== null && (
          <div className={`quiz-feedback ${selected === question.answer ? 'correct' : 'wrong'}`}>
            {selected === question.answer ? 'Chính xác!' : `Đáp án đúng: ${question.answer}`}
          </div>
        )}
      </div>
      <div className="quiz-actions">
        <span className="quiz-score">Điểm: {score}</span>
        <button className="primary-btn" onClick={next} disabled={selected === null}>
          {index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp'} <kbd>Enter</kbd>
        </button>
      </div>
    </div>
  )
}
