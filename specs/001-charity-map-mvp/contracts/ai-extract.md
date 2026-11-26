# AI Contract: gợi ý điền form và cờ kiểm duyệt

> **MVP**: tắt trong app (`AI_SUGGEST_ENABLED=false`). Schema đầu ra bên dưới vẫn là định dạng của file
> `supabase/seed/places.draft.json` mà phiên làm việc với Claude soạn khi nhập dữ liệu khởi đầu (mỗi phần tử
> thêm `source_url` và `pin_hint`).

Dùng Claude qua `@anthropic-ai/sdk`, structured outputs (`output_config.format` với JSON schema bên dưới).
Mặc định model `claude-opus-5-5`, `output_config.effort: "low"`; có thể đổi sang `claude-haiku-5-5` sau khi
chạy bộ test (quyết định của Marshall).

## Đầu vào

- **System prompt cố định** (đặt đầu, có `cache_control`): vai trò, danh sách danh mục và cách giúp, quy tắc
  ngôn từ tôn trọng, 6–8 ví dụ caption → JSON. Không chứa ngày giờ hay dữ liệu thay đổi để cache không bị vô hiệu.
- **Tin nhắn người dùng**: đoạn mô tả/caption người đăng dán (đã lọc số điện thoại/CCCD bằng regex, thay bằng `[đã ẩn]`).

## Đầu ra (JSON schema)

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["category", "help_types", "title", "location_type", "flags"],
  "properties": {
    "category": { "enum": ["ban-ve-so", "cu-gia-ban-hang", "can-ho-tro-dac-biet", "vo-gia-cu",
                           "diem-phat-do-an", "ghe-tham", "khac"] },
    "help_types": { "type": "array", "items": { "enum": ["buy_goods", "bring_food", "bring_items",
                    "visit_chat", "share", "volunteer"] } },
    "title": { "type": "string", "description": "≤ 80 ký tự, tôn trọng, không giật gân" },
    "location_type": { "enum": ["fixed", "roaming"] },
    "hours_text": { "type": ["string", "null"], "description": "Giờ có mặt nếu caption nói rõ" },
    "place_hint": { "type": ["string", "null"], "description": "Tên đường/khu vực nếu caption nhắc, để gợi ý ghim" },
    "flags": { "type": "array", "items": { "enum": ["contact_info", "child_present", "sensational",
               "fundraising", "possible_ad", "id_or_medical"] } }
  }
}
```

## Quy tắc

- Kết quả chỉ là **gợi ý**: hiện cho người đăng sửa, và hiện `flags` cho kiểm duyệt viên. Không tự duyệt.
- Cache theo `sha256(model + prompt_version + text)` trong `ai_suggestions`.
- Nhập hàng loạt (`scripts/import-seed.ts`) dùng Message Batches API cùng system prompt.
- Ghi `usage.input_tokens`, `usage.cache_read_input_tokens`, `usage.output_tokens` để theo dõi chi phí.
- Nếu `stop_reason` là `refusal` hoặc lỗi API: form vẫn dùng được, chỉ không có gợi ý.
