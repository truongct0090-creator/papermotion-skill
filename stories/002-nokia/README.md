# Tập 01 — Nokia: Từ ông vua điện thoại đến kẻ tụt lại

## Trạng thái sản xuất
- Pilot 10 cảnh, tổng 100 giây, 30 fps, 16:9; render thẳng bản cuối 1920×1080, không tạo draft. Nhịp cắt 9,2 giây khớp khoảng cách cue voiceover; cảnh cuối bắt đầu ở 82,8 giây và được giữ đến hết 100 giây để dành chỗ cho lời kết.
- Bản đầy đủ dự kiến 26 cảnh, khoảng 8 phút 30 giây; chưa render full.
- Mỹ thuật bắt buộc: PaperMotion cut-paper, mép giấy xé, texture sợi giấy, bóng đổ, rim/core shadow và phân lớp parallax; dùng shared environment kit cho cảnh quan.
- Mèo mauve là mascot dẫn chuyện xuyên suốt, dùng rig và chuyển động chuẩn từ Rooftops; các đạo cụ lịch sử riêng của Nokia được thiết kế theo bối cảnh từng cảnh.
- Typography dùng Be Vietnam Pro đậm, viền đen rõ; không dùng hiệu ứng chữ 3D. Tiêu đề và phụ đề cùng nằm trong một vùng an toàn bên trái (x=80–780, y=70–440). Đạo cụ, tờ giấy đang bay, sợi giấy rách và bóng đổ đều bị giới hạn bên phải x=800; vùng này được clip cứng trong suốt hiệu ứng.
- Lời thoại được chia theo từng câu để đo thời lượng TTS thực tế; khoảng nghỉ giữa câu trong cùng lượt nói là 0,10 giây, giữa hai lượt thoại là 0,18 giây. Mốc chuyển cảnh và mốc xuất hiện đạo cụ lấy trực tiếp từ các clip thoại đã đo, không dùng nhịp 9,2 giây ước lượng.
- Đạo cụ được hé lộ ở đầu từng câu thoại liên quan bằng tờ giấy xé bay vào; các nhóm tiếp theo có thể bung từ trái/phải hoặc trên/dưới, ghép từ mảnh giấy và có sợi giấy bay theo. Hướng bay được chọn ngẫu nhiên có kiểm soát theo seed để đa dạng nhưng không đổi giữa các lần render. Khi đã xuất hiện, đạo cụ tiếp tục tồn tại đến hết cảnh.
- Adam kể chính; Mỹ Duyên xuất hiện ở cảnh 2 và 7.
- Cảnh đêm dùng bầu trời sao và mặt trăng theo demo Rooftops; cảnh ban ngày dùng mây và môi trường giấy từ shared environment.

## Pilot 10 cảnh

Mỗi cảnh bắt đầu theo mốc thoại thực tế; chuyển cảnh không được cắt lời. Script đo từng câu thoại trước khi render, dùng cùng timeline cho hoạt ảnh và audio, sau đó giữ hình cuối thêm 1,25 giây.

| Cảnh | Thời gian | Hình ảnh | Giọng |
|---:|---:|---|---|
| 1 | 00:00–00:10 | Cửa hàng điện thoại, nhiều mẫu Nokia; mở bằng nghịch lý Nokia từng thống trị nhưng mất vị trí dẫn đầu | Adam |
| 2 | 00:10–00:20 | Nokia trong ký ức gia đình Việt Nam, Snake và điện thoại bền bỉ | Mỹ Duyên |
| 3 | 00:20–00:30 | Nhà máy, sản phẩm và quy mô Nokia năm 2007 | Adam |
| 4 | 00:30–00:40 | iPhone đầu tiên xuất hiện, mở ra cách tương tác mới | Adam |
| 5 | 00:40–00:50 | Android mở rộng, cuộc cạnh tranh chuyển sang hệ sinh thái | Adam |
| 6 | 00:50–01:00 | Symbian và độ phức tạp phần mềm | Adam |
| 7 | 01:00–01:10 | Phòng họp, Nokia đứng trước lựa chọn chiến lược | Mỹ Duyên |
| 8 | 01:10–01:20 | Quyết định chọn Windows Phone và sự xuất hiện của Lumia | Adam |
| 9 | 01:20–01:30 | Thương vụ Microsoft mua mảng thiết bị và dịch vụ | Adam |
| 10 | 01:30–01:40 | Những chiếc Nokia cũ như ký ức; Nokia tiếp tục tồn tại trong lĩnh vực khác | Adam |

Lời thoại và mốc thu âm chính xác nằm trong [voiceover.json](./voiceover.json).

## Dàn ý bản đầy đủ 26 cảnh
1. Mở bằng chiếc Nokia rơi xuống đất và câu hỏi vì sao người khổng lồ mất ngai vàng.
2. Ký ức Nokia trong gia đình Việt Nam — Mỹ Duyên.
3. Nokia trở thành thương hiệu toàn cầu.
4. Quy mô kinh doanh năm 2007.
5. SMS, Snake, pin và độ bền trong đời sống.
6. iPhone ra mắt năm 2007.
7. Thói quen dùng điện thoại thay đổi.
8. Android mở rộng sang nhiều nhà sản xuất.
9. Symbian bắt đầu khó theo kịp.
10. Phân mảnh phần mềm và trải nghiệm nhà phát triển.
11. Nokia tung N97, N8 và các nỗ lực cải tiến.
12. Khó khăn tổ chức và cạnh tranh nội bộ.
13. Đối thủ tăng tốc.
14. Stephen Elop trở thành CEO năm 2010.
15. Thông điệp Burning Platform năm 2011.
16. Câu hỏi vì sao Nokia phải đổi nền tảng — Mỹ Duyên.
17. Hợp tác chiến lược với Microsoft.
18. Symbian và MeeGo rời khỏi vị trí trung tâm.
19. Lumia ra mắt.
20. Windows Phone thiếu ứng dụng và quy mô hệ sinh thái.
21. Thị phần và vị thế Nokia suy giảm.
22. Thương vụ Microsoft được công bố năm 2013.
23. Thương vụ hoàn tất tháng 4 năm 2014.
24. Nokia tiếp tục tồn tại ngoài mảng điện thoại di động.
25. Nhìn lại các nguyên nhân tích tụ, không quy kết cho một cá nhân hay quyết định duy nhất.
26. Kết: nguy hiểm nhất là không nhận ra thế giới đã thay đổi.

## Nguyên tắc kiểm chứng
- Không nói Nokia bán toàn bộ công ty cho Microsoft. Thương vụ là mảng Devices & Services, hoàn tất tháng 4/2014.
- Số liệu 437 triệu thiết bị và 38% thị phần năm 2007 phải dẫn nguồn báo cáo Nokia và ghi rõ là số liệu hãng công bố.
- Không giải thích thất bại chỉ bằng một nguyên nhân. Cần cân bằng vấn đề Symbian, tổ chức, lựa chọn nền tảng, hệ sinh thái ứng dụng và sức cạnh tranh của iOS/Android.
- Hài hước ở cách kể, không chế giễu người lao động hay người dùng.

## Nguồn nền tảng cho bản full
- Nokia annual results 2007.
- Nokia / Microsoft announcement, 3 September 2013.
- Nokia announcement of completion, 25 April 2014.
- INSEAD research on Nokia's platform transition and strategic decisions.
- Các báo cáo nghiên cứu độc lập về Symbian, Windows Phone và hệ sinh thái ứng dụng.
