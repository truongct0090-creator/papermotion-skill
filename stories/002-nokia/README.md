# Tập 01 — Nokia: Từ ông vua điện thoại đến kẻ tụt lại

## Bản sản xuất đầy đủ

- **28 cảnh tổng cộng:** 1 cảnh hook Mọt Mọt, 26 cảnh nội dung lịch sử, 1 cảnh kết và CTA với Mọt Mọt.
- **Phong cách:** giữ nguyên phong cách one-shot PaperMotion của bản test 15 cảnh. Hành trình hình ảnh liên tục, mascot đi xuyên suốt bối cảnh; các lớp giấy, đạo cụ và môi trường chuyển tiếp bằng chuyển động cut-paper/parallax. Không chuyển thành video tài liệu cắt ghép các ảnh tĩnh độc lập.
- **Khung hình:** 16:9, 1920×1080, 30 fps; workflow render full resolution, không dùng bản draft.
- **Mỹ thuật:** cut-paper, mép giấy xé, texture sợi giấy, bóng đổ nhiều lớp, rim/core shadow, parallax và môi trường chuyển động tự nhiên. Dùng rig Mọt Mọt từ Rooftops, giữ màu mauve và giải phẫu mascot nhất quán.
- **Chữ:** Noto Sans với fallback hỗ trợ tiếng Việt; tiêu đề lớn luôn một dòng và tự co cỡ để vừa vùng an toàn. Phụ đề nhỏ bên dưới có thể chia hai dòng. Bỏ viền đen dày, thay bằng nhiều lớp bóng đổ tạo chiều sâu 3D. Vùng chữ bên trái (x=80–780); đạo cụ và hiệu ứng giấy được giới hạn bên phải (x>=800).
- **Chuyển động:** Mọt Mọt di chuyển xuyên suốt, có bước nhảy chuyển đoạn; đuôi và ánh mắt có chuyển động tự nhiên. Cảnh mở đầu dùng cận cảnh mascot để tạo hook; cảnh kết trở lại với CTA. Các cảnh giữa giữ nhịp one-shot của bản test.
- **Đạo cụ:** mỗi cảnh có bố cục riêng, không tái sử dụng cùng một cụm hình ảnh cho nhiều cảnh liên tiếp. Đạo cụ được mở theo cue câu thoại bằng giấy xé bay vào, bung mảnh, xoay và ghép; hướng chuyển động đa dạng nhưng deterministic theo seed.
- **Âm thanh:** Adam dẫn chuyện chính; Mỹ Duyên tạo điểm nhấn ở cảnh 2 và cảnh 16. Intro/outro dùng lời dẫn Mọt Mọt bằng giọng Adam hiện tại để không phát sinh voice profile mới. Các câu được tổng hợp theo từng câu, đo WAV thực tế và đồng bộ timeline với hoạt ảnh. Khoảng nghỉ giữa câu 0,10 giây; giữa lượt thoại 0,18 giây.
- **Chủ đề động:** voiceover manifest dùng placeholder `{{topic}}` và biến `variables.topic`, hiện đặt là Nokia. Có thể đổi chủ đề tập sau mà không phải sửa câu mở/kết theo cách thủ công.

## Danh sách 28 cảnh

| Cảnh | Nội dung | Giọng |
|---:|---|---|
| 1 | Mọt Mọt cận cảnh chào khán giả, hook giới thiệu câu chuyện Nokia | Adam |
| 2 | Nokia từng là cái tên mặc định của điện thoại di động; đặt câu hỏi về cú trượt dài | Adam |
| 3 | Ký ức Nokia trong gia đình Việt Nam, Snake, pin và độ bền | Mỹ Duyên |
| 4 | Nokia vươn lên thành thương hiệu toàn cầu | Adam |
| 5 | Đỉnh cao năm 2007: số liệu thiết bị và thị phần do Nokia công bố | Adam |
| 6 | SMS, Snake, pin lâu và những trải nghiệm thân thuộc | Adam |
| 7 | iPhone ra mắt năm 2007, mở ra cách tương tác mới | Adam |
| 8 | Thói quen người dùng thay đổi, phần mềm trở thành trung tâm | Adam |
| 9 | Android mở rộng qua nhiều nhà sản xuất | Adam |
| 10 | Symbian bắt đầu khó theo kịp smartphone | Adam |
| 11 | Phân mảnh phần mềm và trải nghiệm nhà phát triển | Adam |
| 12 | N97, N8 và nỗ lực cải tiến phần cứng | Adam |
| 13 | Khó khăn tổ chức và phối hợp nội bộ | Adam |
| 14 | Apple và Android tăng tốc | Adam |
| 15 | Stephen Elop trở thành CEO năm 2010 | Adam |
| 16 | Thông điệp Burning Platform đầu năm 2011 | Adam |
| 17 | Câu hỏi Nokia phải đổi hướng như thế nào | Mỹ Duyên |
| 18 | Hợp tác chiến lược Nokia–Microsoft | Adam |
| 19 | Symbian và MeeGo rời vị trí trung tâm | Adam |
| 20 | Lumia ra mắt | Adam |
| 21 | Windows Phone thiếu ứng dụng và hệ sinh thái | Adam |
| 22 | Thị phần và vị thế Nokia suy giảm | Adam |
| 23 | Microsoft công bố mua mảng Devices & Services năm 2013 | Adam |
| 24 | Thương vụ hoàn tất tháng 4/2014 | Adam |
| 25 | Nokia tiếp tục tồn tại trong hạ tầng mạng và công nghệ | Adam |
| 26 | Những nguyên nhân tích tụ, không quy kết một cá nhân hay quyết định | Adam |
| 27 | Bài học về khả năng thích nghi khi thị trường thay đổi | Adam |
| 28 | Mọt Mọt mời khán giả bình luận về mẫu điện thoại từng sử dụng | Adam |

## Nguyên tắc kiểm chứng lịch sử

- Không nói Nokia bán toàn bộ công ty cho Microsoft. Thương vụ là mảng Devices & Services, hoàn tất tháng 4/2014.
- Số liệu 437 triệu thiết bị và gần 38% thị phần năm 2007 phải ghi rõ là số liệu Nokia công bố.
- Không giải thích thất bại chỉ bằng một nguyên nhân. Cần cân bằng vấn đề Symbian, tổ chức, lựa chọn nền tảng, hệ sinh thái ứng dụng và sức cạnh tranh iOS/Android.
- Không dùng chân dung giả của Stephen Elop; thể hiện bằng bối cảnh lãnh đạo mang tính biểu tượng.
- Hài hước ở cách kể, không chế giễu người lao động hay người dùng.

## Quy trình render

Workflow `.github/workflows/test-nokia-pilot.yml` hiện tạo WAV theo từng câu từ manifest, đo timeline thực tế, render full resolution, trộn voiceover và kiểm tra thời lượng, độ phân giải, frame rate và audio stream. Artifact cuối có tên `nokia-28-scenes-full`.
