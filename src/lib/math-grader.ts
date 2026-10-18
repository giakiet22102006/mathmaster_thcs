// ==============================================================================
// MathMaster THCS - Bộ Chấm Điểm Toán Học Tương Đương & Sinh Đề Theo Ma Trận
// Dùng chung cho Backend API (/api/exams, /api/attempts) và Kiểm thử tự động
// ==============================================================================

export function normalizeMathExpression(raw) {
  if (!raw) return '';
  let s = String(raw).trim().toLowerCase();
  s = s.replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '($1)/($2)');
  s = s.replace(/\\sqrt\s*\{([^}]+)\}/g, 'sqrt($1)');
  s = s.replace(/√\s*\(?([0-9]+)\)?/g, 'sqrt($1)');
  s = s.replace(/căn\s*([0-9]+)/g, 'sqrt($1)');
  s = s.replace(/(\d),(\d)/g, '$1.$2');
  s = s.replace(/\\pi/g, 'pi');
  s = s.replace(/\b(cm2|cm3|cm|m2|m|km|đồng|dong|viên|vien|học sinh|hoc sinh|giờ|gio|độ)\b/g, '');
  s = s.replace(/°|\^\\circ/g, '');
  return s.trim();
}

export function evalMathAtom(expr) {
  if (!expr) return null;
  const clean = normalizeMathExpression(expr)
    .replace(/^(x_1|x_2|x1|x2|x|y|m|n|b|p|q|a|s|min\s*[a-z]+)\s*=\s*/i, '')
    .replace(/[{}()]/g, '')
    .trim();
  if (!clean) return null;
  if (/^[+-]?\d+(\.\d+)?$/.test(clean)) return parseFloat(clean);
  const fMatch = clean.match(/^([+-]?\d+(?:\.\d+)?)\s*\/\s*([+-]?\d+(?:\.\d+)?)$/);
  if (fMatch) {
    const den = parseFloat(fMatch[2]);
    return den === 0 ? null : parseFloat(fMatch[1]) / den;
  }
  const rMatch = clean.match(/^([+-]?\d+(?:\.\d+)?)?\s*\*?\s*sqrt\s*(\d+(?:\.\d+)?)$/);
  if (rMatch) {
    const coef = rMatch[1] ? parseFloat(rMatch[1]) : 1;
    return coef * Math.sqrt(parseFloat(rMatch[2]));
  }
  const piMatch = clean.match(/^([+-]?\d+(?:\.\d+)?)\s*\*?\s*pi$/);
  if (piMatch) return parseFloat(piMatch[1]) * Math.PI;
  return null;
}

export function checkMathEquivalence(studentAns, question) {
  if (!studentAns || !String(studentAns).trim()) {
    return { isCorrect: false, matchedReason: 'Chưa trả lời', errorCategory: null };
  }
  const sRaw = String(studentAns).trim();
  const targets = [question.correctAnswer].concat(question.acceptedAnswers || []).filter(Boolean);
  const normS = normalizeMathExpression(sRaw);

  for (const t of targets) {
    const normT = normalizeMathExpression(t);
    if (normS === normT || normS.replace(/\s+/g, '') === normT.replace(/\s+/g, '')) {
      return { isCorrect: true, matchedReason: 'Khớp đáp án chuẩn / tương đương', errorCategory: null };
    }
    const vS = evalMathAtom(normS);
    const vT = evalMathAtom(normT);
    if (vS !== null && vT !== null && Math.abs(vS - vT) < 1e-6) {
      return { isCorrect: true, matchedReason: `Giá trị toán học tương đương (${sRaw} = ${t})`, errorCategory: null };
    }
  }

  const isOrderedPair = /x\s*=.*y\s*=/.test(String(question.correctAnswer).toLowerCase());
  if (!isOrderedPair && (String(question.correctAnswer).includes(';') || sRaw.includes(';'))) {
    const parseSet = (str) =>
      String(str)
        .split(/[;,]/)
        .map((p) => evalMathAtom(p))
        .filter((v) => v !== null)
        .sort((a, b) => a - b);
    const sSet = parseSet(sRaw);
    const tSet = parseSet(question.correctAnswer);
    if (sSet.length > 1 && sSet.length === tSet.length && sSet.every((v, i) => Math.abs(v - tSet[i]) < 1e-6)) {
      return { isCorrect: true, matchedReason: 'Tập nghiệm tương đương', errorCategory: null };
    }
  }

  let detectedError = 'CALCULATION_ERROR';
  if (question.id === 'Q9_008' && sRaw.includes('-5')) detectedError = 'MISSING_CONDITION';
  else if (sRaw.length > 25) detectedError = 'METHOD_ERROR';
  return { isCorrect: false, matchedReason: 'Chưa khớp đáp án chuẩn', errorCategory: detectedError };
}

export function generateExamFromPool(config, allQuestions, existingExams = []) {
  const grade = Number(config.grade || 8);
  const textbook = config.textbook || 'KNTT';
  const category = config.category || 'GIUA_KI_1';
  const difficulty = config.difficulty || 'medium';
  const format = config.format || 'combined';
  const totalCount = Math.max(3, Math.min(12, Number(config.questionCount || 5)));
  const durationMinutes = Number(config.durationMinutes || 45);
  const chapterFilter = config.chapterId || 'ALL';

  let semConstraint = Number(config.semester || 1);
  if (category === 'GIUA_KI_1' || category === 'CUOI_KI_1') semConstraint = 1;
  if (category === 'GIUA_KI_2' || category === 'CUOI_KI_2') semConstraint = 2;
  if (category === 'THI_VAO_10') semConstraint = 0;

  let pool = allQuestions.filter((q) => Number(q.grade) === grade && q.verificationStatus === 'verified');
  if (semConstraint === 1 || semConstraint === 2) {
    const semPool = pool.filter((q) => Number(q.semester) === semConstraint);
    if (semPool.length >= 3) pool = semPool;
  }
  if (chapterFilter && chapterFilter !== 'ALL') {
    const chPool = pool.filter((q) => q.chapterId === chapterFilter);
    if (chPool.length >= 2) pool = chPool;
  }

  const recentQIds = new Set();
  existingExams
    .filter((e) => Number(e.grade) === grade)
    .slice(0, 2)
    .forEach((e) => (e.questionIds || []).forEach((id) => recentQIds.add(id)));

  const scoredPool = pool
    .map((q) => {
      let priority = 10;
      if (q.difficulty === difficulty) priority += 8;
      if (!recentQIds.has(q.id)) priority += 6;
      return { q, priority };
    })
    .sort((a, b) => b.priority - a.priority);

  const mcqCandidates = scoredPool.filter((i) => i.q.type === 'mcq').map((i) => i.q);
  const essayCandidates = scoredPool.filter((i) => i.q.type === 'essay').map((i) => i.q);

  let selected = [];
  if (format === 'mcq') {
    selected = mcqCandidates.slice(0, totalCount);
  } else if (format === 'essay') {
    selected = essayCandidates.slice(0, totalCount);
  } else {
    const targetEssay = Math.max(1, Math.round(totalCount * 0.3));
    const targetMcq = Math.max(1, totalCount - targetEssay);
    selected = mcqCandidates.slice(0, targetMcq).concat(essayCandidates.slice(0, targetEssay));
  }

  if (selected.length < totalCount) {
    const usedIds = new Set(selected.map((x) => x.id));
    for (const q of allQuestions.filter((x) => Number(x.grade) === grade)) {
      if (!usedIds.has(q.id)) {
        selected.push(q);
        usedIds.add(q.id);
        if (selected.length >= totalCount) break;
      }
    }
  }

  const questionPoints = {};
  if (selected.length > 0) {
    const basePt = Math.floor((10.0 / selected.length) * 100) / 100;
    let rem = 10.0;
    selected.forEach((q, idx) => {
      const pts = idx === selected.length - 1 ? Number(rem.toFixed(2)) : basePt;
      questionPoints[q.id] = pts;
      rem -= pts;
    });
  }

  return {
    id: 'EXAM_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    userId: config.userId || 'user_minhanh_01',
    title: config.customTitle || `Đề Kiểm Tra Toán ${grade} (${textbook})`,
    examCode: String(config.examCode || 101),
    grade,
    textbook,
    semester: semConstraint || 1,
    category,
    categoryLabel: category,
    difficulty,
    format,
    durationMinutes,
    maxScore: 10.0,
    questionIds: selected.map((q) => q.id),
    questionPoints,
    isFavorite: false,
    isSeed: false,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  };
}

export function gradeExamAttempt(attempt, exam, allQuestions) {
  let mcqScore = 0;
  let essayScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  const gradedAnswers = {};
  const wrongItems = [];

  for (const qId of exam.questionIds) {
    const q = allQuestions.find((item) => item.id === qId);
    if (!q) continue;
    const maxPts = exam.questionPoints?.[qId] ? Number(exam.questionPoints[qId]) : Number(q.points || 1.0);
    const rec = attempt.answers?.[qId] || { value: '', workings: '', flagged: false };
    const rawVal = String(rec.value || '').trim();

    if (!rawVal && !String(rec.workings || '').trim()) {
      unansweredCount += 1;
      gradedAnswers[qId] = { ...rec, isCorrect: false, points: 0, matchedReason: 'Chưa trả lời' };
    } else if (q.type === 'mcq') {
      const isRight = rawVal.toUpperCase() === String(q.correctAnswer).toUpperCase();
      const pts = isRight ? maxPts : 0;
      if (isRight) {
        mcqScore += pts;
        correctCount += 1;
      } else {
        wrongCount += 1;
        wrongItems.push({ questionId: q.id, wrongAnswer: rawVal, errorType: 'CALCULATION_ERROR' });
      }
      gradedAnswers[qId] = { ...rec, isCorrect: isRight, points: pts };
    } else {
      const eq = checkMathEquivalence(rawVal, q);
      if (eq.isCorrect) {
        essayScore += maxPts;
        correctCount += 1;
        gradedAnswers[qId] = { ...rec, isCorrect: true, points: maxPts, matchedReason: eq.matchedReason };
      } else {
        wrongCount += 1;
        wrongItems.push({ questionId: q.id, wrongAnswer: rawVal, errorType: eq.errorCategory || 'CALCULATION_ERROR' });
        gradedAnswers[qId] = { ...rec, isCorrect: false, points: 0, matchedReason: eq.matchedReason, errorCategory: eq.errorCategory };
      }
    }
  }

  const totalScore = Math.min(10.0, Number((mcqScore + essayScore).toFixed(2)));
  return {
    status: 'GRADED',
    submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    totalScore,
    mcqScore: Number(mcqScore.toFixed(2)),
    essayScore: Number(essayScore.toFixed(2)),
    correctCount,
    wrongCount,
    unansweredCount,
    answers: gradedAnswers,
    wrongItems
  };
}
