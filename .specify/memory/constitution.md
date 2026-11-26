<!--
Sync Impact Report
- Version change: 0.2.0 → 0.3.0 (nguyên tắc II thêm quy tắc không hiển thị thông tin liên hệ; đăng nhập Facebook/Google)
- Trước đó: 0.1.0 → 0.2.0 (đổi trọng tâm sang "bản đồ hoàn cảnh cần giúp")
- Modified principles:
  - I. Dữ liệu chính xác và có nguồn gốc → I. Sự thật, có nguồn, được kiểm duyệt
  - III. Quyền riêng tư theo mặc định → II. Phẩm giá và sự đồng ý của người được giúp
  - II. Chỉ dùng nguồn dữ liệu hợp pháp → III. Chỉ dùng nguồn hợp pháp và đúng điều khoản
- Added principles: IV. Không chỉ là tiền
- Kept: V (Mobile-first → nay đánh số V), Kiểm thử (VI), Đơn giản trước (VII)
- Added sections: Community Moderation
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): đặt ngày khi Marshall phê duyệt.
-->

# Bản đồ thiện nguyện (Charity Map) Constitution

## Core Principles

### I. Sự thật, có nguồn, được kiểm duyệt

Mỗi địa điểm/hoàn cảnh hiển thị trên bản đồ PHẢI có người đăng, ngày đăng, ngày cập nhật cuối và
ít nhất một nguồn (link bài viết/reel Facebook, ảnh, hoặc xác nhận của người kiểm duyệt). Nội dung
cộng đồng gửi PHẢI qua kiểm duyệt trước khi hiển thị công khai. Hoàn cảnh không được xác nhận lại
trong 90 ngày PHẢI được đánh dấu "có thể đã thay đổi"; quá 180 ngày PHẢI tự ẩn.

**Lý do**: Người giúp sẽ tới tận nơi dựa trên thông tin này. Thông tin sai làm mất lòng tin và có
thể bị dùng để lừa đảo.

### II. Phẩm giá và sự đồng ý của người được giúp (NON-NEGOTIABLE)

- Người được giới thiệu (cụ già bán hàng, người khuyết tật, người vô gia cư...) PHẢI đồng ý được
  đưa lên bản đồ. Người đăng PHẢI xác nhận đã hỏi ý kiến; người được giới thiệu hoặc người thân
  PHẢI gỡ được bài trong một thao tác, không cần tài khoản.
- Với người không có chỗ ở cố định, vị trí PHẢI hiển thị gần đúng (bán kính tối thiểu 200 m), không
  phải điểm chính xác. Với cửa hàng/quầy hàng cố định, có thể hiển thị đúng vị trí.
- KHÔNG hiển thị số điện thoại, tài khoản ngân hàng hay kênh liên hệ trực tiếp của người được giới thiệu.
- KHÔNG đăng số giấy tờ tùy thân, thông tin bệnh án, khuôn mặt trẻ em, hay địa chỉ nhà riêng chính xác.
- Ngôn từ PHẢI tôn trọng, không giật gân hay khai thác sự khổ cực để câu tương tác.

**Lý do**: Người yếu thế dễ bị tổn thương khi bị lộ vị trí; tuân thủ Nghị định 13/2023/NĐ-CP về bảo
vệ dữ liệu cá nhân.

### III. Chỉ dùng nguồn hợp pháp và đúng điều khoản

Dữ liệu từ Facebook PHẢI lấy qua kênh Meta cho phép: nhúng bài/reel công khai bằng link (oEmbed),
Graph API với quyền được Meta duyệt, hoặc người dùng tự dán link và nội dung. KHÔNG cào dữ liệu,
KHÔNG tự động hoá đăng nhập bằng tài khoản Facebook cá nhân ("tài khoản tin cậy") để đọc trang.
Mỗi nguồn dữ liệu mới PHẢI được ghi trong tài liệu kèm điều khoản áp dụng.

**Lý do**: Cào dữ liệu hoặc tự động hoá tài khoản cá nhân vi phạm điều khoản Meta, dễ bị khoá tài
khoản và có thể dẫn tới rủi ro pháp lý cho dự án.

### IV. Không chỉ là tiền

Mỗi hoàn cảnh PHẢI mô tả được cách giúp cụ thể ngoài tiền: mua hàng, mang đồ ăn/quần áo, ghé thăm
trò chuyện, chia sẻ thông tin, góp công. Sản phẩm KHÔNG thu hay chuyển tiền quyên góp; nếu có
kênh nhận tiền thì chỉ dẫn link tới kênh của chính người/tổ chức đó.

**Lý do**: Mục tiêu là kết nối con người, nhất là người trẻ, với những hoàn cảnh quanh mình; giữ
tiền của người khác là rủi ro pháp lý và lòng tin mà dự án không cần mang.

### V. Mobile-first, nhẹ và tiếng Việt trước

Giao diện PHẢI dùng tốt trên điện thoại, tiếng Việt là ngôn ngữ chính. Bản đồ NÊN hiện điểm gần
người dùng trong dưới 3 giây trên mạng 4G trung bình.

**Lý do**: Người dùng mở bản đồ khi đang ở ngoài đường, trên điện thoại.

### VI. Kiểm thử cho logic dữ liệu và quyền riêng tư

Logic làm mờ vị trí, kiểm duyệt, gỡ bài và hết hạn PHẢI có test tự động trước khi merge. Luồng chính
(xem bản đồ, đăng địa điểm, gỡ bài) PHẢI có ít nhất một test end-to-end trước khi phát hành công khai.

**Lý do**: Lỗi ở các phần này gây hại trực tiếp cho người được giới thiệu.

### VII. Đơn giản trước, mở rộng sau

Bắt đầu với kiến trúc đơn giản nhất đáp ứng spec (YAGNI). Mọi thành phần phức tạp thêm PHẢI được ghi
lý do trong plan.

**Lý do**: Dự án nhỏ, có thể do một người duy trì.

## Community Moderation

- Ai cũng gửi được địa điểm, nhưng PHẢI đăng nhập bằng Facebook hoặc Google để chống spam; người xem bản đồ không cần đăng nhập.
- Bài mới vào hàng chờ; người kiểm duyệt kiểm tra sự đồng ý, vị trí, ngôn từ và nguồn trước khi duyệt.
- Người xem PHẢI báo cáo được bài (sai thông tin, nghi lừa đảo, người này không đồng ý, đã không còn ở đây).
  Bài bị báo cáo "không đồng ý" PHẢI ẩn ngay, trước khi xem xét.
- Người dùng đăng nội dung sai nhiều lần PHẢI bị hạn chế quyền đăng.

## Development Workflow

- Mỗi tính năng theo quy trình Spec Kit: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan`
  → `/speckit-tasks` → `/speckit-implement`.
- Mỗi tính năng làm trên nhánh riêng và merge qua pull request có review.
- Plan PHẢI có mục "Constitution Check" đối chiếu từng nguyên tắc ở trên.

## Governance

Hiến chương này có hiệu lực cao hơn mọi quy ước khác trong repo. Sửa đổi PHẢI qua pull request, ghi rõ
lý do và tăng phiên bản theo semver: MAJOR khi bỏ hoặc định nghĩa lại nguyên tắc, MINOR khi thêm
nguyên tắc/mục, PATCH khi sửa câu chữ. Trước 1.0.0 (chưa phê duyệt), thay đổi lớn chỉ tăng MINOR.
Mỗi review PR PHẢI kiểm tra sự tuân thủ; ngoại lệ PHẢI được ghi lý do trong plan.

**Version**: 0.3.0 | **Ratified**: TODO(RATIFICATION_DATE): đặt khi Marshall phê duyệt | **Last Amended**: 2026-11-26
