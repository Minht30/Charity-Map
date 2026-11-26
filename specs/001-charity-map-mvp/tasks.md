# Tasks: Bản đồ thiện nguyện — MVP

**Input**: Design documents from `/specs/001-charity-map-mvp/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Có. Hiến chương nguyên tắc VI bắt buộc test cho làm mờ vị trí, kiểm duyệt, gỡ bài, hết hạn, và
test end-to-end cho các luồng chính.

**Organization**: Theo user story để mỗi story làm và kiểm tra độc lập được.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: làm song song được (khác file, không phụ thuộc task chưa xong)
- **[Story]**: US1–US4 theo spec.md

---

## Phase 1: Setup

- [ ] T001 Khởi tạo project Next.js (App Router, TypeScript, pnpm) ở thư mục gốc theo cấu trúc trong plan.md
- [ ] T002 [P] Cấu hình ESLint, Prettier, `tsconfig.json` strict
- [ ] T003 [P] Cài Vitest và Playwright, thêm script `test`, `test:e2e` vào `package.json`
- [ ] T004 [P] Khởi tạo Supabase CLI (`supabase/config.toml`), bật extension `postgis`, `pg_trgm` trong `supabase/migrations/0001_extensions.sql`
- [ ] T005 [P] Tạo `.env.example` (Supabase, Facebook App ID, Google OAuth, `AI_SUGGEST_ENABLED=false`, khoá VietMap/Goong)
- [ ] T006 [P] Thêm `public/manifest.webmanifest` và icon PWA; đặt ngôn ngữ mặc định `vi` trong `app/layout.tsx`

---

## Phase 2: Foundational (chặn mọi user story)

- [ ] T007 Tạo enum và bảng `categories`, `admin_units`, `users`, `groups` trong `supabase/migrations/0002_core.sql` theo data-model.md (`categories.forces_roaming`, `admin_units.former_district`, `users.role`)
- [ ] T008 Tạo bảng `places`, `place_help_types`, `place_hours`, `source_links` trong `supabase/migrations/0003_places.sql` theo data-model.md (`places.status`, `places.location_type`, `places.consent_confirmed`, `source_links.url`)
- [ ] T009 Trigger tính `places.location_public` (làm mờ 200–400 m, cố định theo `id`, cho `roaming` hoặc danh mục `forces_roaming`) và `places.ward_code` trong `supabase/migrations/0004_privacy_triggers.sql`
- [ ] T010 [P] Test SQL cho T009: điểm `roaming` lệch 200–400 m, đọc nhiều lần cùng kết quả, `fixed` giữ nguyên, trong `supabase/tests/location_privacy.test.sql`
- [ ] T011 View `places_public` (không có `location_exact`, `created_by`) và Row Level Security cho anon / member / moderator trong `supabase/migrations/0005_rls.sql`
- [ ] T012 [P] Test SQL cho T011: anon không đọc được `location_exact` hay bài `pending`, trong `supabase/tests/rls.test.sql`
- [ ] T013 [P] Seed danh mục (7 danh mục, gồm `ban-ve-so`) trong `supabase/seed/categories.sql`
- [ ] T014 [P] Tìm và nạp ranh giới 168 phường/xã TP.HCM kèm tên quận cũ vào `supabase/seed/admin_units.sql`; nếu chưa có dữ liệu mở, ghi lại nguồn còn thiếu và để `ward_code` null
- [ ] T015 [P] Supabase client cho server và browser trong `lib/db/client.ts`
- [ ] T016 [P] Regex phát hiện số điện thoại Việt Nam, số CCCD, số tài khoản trong `lib/privacy/detect.ts`, kèm test `tests/unit/privacy-detect.test.ts`
- [ ] T017 [P] Định dạng lỗi chung và Zod helpers trong `lib/api/errors.ts`

**Checkpoint**: database, quyền truy cập và quy tắc quyền riêng tư chạy được và có test.

---

## Phase 3: User Story 1 — Xem hoàn cảnh quanh mình (P1) 🎯 MVP

**Goal**: mở bản đồ, thấy điểm gần mình, lọc danh mục, mở chi tiết có reel nhúng.

**Independent Test**: nạp 30 điểm mẫu, làm theo quickstart.md mục US1.

- [ ] T018 [P] [US1] Tạo file bản đồ nền PMTiles cho TP.HCM mới bằng Protomaps CLI, ghi lệnh vào `scripts/build-basemap.sh`
- [ ] T019 [P] [US1] Dữ liệu mẫu 30 điểm ở TP.HCM trong `supabase/seed/demo_places.sql` (chỉ cho môi trường dev)
- [ ] T020 [US1] `GET /api/places` (bbox, danh mục, phường) trả GeoJSON từ `places_public` trong `app/api/places/route.ts` theo contracts/api.md
- [ ] T021 [US1] `GET /api/places/[id]` trong `app/api/places/[id]/route.ts`, không trả trường liên hệ nào (FR-014)
- [ ] T022 [P] [US1] Lấy và cache mã nhúng oEmbed (`source_links.embed_html`, làm mới sau 7 ngày) trong `lib/facebook/oembed.ts`
- [ ] T023 [US1] Component bản đồ MapLibre + PMTiles, gom cụm, nút "vị trí của tôi", mặc định trung tâm TP.HCM khi bị từ chối vị trí, trong `components/map/MapView.tsx`
- [ ] T024 [P] [US1] Bộ lọc danh mục và chọn phường/xã (tìm bằng tên quận cũ) trong `components/map/Filters.tsx`
- [ ] T025 [US1] Trang chi tiết: cách giúp, giờ có mặt, reel nhúng, nhãn "vị trí gần đúng", nhãn "có thể đã thay đổi", nút chỉ đường mở Google/Apple Maps, trong `app/(public)/p/[id]/page.tsx` và `components/place/PlaceDetail.tsx`
- [ ] T026 [US1] Trang bản đồ chính ghép T023–T025 trong `app/(public)/page.tsx`
- [ ] T027 [P] [US1] Test e2e: mở bản đồ, lọc "Người bán vé số", mở chi tiết, thấy reel, trong `tests/e2e/view-map.spec.ts`
- [ ] T028 [P] [US1] Test e2e đo thời gian hiện điểm < 3 giây trên mạng giả lập 4G trong `tests/e2e/performance.spec.ts`

**Checkpoint**: US1 dùng được với dữ liệu mẫu.

---

## Phase 4: User Story 2 — Cộng đồng thêm địa điểm (P2)

**Goal**: đăng nhập Facebook/Google, gửi địa điểm, kiểm duyệt viên duyệt.

**Independent Test**: quickstart.md mục US2.

- [ ] T029 [US2] Cấu hình Supabase Auth với Facebook và Google (chỉ quyền `public_profile`, `email`), trang `app/(auth)/dang-nhap/page.tsx`
- [ ] T030 [US2] `POST /api/oembed/check` trong `app/api/oembed/route.ts`
- [ ] T031 [US2] `POST /api/places` trong `app/api/places/route.ts`: kiểm `places.consent_confirmed`, ≥1 `place_help_types.help_type`, chặn nội dung từ T016, gợi ý trùng lặp (100 m + `pg_trgm`), tạo bài `pending`
- [ ] T032 [P] [US2] Trigger: điểm `published` phải có ≥1 cách giúp; người có `users.posting_blocked_until` không đăng được, trong `supabase/migrations/0006_publish_rules.sql`
- [ ] T033 [US2] Form thêm địa điểm 3 bước theo FR-016 (Ở đâu? → Ai, cần gì? → Gửi): nút "Tôi đang ở đây", ô hình lớn cho danh mục và cách giúp, trường tuỳ chọn (giờ, mô tả, link reel) thu gọn, đăng nhập chỉ ở bước Gửi, lưu nháp vào trình duyệt, trong `app/them-dia-diem/page.tsx` và `components/forms/PlaceForm/` (mỗi bước một file)
- [ ] T033a [P] [US2] Bộ chữ tiếng Việt đơn giản cho toàn bộ giao diện và thông báo lỗi, tập trung một chỗ trong `lib/i18n/vi.ts`
- [ ] T033b [P] [US2] Kiểm tra tiếp cận tự động (axe) cho bản đồ và form, kích thước nút ≥ 44 px, chữ ≥ 16 px, trong `tests/e2e/accessibility.spec.ts`
- [ ] T034 [P] [US2] Chọn VietMap hay Goong: thử 20 địa chỉ TP.HCM mẫu, ghi kết quả vào research.md, viết `lib/geo/geocode.ts`
- [ ] T035 [US2] Hàng chờ kiểm duyệt (xem `location_exact`, nguồn, cờ từ T016) và `POST /api/moderation/[id]` ghi `moderation_log`, trong `app/kiem-duyet/page.tsx` và `app/api/moderation/[id]/route.ts`
- [ ] T036 [US2] `POST /api/places/[id]/confirm` ("vẫn còn ở đây") trong `app/api/places/[id]/confirm/route.ts`
- [ ] T037 [P] [US2] Test e2e: gửi thiếu đồng ý bị chặn; gửi đủ → `pending` → duyệt → hiện trên bản đồ, trong `tests/e2e/submit-place.spec.ts`

**Checkpoint**: cộng đồng đăng được và bài qua kiểm duyệt.

---

## Phase 5: User Story 3 — Báo cáo, gỡ bài, hết hạn (P2)

**Goal**: ai cũng báo cáo được; "không đồng ý" ẩn ngay; điểm cũ tự đánh dấu và tự ẩn.

**Independent Test**: quickstart.md mục US3.

- [ ] T038 [US3] Bảng `reports` và trigger: `no_consent` ẩn ngay (`places.hidden_reason`), ≥3 báo cáo khác độc lập thì tạm ẩn, trong `supabase/migrations/0007_reports.sql` theo data-model.md (`reports.type`, `reports.reporter_fingerprint`)
- [ ] T039 [P] [US3] Test SQL cho T038 trong `supabase/tests/reports.test.sql`
- [ ] T040 [US3] `POST /api/places/[id]/reports` không cần đăng nhập, giới hạn 5 lần/giờ/thiết bị, trong `app/api/places/[id]/reports/route.ts`
- [ ] T041 [US3] Nút và hộp thoại báo cáo trong `components/place/ReportButton.tsx`
- [ ] T042 [US3] Job hằng ngày: nhãn sau 90 ngày, ẩn (`stale`) sau 180 ngày, bằng `pg_cron` trong `supabase/migrations/0008_expiry.sql`
- [ ] T043 [P] [US3] Test SQL cho T042 trong `supabase/tests/expiry.test.sql`
- [ ] T044 [P] [US3] Test e2e: cửa sổ ẩn danh báo "không đồng ý", điểm biến mất trong 1 phút (SC-004), trong `tests/e2e/report-no-consent.spec.ts`

**Checkpoint**: đủ điều kiện hiến chương nguyên tắc II để phát hành công khai.

---

## Phase 6: Dữ liệu khởi đầu (không gọi API)

- [ ] T045 Soạn `supabase/seed/places.draft.json` từ reel công khai của Tôn Hoa Sen và Chuyện mưu sinh trong một phiên làm việc với Claude, theo schema contracts/ai-extract.md, kèm `source_url` và `pin_hint`; không ghi tên đầy đủ, số điện thoại, địa chỉ nhà
- [ ] T046 `scripts/import-seed.ts`: kiểm schema bằng Zod, chạy T016, tạo bài `pending` gắn link nguồn; không gọi Claude API
- [ ] T047 Kiểm duyệt viên ghim lại vị trí và duyệt từng điểm nhập từ T046

---

## Phase 7: User Story 4 — Nhóm thiện nguyện (P3)

- [ ] T048 [US4] Hồ sơ nhóm, duyệt nhóm (`groups.verified`), huy hiệu trên trang chi tiết, trong `app/nhom/` và `components/place/GroupBadge.tsx`

---

## Phase 8: User Story 5 — Gợi ý vị trí từ video (P3, tuỳ chọn, mặc định tắt)

**Goal**: công cụ nhập dữ liệu cho quản trị/Claude (không thuộc form công khai): từ file video chủ trang cung cấp,
gợi ý ghim kèm bằng chứng cho kiểm duyệt viên.
Bỏ cả phase này thì MVP vẫn chạy đầy đủ.

- [ ] T052 [US5] Bảng `location_suggestions` theo data-model.md (`location_suggestions.evidence_text`, `location_suggestions.video_source`) và RLS chỉ cho kiểm duyệt viên, trong `supabase/migrations/0009_location_suggestions.sql`
- [ ] T053 [P] [US5] Chép lời tiếng Việt bằng Whisper/PhoWhisper trong `scripts/suggest-location/transcribe.py`; thử 10 video thật, ghi độ chính xác vào research.md
- [ ] T054 [P] [US5] Lấy khung hình (ffmpeg, 1 khung/2–3 giây) và OCR tiếng Việt trong `scripts/suggest-location/ocr.py`
- [ ] T055 [US5] Trích cụm vị trí từ caption + bản chép lời + OCR, xuất JSON có bằng chứng, trong `scripts/suggest-location/extract.py` (bản đầu dùng phiên làm việc với Claude, không gọi API)
- [ ] T056 [US5] Geocode cụm vị trí và giao lộ, giới hạn trong TP.HCM, ghi tối đa 3 gợi ý, trong `scripts/suggest-location/geocode.ts`; xoá file video và bản chép lời sau khi xong
- [ ] T057 [US5] Hiện gợi ý + bằng chứng trong hàng chờ kiểm duyệt, nút chấp nhận/kéo ghim, trong `components/moderation/LocationSuggestions.tsx`

---

## Phase 9: Polish

- [ ] T049 [P] *(Tuỳ chọn, Marshall quyết định sau; MVP chạy đầy đủ khi bỏ task này)* AI gợi ý điền form sau cờ `AI_SUGGEST_ENABLED` (mặc định tắt) theo contracts/ai-extract.md, trong `lib/ai/suggest.ts` và `app/api/ai/suggest/route.ts`
- [ ] T049a Buổi thử với ít nhất 5 người không rành công nghệ (có người trên 50 tuổi): thêm một địa điểm và tìm một
  hoàn cảnh gần mình; ghi kết quả và chỗ vướng vào `specs/001-charity-map-mvp/usability-test.md`, sửa trước khi phát hành (SC-008)
- [ ] T050 [P] Ghi công © OpenStreetMap, trang "Về dự án" và chính sách quyền riêng tư tiếng Việt trong `app/(public)/gioi-thieu/page.tsx`
- [ ] T051 Chạy toàn bộ quickstart.md và sửa các lệnh sai

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → các user story.
- US1 không phụ thuộc story khác. US2 và US3 dùng bản đồ và trang chi tiết của US1. US4 sau US2. US5 (tuỳ chọn) sau US2 và Phase 6.
- Phase 6 cần T046 sau T031; T045 làm song song được ngay từ đầu.
- Phát hành công khai cần US1 + US2 + US3 (hiến chương nguyên tắc II).

## MVP Strategy

1. Phase 1–2, rồi US1 với dữ liệu mẫu → demo được cho Marshall.
2. US2 + US3 → đủ điều kiện mở cho cộng đồng.
3. Phase 6 nạp dữ liệu thật, rồi US4 và Polish.
