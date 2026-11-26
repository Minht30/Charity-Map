# Research: Bản đồ thiện nguyện — MVP

**Feature**: [spec.md](./spec.md) · **Ngày**: 2026-11-26 · **Trạng thái**: Bản nháp, chờ Marshall xem

Tài liệu này trả lời 4 câu hỏi trước khi lập plan: (1) lấy dữ liệu từ Facebook thế nào, (2) tổ chức
database ra sao khi có rất nhiều địa điểm, (3) làm bản đồ web thế nào cho nhẹ và rẻ, (4) dùng AI thế
nào cho hữu ích mà tiết kiệm token. Mỗi mục có **Quyết định**, **Lý do** và **Phương án đã cân nhắc**.
Những điểm chưa kiểm chứng được ghi rõ là *chưa kiểm chứng*.

---

## 1. Nguồn dữ liệu Facebook

### Hiện trạng chính sách của Meta (kiểm tra ngày 2026-11-26)

| Cách | Cần gì | Lấy được gì | Phù hợp? |
|---|---|---|---|
| **Nhúng bằng oEmbed** (Facebook oEmbed Post / Video) | Từ 15/06/2026 **không cần access token, không cần App Review** cho nội dung công khai | Mã HTML để nhúng bài/video vào trang của mình, kèm vài metadata kỹ thuật | **Có, dùng cho MVP** |
| **Page Public Content Access** (Graph API) | App Review + xác minh doanh nghiệp (business verification), có thể phải ký thêm hợp đồng | Đọc bài đăng, bình luận công khai của trang mình không quản lý; mục đích được phép: "phân tích và/hoặc hiển thị bài đăng" | Để sau, khi dự án có pháp nhân/doanh nghiệp |
| **Chủ trang cấp quyền** (`pages_read_engagement`) | Admin của trang (ví dụ Tổ Hoa Sen) đăng nhập và cho phép app | Đọc bài của chính trang đó | Có thể làm ở giai đoạn 2 với các trang hợp tác |
| **Tài khoản "tin cậy" dùng chung để đọc trang / cào dữ liệu** | — | — | **Không.** Trái điều khoản Meta, dễ bị khoá tài khoản, rủi ro pháp lý (hiến chương, nguyên tắc III) |

Nguồn: [bài blog của Meta về oEmbed không cần token (15/06/2026)](https://developers.facebook.com/blog/post/2026/06/15/tokenless-access-to-meta-oembed-apis/),
[Meta oEmbed Read](https://developers.facebook.com/docs/features-reference/meta-oembed-read),
[Page Public Content Access](https://developers.facebook.com/docs/features-reference/page-public-content-access).
Lưu ý: trang tài liệu oEmbed Read vẫn ghi "cần App Review"; bài blog mới hơn nói không cần nữa với
nội dung công khai. **Đã kiểm chứng ngày 2026-11-26**: gọi `https://graph.facebook.com/oembed_video?url=`
với một reel công khai của Tôn Hoa Sen (`facebook.com/reel/1639694723761056/`), không token, không đăng nhập,
trả về `type: "video"` và mã nhúng `<div class="fb-video" data-href="…/reel/…">` dùng Facebook JS SDK v27.0.
Trang reels của Tôn Hoa Sen cũng xem được công khai không cần đăng nhập.

### Quyết định

1. **MVP**: người dùng dán link bài/reel → hệ thống gọi oEmbed để kiểm tra link công khai và lấy mã
   nhúng → hiển thị reel ngay trong trang chi tiết. Không tải video, không lưu nội dung bài.
2. **Người đăng tự điền** vị trí (ghim), danh mục, cách giúp và một đoạn mô tả ngắn (có thể dán caption
   của reel). AI giúp điền nhanh từ đoạn chữ này (xem mục 4).
3. **Dữ liệu khởi đầu**: nhóm dự án tự nhập 50–200 điểm từ các reel của những trang như Tổ Hoa Sen,
   Chuyện mưu sinh. Mỗi reel thường là một người/một hoàn cảnh, nên mỗi reel thành một điểm.
4. **Giai đoạn 2**: liên hệ các trang này. Nếu họ đồng ý, admin trang cấp quyền cho app để tự lấy bài
   mới, hoặc gửi cho mình danh sách (bảng tính) các hoàn cảnh họ đã giới thiệu kèm vị trí. Đây là cách
   nhanh nhất để có nhiều dữ liệu tốt, và giải quyết luôn chuyện đồng ý vì các trang này đã gặp trực tiếp.
5. **Giai đoạn 3** (nếu cần): xin Page Public Content Access khi dự án có pháp nhân.

**Lý do**: oEmbed là cách duy nhất vừa hợp lệ, vừa miễn phí, vừa không phải chờ Meta duyệt. Reel
không có toạ độ nên dù có API thì vẫn cần người ghim vị trí; API không làm bớt được bước khó nhất.

---

## 2. Tổ chức database

### Quyết định

**PostgreSQL + PostGIS** (dùng dịch vụ có sẵn như Supabase hoặc Neon ở giai đoạn đầu).

- Mỗi địa điểm lưu 2 toạ độ: `location_exact` (chỉ kiểm duyệt viên thấy) và `location_public`
  (đã làm mờ ≥200 m với người không có chỗ ở cố định). API công khai **chỉ đọc** `location_public`, nên
  không thể lộ vị trí thật do lỗi giao diện.
- Kiểu `geography(Point, 4326)` + chỉ mục GiST; truy vấn "quanh tôi" dùng `ST_DWithin`. Với vài chục
  nghìn đến vài trăm nghìn điểm, cách này trả kết quả trong vài mili giây, chưa cần Redis hay H3.
- Bảng chính (khớp Key Entities trong spec):

```
places            id, title, description, category_id, location_type (fixed|roaming),
                  location_exact, location_public, ward_code, status, last_confirmed_at,
                  created_by, group_id, created_at
place_help_types  place_id, help_type   (buy_goods, bring_food, visit_chat, share, volunteer...)
place_hours       place_id, weekday, start, end      (người bán vé số di chuyển theo giờ)
source_links      place_id, url, platform, embed_ok, checked_at
categories        id, slug, name_vi, icon, sort_order
admin_units       code, name_vi, level (province|ward), parent_code, geom    (đơn vị hành chính)
users             id, auth_provider (facebook|google), display_name, role, strikes
reports           id, place_id, type (no_consent|wrong|scam|gone), note, status, created_at
moderation_log    id, place_id, actor_id, action, reason, created_at
ai_suggestions    place_id, model, input_hash, output_json, created_at   (cache kết quả AI)
```

- **Đơn vị hành chính**: từ 01/07/2025, TP.HCM đã sáp nhập Bình Dương và Bà Rịa – Vũng Tàu, bỏ cấp
  quận/huyện, còn 168 phường/xã ([Lao Động](https://news.laodong.vn/thoi-su/danh-sach-168-don-vi-hanh-chinh-cap-xa-cua-tphcm-1524675.ldo)).
  Vì vậy lọc theo **phường/xã mới**, và lưu thêm tên quận cũ làm từ khoá tìm kiếm vì người dân vẫn quen
  nói "Quận 1", "Bình Thạnh". Tính `ward_code` tự động từ toạ độ (point-in-polygon) thay vì bắt người
  dùng chọn.
- **Chống trùng**: khi đăng, tìm điểm cùng danh mục trong bán kính 100 m (`ST_DWithin`) và tiêu đề gần
  giống (`pg_trgm`), rồi hỏi "Có phải người này không?".
- **Hết hạn**: một job hằng ngày đánh dấu điểm quá 90 ngày, ẩn điểm quá 180 ngày.

**Phương án đã cân nhắc**: Firebase/Firestore (truy vấn địa lý yếu, phải tự làm geohash), MongoDB (có
geo nhưng không có PostGIS, thiếu hàm làm mờ và point-in-polygon tốt), Elasticsearch (thừa cho quy mô này).

---

## 3. Bản đồ web

### Quyết định

- **Thư viện bản đồ**: MapLibre GL JS (mã nguồn mở, miễn phí, chạy mượt trên điện thoại).
- **Bản đồ nền**: dữ liệu OpenStreetMap, đóng gói thành **một file PMTiles** (Protomaps) cho khu vực
  TP.HCM mới, đặt trên dịch vụ lưu file tĩnh (Cloudflare R2, S3...). Không cần máy chủ bản đồ, chi phí
  gần như 0 ([Protomaps](https://docs.protomaps.com/pmtiles/maplibre), [hướng dẫn của Simon Willison](https://til.simonwillison.net/gis/pmtiles)).
  Phải ghi công © OpenStreetMap.
- **Các điểm**: tải dạng GeoJSON theo vùng đang xem, gom cụm (clustering) ngay trong MapLibre. Khi vượt
  ~50.000 điểm thì chuyển sang vector tiles sinh từ PostGIS (`ST_AsMVT`).
- **Tìm địa chỉ (geocoding)**: OSM/Nominatim yếu với địa chỉ Việt Nam. Ưu tiên ghim tay trên bản đồ;
  ô tìm địa chỉ dùng dịch vụ Việt Nam như VietMap hoặc Goong, đã cập nhật đơn vị hành chính mới
  ([VietMap API](https://maps.vietmap.vn/docs), [Goong](https://goong.io/en/)). *Chưa kiểm chứng*: giá và hạn mức miễn phí.
- **Chỉ đường**: nút mở Google Maps/Apple Maps của điện thoại bằng link, không tự làm.
- **Web trước, app sau**: làm dạng PWA (thêm vào màn hình chính được). Có thể bọc thành app sau bằng
  Capacitor mà không phải viết lại.

**Phương án đã cân nhắc**: Google Maps JavaScript API (quen thuộc nhưng tính phí theo lượt tải, khó
kiểm soát chi phí khi nhiều người dùng), Leaflet (đơn giản nhưng không hiện vector tiles mượt bằng).

---

## 4. Dùng AI tiết kiệm token

### AI làm gì (và không làm gì)

| Việc | Khi nào chạy | Đầu vào | Đầu ra |
|---|---|---|---|
| Gợi ý điền form | Khi người dùng dán mô tả/caption | Đoạn chữ ngắn (~100–300 token) | JSON: danh mục, cách giúp, giờ có mặt, gợi ý tiêu đề tôn trọng |
| Sàng lọc kiểm duyệt | Khi bài vào hàng chờ | Mô tả + metadata | Cờ: có số điện thoại/CCCD, nhắc trẻ em, ngôn từ giật gân, nghi quảng cáo/lừa đảo |
| Nhập dữ liệu khởi đầu | Một lần, chạy hàng loạt | Caption của các reel nhóm dự án dán vào | Bản nháp địa điểm để người duyệt |

AI **không** xem video, **không** tự đăng, **không** quyết định duyệt. Người kiểm duyệt luôn quyết định
cuối (hiến chương, nguyên tắc I).

### Giai đoạn MVP: chưa gọi Claude API trong app (Marshall, 2026-11-26)

Marshall muốn chưa trả tiền API. Gói Claude Pro chỉ dùng được trong ứng dụng Claude (như phiên làm việc này),
không dùng được để chạy tính năng AI bên trong một web app đã triển khai; app cần khoá API riêng, tính tiền riêng.
Vì vậy MVP:

- **Không có AI trong app.** Form thêm địa điểm điền tay, có danh sách chọn sẵn; regex chặn số điện thoại/CCCD
  vẫn chạy (không tốn gì). Mã gọi AI để sẵn sau một cờ bật/tắt (`AI_SUGGEST_ENABLED=false`), bật khi có khoá API.
- **Nhập dữ liệu khởi đầu qua phiên làm việc với Claude.** Nhóm dự án (hoặc Claude trong một phiên như thế này)
  mở các trang reel công khai, đọc caption, soạn file `supabase/seed/places.draft.json` theo đúng schema ở
  `contracts/ai-extract.md`. Script `scripts/import-seed.ts` chỉ đọc file này và đưa vào hàng chờ duyệt, không gọi API.
  Người kiểm duyệt vẫn ghim lại vị trí và duyệt từng điểm.

### Cách tiết kiệm token (khi bật AI trong app)

1. **Chọn model theo bộ test**: mặc định dùng Claude Opus 5.5 ở mức effort thấp (`low`). Model nhỏ nhất
   (Haiku 5.5, khoảng $0.10 / 1 triệu token đầu vào, rẻ hơn khoảng 40 lần) có thể đủ cho phân loại và trích
   xuất; chạy cả hai trên bộ test (mục 7) rồi Marshall chọn.
2. **Structured outputs**: bắt model trả đúng JSON schema, không phải gọi lại vì sai định dạng.
3. **Prompt caching**: phần hướng dẫn cố định (danh mục, quy tắc ngôn từ, ví dụ) đặt đầu prompt và cache
   lại. Lần gọi sau chỉ trả giá rẻ cho phần đó.
4. **Batch API** cho việc nhập hàng loạt: rẻ hơn 50%, chạy không đồng bộ.
5. **Chỉ gọi AI khi có bài mới**, không bao giờ gọi khi người xem mở bản đồ. Lưu kết quả vào
   `ai_suggestions` theo hash đầu vào để không gọi lại cùng một nội dung.
6. **Luật đơn giản trước, AI sau**: số điện thoại, số CCCD bắt bằng regex trước; chỉ gửi AI phần cần hiểu ngữ nghĩa.
7. **Bộ test nhỏ**: 50–100 caption thật đã gán nhãn tay để đo độ chính xác trước khi bật cho người dùng.

Chi phí ước tính *(phỏng đoán)*: 10.000 bài × ~800 token/bài ≈ 8 triệu token ≈ khoảng $1 với Haiku 5.5, hoặc
khoảng $40–60 với Opus 5.5 ở effort thấp, chưa tính giảm giá cache/batch.

---

## 5. Gợi ý vị trí từ nội dung video (tuỳ chọn, mặc định tắt)

**Vấn đề** (Marshall, 2026-11-26): vị trí thường chỉ có trong lời nói hoặc trên hình ("ở ngã tư A và B"),
không có trong caption. Claude trong phiên làm việc đọc được chữ và xem được ảnh chụp màn hình, nhưng **không
nghe được âm thanh** của video, nên cần một bước chuyển lời nói thành chữ trước.

**Nguồn video hợp lệ**: chỉ file do chủ trang gửi (ví dụ Tôn Hoa Sen gửi file gốc, hoặc thư mục chia sẻ), hoặc
khi chủ trang cho phép bằng văn bản. KHÔNG dùng công cụ tải video từ Facebook (vi phạm điều khoản Meta, hiến
chương nguyên tắc III).

**Quy trình**

1. **Lời nói → chữ**: Whisper (mã nguồn mở, chạy miễn phí trên máy) hoặc bản tinh chỉnh cho tiếng Việt như
   PhoWhisper của VinAI. *Chưa kiểm chứng*: độ chính xác với giọng miền Nam và tiếng ồn đường phố; cần thử với 10
   video thật.
2. **Chữ trên hình**: lấy 1 khung hình mỗi 2–3 giây, đọc chữ bằng OCR hỗ trợ tiếng Việt (Tesseract `vie`,
   PaddleOCR hoặc VietOCR) để bắt biển tên đường, biển cửa hàng, số nhà.
3. **Trích địa điểm**: một bước đọc hiểu (Claude trong phiên làm việc khi nhập dữ liệu khởi đầu, hoặc Claude API
   nếu sau này bật) đọc caption + bản chép lời + chữ OCR, trả về các cụm vị trí như "ngã tư Lê Lợi – Pasteur",
   "chợ Bà Chiểu", kèm câu gốc làm bằng chứng.
4. **Ra toạ độ**: geocoder (VietMap/Goong, mục 3) đổi cụm vị trí thành toạ độ; giao lộ thì tìm điểm cắt của hai
   con đường. Giới hạn trong ranh giới TP.HCM mới.
5. **Người xác nhận**: kiểm duyệt viên thấy tối đa 3 ghim gợi ý + bằng chứng, chọn một hoặc ghim tay.

**Chi phí**: bước 1, 2, 4 chạy miễn phí trên máy (trừ phí geocoder nếu vượt hạn mức miễn phí); bước 3 làm trong
phiên làm việc với Claude thì không tốn thêm. Không cần máy chủ riêng ở MVP: chạy bằng script trên máy của nhóm
khi nhập dữ liệu (`scripts/suggest-location/`).

**Quyền riêng tư**: xoá file video và bản chép lời đầy đủ sau khi xử lý; chỉ lưu đoạn bằng chứng ngắn. Bản chép
lời cũng chạy qua bộ lọc số điện thoại/CCCD.

## 6. Ảnh hưởng tới spec

- FR-012 (nguồn Facebook): **đã chốt** dán link + nhúng oEmbed cho MVP; liên hệ trang hợp tác ở giai đoạn 2.
- FR-013 (đăng nhập): **đã chốt** Facebook và Google.
- FR-002: lọc theo phường/xã mới, tìm được bằng tên quận cũ; thêm danh mục "Người bán vé số".
- Còn mở: thử oEmbed với link reel thật; chọn VietMap hay Goong cho ô tìm địa chỉ.
