# Bản đồ thiện nguyện (Charity Map)

Bản đồ các tổ chức và hoạt động thiện nguyện, tình nguyện.

Dự án phát triển theo [GitHub Spec Kit](https://github.com/github/spec-kit) (spec-driven development).

- Hiến chương dự án: [.specify/memory/constitution.md](.specify/memory/constitution.md)
- Spec đầu tiên: [specs/001-charity-map-mvp/spec.md](specs/001-charity-map-mvp/spec.md)

## Chạy thử trên máy

Cần Node.js 22 trở lên.

```bash
npm install
npm run dev          # mở http://localhost:3000
npm test             # test đơn vị
```

Chưa có Supabase thì app tự dùng 30 điểm **mẫu** (có nhãn "Dữ liệu mẫu" trên đầu trang).

### Mở trên điện thoại

1. Điện thoại và máy tính dùng chung một mạng Wi-Fi.
2. Chạy `npm run dev:phone`, rồi xem địa chỉ IP của máy tính (`ipconfig` trên Windows, dòng IPv4, ví dụ `192.168.1.5`).
3. Trên điện thoại mở `http://192.168.1.5:3000`.

Nút "Chỗ tôi đang đứng" chỉ chạy qua HTTPS (hoặc `localhost`), nên khi mở bằng địa chỉ IP thì bản đồ ở lại
trung tâm TP.HCM. Bản đưa lên mạng (Vercel...) có HTTPS nên nút này chạy bình thường.

## Bắt đầu với Spec Kit

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

Mở repo bằng Claude Code rồi dùng các skill: `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
