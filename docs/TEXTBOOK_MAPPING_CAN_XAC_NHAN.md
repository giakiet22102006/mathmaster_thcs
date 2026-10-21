# BẢNG ĐỐI CHIẾU NỘI DUNG CHƯƠNG TRÌNH 3 BỘ SÁCH GIÁO KHOA TOÁN THCS
## (Kết Nối Tri Thức Với Cuộc Sống • Cánh Diều • Chân Trời Sáng Tạo)

> Tài liệu chuẩn hóa ma trận đối chiếu kiến thức phục vụ **Parametric Question Engine** trong dự án MathMaster THCS theo chuẩn Chương trình Giáo dục phổ thông 2018 (Thông tư 32/2018/TT-BGDĐT) và Thông tư 22/2021/TT-BGDĐT.

---

### 1. NGUYÊN TẮC ÁNH XẠ (MAPPING CONVENTION)

1. **Chuẩn đầu ra cốt lõi chung**: Cả 3 bộ sách (KNTT, CD, CTST) đều tuân thủ 100% yêu cầu cần đạt của Chương trình GDPT 2018. Mọi template câu hỏi trong engine đều nhắm trực tiếp vào chuẩn năng lực cốt lõi này.
2. **Khác biệt về thứ tự dạy học**:
   - Ở một số khối lớp (đặc biệt Lớp 6 và Lớp 8), thứ tự giữa phần *Hình học trực quan / Hình học phẳng* và phần *Thống kê - Xác suất / Phân thức* có thể được sắp xếp đảo kỳ hoặc đảo thứ tự bài trong kỳ giữa các bộ sách.
   - Engine giải quyết triệt để điều này bằng cách gán định danh chương thống nhất (`G{Grade}_C{Chapter}`) tương ứng với nội dung chủ đề, cho phép tra cứu linh hoạt qua `chapterId` và `semester`.
3. **Bối cảnh thực tế đặc trưng của từng bộ sách**:
   - **KNTT**: Ưu tiên ngữ cảnh đời sống thường nhật ở miền Bắc & đồng bằng, ứng dụng công nghệ, số liệu thực tế Việt Nam.
   - **CD**: Ưu tiên ngữ cảnh STEM, khoa học tự nhiên, dự án kỹ thuật, tính toán chi phí thực nghiệm.
   - **CTST**: Ưu tiên ngữ cảnh thiên nhiên, biển đảo, kinh tế nông - lâm - ngư nghiệp, làng nghề truyền thống phương Nam.

---

### 2. MA TRẬN ĐỐI CHIẾU CHI TIẾT THEO 4 KHỐI LỚP

#### 2.1. TOÁN LỚP 6

| Mã chương | Nội dung cốt lõi | KNTT | Cánh Diều | Chân Trời Sáng Tạo | Ghi chú & Đề xuất xác nhận |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **G6_C1** | Tập hợp số tự nhiên, tính chất chia hết, ƯCLN & BCNN | Chương I: Tập hợp các số tự nhiên | Chương I: Số tự nhiên | Chương 1: Số tự nhiên | Đồng nhất 100% về kiến thức và mức độ. |
| **G6_C2** | Số nguyên, quy tắc dấu, phép tính số nguyên | Chương III: Số nguyên | Chương II: Số nguyên | Chương 2: Số nguyên | KNTT xếp sau Hình học phẳng; CD và CTST xếp nối tiếp Đại số. |
| **G6_C3** | Hình học trực quan: Tam giác đều, hình vuông, lục giác đều, hình chữ nhật, hình thoi, hình bình hành, hình thang cân | Chương II: Tính đối xứng của hình phẳng trong tự nhiên | Chương III: Hình học trực quan | Chương 3: Hình học trực quan | Nội dung tương đương, công thức diện tích chu vi chuẩn hóa. |
| **G6_C4** | Phân số và các phép tính phân số | Chương VI: Phân số | Chương V: Phân số và số thập phân | Chương 5: Phân số | Đảm bảo rút gọn tối giản và phân số âm. |
| **G6_C5** | Số thập phân, tỉ số, tỉ số phần trăm | Chương VII: Số thập phân | Chương V: Phân số và số thập phân (Phần 2) | Chương 6: Số thập phân | Bao gồm bài toán tỉ số phần trăm thực tế (mua sắm, giảm giá). |
| **G6_C6** | Hình học phẳng: Điểm, đường thẳng, tia, đoạn thẳng, góc | Chương VIII: Những hình hình học cơ bản | Chương VI: Hình học phẳng | Chương 8: Hình học phẳng | Đo góc, trung điểm đoạn thẳng. |

---

#### 2.2. TOÁN LỚP 7

| Mã chương | Nội dung cốt lõi | KNTT | Cánh Diều | Chân Trời Sáng Tạo | Ghi chú & Đề xuất xác nhận |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **G7_C1** | Số hữu tỉ và các phép tính số hữu tỉ | Chương I: Số hữu tỉ | Chương I: Số hữu tỉ | Chương 1: Số hữu tỉ | Đồng nhất 100%. |
| **G7_C2** | Số thực, căn bậc hai số học, giá trị tuyệt đối | Chương II: Số thực | Chương II: Số thực | Chương 2: Số thực | Bao gồm quy tắc làm tròn và ước lượng. |
| **G7_C3** | Hình khối thực tiễn: Hình hộp chữ nhật, lập phương, lăng trụ đứng tam giác & tứ giác | Chương III: Góc và hai đường thẳng song song (HK1) / Chương X: Một số hình khối | Chương III: Hình học trực quan | Chương 3: Các hình khối trong thực tiễn | Công thức diện tích xung quanh và thể tích lăng trụ đứng. |
| **G7_C4** | Góc và đường thẳng song song, tam giác bằng nhau | Chương IV: Tam giác bằng nhau | Chương IV: Góc. Đường thẳng song song | Chương 4: Góc và đường thẳng song song | Tiên đề Euclid, hai tam giác bằng nhau (c-c-c, c-g-c, g-c-g). |
| **G7_C5** | Thu thập, phân loại và biểu diễn dữ liệu thống kê | Chương V: Thu thập và biểu diễn dữ liệu | Chương V: Một số yếu tố thống kê và xác suất | Chương 5: Một số yếu tố thống kê | Biểu đồ đoạn thẳng, biểu đồ hình quạt tròn. |
| **G7_C6** | Biểu thức đại số và đa thức một biến | Chương VII: Biểu thức đại số và đa thức một biến | Chương VI: Biểu thức đại số | Chương 7: Biểu thức đại số | Cộng, trừ, nhân, chia đa thức 1 biến, nghiệm của đa thức. |

---

#### 2.3. TOÁN LỚP 8

| Mã chương | Nội dung cốt lõi | KNTT | Cánh Diều | Chân Trời Sáng Tạo | Ghi chú & Đề xuất xác nhận |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **G8_C1** | Đa thức nhiều biến và bảy hằng đẳng thức đáng nhớ | Chương I: Đa thức | Chương I: Đa thức nhiều biến | Chương 1: Biểu thức đại số | Phân tích đa thức thành nhân tử; tìm GTNN/GTLN. |
| **G8_C2** | Phân thức đại số và các phép tính | Chương VI: Phân thức đại số | Chương II: Phân thức đại số | Chương 2: Các hình khối trong thực tiễn / Phân thức | ĐKXĐ, rút gọn, bài toán thực tế chuyển động và năng suất. |
| **G8_C3** | Tứ giác và định lí Pythagore | Chương III: Tứ giác | Chương V: Tam giác. Tứ giác | Chương 3: Định lí Pythagore. Tứ giác | Hình chữ nhật, hình thoi, hình vuông, định lí Pythagore đảo. |
| **G8_C4** | Phương trình bậc nhất một ẩn và hàm số bậc nhất | Chương VII: Phương trình bậc nhất và hàm số bậc nhất | Chương III: Hàm số và đồ thị / Chương VII: PT bậc nhất | Chương 5: Hàm số và đồ thị | $y = ax + b$, hệ số góc, giải bài toán bằng cách lập PT. |
| **G8_C5** | Định lí Thalès và tam giác đồng dạng | Chương IV: Định lí Thalès / Chương IX: Tam giác đồng dạng | Chương VIII: Tam giác đồng dạng. Hình đồng dạng | Chương 7: Tam giác đồng dạng | Định lí Thalès thuận, đảo; đường trung bình, phân giác tam giác. |

---

#### 2.4. TOÁN LỚP 9

| Mã chương | Nội dung cốt lõi | KNTT | Cánh Diều | Chân Trời Sáng Tạo | Ghi chú & Đề xuất xác nhận |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **G9_C1** | Phương trình và hệ hai phương trình bậc nhất hai ẩn | Chương I: Phương trình và hệ hai phương trình bậc nhất hai ẩn | Chương I: Phương trình và hệ phương trình bậc nhất | Chương 1: Phương trình và hệ phương trình bậc nhất | Phương pháp thế, cộng đại số; bài toán chuyển động, năng suất, pha trộn. |
| **G9_C2** | Bất đẳng thức, bất phương trình và căn thức bậc hai | Chương II: Bất đẳng thức. Bất phương trình / Chương III: Căn bậc hai | Chương II: Bất đẳng thức. Bất phương trình / Chương III: Căn thức | Chương 2: Bất đẳng thức. Bất phương trình / Chương 3: Căn thức | ĐKXĐ căn thức, trục căn thức, bất đẳng thức Cauchy (AM-GM). |
| **G9_C3** | Hệ thức lượng trong tam giác vuông và đường tròn | Chương IV: Hệ thức lượng trong tam giác vuông / Chương V: Đường tròn | Chương IV: Hệ thức lượng trong tam giác vuông / Chương V: Đường tròn | Chương 4: Hệ thức lượng trong tam giác vuông / Chương 5: Đường tròn | Tỉ số lượng giác (sin, cos, tan, cot), tiếp tuyến đường tròn, bài toán đo góc thực địa. |
| **G9_C4** | Hàm số $y = ax^2$ ($a \neq 0$) và phương trình bậc hai một ẩn | Chương VI: Hàm số $y = ax^2$. Phương trình bậc hai một ẩn | Chương VI: Hàm số $y = ax^2$. Phương trình bậc hai một ẩn | Chương 6: Hàm số $y = ax^2$. Phương trình bậc hai một ẩn | Đồ thị Parabol, định lí Viète ($x_1 + x_2 = -b/a, x_1 x_2 = c/a$), tương giao Parabol và đường thẳng. |
| **G9_C5** | Tứ giác nội tiếp & các hình khối trong không gian | Chương IX: Đường tròn ngoại tiếp và nội tiếp / Chương X: Một số hình khối | Chương VII: Tứ giác nội tiếp / Chương VIII: Một số hình khối | Chương 8: Đường tròn ngoại tiếp và nội tiếp / Chương 9: Hình khối | Góc ở tâm, góc nội tiếp, tứ giác nội tiếp; thể tích hình trụ, nón, cầu. |
| **G9_C6** | Chuyên đề tổng hợp ôn thi tuyển sinh vào Lớp 10 THPT | Chuyên đề ôn tập tổng hợp cuối cấp | Chuyên đề ôn tập tổng hợp cuối cấp | Chuyên đề ôn tập tổng hợp cuối cấp | Rút gọn căn thức có câu hỏi phụ, bài toán thực tế liên môn, Viète tham số nâng cao, cực trị hình học. |

---

### 3. CÁC ĐIỂM CẦN QUYẾT ĐỊNH & XÁC NHẬN TỪ PHÍA GIÁO VIÊN / NGƯỜI DÙNG

1. **Về tên gọi định lí Pythagore**:
   - SGK hiện đại viết chuẩn hóa là *Định lí Pythagore* (hoặc *Py-ta-go* trong một số tài liệu tham khảo cũ). Engine đã cấu hình hỗ trợ cả hai cách viết này trong đáp án chấp nhận (`acceptedAnswers`).
2. **Về hằng số $\pi$ trong các bài toán hình khối**:
   - Khi tạo đề kiểm tra dạng tự luận, hệ thống giữ nguyên biểu thức theo $\pi$ (ví dụ: $36\pi\text{ cm}^3$) để chấm chính xác tuyệt đối; đối với bài toán thực tế có quy đổi lít hoặc mét khối thì dùng xấp xỉ $\pi \approx 3{,}14$.
3. **Mở rộng template mới trong tương lai**:
   - Khi có thêm chuyên đề thi học sinh giỏi cấp Huyện / Tỉnh, cấu trúc template tại `src/lib/question-engine/templates/` cho phép bổ sung thêm các template mức độ `van_dung_cao` mà không ảnh hưởng tới các template đã kiểm định.
