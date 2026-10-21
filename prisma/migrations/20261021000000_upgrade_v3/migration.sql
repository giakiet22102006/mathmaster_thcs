-- ==============================================================================
-- MathMaster THCS - Migration nâng cấp Giai đoạn 1, 2, 3 (Không làm mất dữ liệu)
-- ==============================================================================

-- 1. Bổ sung giá trị Enum mới an toàn
ALTER TYPE "Difficulty" ADD VALUE IF NOT EXISTS 'VERY_HARD';
ALTER TYPE "VerificationStatus" ADD VALUE IF NOT EXISTS 'DRAFT';

-- 2. Bổ sung các cột bảo mật và cá nhân hoá vào bảng "users"
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "must_change_password" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "password_updated_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "failed_login_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "locked_until" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "anonymous_leaderboard" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "favorite_question_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "onboarding_completed" BOOLEAN NOT NULL DEFAULT false;

-- 3. Tạo bảng "sessions" lưu phiên đăng nhập theo từng thiết bị
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_name" TEXT NOT NULL DEFAULT 'Trình duyệt Web',
    "user_agent" TEXT,
    "ip_address" TEXT,
    "remember_me" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id");

DO $$ BEGIN
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4. Tạo bảng "password_reset_tokens" cho chức năng quên mật khẩu
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

DO $$ BEGIN
  ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5. Bổ sung cột cho bảng "questions" (textbooks, empirical_difficulty, template_id...)
ALTER TABLE "questions"
  ADD COLUMN IF NOT EXISTS "textbooks" TEXT[] NOT NULL DEFAULT ARRAY['KNTT', 'CD', 'CTST']::TEXT[],
  ADD COLUMN IF NOT EXISTS "empirical_difficulty" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "attempt_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "correct_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "template_id" TEXT;

-- 6. Bổ sung cột cho bảng "generated_exams" (seed, chapter_ids, matrix_config, composition)
ALTER TABLE "generated_exams"
  ADD COLUMN IF NOT EXISTS "seed" INTEGER,
  ADD COLUMN IF NOT EXISTS "chapter_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "matrix_config" JSONB,
  ADD COLUMN IF NOT EXISTS "composition" JSONB;

-- 7. Bổ sung cột thuật toán ôn tập ngắt quãng SM-2 cho bảng "review_queue"
ALTER TABLE "review_queue"
  ADD COLUMN IF NOT EXISTS "ease_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS "interval_days" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "repetitions" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "next_review_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "last_reviewed_at" TIMESTAMP(3);

-- 8. Tạo các bảng quản lý Lớp học cho Giáo viên (classrooms, classroom_members, classroom_assignments)
CREATE TABLE IF NOT EXISTS "classrooms" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade_id" INTEGER NOT NULL,
    "join_code" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "classrooms_join_code_key" ON "classrooms"("join_code");

CREATE TABLE IF NOT EXISTS "classroom_members" (
    "id" TEXT NOT NULL,
    "classroom_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classroom_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "classroom_members_classroom_id_student_id_key" ON "classroom_members"("classroom_id", "student_id");

CREATE TABLE IF NOT EXISTS "classroom_assignments" (
    "id" TEXT NOT NULL,
    "classroom_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classroom_assignments_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "classroom_members" ADD CONSTRAINT "classroom_members_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "classroom_members" ADD CONSTRAINT "classroom_members_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "classroom_assignments" ADD CONSTRAINT "classroom_assignments_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "classroom_assignments" ADD CONSTRAINT "classroom_assignments_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "generated_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
