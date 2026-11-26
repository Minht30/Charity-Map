# Feature Specification: Bản đồ thiện nguyện — MVP

**Feature Branch**: `001-charity-map-mvp`

**Created**: 2026-11-26

**Status**: Draft (bản nháp, nhiều điểm là phỏng đoán, chờ Marshall xác nhận)

**Input**: User description: "Bản đồ các tổ chức thiện nguyện / tình nguyện, có thể lấy dữ liệu từ các trang Facebook công khai."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tìm tổ chức thiện nguyện gần mình trên bản đồ (Priority: P1)

Một người muốn quyên góp hoặc đi tình nguyện mở trang web trên điện thoại, thấy bản đồ các tổ
chức quanh vị trí của mình (hoặc tỉnh/thành mình chọn), lọc theo lĩnh vực (trẻ em, người già,
môi trường, cứu trợ thiên tai, y tế...) và bấm vào một điểm để xem thông tin tổ chức.

**Why this priority**: Đây là giá trị cốt lõi của sản phẩm; chỉ riêng tính năng này với dữ liệu
nhập tay đã là một MVP dùng được.

**Independent Test**: Nhập sẵn 20 tổ chức mẫu, mở bản đồ, lọc theo lĩnh vực và tỉnh, mở chi tiết
một tổ chức và thấy đủ thông tin liên hệ.

**Acceptance Scenarios**:

1. **Given** người dùng cho phép truy cập vị trí, **When** mở trang, **Then** bản đồ căn giữa
   vào vị trí đó và hiển thị các tổ chức trong khu vực.
2. **Given** người dùng từ chối vị trí, **When** mở trang, **Then** bản đồ hiển thị toàn quốc và
   cho phép chọn tỉnh/thành.
3. **Given** bản đồ đang hiển thị, **When** chọn lĩnh vực "Trẻ em", **Then** chỉ các tổ chức thuộc
   lĩnh vực đó còn hiển thị.
4. **Given** bấm vào một điểm, **When** mở chi tiết, **Then** thấy tên, mô tả ngắn, lĩnh vực, khu
   vực hoạt động, kênh liên hệ chính thức, link nguồn, ngày cập nhật và trạng thái xác minh.

---

### User Story 2 - Tổ chức tự đăng ký và cập nhật thông tin (Priority: P2)

Một nhóm/tổ chức thiện nguyện điền form để đưa mình lên bản đồ (tên, lĩnh vực, khu vực, link
trang Facebook/website, liên hệ). Quản trị viên duyệt trước khi hiển thị. Tổ chức có thể yêu cầu
sửa hoặc gỡ thông tin.

**Why this priority**: Giúp dữ liệu tăng lên mà không phụ thuộc vào quản trị viên nhập tay, và
đáp ứng nguyên tắc tổ chức được quyền sửa/gỡ thông tin.

**Independent Test**: Gửi form đăng ký, quản trị viên duyệt, tổ chức xuất hiện trên bản đồ; gửi
yêu cầu gỡ và tổ chức biến mất sau khi duyệt.

**Acceptance Scenarios**:

1. **Given** form đăng ký, **When** tổ chức gửi đủ trường bắt buộc, **Then** bản ghi vào hàng chờ
   duyệt và chưa hiển thị công khai.
2. **Given** bản ghi chờ duyệt, **When** quản trị viên duyệt, **Then** tổ chức xuất hiện trên bản đồ.
3. **Given** tổ chức đã hiển thị, **When** gửi yêu cầu gỡ, **Then** quản trị viên nhận được yêu cầu
   và có thể gỡ trong một thao tác.

---

### User Story 3 - Lấy thông tin từ trang Facebook công khai của tổ chức (Priority: P3) *(phỏng đoán)*

Khi một tổ chức có trang Facebook công khai, hệ thống tự điền hoặc định kỳ làm mới thông tin cơ bản
(tên, ảnh đại diện, mô tả, địa chỉ, bài đăng gần nhất về hoạt động/kêu gọi) từ trang đó, qua kênh
được Meta cho phép.

**Why this priority**: Giảm công nhập liệu và giữ dữ liệu "sống", nhưng phụ thuộc vào việc Meta
duyệt quyền truy cập nên không nên chặn MVP.

**Independent Test**: Với một trang Facebook đã được cấp quyền, nhập link trang và thấy các trường
được điền sẵn kèm nguồn và thời điểm lấy.

**Acceptance Scenarios**:

1. **Given** một link trang Facebook hợp lệ và có quyền truy cập, **When** quản trị viên/tổ chức
   nhập link, **Then** các trường cơ bản được điền sẵn để người dùng xác nhận.
2. **Given** không lấy được dữ liệu (không có quyền, trang bị xoá), **When** làm mới, **Then** bản
   ghi giữ dữ liệu cũ, được đánh dấu "không làm mới được" và không bị xoá tự động.

---

### Edge Cases

- Một tổ chức hoạt động ở nhiều tỉnh hoặc không có địa chỉ cố định (nhóm online, đoàn cứu trợ lưu
  động): hiển thị theo khu vực hoạt động thay vì một điểm duy nhất.
- Trùng lặp: cùng một tổ chức được đăng ký hai lần, hoặc vừa đăng ký vừa có từ Facebook.
- Tổ chức có dấu hiệu lừa đảo bị báo cáo: cần cơ chế báo cáo và tạm ẩn.
- Khu vực có quá nhiều điểm: gom cụm (cluster) để bản đồ vẫn đọc được.
- Dữ liệu cũ hơn 12 tháng: đánh dấu "có thể không còn hoạt động".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI hiển thị bản đồ các tổ chức đã được duyệt, kèm gom cụm khi nhiều điểm.
- **FR-002**: Người dùng PHẢI lọc được theo lĩnh vực và theo tỉnh/thành, và tìm theo tên.
- **FR-003**: Mỗi tổ chức PHẢI có trang chi tiết với thông tin liên hệ chính thức, link nguồn, ngày
  cập nhật và trạng thái xác minh.
- **FR-004**: Tổ chức PHẢI tự đăng ký được qua form; bản ghi mới PHẢI qua duyệt trước khi hiển thị.
- **FR-005**: Quản trị viên PHẢI thêm, sửa, duyệt, ẩn và gỡ được bản ghi.
- **FR-006**: Người dùng PHẢI báo cáo được một tổ chức (thông tin sai, nghi lừa đảo, ngừng hoạt động).
- **FR-007**: Tổ chức PHẢI gửi được yêu cầu sửa hoặc gỡ thông tin của mình.
- **FR-008**: Hệ thống PHẢI lưu nguồn, URL gốc, thời điểm lấy và trạng thái xác minh cho mỗi bản ghi.
- **FR-009**: Hệ thống PHẢI dùng được tốt trên điện thoại và có giao diện tiếng Việt.
- **FR-010**: Hệ thống NÊN lấy thông tin từ trang Facebook công khai chỉ qua kênh được Meta cho phép
  [NEEDS CLARIFICATION: Dùng Graph API (cần Meta duyệt ứng dụng, mất thời gian) hay chỉ lưu link
  Facebook và để tổ chức/quản trị viên tự điền ở MVP?]
- **FR-011**: Phạm vi địa lý ban đầu là [NEEDS CLARIFICATION: toàn Việt Nam, hay bắt đầu với một
  thành phố/tỉnh cụ thể?]
- **FR-012**: Đối tượng chính là [NEEDS CLARIFICATION: người muốn quyên góp/tình nguyện, người cần
  được hỗ trợ tìm nơi giúp đỡ, hay cả hai? Ảnh hưởng tới nội dung trang chi tiết và cách lọc.]

### Key Entities *(include if feature involves data)*

- **Tổ chức (Organization)**: tên, mô tả ngắn, lĩnh vực (nhiều), khu vực hoạt động, vị trí (điểm
  hoặc vùng), kênh liên hệ chính thức, link Facebook/website, trạng thái (chờ duyệt / hiển thị /
  ẩn / gỡ), trạng thái xác minh, ngày cập nhật.
- **Nguồn dữ liệu (Source Record)**: loại nguồn (tự đăng ký, nhập tay, Facebook), URL gốc, thời điểm
  lấy, dữ liệu thô; thuộc về một Tổ chức.
- **Lĩnh vực (Category)**: danh mục cố định do quản trị viên quản lý.
- **Báo cáo / Yêu cầu (Report)**: loại (sai thông tin, nghi lừa đảo, yêu cầu gỡ/sửa), nội dung, trạng
  thái xử lý; thuộc về một Tổ chức.
- **Quản trị viên (Admin)**: người được quyền duyệt và chỉnh sửa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng mới tìm được ít nhất một tổ chức phù hợp trong khu vực của mình trong
  dưới 1 phút kể từ khi mở trang.
- **SC-002**: Trang bản đồ đầu tiên hiển thị dưới 3 giây trên mạng 4G trung bình.
- **SC-003**: Có ít nhất 100 tổ chức đã duyệt trên bản đồ trong 3 tháng đầu.
- **SC-004**: 100% tổ chức hiển thị có link nguồn và ngày cập nhật.
- **SC-005**: Yêu cầu gỡ thông tin được xử lý trong vòng 7 ngày.

## Assumptions

- (Phỏng đoán) Người dùng chủ yếu ở Việt Nam, truy cập bằng điện thoại, giao diện tiếng Việt.
- (Phỏng đoán) MVP là ứng dụng web, không có app di động riêng.
- (Phỏng đoán) Người xem bản đồ không cần đăng nhập; chỉ quản trị viên đăng nhập.
- (Phỏng đoán) Không xử lý quyên góp/thanh toán trong sản phẩm; chỉ dẫn link tới kênh chính thức
  của tổ chức.
- Tính năng Facebook phụ thuộc vào chính sách và quy trình duyệt ứng dụng của Meta; MVP vẫn
  hoạt động đầy đủ nếu chưa có quyền này.
