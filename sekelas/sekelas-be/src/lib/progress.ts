import { prisma } from './prisma';

export async function buildStudentProgress(userId: string, semesterId = 'sem-1') {
  const subjects = await prisma.subject.findMany({
    where: { semesterId }, orderBy: { orderIndex: 'asc' },
    include: { sections: { orderBy: { orderIndex: 'asc' }, include: { chapters: { orderBy: { orderIndex: 'asc' } } } } },
  });
  const progressRows = await prisma.chapterProgress.findMany({ where: { userId } });
  const pmap = new Map(progressRows.map((p) => [p.chapterId, p]));

  // Chapter quiz attempts
  const chapterAttempts = await prisma.quizAttempt.findMany({ where: { userId, quizType: 'CHAPTER_QUIZ' }, orderBy: { createdAt: 'asc' } });
  const attByChapter = new Map<string, number[]>();
  for (const a of chapterAttempts) { if (!a.chapterId) continue; const arr = attByChapter.get(a.chapterId) ?? []; arr.push(a.score); attByChapter.set(a.chapterId, arr); }

  // Pre/Post Test attempts at subject level (latest score per subject per type)
  const subjectAttempts = await prisma.quizAttempt.findMany({
    where: { userId, quizType: { in: ['PRE_TEST', 'POST_TEST'] } },
    orderBy: { createdAt: 'desc' },
  });
  const preTestBySubject = new Map<string, { score: number; completed: boolean }>();
  const postTestBySubject = new Map<string, { score: number; completed: boolean }>();
  for (const a of subjectAttempts) {
    if (!a.subjectId) continue;
    if (a.quizType === 'PRE_TEST' && !preTestBySubject.has(a.subjectId)) {
      preTestBySubject.set(a.subjectId, { score: a.score, completed: true });
    }
    if (a.quizType === 'POST_TEST' && !postTestBySubject.has(a.subjectId)) {
      postTestBySubject.set(a.subjectId, { score: a.score, completed: true });
    }
  }

  let totalChapters = 0, completed = 0;
  const subjectProgress = subjects.map((subj) => {
    let subjFirstSeen = false, subjTotal = 0, subjDone = 0;
    const sections = subj.sections.map((sec) => {
      const chapters = sec.chapters.map((ch) => {
        totalChapters++; subjTotal++;
        const p = pmap.get(ch.id);
        let status = p?.status as string | undefined;
        if (!status) { status = !subjFirstSeen ? 'UNLOCKED' : 'LOCKED'; }
        subjFirstSeen = true;
        if (status === 'COMPLETED') { completed++; subjDone++; }
        const sh = attByChapter.get(ch.id) ?? [];
        return { chapterId: ch.id, title: ch.name, status, watchedPercentage: p?.watchedPercentage ?? 0, lastScore: sh.length ? sh[sh.length - 1] : null, quizAttempts: sh.length, scoreHistory: sh, videoWatchAttempts: p?.videoWatchAttempts ?? 0, xpEarned: 0 };
      });
      const allDone = chapters.length > 0 && chapters.every((c) => c.status === 'COMPLETED');
      const anyOpen = chapters.some((c) => c.status !== 'LOCKED');
      return { sectionId: sec.id, sectionName: sec.name, status: allDone ? 'COMPLETED' : anyOpen ? 'IN_PROGRESS' : 'LOCKED', chapters };
    });

    const pre = preTestBySubject.get(subj.id);
    const post = postTestBySubject.get(subj.id);

    return {
      subjectId: subj.id,
      subjectName: subj.name,
      completionPercentage: subjTotal ? Math.round((subjDone / subjTotal) * 100) : 0,
      preTestCompleted: pre?.completed ?? false,
      postTestCompleted: post?.completed ?? false,
      preTestScore: pre?.score ?? null,
      postTestScore: post?.score ?? null,
      sections,
    };
  });
  const xp = await prisma.xPEvent.aggregate({ _sum: { amount: true }, where: { userId } });
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { classRoom: true } });
  return { userId, completedChapters: completed, totalChapters, totalXP: xp._sum.amount ?? 0, currentStreak: user?.currentStreak ?? 0, subjectProgress };
}
