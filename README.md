# Vocab Daily (QuizToeic)

Ứng dụng học từ vựng local lấy cảm hứng từ flashcards, không cần tài khoản hay kết nối cloud. Dữ liệu được lưu trong `localStorage` của trình duyệt.

## Chạy ứng dụng

```bash
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị (thường là `http://localhost:5173`). Dừng bằng `Ctrl+C`.

## Kiểm thử

```bash
npm test        # chạy unit test bằng node:test (không cần cài thêm package)
npm run build   # kiểm tra build production
```

## Sử dụng

- Trang chủ: xem các bộ từ và tiến độ. Nút 🗑 trên mỗi bộ để xóa bộ từ (có xác nhận).
- **Import bộ từ**: chọn CSV/TXT hoặc dán dữ liệu. Cột bắt buộc là tiếng Anh và nghĩa tiếng Việt; có thể thêm `example`, `ipa`, `part of speech`, `note`. Hỗ trợ ô có ngoặc kép chứa dấu phẩy, dấu chấm phẩy, tab và xuống dòng.
- Mở bộ từ để sửa/xóa/thêm từ (kèm phiên âm, ví dụ, ghi chú) hoặc bắt đầu học.
- Trong phiên học: bấm thẻ hoặc `Space` để lật; `←` quay lại; `→` giữ nguyên và chuyển tiếp; `1` đánh dấu học lại; `2` đánh dấu đã thuộc. Thẻ đánh dấu "Học lại" sẽ xuất hiện lại sau vài thẻ khác.
- **Quiz trắc nghiệm**: chọn nghĩa đúng trong 4 phương án. Dùng phím `1`–`4` để chọn, `Enter` để sang câu tiếp. Từ trả lời đúng được đánh dấu "Đã thuộc".
- Trang **Ôn tập** gom các từ chưa được đánh dấu đã thuộc, có thể học hoặc làm quiz theo từng bộ.
- **Xuất sao lưu** tạo file JSON; **Khôi phục** nạp lại file đó trên thiết bị.
- Chế độ sáng/tối được ghi nhớ giữa các lần mở.

File [sample-vocabulary.csv](./sample-vocabulary.csv) có thể dùng để kiểm tra nhanh.

Bộ từ [preposition-noun-phrases-2026-10-22.csv](./preposition-noun-phrases-2026-10-22.csv) đã được thêm sẵn cho ngày 22/10/2026. Nếu trình duyệt đã có dữ liệu cũ, bộ này sẽ tự động xuất hiện mà không ghi đè tiến độ hiện tại.

Bộ từ [listening-part-1-people-actions-2026-10-22.csv](./listening-part-1-people-actions-2026-10-22.csv) lọc các động từ hành động trọng tâm của Listening Part 1, kèm IPA và cụm ví dụ.

## Deploy lên Vercel

Repo đã có sẵn `vercel.json` (framework Vite, output `dist`). Trên Vercel:

1. **Add New → Project** → chọn repo `haibadguy/toeic`.
2. Giữ nguyên preset **Vite** (Build Command `npm run build`, Output Directory `dist`).
3. Bấm **Deploy**. Mỗi lần push lên `main`, Vercel tự build lại.

## Cấu trúc mã nguồn

```
src/
  main.jsx              # entry point
  App.jsx               # điều hướng + state dữ liệu
  components/           # Home, SetCard, ImportPage, Detail, Learn, Quiz, Review, Status
  data/seed.js          # bộ từ mặc định
  lib/csv.js            # parser CSV (RFC 4180)
  lib/study.js          # xáo trộn, hàng đợi học, tạo câu hỏi quiz
  lib/storage.js        # localStorage, chuẩn hóa & sao lưu dữ liệu
  lib/date.js, lib/id.js
tests/                  # unit test cho csv, study, storage
```

