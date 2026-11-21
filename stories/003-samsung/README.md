# Tập 02 — Samsung: Từ cửa hàng cá khô đến gã khổng lồ công nghệ

## Trạng thái

- Pilot gồm 10 cảnh nội dung, khoảng 2 phút; thời lượng cuối cùng được xác định bởi WAV thực tế.
- Samsung pilot được dựng trên đúng nền hình ảnh và chuyển động của Nokia Full.
- Chỉ thay câu chuyện, lời thoại, palette theo bối cảnh và đạo cụ Samsung.
- Chưa triển khai 26 cảnh + 2 mascot layouts cho tới khi pilot được xem và duyệt.

## Chuẩn kế thừa Nokia Full

Samsung dùng trực tiếp cùng:

- Mọt Mọt rig, màu sắc, tỷ lệ, tọa độ sàn và nhịp chạy/nhảy từ Nokia Full.
- Camera follow, zoom intro/ending, one-shot motion và parallax layers.
- Paper materials, light, edge, core/rim shadows, grain, vignette và tearWipe.
- Hàm typography Nokia Full: title một dòng lớn, subtitle đúng hai dòng nhỏ, layered shadows.
- Text safe zone bên trái và prop safe zone từ x=800.
- Hàm paperFlyIn Nokia Full cho từng nhóm đạo cụ, được kích hoạt theo sentence-level voice timing.
- Mixer, music bed và ambience theo timeline đo từ giọng đọc.

## Pilot 10 cảnh

| Cảnh | Nội dung | Vật thể chính |
|---:|---|---|
| 1 | Hook: từ Galaxy hiện đại về cửa hàng hàng hóa | Galaxy, thùng cá khô, rau củ |
| 2 | Samsung Sanghoe thành lập tại Daegu năm 1938 | Biển hiệu cửa hàng, cá khô, gạo, trái cây, sổ hàng |
| 3 | Mở rộng mạng lưới giao thương | Tàu hàng giấy, kiện hàng |
| 4 | Mở rộng sau chiến tranh Triều Tiên | Xưởng dệt, thực phẩm, bảng mở rộng kinh doanh |
| 5 | Samsung Electronics thành lập năm 1969 | Nhà máy điện tử, bảng hiệu, linh kiện |
| 6 | TV đen trắng P-3202 năm 1970 | TV CRT đen trắng, nhãn P-3202 |
| 7 | Xuất khẩu TV sang Panama năm 1971 | Tàu hàng, kiện TV, cờ Panama |
| 8 | Mua 50% Korea Semiconductor năm 1974 | Wafer bán dẫn, chip, hợp đồng |
| 9 | Hoàn tất mua lại và sản xuất TV màu năm 1977 | Dây chuyền TV màu |
| 10 | Hợp nhất hoạt động bán dẫn vào Samsung Electronics năm 1980 | Bảng mạch, chip, nhà máy điện tử |

## Lời thoại và đồng bộ

Nguồn thoại: voiceover.json.

- Adam là giọng kể chính.
- Mỹ Duyên chỉ có câu hỏi nhấn ở hook, bắt đầu sau khi Adam kết thúc.
- scripts/prepare_voiceover.py tạo clip theo từng câu và xuất voiceoverTiming.ts.
- Mốc bắt đầu scene lấy từ line timing đo thực tế; nếu câu trước dài hơn mốc dự kiến, lịch thoại được đẩy tiếp thay vì chồng tiếng.
- Đạo cụ xuất hiện theo cue câu thoại tương ứng, không dùng một hiệu ứng trượt ngang chung.

## Kiểm tra

Workflow .github/workflows/test-samsung-pilot.yml thực hiện:
1. Chuẩn bị WAV và timeline đo thực tế.
2. Typecheck và unit tests.
3. Runtime preflight từng giây, từng scene transition và từng voice cue.
4. Render draft 10 cảnh.
5. Mix thoại Adam/Mỹ Duyên.
6. Kiểm tra thời lượng, 960×540 draft, 30 fps và audio stream.

Bản draft trung gian chỉ dùng nội bộ để mix âm thanh; artifact review chỉ chứa MP4 cuối và các file kiểm tra cần thiết.
