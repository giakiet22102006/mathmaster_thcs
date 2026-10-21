-- ==============================================================================
-- MathMaster THCS - Migration Bổ Sung Composite Indexes Tối Ưu Tốc Độ Truy Vấn
-- An toàn, chạy lại được nhiều lần (Idempotent - IF NOT EXISTS), không mất dữ liệu
-- ==============================================================================

-- 1. Index cho bảng phiên đăng nhập thiết bị (kiểm tra phiên hoạt động của người dùng)
CREATE INDEX IF NOT EXISTS "sessions_user_id_revoked_at_expires_at_idx"
  ON "sessions"("user_id", "revoked_at", "expires_at");

-- 2. Index cho ngân hàng câu hỏi (lọc theo khối lớp, trạng thái duyệt, mức nhận thức, học kỳ & chương)
CREATE INDEX IF NOT EXISTS "questions_grade_id_verification_status_cognitive_level_seme_idx"
  ON "questions"("grade_id", "verification_status", "cognitive_level", "semester_number");

CREATE INDEX IF NOT EXISTS "questions_chapter_id_verification_status_difficulty_idx"
  ON "questions"("chapter_id", "verification_status", "difficulty");

-- 3. Index cho đề thi (tải danh sách đề của học sinh sắp xếp theo ngày tạo & đề mẫu theo khối)
CREATE INDEX IF NOT EXISTS "generated_exams_user_id_created_at_idx"
  ON "generated_exams"("user_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "generated_exams_grade_id_is_seed_data_idx"
  ON "generated_exams"("grade_id", "is_seed_data");

-- 4. Index cho lượt làm bài thi (tải lịch sử & tìm bài đang làm dở IN_PROGRESS)
CREATE INDEX IF NOT EXISTS "exam_attempts_user_id_status_started_at_idx"
  ON "exam_attempts"("user_id", "status", "started_at" DESC);

CREATE INDEX IF NOT EXISTS "exam_attempts_exam_id_user_id_idx"
  ON "exam_attempts"("exam_id", "user_id");

-- 5. Index cho câu trả lời của học sinh (thống kê độ khó thực nghiệm & câu sai nhiều nhất lớp)
CREATE INDEX IF NOT EXISTS "student_answers_question_id_is_correct_idx"
  ON "student_answers"("question_id", "is_correct");

-- 6. Index cho sổ tay lỗi sai & lịch ôn tập ngắt quãng SM-2
CREATE INDEX IF NOT EXISTS "review_queue_user_id_resolved_next_review_at_idx"
  ON "review_queue"("user_id", "resolved", "next_review_at");
