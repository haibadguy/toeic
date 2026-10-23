import { useState } from 'react'
import { parseImport } from '../lib/csv.js'
import { today } from '../lib/date.js'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function ImportPage({ data, onImport, onCancel }) {
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(today())
  const [target, setTarget] = useState('')
  const [preview, setPreview] = useState([])
  const [error, setError] = useState('')

  const updatePreview = (value) => {
    setText(value)
    setError('')
    try {
      setPreview(parseImport(value).slice(0, 5))
    } catch {
      setPreview([])
    }
  }

  const read = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      setError('File vượt quá 10MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => updatePreview(String(reader.result))
    reader.readAsText(file)
  }

  return (
    <div className="container narrow">
      <button className="back-link" onClick={onCancel}>← Quay lại</button>
      <div className="page-heading">
        <p className="eyebrow">THÊM TỪ VỰNG</p>
        <h1>Import bộ từ mới</h1>
        <p>CSV, TXT hoặc dữ liệu phân tách bằng dấu phẩy / tab. Cột đầu là tiếng Anh, cột sau là nghĩa.</p>
      </div>
      <div className="import-layout">
        <section className="panel">
          <label className="dropzone">
            <strong>＋</strong>
            <span>Chọn file từ máy tính</span>
            <small>CSV, TXT · tối đa 10MB</small>
            <input type="file" accept=".csv,.txt,.tsv" hidden onChange={(event) => event.target.files[0] && read(event.target.files[0])} />
          </label>
          <div className="or">hoặc dán dữ liệu vào đây</div>
          <textarea
            rows="8"
            placeholder={'english,meaning,example\nabundant,dồi dào,An abundant supply'}
            value={text}
            onChange={(event) => updatePreview(event.target.value)}
          />
          {error && <p className="form-error">{error}</p>}
        </section>
        <section className="panel">
          <h3>Thông tin bộ từ</h3>
          <label>Tên bộ từ<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Từ vựng ngày 22/10" /></label>
          <label>Ngày học<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          <label>Thêm vào bộ có sẵn<select value={target} onChange={(event) => setTarget(event.target.value)}><option value="">Tạo bộ mới</option>{data.sets.map((set) => <option key={set.id} value={set.id}>{set.title}</option>)}</select></label>
          <button className="primary-btn full" disabled={!text.trim()} onClick={() => onImport(text, title, date, target)}>{target ? 'Thêm vào bộ' : 'Tạo bộ từ'}</button>
        </section>
      </div>
      {preview.length > 0 && (
        <section className="panel preview">
          <h3>Xem trước ({preview.length} dòng đầu)</h3>
          {preview.map((card) => <div className="preview-row" key={card.id}><b>{card.term}</b><span>{card.meaning}</span></div>)}
        </section>
      )}
    </div>
  )
}
