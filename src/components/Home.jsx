import SetCard from './SetCard.jsx'

export default function Home({ data, open, onDelete }) {
  const total = data.sets.reduce((sum, set) => sum + set.cards.length, 0)
  return (
    <div className="container">
      <section className="hero">
        <div>
          <p className="eyebrow">KHÔNG GIAN HỌC TẬP CỦA BẠN</p>
          <h1>Học một chút,<br /><em>nhớ thật lâu.</em></h1>
          <p className="hero-copy">Theo dõi từ vựng mỗi ngày bằng những phiên học ngắn và tập trung.</p>
        </div>
        <div className="hero-stat"><strong>{total}</strong><span>từ đang học</span></div>
      </section>
      <div className="section-head">
        <div><h2>Bộ từ vựng</h2><p>{data.sets.length} bộ từ · lưu ngay trên thiết bị của bạn</p></div>
        <button className="primary-btn" onClick={() => open('import')}>＋ Import bộ từ</button>
      </div>
      <div className="set-grid">
        {data.sets.map((set) => <SetCard key={set.id} set={set} open={open} onDelete={onDelete} />)}
        {!data.sets.length && <div className="empty"><span>▱</span><h3>Chưa có bộ từ nào</h3><p>Import danh sách đầu tiên để bắt đầu học.</p></div>}
      </div>
    </div>
  )
}
