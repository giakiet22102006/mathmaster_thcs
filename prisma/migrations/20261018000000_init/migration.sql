-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'PARENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "CognitiveLevel" AS ENUM ('NHAN_BIET', 'THONG_HIEU', 'VAN_DUNG', 'VAN_DUNG_CAO');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'ESSAY');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('VERIFIED', 'PENDING_REVIEW', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'EXTRACTED', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'GRADED');

-- CreateEnum
CREATE TYPE "MasteryLevel" AS ENUM ('INSUFFICIENT_DATA', 'NEEDS_WORK', 'PROGRESSING', 'MASTERED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "is_guest" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "current_grade" INTEGER NOT NULL DEFAULT 8,
    "preferred_book_id" TEXT NOT NULL DEFAULT 'KNTT',
    "school_name" TEXT,
    "xp_points" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "last_study_date" TIMESTAMP(3),

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "auto_save_interval" INTEGER NOT NULL DEFAULT 10,
    "daily_goal_minutes" INTEGER NOT NULL DEFAULT 30,
    "weekly_exam_target" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "textbooks" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,

    CONSTRAINT "textbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semesters" (
    "id" TEXT NOT NULL,
    "grade_id" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "textbook_id" TEXT NOT NULL,
    "grade_id" INTEGER NOT NULL,
    "semester_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "book_notes" JSONB,
    "lessons" TEXT[],

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "lesson_title" TEXT NOT NULL,
    "topic_name" TEXT NOT NULL,
    "problem_types" TEXT[],

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "storage_path" TEXT NOT NULL,
    "extracted_text" TEXT,
    "extracted_questions_count" INTEGER NOT NULL DEFAULT 0,
    "grade_id" INTEGER NOT NULL,
    "textbook_id" TEXT NOT NULL,
    "semester_number" INTEGER NOT NULL,
    "chapter_id" TEXT,
    "processing_status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "is_seed_data" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "grade_id" INTEGER NOT NULL,
    "textbook_id" TEXT NOT NULL,
    "semester_number" INTEGER NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "lesson_title" TEXT,
    "problem_type" TEXT NOT NULL,
    "question_type" "QuestionType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "cognitive_level" "CognitiveLevel" NOT NULL,
    "content" TEXT NOT NULL,
    "default_points" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "source_doc_id" TEXT,
    "source_label" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'VERIFIED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_seed_data" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_solutions" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "standard_answer" TEXT NOT NULL,
    "accepted_answers" TEXT[],
    "solution_text" TEXT NOT NULL,
    "step_by_step_guide" JSONB NOT NULL,
    "key_formula" TEXT,
    "common_mistakes" TEXT,

    CONSTRAINT "question_solutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "math_formulas" (
    "id" TEXT NOT NULL,
    "grade_id" INTEGER NOT NULL,
    "semester_number" INTEGER NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "formula_latex" TEXT NOT NULL,
    "condition_text" TEXT,
    "example_text" TEXT,
    "related_question_id" TEXT,

    CONSTRAINT "math_formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_exams" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "exam_code" TEXT NOT NULL DEFAULT '101',
    "grade_id" INTEGER NOT NULL,
    "textbook_id" TEXT NOT NULL,
    "semester_number" INTEGER NOT NULL,
    "exam_category" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "format_type" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "max_score" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "is_seed_data" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_questions" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "grade_id" INTEGER NOT NULL DEFAULT 8,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "remaining_seconds" INTEGER NOT NULL,
    "total_score" DOUBLE PRECISION,
    "mcq_score" DOUBLE PRECISION,
    "essay_score" DOUBLE PRECISION,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "wrong_count" INTEGER NOT NULL DEFAULT 0,
    "unanswered_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_answers" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option" TEXT,
    "essay_response" TEXT,
    "workings_text" TEXT,
    "flagged_for_review" BOOLEAN NOT NULL DEFAULT false,
    "is_correct" BOOLEAN,
    "earned_points" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "error_category" TEXT,
    "matched_reason" TEXT,
    "ai_estimated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "student_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_results" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "total_score" DOUBLE PRECISION NOT NULL,
    "mcq_score" DOUBLE PRECISION NOT NULL,
    "essay_score" DOUBLE PRECISION NOT NULL,
    "accuracy_percent" DOUBLE PRECISION NOT NULL,
    "weak_topics_summary" TEXT[],
    "graded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grading_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_mastery" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "grade_id" INTEGER NOT NULL,
    "topic_id" TEXT NOT NULL,
    "questions_done" INTEGER NOT NULL DEFAULT 0,
    "questions_right" INTEGER NOT NULL DEFAULT 0,
    "accuracy_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mastery_level" "MasteryLevel" NOT NULL DEFAULT 'INSUFFICIENT_DATA',

    CONSTRAINT "topic_mastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_queue" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "wrong_attempts" INTEGER NOT NULL DEFAULT 1,
    "last_wrong_ans" TEXT,
    "error_type" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "grade_id" INTEGER NOT NULL,
    "activity_type" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "session_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'award',
    "condition_text" TEXT,
    "xp_reward" INTEGER NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "goal_type" TEXT NOT NULL,
    "target_value" INTEGER NOT NULL,
    "current_value" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'đề',
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "learning_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");
CREATE UNIQUE INDEX "textbooks_code_key" ON "textbooks"("code");
CREATE UNIQUE INDEX "semesters_grade_id_number_key" ON "semesters"("grade_id", "number");
CREATE UNIQUE INDEX "questions_code_key" ON "questions"("code");
CREATE UNIQUE INDEX "question_options_question_id_label_key" ON "question_options"("question_id", "label");
CREATE UNIQUE INDEX "question_solutions_question_id_key" ON "question_solutions"("question_id");
CREATE UNIQUE INDEX "exam_questions_exam_id_question_id_key" ON "exam_questions"("exam_id", "question_id");
CREATE UNIQUE INDEX "student_answers_attempt_id_question_id_key" ON "student_answers"("attempt_id", "question_id");
CREATE UNIQUE INDEX "grading_results_attempt_id_key" ON "grading_results"("attempt_id");
CREATE UNIQUE INDEX "topic_mastery_user_id_topic_id_key" ON "topic_mastery"("user_id", "topic_id");
CREATE UNIQUE INDEX "review_queue_user_id_question_id_key" ON "review_queue"("user_id", "question_id");
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_textbook_id_fkey" FOREIGN KEY ("textbook_id") REFERENCES "textbooks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "topics" ADD CONSTRAINT "topics_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "source_documents" ADD CONSTRAINT "source_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_textbook_id_fkey" FOREIGN KEY ("textbook_id") REFERENCES "textbooks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_source_doc_id_fkey" FOREIGN KEY ("source_doc_id") REFERENCES "source_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "question_solutions" ADD CONSTRAINT "question_solutions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "math_formulas" ADD CONSTRAINT "math_formulas_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "math_formulas" ADD CONSTRAINT "math_formulas_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "generated_exams" ADD CONSTRAINT "generated_exams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "generated_exams" ADD CONSTRAINT "generated_exams_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "generated_exams" ADD CONSTRAINT "generated_exams_textbook_id_fkey" FOREIGN KEY ("textbook_id") REFERENCES "textbooks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "generated_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "generated_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "grading_results" ADD CONSTRAINT "grading_results_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "topic_mastery" ADD CONSTRAINT "topic_mastery_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "topic_mastery" ADD CONSTRAINT "topic_mastery_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_queue" ADD CONSTRAINT "review_queue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_queue" ADD CONSTRAINT "review_queue_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_goals" ADD CONSTRAINT "learning_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
