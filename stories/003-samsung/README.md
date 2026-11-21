# Tập 02 — Samsung: Từ cửa hàng cá khô đến gã khổng lồ công nghệ

## Bản dựng Full

- 28 layouts: 26 cảnh câu chuyện (cảnh 1 là hook) + 2 cảnh mascot kết thúc.
- Timeline thoại được đo từ WAV VieNeu thực tế; Samsung dùng lịch tuần tự, không dùng các mốc start cố định cách nhau 12 giây.
- Trim im lặng chỉ ở đầu/cuối clip thoại, giữ lại 35 ms đầu và 60 ms cuối làm đệm tự nhiên.
- Khoảng nghỉ giữa câu mặc định 0,16 giây; giữa câu con trong cùng một line là 0,08 giây.
- Mục tiêu xuất bản: 1920×1080, 30 FPS; workflow xác minh MP4 bằng ffprobe.
- Nokia Full không bị thay đổi. Mã nguồn pilot 10 cảnh cũ vẫn được giữ tại main.ts làm tài liệu tham chiếu; render target chính thức mới là samsung-full.

## Kế thừa PaperMotion gốc

Samsung Full tái sử dụng rig Mọt Mọt, camera follow, zoom hook/ending, one-shot motion, tearWipe, paperFlyIn, paper material, grain, vignette, mixer, city skyline và grassland environment từ repo. Bổ sung các lớp môi trường đã có trong `stories/shared/environment/grassland.ts`:

1. Mây và đồi ở hậu cảnh.
2. Cây lớn, cây thông ở trung cảnh.
3. Hoa, đá và bụi cây ở lớp gần.
4. Cỏ uốn theo gió ở tiền cảnh; cỏ và props phản ứng khi Mọt Mọt đi qua.
5. Mưa nhẹ có hạt rơi, độ nghiêng theo gió và điểm chạm mặt đất được lấy trực tiếp từ `stories/shared/environment/weather.ts` (`rainfall`) + `src/weather/rain.ts` (`drawRain`); chỉ kích hoạt ở phân đoạn khủng hoảng 1997 để tạo nhịp cảm xúc, không phủ mưa lên toàn bộ video.
6. Các preset tuyết `snowfall`/`drawSnow` của repo vẫn được giữ làm lựa chọn cho bối cảnh mùa đông; không tự ý gắn tuyết vào các mốc lịch sử không có căn cứ thời tiết.

Các lớp được cuộn bằng camera parallax, không dùng ảnh nền tĩnh thay thế.

## 28 layouts

| # | Phân đoạn | Mốc / vật thể chủ đạo |
|---:|---|---|
| 1 | Hook: cá khô và gã khổng lồ | Galaxy đối lập thùng cá khô, rau củ |
| 2 | Samsung bắt đầu ở Daegu | Samsung Sanghoe, 1938 |
| 3 | Mạng lưới thương mại | Tàu hàng và kiện hàng |
| 4 | Mở rộng sau chiến tranh | Dệt may, thực phẩm, bán lẻ |
| 5 | Bước vào ngành điện tử | Samsung Electronics, 1969 |
| 6 | TV đen trắng đầu tiên | P-3202, 1970 |
| 7 | Xuất khẩu đến Panama | TV xuất khẩu, 1971 |
| 8 | Đầu tư vào bán dẫn | Korea Semiconductor, 1974 |
| 9 | TV màu và bán dẫn | Mua lại và TV màu, 1977 |
| 10 | Bán dẫn thành trụ cột | Hợp nhất hoạt động, 1980 |
| 11 | DRAM vào cuộc đua toàn cầu | DRAM 64K, 1983 |
| 12 | Bước tiến 256K DRAM | 1984 |
| 13 | Chip 1M DRAM | 1986 |
| 14 | 4M DRAM | 1988 |
| 15 | 64M DRAM | 1992 |
| 16 | New Management | Chuyển đổi chất lượng, 1993 |
| 17 | Vượt qua khủng hoảng | Khủng hoảng tài chính châu Á, 1997 |
| 18 | Chất lượng là ưu tiên | Thiết kế và độ tin cậy |
| 19 | Thương hiệu toàn cầu | TV, màn hình, điện thoại và linh kiện |
| 20 | Kỷ nguyên TV màn hình phẳng | LCD và công nghệ hiển thị |
| 21 | Galaxy S mở ra chương mới | Galaxy S, 2010 |
| 22 | Galaxy Note và màn hình lớn | Note, S Pen, 2011 |
| 23 | Hệ sinh thái Galaxy | Điện thoại, đồng hồ, tablet, tai nghe |
| 24 | OLED và điện thoại gập | Galaxy Fold, 2019 |
| 25 | Bán dẫn cho kỷ nguyên AI | DRAM, NAND, HBM |
| 26 | Samsung hôm nay và ngày mai | Tổng kết hành trình đa ngành |
| 27 | Mọt Mọt hỏi bạn | Câu hỏi bình luận, mascot tương tác |
| 28 | Hẹn gặp lại | Cảnh kết, mascot chào và dẫn sang tập sau |

## Đồng bộ thoại và hình

- Adam là giọng kể chính; Mỹ Duyên tạo điểm nhấn ở hook và đoạn hỏi khán giả.
- Hai giọng không chồng nhau; lịch sequential được tạo sau khi WAV đã trim.
- Mỗi câu được tách thành các spoken beat; các lần paperFlyIn đọc cue từ `STORY_TIMING` đo thật.
- Đạo cụ chính và nhãn mốc thời gian có hai cue riêng khi câu thoại có đủ nhịp.
- Title và subtitle vẫn ở cột an toàn bên trái; đạo cụ ở từ x=800 trở đi.

## Kiểm tra trước render

Workflow `.github/workflows/build-samsung-full.yml` chạy thủ công và có các chốt:

1. Typecheck và unit tests.
2. Tạo WAV, trim silence đầu/cuối và sinh timeline tuần tự.
3. Từ chối khoảng nghỉ thoại trên 0,5 giây hoặc thoại chồng nhau.
4. Preflight 28 scene entrances, mỗi giây, từng cue thoại và runtime draw.
5. Render ở full resolution, không dùng `--draft`.
6. Mix Adam/Mỹ Duyên.
7. Dùng ffprobe xác minh thời lượng, 1920×1080, 30 FPS và audio stream.
8. Chỉ upload artifact cuối sau khi toàn bộ bước kiểm tra thành công.

`voiceoverTiming.ts` trong repo là placeholder để TypeScript kiểm tra tĩnh; workflow luôn ghi đè file này bằng timeline WAV thực tế trước preflight và render.
