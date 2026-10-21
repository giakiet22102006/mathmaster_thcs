-- ==============================================================================
-- MathMaster THCS - Bước 2.6: Tách dữ liệu biến động khỏi JSONB mm_cloud_state
-- (sessions, attempts, topicMastery, reviewQueue) sang các bảng quan hệ riêng.
--
-- AN TOÀN: chỉ THÊM bảng/chỉ mục mới (IF NOT EXISTS), chạy lại được nhiều lần,
-- KHÔNG sửa/xoá bảng hay dữ liệu hiện có. Việc chuyển dữ liệu thực hiện riêng bằng
-- scripts/migrate-hot-collections.mjs (có snapshot sao lưu + đối chiếu + rollback).
-- Ứng dụng chỉ chuyển sang chế độ tách khi mm_state_meta.migrated_at được ghi nhận.
-- ==============================================================================

-- Bảo đảm bảng JSONB gốc tồn tại (ứng dụng vẫn tự tạo, đây chỉ là dự phòng)
CREATE TABLE IF NOT EXISTS "mm_cloud_state" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "mm_cloud_state_pkey" PRIMARY KEY ("id")
);

-- Siêu dữ liệu chế độ lưu trữ & phiên bản các bảng dữ liệu biến động
CREATE TABLE IF NOT EXISTS "mm_state_meta" (
    "id" TEXT NOT NULL,
    "migrated_at" TIMESTAMPTZ,
    "rows_version" BIGINT NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "mm_state_meta_pkey" PRIMARY KEY ("id")
);

-- Snapshot sao lưu toàn bộ payload trước mỗi lần chuyển đổi / quay lui
CREATE TABLE IF NOT EXISTS "mm_state_backups" (
    "id" BIGSERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "mm_state_backups_pkey" PRIMARY KEY ("id")
);

-- Phiên đăng nhập theo thiết bị
CREATE TABLE IF NOT EXISTS "mm_user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ,
    "revoked_at" TIMESTAMPTZ,
    "ord" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "mm_user_sessions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "mm_user_sessions_user_id_revoked_at_expires_at_idx"
  ON "mm_user_sessions"("user_id", "revoked_at", "expires_at");

-- Lượt làm bài
CREATE TABLE IF NOT EXISTS "mm_exam_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exam_id" TEXT,
    "status" TEXT,
    "ord" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "mm_exam_attempts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "mm_exam_attempts_user_id_status_idx"
  ON "mm_exam_attempts"("user_id", "status");
CREATE INDEX IF NOT EXISTS "mm_exam_attempts_exam_id_idx"
  ON "mm_exam_attempts"("exam_id");

-- Mức độ thành thạo theo chủ đề
CREATE TABLE IF NOT EXISTS "mm_topic_mastery" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ord" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "mm_topic_mastery_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "mm_topic_mastery_user_id_idx"
  ON "mm_topic_mastery"("user_id");

-- Sổ tay lỗi sai / lịch ôn tập SM-2
CREATE TABLE IF NOT EXISTS "mm_review_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_id" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "next_review_at" TIMESTAMPTZ,
    "ord" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "mm_review_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "mm_review_items_user_id_resolved_next_review_at_idx"
  ON "mm_review_items"("user_id", "resolved", "next_review_at");
