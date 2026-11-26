<!--
Sync Impact Report
- Version change: (template) → 0.1.0 (bản nháp đầu tiên, chưa được Marshall phê duyệt)
- Principles: thêm mới I–VI (toàn bộ)
- Added sections: Data Sources & Legal Constraints, Development Workflow
- Removed sections: none
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): đặt ngày khi Marshall phê duyệt bản hiến chương.
  - Khu vực, đối tượng người dùng và nguồn dữ liệu Facebook là phỏng đoán; xác nhận với Marshall.
-->

# Bản đồ thiện nguyện (Charity Map) Constitution

## Core Principles

### I. Dữ liệu chính xác và có nguồn gốc

Mỗi tổ chức hoặc hoạt động thiện nguyện hiển thị trên bản đồ PHẢI có nguồn gốc rõ ràng
(link nguồn, ngày cập nhật cuối, ai/hệ thống nào thêm vào). Dữ liệu chưa được xác minh PHẢI
được gắn nhãn "chưa xác minh" khi hiển thị. Dữ liệu quá hạn (không cập nhật trong 12 tháng)
PHẢI được đánh dấu hoặc ẩn.

**Lý do**: Người dùng quyết định quyên góp hoặc tham gia dựa trên thông tin này; thông tin
sai có thể gây thiệt hại thật hoặc tiếp tay cho lừa đảo từ thiện.

### II. Chỉ dùng nguồn dữ liệu hợp pháp và đúng điều khoản

Mọi nguồn dữ liệu (kể cả trang Facebook công khai) PHẢI được thu thập qua kênh được phép:
API chính thức, dữ liệu do tổ chức tự gửi, hoặc nhập thủ công có kiểm duyệt. KHÔNG cào
(scrape) dữ liệu vi phạm điều khoản dịch vụ của nền tảng. Mỗi nguồn PHẢI được ghi lại trong
tài liệu với cơ sở pháp lý/điều khoản áp dụng.

**Lý do**: Cào dữ liệu trái điều khoản có thể khiến dự án bị chặn, bị kiện, hoặc mất uy tín.

### III. Quyền riêng tư theo mặc định

Hệ thống KHÔNG lưu hoặc hiển thị dữ liệu cá nhân của người dùng Facebook cá nhân, người nhận
hỗ trợ, hay tình nguyện viên nếu không có sự đồng ý rõ ràng. Chỉ lưu thông tin công khai của
tổ chức (tên, khu vực, lĩnh vực, kênh liên hệ chính thức). Vị trí của người nhận hỗ trợ (ví dụ
gia đình khó khăn) KHÔNG BAO GIỜ được hiển thị chính xác trên bản đồ.

**Lý do**: Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân và bảo vệ người yếu thế.

### IV. Mobile-first, nhẹ và tiếng Việt trước

Giao diện PHẢI dùng được tốt trên điện thoại với mạng 3G/4G yếu, và PHẢI có tiếng Việt là ngôn
ngữ chính. Trang bản đồ đầu tiên NÊN tải xong dưới 3 giây trên mạng 4G trung bình.

**Lý do**: Phần lớn người dùng tại Việt Nam truy cập qua điện thoại, nhiều người ở vùng xa.

### V. Kiểm thử cho logic dữ liệu

Mọi logic nhập, chuẩn hoá, gộp trùng và xác minh dữ liệu PHẢI có test tự động trước khi merge.
Giao diện có thể kiểm thử thủ công ở giai đoạn đầu, nhưng các luồng chính (tìm kiếm, xem chi
tiết tổ chức) PHẢI có ít nhất một test end-to-end trước khi phát hành công khai.

**Lý do**: Lỗi dữ liệu lan rộng và khó phát hiện bằng mắt; lỗi giao diện thì dễ thấy hơn.

### VI. Đơn giản trước, mở rộng sau

Bắt đầu với kiến trúc đơn giản nhất đáp ứng được spec (YAGNI). Mọi thành phần phức tạp thêm
(dịch vụ riêng, hàng đợi, ML để phân loại...) PHẢI được ghi lý do trong plan và đối chiếu với
nguyên tắc này.

**Lý do**: Dự án nhỏ, có thể do một người duy trì; độ phức tạp là chi phí lâu dài.

## Data Sources & Legal Constraints

- Nguồn dữ liệu dự kiến: (1) tổ chức tự đăng ký qua form; (2) quản trị viên nhập thủ công;
  (3) *phỏng đoán, cần xác nhận*: trang Facebook công khai của tổ chức, chỉ qua Meta Graph API
  (quyền Page Public Content Access cần Meta duyệt ứng dụng) hoặc khi tổ chức cấp quyền trang.
- Mỗi bản ghi PHẢI lưu: nguồn, URL gốc, thời điểm lấy dữ liệu, trạng thái xác minh.
- Tổ chức PHẢI có cách yêu cầu sửa hoặc gỡ thông tin của mình.
- Bản đồ nền PHẢI dùng dịch vụ có giấy phép phù hợp (ví dụ OpenStreetMap, ghi công đúng).

## Development Workflow

- Mỗi tính năng đi theo quy trình Spec Kit: `/speckit-specify` → `/speckit-clarify` (khi còn
  điểm mơ hồ) → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
- Mỗi tính năng làm trên nhánh riêng và merge qua pull request có review.
- Plan PHẢI có mục "Constitution Check" đối chiếu từng nguyên tắc ở trên.

## Governance

Hiến chương này có hiệu lực cao hơn mọi quy ước khác trong repo. Sửa đổi PHẢI qua pull request,
ghi rõ lý do và tăng phiên bản theo semver: MAJOR khi bỏ hoặc định nghĩa lại nguyên tắc, MINOR
khi thêm nguyên tắc/mục, PATCH khi sửa câu chữ. Mỗi review PR PHẢI kiểm tra sự tuân thủ; mọi
ngoại lệ PHẢI được ghi lý do trong plan của tính năng đó.

**Version**: 0.1.0 | **Ratified**: TODO(RATIFICATION_DATE): đặt khi Marshall phê duyệt | **Last Amended**: 2026-11-26
