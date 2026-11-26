# Data Model: Bản đồ thiện nguyện — MVP

PostgreSQL 16 + PostGIS + `pg_trgm`. Toạ độ dùng `geography(Point, 4326)`. Tên bảng/cột tiếng Anh, nội
dung hiển thị tiếng Việt.

## Bảng

### `places` — Hoàn cảnh / địa điểm

| Cột | Kiểu | Ràng buộc / ghi chú |
|---|---|---|
| `id` | uuid | PK |
| `title` | text | 3–120 ký tự |
| `description` | text | ≤ 2.000 ký tự; không chứa số điện thoại/CCCD (kiểm ở API + trigger) |
| `category_id` | int | FK `categories` |
| `location_type` | enum `fixed` \| `roaming` | `roaming` bắt buộc với danh mục người vô gia cư |
| `location_exact` | geography(Point) | Chỉ kiểm duyệt viên đọc được |
| `location_public` | geography(Point) | Trigger tính: `fixed` = bằng `location_exact`; `roaming` = dịch ngẫu nhiên 200–400 m, cố định theo `id` (không đổi mỗi lần đọc, tránh lộ vị trí thật khi lấy trung bình) |
| `ward_code` | text | FK `admin_units`; trigger tính từ `location_exact` |
| `status` | enum `pending` \| `published` \| `hidden` \| `rejected` \| `removed` | Mặc định `pending` |
| `hidden_reason` | enum `no_consent` \| `reports` \| `stale` \| `moderator` | null khi không ẩn |
| `consent_confirmed` | boolean | CHECK = true |
| `last_confirmed_at` | timestamptz | Mặc định `now()` |
| `created_by` | uuid | FK `users` |
| `group_id` | uuid | FK `groups`, có thể null |
| `created_at`, `updated_at` | timestamptz | |

Chỉ mục: GiST trên `location_public`, GiST trên `location_exact`, GIN `pg_trgm` trên `title`,
B-tree `(status, category_id)`.

### `place_help_types`

`place_id` FK, `help_type` enum: `buy_goods` (mua hàng), `bring_food` (mang đồ ăn), `bring_items` (đồ dùng,
quần áo), `visit_chat` (ghé thăm trò chuyện), `share` (chia sẻ thông tin), `volunteer` (góp công). PK
`(place_id, help_type)`. Trigger: điểm `published` phải có ≥1 dòng.

### `place_hours`

`place_id`, `weekday` 0–6, `start_time`, `end_time`, `note`. Cho người bán vé số/bán rong theo giờ.

### `source_links`

`id`, `place_id`, `url` (chỉ chấp nhận domain facebook.com / fb.watch ở MVP), `kind` enum `post` \| `reel` \|
`video`, `embed_ok` boolean, `embed_html` text (cache kết quả oEmbed, làm mới khi quá 7 ngày), `checked_at`.

### `categories`

`id`, `slug`, `name_vi`, `icon`, `sort_order`, `forces_roaming` boolean.
Seed: `ban-ve-so` Người bán vé số · `cu-gia-ban-hang` Cụ già bán hàng · `nguoi-khuyet-tat` Cửa hàng do người
khuyết tật làm · `vo-gia-cu` Người vô gia cư (`forces_roaming`) · `diem-phat-do-an` Điểm phát đồ ăn / quyên góp
đồ · `ghe-tham` Nhà có thể ghé thăm · `khac` Khác.

### `admin_units`

`code`, `name_vi`, `level` enum `province` \| `ward`, `parent_code`, `former_district` text[] (tên quận/huyện
cũ để tìm kiếm), `geom` geography(MultiPolygon).

### `users`

`id` (= Supabase Auth user id), `display_name`, `role` enum `member` \| `moderator` \| `admin`, `strikes` int,
`posting_blocked_until` timestamptz. Không lưu email ở bảng công khai.

### `groups`

`id`, `name`, `facebook_url`, `verified` boolean, `created_by`.

### `reports`

`id`, `place_id`, `type` enum `no_consent` \| `wrong_info` \| `scam` \| `gone`, `note` ≤ 500 ký tự,
`reporter_id` (null nếu ẩn danh), `reporter_fingerprint` (hash IP + ngày, chống spam, không lưu IP gốc),
`status` enum `open` \| `resolved` \| `dismissed`, `created_at`.

### `moderation_log`

`id`, `place_id`, `actor_id`, `action` (approve, reject, edit, hide, unhide, remove), `reason`, `created_at`.

### `ai_suggestions`

`id`, `place_id` (null trước khi gửi), `input_hash` (sha256 của đầu vào), `model`, `output` jsonb,
`input_tokens`, `output_tokens`, `created_at`. Cùng `input_hash` thì dùng lại, không gọi AI lần nữa.

### `location_suggestions` *(chỉ khi bật FR-015)*

`id`, `place_id`, `rank` 1–3, `point` geography(Point), `confidence` 0–1, `evidence_text` (≤ 300 ký tự, câu
nói hoặc chữ trên hình), `evidence_kind` enum `speech` \| `ocr` \| `caption`, `video_source` enum
`owner_upload` \| `owner_permission`, `status` enum `suggested` \| `accepted` \| `rejected`, `created_at`.
Chỉ kiểm duyệt viên đọc được. Không lưu file video hay bản chép lời đầy đủ.

## Quy tắc trạng thái

```
pending ──duyệt──▶ published ──báo cáo no_consent──▶ hidden(no_consent)   (ngay lập tức, trigger)
   │                   │ ──≥3 báo cáo khác độc lập──▶ hidden(reports)
   │                   │ ──90 ngày không xác nhận──▶ published + nhãn "có thể đã thay đổi"
   │                   │ ──180 ngày──▶ hidden(stale)
   └──từ chối──▶ rejected          hidden ──kiểm duyệt viên──▶ published | removed
```

## Quyền truy cập (Row Level Security)

- **Người xem (anon)**: chỉ đọc view `places_public` = `published` và các cột không nhạy cảm (không có
  `location_exact`, `created_by`). Được INSERT vào `reports`.
- **Thành viên**: INSERT `places` với `status = pending`, sửa bài `pending` của chính mình.
- **Kiểm duyệt viên/admin**: đọc mọi cột, đổi `status`, ghi `moderation_log`.
