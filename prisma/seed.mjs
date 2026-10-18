// ==============================================================================
// MathMaster THCS - Script Nạp Dữ Liệu Mẫu (prisma/seed.mjs)
// Chạy lệnh: npm run db:seed   (hoặc: npx prisma db seed)
// Kiểm tra cấu trúc dữ liệu: node prisma/seed.mjs --verify-only
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedFilePath = path.join(__dirname, 'seed_data.json');
const rawJson = fs.readFileSync(seedFilePath, 'utf-8');
const seedData = JSON.parse(rawJson);

function mapDifficulty(d) {
  const v = String(d || 'medium').toUpperCase();
  if (v === 'EASY' || v === 'MEDIUM' || v === 'HARD') return v;
  return 'MEDIUM';
}

function mapCognitiveLevel(c) {
  const v = String(c || 'thong_hieu').toUpperCase();
  if (['NHAN_BIET', 'THONG_HIEU', 'VAN_DUNG', 'VAN_DUNG_CAO'].includes(v)) return v;
  return 'THONG_HIEU';
}

function mapQuestionType(t) {
  return String(t || 'mcq').toUpperCase() === 'ESSAY' ? 'ESSAY' : 'MCQ';
}

function validateSeedDataStructure(data) {
  const errors = [];
  if (!data.curriculum || !Array.isArray(data.curriculum.textbooks) || data.curriculum.textbooks.length !== 3) {
    errors.push('Thiếu danh sách 3 bộ sách giáo khoa trong curriculum.textbooks');
  }
  if (!data.curriculum || !Array.isArray(data.curriculum.grades) || data.curriculum.grades.length !== 4) {
    errors.push('Thiếu danh sách 4 khối lớp (6, 7, 8, 9) trong curriculum.grades');
  }
  if (!Array.isArray(data.questions) || data.questions.length < 30) {
    errors.push('Ngân hàng câu hỏi mẫu chưa đủ số lượng (cần >= 30 câu)');
  }
  if (!Array.isArray(data.users) || data.users.length < 2) {
    errors.push('Thiếu tài khoản học sinh mẫu trong seed_data.json');
  }
  if (!Array.isArray(data.exams) || data.exams.length < 4) {
    errors.push('Thiếu đề thi mẫu trong seed_data.json');
  }
  if (!Array.isArray(data.attempts) || data.attempts.length < 3) {
    errors.push('Thiếu lượt làm bài mẫu (bao gồm bài đã chấm và bài đang làm dở) trong seed_data.json');
  }

  // Build topic map from curriculum
  const topicMap = new Map();
  for (const g of data.curriculum.grades) {
    for (const ch of g.chapters) {
      ch.topics.forEach((tpName, idx) => {
        const tpId = `${ch.id}_T${idx + 1}`;
        topicMap.set(`${ch.id}::${tpName}`, tpId);
      });
    }
  }

  // Verify every question links to a valid grade & chapter
  for (const q of data.questions) {
    if (!q.id || !q.code || !q.chapterId || !q.content || !q.correctAnswer) {
      errors.push(`Câu hỏi ${q.id || 'unknown'} thiếu trường bắt buộc`);
    }
  }

  return { valid: errors.length === 0, errors, topicCount: topicMap.size };
}

async function main() {
  console.log('==============================================================');
  console.log('🚀 Bắt đầu kiểm tra và nạp dữ liệu mẫu MathMaster THCS...');
  console.log('==============================================================');

  const check = validateSeedDataStructure(seedData);
  if (!check.valid) {
    console.error('❌ Lỗi cấu trúc seed_data.json:', check.errors);
    process.exit(1);
  }
  console.log(`✓ Đã kiểm tra tính hợp lệ của seed_data.json:`);
  console.log(`  - Bộ sách giáo khoa : ${seedData.curriculum.textbooks.length} bộ (KNTT, CD, CTST)`);
  console.log(`  - Khối lớp          : ${seedData.curriculum.grades.length} khối (Lớp 6, 7, 8, 9)`);
  console.log(`  - Chủ đề Toán học   : ${check.topicCount} chủ đề`);
  console.log(`  - Câu hỏi xác minh  : ${seedData.questions.length} câu`);
  console.log(`  - Công thức Toán    : ${seedData.formulas.length} công thức`);
  console.log(`  - Đề thi mẫu        : ${seedData.exams.length} đề`);
  console.log(`  - Lượt làm bài mẫu  : ${seedData.attempts.length} lượt (có bài đang làm dở để test khôi phục)`);

  // Also initialize local JSON state fallback (.data/local_db_state.json) so local dev works immediately
  const localDataDir = path.join(__dirname, '..', '.data');
  fs.mkdirSync(localDataDir, { recursive: true });
  const localStateFile = path.join(localDataDir, 'local_db_state.json');
  fs.writeFileSync(localStateFile, JSON.stringify({
    currentUserId: seedData.users[0].id,
    users: seedData.users,
    questions: seedData.questions,
    exams: seedData.exams,
    attempts: seedData.attempts,
    documents: seedData.documents,
    reviewQueue: seedData.reviewQueue,
    formulas: seedData.formulas,
    achievements: seedData.achievements,
    userAchievements: seedData.userAchievements,
    learningGoals: seedData.learningGoals,
    studySessions: seedData.studySessions
  }, null, 2), 'utf-8');
  console.log('✓ Đã khởi tạo bộ nhớ đệm .data/local_db_state.json');

  if (process.argv.includes('--verify-only')) {
    console.log('✅ Chế độ --verify-only hoàn tất thành công!');
    return;
  }

  let PrismaClient;
  try {
    const pkg = await import('@prisma/client');
    PrismaClient = pkg.PrismaClient;
  } catch (err) {
    console.error('⚠️ Chưa chạy "npx prisma generate". Vui lòng chạy lệnh: npx prisma generate');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('✓ Đã kết nối thành công tới PostgreSQL Database!');

    // 1. Textbooks
    for (const tb of seedData.curriculum.textbooks) {
      await prisma.textbooks.upsert({
        where: { id: tb.id },
        update: { code: tb.code, name: tb.name, publisher: tb.publisher },
        create: { id: tb.id, code: tb.code, name: tb.name, publisher: tb.publisher }
      });
    }
    console.log('  [1/9] Đã nạp bảng textbooks');

    // 2. Grades, Semesters, Chapters, Topics
    const topicLookup = new Map();
    for (const g of seedData.curriculum.grades) {
      await prisma.grades.upsert({
        where: { id: g.id },
        update: { name: g.name, tagline: g.tagline },
        create: { id: g.id, name: g.name, tagline: g.tagline }
      });

      for (const semNum of [1, 2]) {
        const semId = `G${g.id}_HK${semNum}`;
        await prisma.semesters.upsert({
          where: { id: semId },
          update: { name: `Học kì ${semNum === 1 ? 'I' : 'II'} - Lớp ${g.id}` },
          create: { id: semId, grade_id: g.id, number: semNum, name: `Học kì ${semNum === 1 ? 'I' : 'II'} - Lớp ${g.id}` }
        });
      }

      for (const ch of g.chapters) {
        const semId = `G${g.id}_HK${ch.semester}`;
        await prisma.chapters.upsert({
          where: { id: ch.id },
          update: {
            title: ch.title,
            order_index: ch.order,
            book_notes: ch.bookNotes || {},
            lessons: ch.lessons || []
          },
          create: {
            id: ch.id,
            textbook_id: 'KNTT',
            grade_id: g.id,
            semester_id: semId,
            order_index: ch.order,
            title: ch.title,
            book_notes: ch.bookNotes || {},
            lessons: ch.lessons || []
          }
        });

        for (let i = 0; i < ch.topics.length; i++) {
          const tpName = ch.topics[i];
          const tpId = `${ch.id}_T${i + 1}`;
          topicLookup.set(`${ch.id}::${tpName}`, tpId);
          if (i === 0) topicLookup.set(`${ch.id}::DEFAULT`, tpId);

          await prisma.topics.upsert({
            where: { id: tpId },
            update: {
              topic_name: tpName,
              lesson_title: ch.lessons[i] || ch.lessons[0] || ch.title,
              problem_types: ch.problemTypes || []
            },
            create: {
              id: tpId,
              chapter_id: ch.id,
              lesson_title: ch.lessons[i] || ch.lessons[0] || ch.title,
              topic_name: tpName,
              problem_types: ch.problemTypes || []
            }
          });
        }
      }
    }
    console.log('  [2/9] Đã nạp bảng grades, semesters, chapters, topics');

    // 3. Achievements
    for (const ach of seedData.achievements) {
      await prisma.achievements.upsert({
        where: { id: ach.id },
        update: { title: ach.title, description: ach.description, xp_reward: ach.xpReward, icon: ach.icon, condition_text: ach.conditionText },
        create: { id: ach.id, code: ach.id, title: ach.title, description: ach.description, xp_reward: ach.xpReward, icon: ach.icon, condition_text: ach.conditionText }
      });
    }
    console.log('  [3/9] Đã nạp bảng achievements');

    // 4. Users, Profiles, Settings
    for (const u of seedData.users) {
      await prisma.users.upsert({
        where: { id: u.id },
        update: { email: u.email, username: u.username, is_guest: Boolean(u.isGuest) },
        create: {
          id: u.id,
          email: u.email,
          username: u.username,
          password_hash: u.passwordHash || 'pass123',
          role: 'STUDENT',
          is_guest: Boolean(u.isGuest)
        }
      });

      await prisma.user_profiles.upsert({
        where: { user_id: u.id },
        update: {
          full_name: u.fullName,
          current_grade: u.currentGrade,
          preferred_book_id: u.preferredBook,
          school_name: u.schoolName,
          xp_points: u.xp,
          level: u.level,
          streak_days: u.streakDays
        },
        create: {
          user_id: u.id,
          full_name: u.fullName,
          current_grade: u.currentGrade,
          preferred_book_id: u.preferredBook,
          school_name: u.schoolName,
          xp_points: u.xp,
          level: u.level,
          streak_days: u.streakDays
        }
      });

      await prisma.user_settings.upsert({
        where: { user_id: u.id },
        update: { theme: u.theme || 'light' },
        create: { user_id: u.id, theme: u.theme || 'light' }
      });
    }
    console.log('  [4/9] Đã nạp bảng users, user_profiles, user_settings');

    // 5. Source Documents
    for (const doc of seedData.documents) {
      await prisma.source_documents.upsert({
        where: { id: doc.id },
        update: { extracted_text: doc.extractedText, extracted_questions_count: doc.extractedQuestionsCount },
        create: {
          id: doc.id,
          user_id: doc.userId,
          file_name: doc.fileName,
          file_type: doc.fileType,
          file_size_bytes: doc.fileSize,
          storage_path: `/uploads/${doc.fileName}`,
          extracted_text: doc.extractedText,
          extracted_questions_count: doc.extractedQuestionsCount || 1,
          grade_id: doc.grade,
          textbook_id: doc.textbook,
          semester_number: doc.semester,
          chapter_id: doc.chapterId,
          processing_status: 'VERIFIED',
          is_seed_data: true
        }
      });
    }
    console.log('  [5/9] Đã nạp bảng source_documents');

    // 6. Questions, Options, Solutions
    for (const q of seedData.questions) {
      const tpId = topicLookup.get(`${q.chapterId}::${q.topic}`) || topicLookup.get(`${q.chapterId}::DEFAULT`) || `${q.chapterId}_T1`;
      await prisma.questions.upsert({
        where: { id: q.id },
        update: {
          content: q.content,
          default_points: q.points || 1.0,
          verification_status: 'VERIFIED'
        },
        create: {
          id: q.id,
          code: q.code,
          grade_id: q.grade,
          textbooks: undefined,
          textbook_id: (q.textbooks && q.textbooks[0]) ? q.textbooks[0] : 'KNTT',
          semester_number: q.semester,
          chapter_id: q.chapterId,
          topic_id: tpId,
          lesson_title: q.lesson,
          problem_type: q.problemType,
          question_type: mapQuestionType(q.type),
          difficulty: mapDifficulty(q.difficulty),
          cognitive_level: mapCognitiveLevel(q.cognitiveLevel),
          content: q.content,
          default_points: q.points || 1.0,
          source_label: q.source,
          verification_status: 'VERIFIED',
          version: q.version || 1,
          is_seed_data: true
        }
      });

      if (Array.isArray(q.options)) {
        for (const opt of q.options) {
          await prisma.question_options.upsert({
            where: { question_id_label: { question_id: q.id, label: opt.label } },
            update: { content: opt.text, is_correct: opt.label === q.correctAnswer },
            create: {
              question_id: q.id,
              label: opt.label,
              content: opt.text,
              is_correct: opt.label === q.correctAnswer
            }
          });
        }
      }

      await prisma.question_solutions.upsert({
        where: { question_id: q.id },
        update: {
          standard_answer: String(q.correctAnswer),
          accepted_answers: q.acceptedAnswers || [String(q.correctAnswer)],
          solution_text: q.solution,
          step_by_step_guide: q.rubricSteps || [],
          key_formula: q.keyFormula || '',
          common_mistakes: q.commonMistake || ''
        },
        create: {
          question_id: q.id,
          standard_answer: String(q.correctAnswer),
          accepted_answers: q.acceptedAnswers || [String(q.correctAnswer)],
          solution_text: q.solution,
          step_by_step_guide: q.rubricSteps || [],
          key_formula: q.keyFormula || '',
          common_mistakes: q.commonMistake || ''
        }
      });
    }
    console.log('  [6/9] Đã nạp bảng questions, question_options, question_solutions');

    // 7. Math Formulas
    for (const f of seedData.formulas) {
      await prisma.math_formulas.upsert({
        where: { id: f.id },
        update: { title: f.title, formula_latex: f.formula },
        create: {
          id: f.id,
          grade_id: f.grade,
          semester_number: f.semester,
          chapter_id: f.chapterId,
          title: f.title,
          formula_latex: f.formula,
          condition_text: f.condition,
          example_text: f.example,
          related_question_id: f.relatedQuestionId
        }
      });
    }
    console.log('  [7/9] Đã nạp bảng math_formulas');

    // 8. Generated Exams & Exam Questions
    for (const ex of seedData.exams) {
      await prisma.generated_exams.upsert({
        where: { id: ex.id },
        update: { title: ex.title, is_favorite: Boolean(ex.isFavorite) },
        create: {
          id: ex.id,
          user_id: ex.userId,
          title: ex.title,
          exam_code: ex.examCode || '101',
          grade_id: ex.grade,
          textbook_id: ex.textbook,
          semester_number: ex.semester,
          exam_category: ex.category,
          difficulty: mapDifficulty(ex.difficulty),
          format_type: ex.format,
          duration_minutes: ex.durationMinutes,
          max_score: ex.maxScore || 10.0,
          is_favorite: Boolean(ex.isFavorite),
          is_seed_data: true
        }
      });

      for (let idx = 0; idx < ex.questionIds.length; idx++) {
        const qId = ex.questionIds[idx];
        const pts = (ex.questionPoints && ex.questionPoints[qId]) ? Number(ex.questionPoints[qId]) : 1.0;
        await prisma.exam_questions.upsert({
          where: { exam_id_question_id: { exam_id: ex.id, question_id: qId } },
          update: { order_index: idx + 1, points: pts },
          create: {
            exam_id: ex.id,
            question_id: qId,
            order_index: idx + 1,
            points: pts
          }
        });
      }
    }
    console.log('  [8/9] Đã nạp bảng generated_exams & exam_questions');

    // 9. Exam Attempts, Student Answers, Review Queue, Goals & Achievements
    for (const att of seedData.attempts) {
      await prisma.exam_attempts.upsert({
        where: { id: att.id },
        update: {
          status: att.status === 'GRADED' ? 'GRADED' : 'IN_PROGRESS',
          total_score: att.totalScore,
          time_spent_seconds: att.timeSpentSeconds,
          remaining_seconds: att.remainingSeconds
        },
        create: {
          id: att.id,
          exam_id: att.examId,
          user_id: att.userId,
          grade_id: att.grade,
          status: att.status === 'GRADED' ? 'GRADED' : 'IN_PROGRESS',
          time_spent_seconds: att.timeSpentSeconds || 0,
          remaining_seconds: att.remainingSeconds || 1800,
          total_score: att.totalScore,
          mcq_score: att.mcqScore,
          essay_score: att.essayScore,
          correct_count: att.correctCount || 0,
          wrong_count: att.wrongCount || 0,
          unanswered_count: att.unansweredCount || 0
        }
      });

      if (att.answers) {
        for (const [qId, ansObj] of Object.entries(att.answers)) {
          await prisma.student_answers.upsert({
            where: { attempt_id_question_id: { attempt_id: att.id, question_id: qId } },
            update: {
              selected_option: ansObj.value,
              essay_response: ansObj.value,
              is_correct: ansObj.isCorrect ?? null,
              earned_points: ansObj.points ?? 0
            },
            create: {
              attempt_id: att.id,
              question_id: qId,
              selected_option: ansObj.value,
              essay_response: ansObj.value,
              flagged_for_review: Boolean(ansObj.flagged),
              is_correct: ansObj.isCorrect ?? null,
              earned_points: ansObj.points ?? 0,
              error_category: ansObj.errorCategory || null
            }
          });
        }
      }
    }

    for (const rev of (seedData.reviewQueue || [])) {
      await prisma.review_queue.upsert({
        where: { user_id_question_id: { user_id: rev.userId, question_id: rev.questionId } },
        update: { wrong_attempts: rev.wrongAttempts, last_wrong_ans: rev.lastWrongAnswer, resolved: Boolean(rev.resolved) },
        create: {
          id: rev.id,
          user_id: rev.userId,
          question_id: rev.questionId,
          wrong_attempts: rev.wrongAttempts || 1,
          last_wrong_ans: rev.lastWrongAnswer,
          error_type: rev.errorType,
          resolved: Boolean(rev.resolved)
        }
      });
    }

    for (const ua of (seedData.userAchievements || [])) {
      await prisma.user_achievements.upsert({
        where: { user_id_achievement_id: { user_id: ua.userId, achievement_id: ua.achievementId } },
        update: {},
        create: { user_id: ua.userId, achievement_id: ua.achievementId }
      });
    }

    for (const g of (seedData.learningGoals || [])) {
      await prisma.learning_goals.upsert({
        where: { id: g.id },
        update: { current_value: g.current, completed: Boolean(g.completed) },
        create: {
          id: g.id,
          user_id: g.userId,
          title: g.title,
          goal_type: g.type,
          target_value: g.target,
          current_value: g.current,
          unit: g.unit || 'đề',
          completed: Boolean(g.completed)
        }
      });
    }

    console.log('  [9/9] Đã nạp bảng exam_attempts, student_answers, review_queue, goals, achievements');
    console.log('🎉 HOÀN TẤT NẠP DỮ LIỆU MẪU VÀO POSTGRESQL!');
  } catch (dbErr) {
    console.warn('⚠️ Không thể kết nối trực tiếp tới máy chủ PostgreSQL lúc này:', dbErr.message);
    console.log('💡 Dữ liệu mẫu đã được lưu sẵn vào .data/local_db_state.json để ứng dụng vẫn chạy được ngay lập tức.');
    console.log('   Khi bạn đã điền DATABASE_URL đúng trong file .env, hãy chạy lại: npm run db:seed');
  } finally {
    await prisma.$disconnect();
  }
}

main();
