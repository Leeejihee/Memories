# My Memories — Personal Memory & Photo Journal

Một ứng dụng nhật ký và lưu giữ kỷ niệm cá nhân ấm áp, riêng tư với phong cách ảnh Polaroid, lưu trữ không giới hạn qua IndexedDB, hỗ trợ tải ảnh từ máy tính/điện thoại, quản lý album, tìm kiếm thông minh và sao lưu dự phòng.

---

## 🌟 Tính Năng Nổi Bật

1. **Tải ảnh trực tiếp & Lưu trữ IndexedDB**:
   - Tải nhiều ảnh cùng lúc từ thiết bị (kéo thả hoặc chọn tệp).
   - Tự động nén thông minh giữ chất lượng cao và tiết kiệm bộ nhớ.
   - Hỗ trợ lưu trữ số lượng lớn hình ảnh ngoại tuyến (không bị giới hạn 5MB như localStorage thông thường).

2. **Bộ sưu tập & Album**:
   - Tạo album theo chủ đề (Du lịch, Bạn bè, Gia đình...).
   - Chỉnh sửa, chọn ảnh bìa, xóa album an toàn (giữ nguyên ảnh gốc).

3. **Chỉnh sửa & Chi tiết Kỷ niệm**:
   - Xem ảnh phóng to (Lightbox), trình chiếu ảnh tự động (Slideshow).
   - Chỉnh sửa tiêu đề, ngày chụp, địa điểm, thẻ phân loại (#tags) và cảm xúc/câu chuyện đính kèm.
   - Tải ảnh trực tiếp về máy.

4. **Ngày này năm xưa (On This Day) & Timeline**:
   - Tự động tìm và gợi ý những bức ảnh được chụp đúng vào ngày hôm nay của các năm trước.
   - Dòng thời gian trực quan sắp xếp theo thứ tự thời gian.

5. **AI Tìm kiếm Thông minh**:
   - Tìm kiếm nhanh theo nội dung, cảm xúc, địa điểm, năm hoặc thẻ chủ đề (Đà Lạt, Hoàng hôn, Bạn bè, Sương sớm...).

6. **Sao lưu & Phục hồi Toàn diện**:
   - Xuất tệp sao lưu (.json) lưu trữ toàn bộ dữ liệu ảnh và album về máy.
   - Khôi phục dữ liệu từ tệp sao lưu chỉ với 1 cú nhấp chuột.

---

## 🚀 Hướng Dẫn Deploy Lên Vercel

Dự án đã được cấu hình sẵn tệp `vercel.json` chuẩn hóa cho Vite + React SPA:

### Cách 1: Deploy qua Vercel Dashboard (Khuyên dùng)
1. Đẩy mã nguồn dự án lên GitHub / GitLab / Bitbucket.
2. Truy cập [https://vercel.com](https://vercel.com) và đăng nhập.
3. Nhấn **"Add New Project"** > Chọn repository **My Memories**.
4. Cấu hình tự động nhận diện:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Nhấn **Deploy** — Vercel sẽ tự động build và cấp tên miền miễn phí (VD: `my-memories.vercel.app`).

### Cách 2: Deploy qua Vercel CLI
```bash
# Cài đặt Vercel CLI nếu chưa có
npm i -g vercel

# Đăng nhập và deploy
vercel --prod
```

---

## 💻 Chạy Tại Máy Cục Bộ (Local Development)

```bash
# Cài đặt dependencies
npm install

# Khởi chạy dev server
npm run dev

# Build production
npm run build
```
