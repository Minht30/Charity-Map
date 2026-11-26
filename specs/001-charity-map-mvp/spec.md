# Feature Specification: Bản đồ thiện nguyện — MVP

**Feature Branch**: `001-charity-map-mvp`

**Created**: 2026-11-26

**Status**: Draft (v3, 2026-11-26: chốt đăng nhập và nguồn Facebook, thêm danh mục bán vé số; xem [research.md](./research.md))

**Input**: User description: "Một bản đồ giống Google Maps, bắt đầu ở TP.HCM và vùng lân cận. Mở bản
đồ là thấy quanh mình có hoàn cảnh nào cần giúp và cần giúp gì: cụ già vẫn đi bán hàng, cửa hàng do
người khuyết tật làm, người vô gia cư, điểm quyên góp đồ ăn, nhà có thể ghé thăm trò chuyện. Không
phải chuyện tiền, mà để người trẻ và những người có điều kiện biết tới và giúp. Ai cũng thêm được địa
điểm mới, chọn danh mục và gắn link bài viết/reel Facebook kể về hoàn cảnh đó."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mở bản đồ, thấy hoàn cảnh cần giúp quanh mình (Priority: P1)

Một bạn trẻ ở TP.HCM mở trang trên điện thoại, bản đồ căn vào vị trí của bạn và hiện các điểm cần
giúp gần đó, mỗi điểm có biểu tượng theo danh mục. Bạn lọc "Người bán vé số", bấm vào một điểm và
thấy: ai, đang bán gì hoặc cần gì, cách giúp (mua hàng, mang đồ ăn, ghé trò chuyện...), giờ thường
có mặt, và bài/reel Facebook kể về hoàn cảnh này.

**Why this priority**: Đây là giá trị cốt lõi. Chỉ cần tính năng này với dữ liệu do nhóm nhập sẵn là
đã có MVP dùng được.

**Independent Test**: Nhập sẵn 30 điểm mẫu ở TP.HCM, mở bản đồ, lọc theo danh mục, mở chi tiết và thấy
cách giúp cùng bài Facebook được nhúng.

**Acceptance Scenarios**:

1. **Given** người dùng cho phép truy cập vị trí, **When** mở trang, **Then** bản đồ căn vào vị trí đó
   và hiện các điểm đã duyệt trong bán kính có thể điều chỉnh (mặc định 3 km).
2. **Given** người dùng từ chối vị trí, **When** mở trang, **Then** bản đồ hiện trung tâm TP.HCM và cho
   phép chọn phường/xã (tìm được cả bằng tên quận cũ).
3. **Given** bản đồ đang hiển thị, **When** chọn một hoặc nhiều danh mục, **Then** chỉ các điểm thuộc
   danh mục đó còn hiện.
4. **Given** bấm vào một điểm, **When** mở chi tiết, **Then** thấy tiêu đề, mô tả, danh mục, các cách
   giúp, giờ có mặt (nếu có), bài/reel Facebook nhúng (nếu có), ngày xác nhận gần nhất và nút "Chỉ đường".
5. **Given** điểm là người không có chỗ ở cố định, **When** hiển thị, **Then** chỉ hiện một vùng gần đúng
   (tối thiểu bán kính 200 m), không hiện điểm chính xác.

---

### User Story 2 - Cộng đồng thêm địa điểm mới (Priority: P2)

Một người đi đường gặp cụ bà bán vé số đã lớn tuổi, hỏi ý kiến cụ, rồi bấm nút lớn "Thêm người cần giúp".
Form chỉ có 3 bước, mỗi bước một màn hình:

1. **Ở đâu?** Bấm "Tôi đang ở đây" (dùng vị trí điện thoại) hoặc kéo ghim trên bản đồ.
2. **Ai, cần gì?** Chạm một ô hình lớn (bán vé số, cụ già bán hàng, vô gia cư...), chạm các cách giúp (mua
   hàng, mang đồ ăn, ghé trò chuyện...), viết vài dòng nếu muốn.
3. **Gửi.** Dán link reel nếu có (không bắt buộc), tích "Tôi đã hỏi và người này đồng ý", bấm Gửi.

Chỉ tới lúc bấm Gửi mới cần đăng nhập Facebook/Google, và những gì đã điền vẫn được giữ lại. Bài vào hàng chờ;
người kiểm duyệt xem xét rồi duyệt.

**Why this priority**: Dữ liệu tăng nhờ cộng đồng; đây là cách sản phẩm phủ được nhiều nơi.

**Independent Test**: Đăng nhập, gửi một địa điểm có link Facebook, kiểm duyệt viên duyệt, điểm xuất hiện
trên bản đồ; gửi một địa điểm không tích xác nhận đồng ý thì không gửi được.

**Acceptance Scenarios**:

1. **Given** người dùng chưa đăng nhập, **When** điền xong và bấm Gửi, **Then** được yêu cầu đăng nhập, và sau
   khi đăng nhập bài được gửi luôn với nội dung đã điền, không phải điền lại.
2. **Given** form thêm địa điểm, **When** gửi đủ trường bắt buộc (vị trí, danh mục, mô tả, ít nhất một
   cách giúp, xác nhận đồng ý), **Then** bài vào hàng chờ và chưa hiện công khai.
3. **Given** người dùng dán link bài/reel Facebook công khai, **When** gửi, **Then** link được kiểm tra
   có xem trước được không và được nhúng ở trang chi tiết sau khi duyệt.
4. **Given** bài trong hàng chờ, **When** kiểm duyệt viên duyệt hoặc từ chối kèm lý do, **Then** người đăng
   được báo kết quả.
5. **Given** điểm đã hiển thị, **When** người đăng hoặc người khác xác nhận "vẫn còn ở đây", **Then** ngày
   xác nhận gần nhất được cập nhật.

---

### User Story 3 - Báo cáo, gỡ bài và bảo vệ người được giới thiệu (Priority: P2)

Người được giới thiệu, người thân, hoặc bất kỳ ai cũng có thể báo cáo một điểm: "người này không đồng ý",
"sai thông tin", "nghi lừa đảo", "không còn ở đây". Báo cáo "không đồng ý" làm điểm bị ẩn ngay.

**Why this priority**: Bắt buộc theo nguyên tắc II của hiến chương; không phát hành công khai nếu thiếu.

**Independent Test**: Báo cáo "không đồng ý" mà không cần đăng nhập, điểm biến mất khỏi bản đồ ngay và vào
hàng chờ xem xét.

**Acceptance Scenarios**:

1. **Given** trang chi tiết một điểm, **When** chọn "Người này không đồng ý / Gỡ bài", **Then** điểm bị ẩn
   ngay, không cần đăng nhập, và kiểm duyệt viên nhận được yêu cầu.
2. **Given** báo cáo loại khác, **When** gửi, **Then** điểm vẫn hiện nhưng vào hàng chờ xem xét; nếu có từ
   3 báo cáo độc lập, điểm tạm ẩn.
3. **Given** điểm không được xác nhận lại trong 90 ngày, **When** hiển thị, **Then** có nhãn "có thể đã thay
   đổi"; sau 180 ngày, điểm tự ẩn.

---

### User Story 4 - Tổ chức/nhóm thiện nguyện đăng điểm và hoạt động (Priority: P3)

Một nhóm thiện nguyện có trang Facebook đăng điểm phát cơm, tủ quần áo miễn phí, hoặc lịch thăm nhà
các cụ, kèm link bài Facebook của nhóm. Nhóm có hồ sơ riêng và các điểm của nhóm hiện huy hiệu "nhóm đã
xác minh" sau khi được duyệt.

**Why this priority**: Tăng độ tin cậy và số lượng điểm, nhưng không chặn MVP.

**Independent Test**: Tạo hồ sơ nhóm, được duyệt, đăng một điểm và thấy huy hiệu trên trang chi tiết.

**Acceptance Scenarios**:

1. **Given** một nhóm được duyệt, **When** đăng điểm, **Then** điểm hiện huy hiệu nhóm và link tới trang
   Facebook của nhóm.

---

### User Story 5 - Gợi ý vị trí từ nội dung video (Priority: P3, tuỳ chọn, mặc định tắt)

Đây là **công cụ nhập dữ liệu cho quản trị/Claude** khi tự tìm và nhập hàng loạt địa điểm từ các trang nguồn.
Form công khai cho người dùng vẫn là form điền tay đơn giản, không có bước này.

Trong reel, vị trí thường chỉ được nói ra ("cô ngồi ở góc đường A và B") hoặc hiện trên biển hiệu, không có
trong caption. Khi một trang hợp tác (ví dụ Tôn Hoa Sen) gửi file video gốc hoặc cho phép dùng video của họ,
hệ thống chuyển lời nói thành chữ, đọc chữ trên vài khung hình (biển tên đường, biển cửa hàng), rồi gợi ý một
vị trí trên bản đồ. Kiểm duyệt viên xác nhận hoặc sửa ghim trước khi điểm được duyệt.

**Why this priority**: Giảm phần việc khó nhất (tìm vị trí) khi nhập nhiều reel, nhưng MVP vẫn chạy đầy đủ với
ghim tay.

**Independent Test**: Tải lên một video mẫu có câu nói về một ngã tư ở TP.HCM, thấy gợi ý ghim gần ngã tư đó
kèm đoạn chữ làm bằng chứng; kiểm duyệt viên chấp nhận hoặc kéo ghim đi chỗ khác.

**Acceptance Scenarios**:

1. **Given** tính năng bật và có video do trang hợp tác cung cấp, **When** chạy gợi ý, **Then** hiện tối đa 3
   vị trí gợi ý, mỗi cái kèm đoạn lời nói hoặc chữ trên hình làm căn cứ và mức độ tin cậy.
2. **Given** gợi ý có độ tin cậy thấp hoặc không tìm thấy, **When** hiển thị, **Then** kiểm duyệt viên ghim tay
   như bình thường.
3. **Given** tính năng tắt, **When** nhập reel, **Then** mọi thứ hoạt động như cũ, không có bước gợi ý.

---

### Edge Cases

- Người bán hàng rong di chuyển theo giờ: cho phép nhiều khung giờ/vị trí hoặc chỉ một vùng hoạt động.
- Trùng lặp: hai người cùng đăng một cụ bán hàng; hệ thống gợi ý điểm có sẵn ở gần khi đăng.
- Link Facebook bị xoá, chuyển riêng tư hoặc không nhúng được: trang chi tiết vẫn hiện, ẩn phần nhúng.
- Ảnh/bài có trẻ em hoặc giấy tờ tùy thân: kiểm duyệt viên từ chối hoặc yêu cầu sửa.
- Nhiều điểm sát nhau: gom cụm để bản đồ vẫn đọc được.
- Người dùng ở ngoài TP.HCM và vùng lân cận: bản đồ vẫn mở được nhưng báo khu vực chưa có nhiều dữ liệu.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI hiển thị bản đồ các điểm đã duyệt quanh vị trí người dùng, có gom cụm.
- **FR-002**: Người dùng PHẢI lọc được theo danh mục và tìm theo khu vực (phường/xã theo đơn vị hành
  chính từ 01/07/2025, tìm được bằng tên quận cũ). Danh mục ban đầu: người bán vé số, cụ già/người lớn tuổi bán hàng, cần hỗ trợ đặc biệt (vd: cửa hàng do người khuyết tật làm), người vô gia cư, điểm phát đồ ăn/quyên
  góp đồ, nhà có thể ghé thăm, khác. Quản trị viên quản lý được danh sách này.
- **FR-003**: Mỗi điểm PHẢI có ít nhất một "cách giúp" ngoài tiền (mua hàng, mang đồ ăn, đồ dùng, ghé thăm
  trò chuyện, chia sẻ, góp công). Hệ thống KHÔNG nhận hay chuyển tiền.
- **FR-004**: Trang chi tiết PHẢI hiện bài/reel Facebook công khai được gắn link (nhúng nếu có thể, nếu không
  thì hiện link), cùng nút chỉ đường mở ứng dụng bản đồ của điện thoại.
- **FR-005**: Người xem KHÔNG cần đăng nhập. Người đăng địa điểm PHẢI đăng nhập.
- **FR-006**: Form đăng PHẢI bắt buộc xác nhận đã được người được giới thiệu đồng ý.
- **FR-007**: Mọi bài cộng đồng PHẢI qua kiểm duyệt trước khi hiển thị; kiểm duyệt viên duyệt, từ chối kèm lý
  do, sửa, ẩn hoặc gỡ được.
- **FR-008**: Vị trí của danh mục "người vô gia cư" (và mọi điểm được đánh dấu "không cố định") PHẢI được làm
  mờ tối thiểu 200 m; vị trí chính xác chỉ kiểm duyệt viên thấy.
- **FR-009**: Bất kỳ ai cũng PHẢI báo cáo được một điểm; báo cáo "không đồng ý" PHẢI ẩn điểm ngay.
- **FR-010**: Điểm không được xác nhận lại sau 90 ngày PHẢI có nhãn cảnh báo; sau 180 ngày PHẢI tự ẩn.
- **FR-011**: Giao diện PHẢI tiếng Việt và dùng tốt trên điện thoại.
- **FR-012**: Người đăng PHẢI gắn được link bài/reel Facebook công khai; hệ thống nhúng nội dung bằng công cụ
  nhúng chính thức của Meta (oEmbed) và KHÔNG tải hay lưu video/nội dung bài. Tự động đọc bài từ các trang hợp
  tác là giai đoạn sau (xem research.md mục 1).
- **FR-013**: Người đăng PHẢI đăng nhập bằng Facebook hoặc Google.
- **FR-014**: Hệ thống KHÔNG hiển thị số điện thoại, tài khoản ngân hàng hay kênh liên hệ trực tiếp của người
  được giới thiệu. Chỉ có vị trí, cách giúp và link bài viết/reel kể về hoàn cảnh.
- **FR-016**: Xem bản đồ và thêm địa điểm PHẢI dùng được bởi người không rành công nghệ (kể cả người lớn tuổi):
  form thêm địa điểm tối đa 3 bước; chỉ vị trí, danh mục, một cách giúp và ô xác nhận đồng ý là bắt buộc; chọn
  bằng ô hình lớn thay vì danh sách thả xuống; chữ tiếng Việt đơn giản, không thuật ngữ; nút bấm đủ lớn cho ngón
  tay (tối thiểu 44×44 px), chữ tối thiểu 16 px, tương phản đạt WCAG AA; mỗi lỗi nói rõ cần sửa gì bằng tiếng Việt;
  bản nháp form được giữ lại nếu thoát giữa chừng hoặc mất mạng.
- **FR-015** *(tuỳ chọn, mặc định tắt)*: Hệ thống CÓ THỂ gợi ý vị trí từ lời nói và chữ trên hình trong video,
  CHỈ với file video do chủ trang cung cấp hoặc cho phép. KHÔNG tự tải video từ Facebook. Gợi ý chỉ hiện cho
  kiểm duyệt viên, không bao giờ tự duyệt; file video và bản chép lời bị xoá sau khi xử lý xong, chỉ giữ đoạn
  chữ làm căn cứ.

### Key Entities *(include if feature involves data)*

- **Hoàn cảnh / Địa điểm (Place)**: tiêu đề, mô tả, danh mục, các cách giúp, giờ có mặt, vị trí (chính xác,
  chỉ kiểm duyệt viên thấy) và vị trí hiển thị (có thể đã làm mờ), loại vị trí (cố định / không cố định),
  trạng thái (chờ duyệt / hiển thị / ẩn / gỡ), ngày xác nhận gần nhất, người đăng, nhóm (nếu có).
- **Link nguồn (Source Link)**: URL bài/reel Facebook hoặc link khác, đã nhúng được hay chưa, thời điểm kiểm tra;
  thuộc về một Địa điểm.
- **Danh mục (Category)**: tên, biểu tượng; quản trị viên quản lý.
- **Người dùng (User)**: người đăng, kiểm duyệt viên, quản trị viên; lịch sử đăng và vi phạm.
- **Nhóm thiện nguyện (Group)**: tên, trang Facebook, trạng thái xác minh; có nhiều Địa điểm.
- **Báo cáo (Report)**: loại (không đồng ý, sai thông tin, nghi lừa đảo, không còn ở đây), nội dung, trạng thái
  xử lý; thuộc về một Địa điểm.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng mới thấy ít nhất một hoàn cảnh gần mình và biết cách giúp trong dưới 1 phút.
- **SC-002**: Bản đồ hiện điểm quanh người dùng trong dưới 3 giây trên mạng 4G trung bình.
- **SC-003**: Có ít nhất 200 điểm đã duyệt ở TP.HCM và vùng lân cận trong 3 tháng đầu.
- **SC-004**: Báo cáo "không đồng ý" làm điểm biến mất khỏi bản đồ trong vòng 1 phút, 100% trường hợp.
- **SC-005**: Bài cộng đồng được duyệt hoặc từ chối trong vòng 48 giờ.
- **SC-006**: 0 điểm thuộc danh mục người vô gia cư hiển thị vị trí chính xác.
- **SC-008**: Trong buổi thử với ít nhất 5 người không rành công nghệ (có người trên 50 tuổi), ít nhất 4 người
  tự thêm được một địa điểm trong dưới 2 phút mà không cần hỏi ai.
- **SC-007**: 100% điểm hiển thị không chứa số điện thoại hay số tài khoản của người được giới thiệu.

## Assumptions

- Phạm vi ban đầu là TP.HCM và các tỉnh lân cận (theo Marshall).
- Người dùng chính: người trẻ và những người có điều kiện giúp đỡ; không phải nền tảng gây quỹ.
- (Phỏng đoán) MVP là web app chạy tốt trên điện thoại, chưa có app di động riêng.
- (Phỏng đoán) Ban đầu nhóm dự án là kiểm duyệt viên; chưa cần hệ thống kiểm duyệt viên tình nguyện.
- Không dùng "tài khoản Facebook tin cậy" để tự động đọc trang, vì vi phạm điều khoản Meta (hiến chương,
  nguyên tắc III). Danh sách trang Facebook Marshall gửi sau sẽ dùng làm dữ liệu khởi đầu qua nhập tay + nhúng link.
- Ví dụ nguồn tham khảo do Marshall gửi (trang Facebook đăng reel kể về các hoàn cảnh):
  https://www.facebook.com/tonhoasen.hsg/reels/ và https://www.facebook.com/chuyenmuusinh/reels/.
  Reel từ các trang này là loại link người dùng sẽ gắn vào một địa điểm; mỗi reel cần được gắn với
  một vị trí và danh mục bằng tay vì reel không có toạ độ.
- Nhúng bài/reel Facebook phụ thuộc vào công cụ nhúng của Meta và việc bài đó còn công khai.
