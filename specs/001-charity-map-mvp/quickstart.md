# Quickstart: chạy và kiểm tra MVP trên máy

> Viết trước khi có code; các lệnh sẽ được xác nhận khi triển khai.

## Cần có

- Node.js 22, pnpm
- Docker (cho Supabase CLI chạy Postgres + PostGIS trên máy)
- App Meta (chỉ Facebook Login) và OAuth client Google, cho bước đăng nhập
- `ANTHROPIC_API_KEY` (tuỳ chọn; không có thì form vẫn chạy, chỉ không có gợi ý AI)

## Chạy

```bash
pnpm install
supabase start                 # Postgres + PostGIS + Auth trên máy
supabase db reset              # chạy migrations + seed danh mục và phường/xã
cp .env.example .env.local     # điền khoá Supabase, Facebook, Google, Anthropic
pnpm dev                       # http://localhost:3000
```

## Kiểm tra theo user story

1. **US1 Xem bản đồ**: `pnpm seed:demo` nạp 30 điểm mẫu ở TP.HCM. Mở trang trên điện thoại (hoặc chế độ giả lập),
   cho phép vị trí, lọc "Người bán vé số", mở một điểm, thấy reel nhúng và nút chỉ đường. Điểm "vô gia cư" chỉ hiện vùng gần đúng.
2. **US2 Đăng địa điểm**: đăng nhập Google, "Thêm địa điểm", dán caption → thấy gợi ý AI, bỏ tích đồng ý → không gửi
   được; tích → gửi, bài ở trạng thái chờ duyệt. Đăng nhập tài khoản kiểm duyệt viên, duyệt, điểm hiện trên bản đồ.
3. **US3 Báo cáo**: ở cửa sổ ẩn danh, mở một điểm, chọn "Người này không đồng ý" → điểm biến mất khỏi bản đồ ngay.

## Test

```bash
pnpm test            # Vitest
supabase test db     # test SQL: làm mờ vị trí, RLS, ẩn khi báo cáo, hết hạn
pnpm test:e2e        # Playwright, 3 luồng chính
```
