# Samsung – Từ cửa hàng nhỏ đến đế chế công nghệ
## Kịch bản Mọt Mọt Studio – Bản duyệt số 2

- 26 cảnh nội dung, 5 chương, mục tiêu biên tập 07:30 (450 giây).
- 29 lượt thoại tuần tự: 26 cảnh và 3 cảnh có hai lượt thoại (nữ hỏi, nam trả lời) tại cảnh 15, 20, 25.
- Giọng nam là dẫn chuyện chính; giọng nữ chỉ xuất hiện đúng 3 lần.
- Timeline xuất bản được đo từ WAV VieNeu thực tế; 07:30 là tổng thời lượng phân bổ theo kịch bản, không ép tốc độ đọc để khớp.
- Trim khoảng lặng đầu/cuối clip thoại; giữ khoảng nghỉ có dụng ý trong câu hỏi, câu đùa và cao trào.
- Định dạng 1920×1080, 30 FPS, One-shot PaperMotion. Camera di chuyển liên tục; Mọt Mọt tương tác và nối cảnh, không dựng slideshow.
- Nokia Full không bị thay đổi.

## Kế thừa thư viện PaperMotion gốc

Samsung Full tái sử dụng rig Mọt Mọt, camera follow, zoom hook/ending, one-shot motion, tearWipe, paperFlyIn, paper material, grain, vignette, mixer, city skyline và grassland environment từ repo. Các lớp môi trường gồm:

1. Mây và đồi ở hậu cảnh.
2. Cây lớn, cây thông ở trung cảnh.
3. Hoa, đá và bụi cây ở lớp gần.
4. Cỏ uốn theo gió ở tiền cảnh; cỏ và props phản ứng khi Mọt Mọt đi qua.
5. Mưa nhẹ lấy từ preset `rainfall` và `drawRain`, chỉ dùng ở phân đoạn khủng hoảng khi phù hợp nhịp kể.
6. Giữ các preset tuyết `snowfall`/`drawSnow` sẵn có trong thư viện; không gắn tuyết vào câu chuyện Samsung nếu không có căn cứ bối cảnh.

Các lớp được cuộn bằng camera parallax, không dùng ảnh nền tĩnh thay thế.

## Cấu trúc 26 cảnh

| # | Nội dung | Mốc / điểm nhấn |
|---:|---|---|
| 1 | Bạn sẽ không tin Samsung bắt đầu từ đâu | Cửa hàng nhỏ, cá khô, rau củ, 1938 |
| 2 | Ba ngôi sao | Samsung thành lập tại Daegu |
| 3 | Samsung không muốn mãi bán cá khô | Dệt may, bảo hiểm, thương mại |
| 4 | Một quyết định có vẻ điên rồ | Samsung Electronics, 1969 |
| 5 | Chiếc tivi mở ra tương lai | TV đen trắng, 1970 |
| 6 | Những chiếc tivi chưa đủ | TV và thiết bị gia dụng |
| 7 | Một quyết định đốt tiền | Đầu tư bán dẫn |
| 8 | Kẻ đi sau muốn đuổi kịp | Kỹ sư, nghiên cứu, tiếp nhận công nghệ |
| 9 | Con chip nhỏ, bước ngoặt lớn | 64K DRAM, 1983 |
| 10 | Thay đổi hoặc bị bỏ lại | New Management, 1993 |
| 11 | Tham vọng bắt đầu thành hiện thực | Đầu tư nghiên cứu và công nghệ |
| 12 | Samsung cũng muốn làm điện thoại | Điện thoại di động đầu tiên tại Hàn Quốc, 1988 |
| 13 | Khi những ông lớn đã có chỗ đứng | Nokia, Motorola |
| 14 | Samsung bắt đầu chơi khác | Điện thoại gập, trượt |
| 15 | Một chiếc điện thoại khiến cả ngành suy nghĩ lại | iPhone, 2007; nữ hỏi, nam trả lời |
| 16 | Samsung tung ra quân bài của mình | Galaxy S, 2010 |
| 17 | Cuộc chiến không khoan nhượng | Apple, Android, Samsung |
| 18 | Một ý tưởng từng bị chê cười | Galaxy Note, S Pen, 2011 |
| 19 | Khi kẻ bị chê lại tạo ra xu hướng | Màn hình lớn và S Pen |
| 20 | Nhưng chiến thắng không kéo dài mãi | Nữ hỏi, nam dẫn vào Note 7 |
| 21 | Cú ngã mang tên Note 7 | Sự cố pin, đổi máy và thu hồi, 2016 |
| 22 | Samsung phải giành lại niềm tin | Kiểm định, chất lượng, Galaxy S |
| 23 | Bí mật phía sau những chiếc điện thoại | Bán dẫn, bộ nhớ, màn hình |
| 24 | Lại một lần thử thách giới hạn | Galaxy Fold, 2019 |
| 25 | Điều gì tạo nên một đế chế? | Nữ hỏi, nam trả lời |
| 26 | Câu chuyện chưa kết thúc | Tổng kết hành trình, nhận diện Mọt Mọt Studio |

## Đồng bộ thoại và hình

- `voiceover.json` giữ 29 lượt thoại theo thứ tự tuần tự; 3 lượt nữ đứng ngay trước câu trả lời nam ở cảnh 15, 20 và 25.
- Chỉ mục cảnh ánh xạ 26 cảnh vào 29 lượt thoại, bỏ qua lượt thứ hai khi xác định điểm bắt đầu cảnh.
- WAV thực tế là nguồn sự thật cho timeline. Không ép giọng đọc tăng tốc để khớp 07:30.
- Mỗi câu được tách thành spoken beats; cue đạo cụ, nhãn thời gian và chuyển động camera phải bám theo thời điểm thoại thực tế.
- Title và subtitle nằm trong vùng an toàn bên trái; đạo cụ ở vùng bên phải, không che chữ chính/phụ.
- Thay đổi hiệu ứng xuất hiện giữa các đạo cụ; không dùng một kiểu entrance lặp lại cho tất cả vật thể.

## Kiểm tra trước render

Workflow preflight xác minh:
1. Typecheck và khả năng nạp scene.
2. Tạo WAV, trim silence đầu/cuối và sinh timeline tuần tự.
3. Từ chối thoại chồng nhau hoặc khoảng nghỉ ngoài giới hạn.
4. Kiểm tra 26 điểm vào cảnh, từng giây, từng cue thoại và runtime draw.
5. Xác minh MP4 sau render: thời lượng theo WAV, 1920×1080, 30 FPS và audio stream.

Full render chỉ chạy sau khi preflight và rà soát đồng bộ thoại/hình hoàn tất.
