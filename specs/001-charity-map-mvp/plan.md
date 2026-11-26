# Implementation Plan: Bản đồ thiện nguyện — MVP

**Branch**: `001-charity-map-mvp` | **Date**: 2026-11-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-charity-map-mvp/spec.md`

## Summary

Web app chạy tốt trên điện thoại hiển thị các hoàn cảnh cần giúp quanh người dùng ở TP.HCM (mới). Người
xem không cần đăng nhập; người đăng đăng nhập bằng Facebook/Google, ghim vị trí, chọn danh mục, cách giúp
và gắn link bài/reel Facebook (nhúng bằng oEmbed). Bài qua kiểm duyệt trước khi hiển thị. Vị trí người không
có chỗ ở cố định được làm mờ ở tầng database. AI chỉ chạy lúc đăng bài để gợi ý điền form và gắn cờ cho kiểm
duyệt viên. Chi tiết lựa chọn công nghệ ở [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22 LTS

**Primary Dependencies**: Next.js (App Router, một project cho cả giao diện và API), MapLibre GL JS +
`pmtiles`, Supabase (PostgreSQL + PostGIS, Auth với Facebook và Google, Row Level Security),
`@anthropic-ai/sdk` cho phần AI, Zod để kiểm tra dữ liệu vào/ra

**Storage**: PostgreSQL 16 + PostGIS + `pg_trgm` (Supabase); bản đồ nền là một file PMTiles trên dịch vụ
lưu file tĩnh (Supabase Storage hoặc Cloudflare R2)

**Testing**: Vitest (logic), test SQL chạy trên Postgres thật bằng Supabase CLI (làm mờ vị trí, RLS, hết hạn),
Playwright (3 luồng chính: xem bản đồ, đăng địa điểm, báo cáo "không đồng ý")

**Target Platform**: Trình duyệt điện thoại (Chrome Android, Safari iOS), dạng PWA

**Project Type**: web application (một project Next.js)

**Performance Goals**: hiện điểm quanh người dùng < 3 giây trên 4G (SC-002); truy vấn "quanh tôi" < 50 ms
ở database với 100.000 điểm

**Constraints**: không lưu video/nội dung bài Facebook; vị trí chính xác không bao giờ rời database tới
người xem; không lưu số điện thoại/số tài khoản của người được giới thiệu; AI không chạy khi xem bản đồ

**Scale/Scope**: giai đoạn đầu 200–5.000 điểm, vài nghìn người xem/ngày; thiết kế chịu được 100.000 điểm

**AI model**: mặc định `claude-opus-5-5` ở effort `low`, prompt cố định được cache, Batch API cho lần nhập
hàng loạt. Model nhỏ hơn (`claude-haiku-5-5`, rẻ hơn khoảng 40 lần) là lựa chọn của Marshall sau khi chạy bộ
test 50–100 caption (research.md mục 4).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Nguyên tắc | Thiết kế đáp ứng thế nào | Kết quả |
|---|---|---|
| I. Sự thật, có nguồn, được kiểm duyệt | `status` mặc định `pending`; RLS chỉ cho người xem đọc `published`; `last_confirmed_at` + job hằng ngày đánh dấu 90 ngày, ẩn 180 ngày; `moderation_log` ghi mọi thao tác | ĐẠT |
| II. Phẩm giá và sự đồng ý (NON-NEGOTIABLE) | Cờ `consent_confirmed` bắt buộc (CHECK constraint); `location_public` tính bằng trigger, làm mờ ≥200 m khi `roaming`; view công khai không có cột `location_exact`; báo cáo `no_consent` ẩn ngay bằng trigger, không cần đăng nhập; lọc số điện thoại/CCCD bằng regex trước khi lưu | ĐẠT |
| III. Nguồn hợp pháp | Chỉ dùng oEmbed công khai; không tải video, không cào, không dùng tài khoản cá nhân; chỉ lưu URL + `embed_ok` | ĐẠT |
| IV. Không chỉ là tiền | Mỗi điểm cần ≥1 `help_type` (CHECK qua trigger); không có bảng/tính năng thanh toán | ĐẠT |
| V. Mobile-first, tiếng Việt | Giao diện tiếng Việt mặc định; bản đồ PMTiles + gom cụm; ngân sách tải trang < 3 giây đo bằng Playwright trên mạng giả lập 4G | ĐẠT |
| VI. Kiểm thử | Test SQL cho làm mờ, RLS, ẩn khi báo cáo, hết hạn; Vitest cho regex, schema; Playwright cho 3 luồng chính | ĐẠT |
| VII. Đơn giản trước | Một project Next.js, một database dịch vụ, không có hàng đợi/máy chủ bản đồ riêng | ĐẠT |

Kiểm tra lại sau Phase 1: không phát sinh vi phạm. Không cần mục Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-charity-map-mvp/
├── plan.md              # File này
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── api.md           # Các endpoint HTTP
│   └── ai-extract.md    # Hợp đồng đầu vào/đầu ra của AI
└── tasks.md             # Phase 2 (/speckit-tasks, chưa tạo)
```

### Source Code (repository root)

```text
app/
├── (public)/
│   ├── page.tsx                 # Bản đồ
│   └── p/[id]/page.tsx          # Chi tiết địa điểm
├── (auth)/dang-nhap/page.tsx    # Đăng nhập Facebook/Google
├── them-dia-diem/page.tsx       # Form thêm địa điểm
├── kiem-duyet/                  # Trang của kiểm duyệt viên
└── api/
    ├── places/route.ts
    ├── places/[id]/reports/route.ts
    ├── places/[id]/confirm/route.ts
    ├── oembed/route.ts
    ├── ai/suggest/route.ts
    └── moderation/[id]/route.ts
components/
├── map/                         # MapLibre, gom cụm, nút vị trí
├── place/                       # Thẻ chi tiết, nhúng reel, nút báo cáo
└── forms/
lib/
├── db/                          # Supabase client, truy vấn
├── privacy/                     # Regex số điện thoại/CCCD
├── facebook/oembed.ts
├── ai/                          # Gọi Claude, prompt, schema
└── geo/                         # Geocoding (VietMap/Goong), đơn vị hành chính
supabase/
├── migrations/                  # Bảng, PostGIS, RLS, trigger
├── seed/                        # Danh mục, 168 phường/xã TP.HCM
└── tests/                       # Test SQL
scripts/
└── import-seed.ts               # Nhập dữ liệu khởi đầu (dùng Batch API)
tests/
├── unit/
└── e2e/
public/
└── manifest.webmanifest
```

**Structure Decision**: Một project Next.js chứa cả giao diện và API (route handlers), database và quy tắc
bảo mật nằm trong `supabase/migrations`. Đây là cấu trúc đơn giản nhất mà vẫn đặt các quy tắc quyền riêng tư
ở tầng database, nơi lỗi giao diện không vượt qua được.

## Risks & Open Items

| Mục | Ảnh hưởng | Cách xử lý |
|---|---|---|
| oEmbed có nhận link `/reel/...` không | FR-004, FR-012 | Task đầu tiên: thử với 5 reel thật của Tổ Hoa Sen và Chuyện mưu sinh; nếu không được, hiện ảnh xem trước + link mở Facebook |
| Chọn VietMap hay Goong | Ô tìm địa chỉ | So sánh giá, hạn mức miễn phí, độ chính xác với 20 địa chỉ mẫu; ghim tay vẫn là cách chính |
| Ranh giới 168 phường/xã mới | Lọc theo khu vực | Tìm bộ dữ liệu ranh giới mở (OSM hoặc nguồn nhà nước); nếu chưa có, lọc theo bán kính trước |
| Facebook Login cần app Meta | FR-013 | Tạo app Meta chỉ với quyền đăng nhập cơ bản (`public_profile`, `email`), không xin quyền đọc trang |
| Ai kiểm duyệt | SC-005 (48 giờ) | Ban đầu là nhóm dự án; thêm vai trò kiểm duyệt viên tình nguyện sau |
