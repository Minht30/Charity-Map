# API Contract: Bản đồ thiện nguyện — MVP

Route handlers của Next.js, JSON, tiếng Việt cho thông báo lỗi. Mọi đầu vào được kiểm bằng Zod.
Lỗi trả dạng `{ "error": { "code": "...", "message": "..." } }`.

## Công khai (không cần đăng nhập)

### `GET /api/places`

Lấy điểm trong khung bản đồ đang xem.

Query: `bbox=minLng,minLat,maxLng,maxLat` (bắt buộc), `categories=ban-ve-so,vo-gia-cu` (tuỳ chọn),
`ward=<code>` (tuỳ chọn), `limit` (mặc định 500, tối đa 2.000).

200:
```json
{ "type": "FeatureCollection",
  "features": [{ "type": "Feature",
    "geometry": { "type": "Point", "coordinates": [106.70, 10.77] },
    "properties": { "id": "uuid", "title": "Cô Ba bán vé số", "category": "ban-ve-so",
                    "approximate": false, "stale": false } }] }
```
Toạ độ luôn lấy từ `location_public`. `approximate: true` với điểm `roaming`.

### `GET /api/places/:id`

200: `{ id, title, description, category, help_types[], hours[], approximate, ward_name, last_confirmed_at,
stale, sources: [{ url, kind, embed_html | null }], group: { name, verified } | null }`. 404 nếu không `published`.
Không có trường liên hệ nào.

### `POST /api/places/:id/reports`

Body: `{ "type": "no_consent" | "wrong_info" | "scam" | "gone", "note"?: string }`.
201. Với `no_consent`: điểm bị ẩn trước khi trả lời. Giới hạn 5 báo cáo/giờ/thiết bị (429).

## Thành viên (đăng nhập Facebook/Google)

### `POST /api/oembed/check`

Body: `{ "url": "https://www.facebook.com/..." }`. Gọi oEmbed công khai của Meta.
200: `{ ok: true, kind, embed_html }` hoặc `{ ok: false, reason: "not_public" | "unsupported" | "not_found" }`.

### `POST /api/ai/suggest`  *(chỉ khi `AI_SUGGEST_ENABLED=true`; MVP trả 404)*

Body: `{ "text": string (≤ 2.000 ký tự) }`. Xem [ai-extract.md](./ai-extract.md).
200: gợi ý để người dùng xác nhận, không lưu vào `places`. Giới hạn 20 lần/ngày/người.

### `POST /api/places`

Body: `{ title, description, category, location: { lat, lng }, location_type, help_types[], hours?[],
source_urls?[], consent_confirmed: true, group_id? }`.
201: `{ id, status: "pending" }`. 422 nếu thiếu đồng ý, không có cách giúp, hoặc mô tả chứa số điện thoại/CCCD
(trả về vị trí đoạn vi phạm). 200 kèm `possible_duplicates[]` nếu có điểm cùng danh mục trong 100 m và người dùng
chưa gửi `confirm_not_duplicate: true`.

### `POST /api/places/:id/confirm`

Xác nhận "vẫn còn ở đây". Cập nhật `last_confirmed_at`. Tối đa 1 lần/ngày/người/điểm.

## Kiểm duyệt viên

### `GET /api/moderation/queue?status=pending|reported`

Danh sách kèm `location_exact`, cờ AI (`ai_flags`), báo cáo.

### `POST /api/moderation/:id`

Body: `{ action: "approve" | "reject" | "edit" | "hide" | "unhide" | "remove", reason?, patch? }`.
Ghi `moderation_log`. `reject` bắt buộc có `reason`.
