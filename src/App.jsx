import { useEffect, useMemo, useState } from 'react'
import Detail from './components/Detail.jsx'
import Home from './components/Home.jsx'
import ImportPage from './components/ImportPage.jsx'
import Learn from './components/Learn.jsx'
import Quiz from './components/Quiz.jsx'
import Review from './components/Review.jsx'
import { parseImport } from './lib/csv.js'
import { formatDate, today } from './lib/date.js'
import { createId } from './lib/id.js'
import { loadData, loadTheme, parseBackup, saveData, saveTheme } from './lib/storage.js'

export default function App() {
  const [data, setData] = useState(loadData)
  const [page, setPage] = useState('home')
  const [activeSetId, setActiveSetId] = useState(null)
  const [session, setSession] = useState(null)
  const [toast, setToast] = useState('')
  const [dark, setDark] = useState(loadTheme)

  useEffect(() => saveData(data), [data])
  useEffect(() => saveTheme(dark), [dark])
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(timer)
  }, [toast])

  const allCards = useMemo(
    () => data.sets.flatMap((set) => set.cards.map((card) => ({ ...card, setId: set.id, setTitle: set.title }))),
    [data],
  )
  const activeSet = activeSetId ? data.sets.find((set) => set.id === activeSetId) || null : null
  const showHome = page === 'home' || (['detail', 'learn', 'quiz'].includes(page) && !activeSet)

  const open = (nextPage, setId = null) => {
    setActiveSetId(setId)
    setPage(nextPage)
  }

  const updateSet = (setId, updater) => setData((current) => ({
    ...current,
    sets: current.sets.map((set) => (set.id === setId ? updater(set) : set)),
  }))

  const createSet = (set) => {
    setData((current) => ({ ...current, sets: [set, ...current.sets] }))
    setToast('Đã tạo bộ từ mới.')
  }

  const startSession = (set, cards, shuffled, mode) => {
    setSession({ setId: set.id, cards, shuffled, mode })
    setActiveSetId(set.id)
    setPage(mode)
  }
  const startLearn = (set, cards, shuffled) => startSession(set, cards, shuffled, 'learn')
  const startQuiz = (set, cards) => startSession(set, cards, false, 'quiz')

  const importText = (text, title, date, targetId) => {
    try {
      const cards = parseImport(text)
      if (targetId) {
        const added = cards.filter((card) => !data.sets.find((set) => set.id === targetId)?.cards.some((old) => old.term.toLowerCase() === card.term.toLowerCase()))
        updateSet(targetId, (set) => ({
          ...set,
          cards: [...set.cards, ...cards.filter((card) => !set.cards.some((old) => old.term.toLowerCase() === card.term.toLowerCase()))],
        }))
        setToast(added.length ? `Đã thêm ${added.length} từ vào bộ.` : 'Không có từ mới để thêm (đã trùng).')
      } else {
        createSet({ id: createId(), title: title.trim() || `Bộ từ ${formatDate(date)}`, date, createdAt: Date.now(), cards })
      }
      setPage('home')
    } catch (error) {
      setToast(error.message)
    }
  }

  const deleteSet = (set) => {
    if (!window.confirm(`Xóa bộ từ "${set.title}"? Hành động này không thể hoàn tác.`)) return
    setData((current) => ({ ...current, sets: current.sets.filter((item) => item.id !== set.id) }))
    if (activeSetId === set.id) open('home')
    setToast('Đã xóa bộ từ.')
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vocab-daily-backup-${today()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const restoreData = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        setData(parseBackup(String(reader.result)))
        setPage('home')
        setToast('Đã khôi phục dữ liệu.')
      } catch (error) {
        setToast(error.message)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <header className="topbar">
        <button className="brand" onClick={() => open('home')}><span>✦</span> Vocab Daily</button>
        <nav>
          <button className={page === 'home' ? 'active' : ''} onClick={() => open('home')}>Bộ từ của tôi</button>
          <button className={page === 'review' ? 'active' : ''} onClick={() => open('review')}>Ôn tập</button>
        </nav>
        <div className="top-actions">
          <button className="icon-btn" title="Đổi giao diện" onClick={() => setDark(!dark)}>{dark ? '☀' : '☾'}</button>
          <button className="outline-btn" onClick={exportData}>Xuất sao lưu</button>
          <label className="outline-btn">Khôi phục<input type="file" accept=".json" hidden onChange={(event) => event.target.files[0] && restoreData(event.target.files[0])} /></label>
        </div>
      </header>
      <main>
        {showHome && <Home data={data} open={open} onDelete={deleteSet} />}
        {page === 'import' && <ImportPage data={data} onImport={importText} onCancel={() => open('home')} />}
        {page === 'detail' && activeSet && (
          <Detail
            set={activeSet}
            updateSet={updateSet}
            onLearn={(shuffled) => startLearn(activeSet, activeSet.cards, shuffled)}
            onQuiz={() => startQuiz(activeSet, activeSet.cards)}
            onBack={() => open('home')}
          />
        )}
        {page === 'learn' && activeSet && session && (
          <Learn
            set={activeSet}
            cards={session.cards}
            shuffled={session.shuffled}
            updateSet={updateSet}
            onBack={() => open('detail', session.setId)}
          />
        )}
        {page === 'quiz' && activeSet && session && (
          <Quiz
            set={activeSet}
            cards={session.cards}
            updateSet={updateSet}
            onBack={() => open('detail', session.setId)}
          />
        )}
        {page === 'review' && <Review cards={allCards} data={data} onLearn={startLearn} onQuiz={startQuiz} />}
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
