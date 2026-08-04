import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// 获取所有语言
router.get('/languages', (req, res) => {
  const langs = db.prepare('SELECT * FROM languages ORDER BY id').all();
  res.json({ languages: langs });
});

// 获取某语言的等级
router.get('/languages/:langId/levels', (req, res) => {
  const levels = db.prepare('SELECT * FROM levels WHERE language_id = ? ORDER BY level_order').all(req.params.langId);
  res.json({ levels });
});

// 获取某等级的课程列表
router.get('/levels/:levelId/courses', (req, res) => {
  const courses = db.prepare(`SELECT * FROM courses WHERE level_id = ? ORDER BY CASE category WHEN 'vocabulary' THEN 1 WHEN 'grammar' THEN 2 WHEN 'speaking' THEN 3 WHEN 'listening' THEN 4 END, order_num`).all(req.params.levelId);
  res.json({ courses });
});

// 获取课程详情（含题目）
router.get('/courses/:courseId', (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.courseId);
  if (!course) return res.status(404).json({ error: '课程不存在' });

  let items = [];
  switch (course.category) {
    case 'vocabulary':
      items = db.prepare('SELECT * FROM vocabulary WHERE course_id = ?').all(course.id);
      break;
    case 'grammar':
      items = db.prepare('SELECT * FROM grammar_questions WHERE course_id = ?').all(course.id);
      break;
    case 'speaking':
      items = db.prepare('SELECT * FROM speaking_prompts WHERE course_id = ?').all(course.id);
      break;
    case 'listening':
      items = db.prepare('SELECT * FROM listening_exercises WHERE course_id = ?').all(course.id);
      break;
  }

  res.json({ course, items });
});

// 获取某语言所有课程（按等级分组）
router.get('/languages/:langId/all-courses', (req, res) => {
  const levels = db.prepare('SELECT * FROM levels WHERE language_id = ? ORDER BY level_order').all(req.params.langId);
  const result = levels.map(level => {
    const courses = db.prepare(`SELECT * FROM courses WHERE level_id = ? ORDER BY CASE category WHEN 'vocabulary' THEN 1 WHEN 'grammar' THEN 2 WHEN 'speaking' THEN 3 WHEN 'listening' THEN 4 END, order_num`).all(level.id);
    return { ...level, courses };
  });
  res.json({ levels: result });
});

// 提交课程进度
router.post('/courses/:courseId/progress', authMiddleware, (req, res) => {
  const { courseId } = req.params;
  const { score } = req.body;
  const userId = req.user.id;

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
  if (!course) return res.status(404).json({ error: '课程不存在' });

  const existing = db.prepare('SELECT * FROM progress WHERE user_id = ? AND course_id = ?').get(userId, courseId);
  const finalScore = Math.max(existing?.score || 0, score || 0);
  const completed = finalScore >= 60 ? 1 : 0;

  db.prepare(`
    INSERT INTO progress (user_id, course_id, completed, score, max_score, completed_at)
    VALUES (?,?,?,?,100, CASE WHEN ? THEN datetime('now') ELSE NULL END)
    ON CONFLICT(user_id, course_id) DO UPDATE SET
      score = MAX(score, ?), completed = ?, completed_at = CASE WHEN ? THEN COALESCE(completed_at, datetime('now')) ELSE completed_at END
  `).run(userId, courseId, completed, finalScore, completed, finalScore, completed, completed);

  // 更新用户统计
  const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(userId) || {};
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let streakDays = stats.streak_days || 0;
  if (stats.last_study_date !== today) {
    if (stats.last_study_date === yesterday) {
      streakDays += 1;
    } else {
      streakDays = 1;
    }
  }

  const updateFields = {
    total_xp: (stats.total_xp || 0) + (completed ? course.xp_reward : 0),
    streak_days: streakDays,
    last_study_date: today,
  };
  updateFields[course.category + '_done'] = (stats[course.category + '_done'] || 0) + 1;

  db.prepare(`
    INSERT INTO user_stats (user_id, total_xp, streak_days, last_study_date, vocab_learned, grammar_done, speaking_done, listening_done)
    VALUES (?,?,?,?,?,?,?,?)
    ON CONFLICT(user_id) DO UPDATE SET
      total_xp = total_xp + ?, streak_days = ?, last_study_date = ?,
      vocab_learned = vocab_learned + ?, grammar_done = grammar_done + ?,
      speaking_done = speaking_done + ?, listening_done = listening_done + ?
  `).run(
    userId, updateFields.total_xp, streakDays, today,
    course.category === 'vocabulary' ? 1 : 0,
    course.category === 'grammar' ? 1 : 0,
    course.category === 'speaking' ? 1 : 0,
    course.category === 'listening' ? 1 : 0,
    completed ? course.xp_reward : 0, streakDays, today,
    course.category === 'vocabulary' ? 1 : 0,
    course.category === 'grammar' ? 1 : 0,
    course.category === 'speaking' ? 1 : 0,
    course.category === 'listening' ? 1 : 0
  );

  // 检查成就
  checkAchievements(userId);

  res.json({ success: true, score: finalScore, completed: !!completed, xp_earned: completed ? course.xp_reward : 0 });
});

function checkAchievements(userId) {
  const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(userId);
  if (!stats) return;

  const achievements = db.prepare('SELECT * FROM achievements').all();
  const earned = db.prepare('SELECT achievement_id FROM user_achievements WHERE user_id = ?').all(userId).map(r => r.achievement_id);

  for (const ach of achievements) {
    if (earned.includes(ach.id)) continue;
    let met = false;
    switch (ach.requirement_type) {
      case 'courses_completed':
        met = (stats.vocab_learned + stats.grammar_done + stats.speaking_done + stats.listening_done) >= ach.requirement_value;
        break;
      case 'vocab_learned': met = stats.vocab_learned >= ach.requirement_value; break;
      case 'grammar_done': met = stats.grammar_done >= ach.requirement_value; break;
      case 'speaking_done': met = stats.speaking_done >= ach.requirement_value; break;
      case 'listening_done': met = stats.listening_done >= ach.requirement_value; break;
      case 'streak_days': met = stats.streak_days >= ach.requirement_value; break;
      case 'all_types':
        met = stats.vocab_learned > 0 && stats.grammar_done > 0 && stats.speaking_done > 0 && stats.listening_done > 0;
        break;
    }
    if (met) {
      db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?,?)').run(userId, ach.id);
      db.prepare('UPDATE user_stats SET total_xp = total_xp + ? WHERE user_id = ?').run(ach.xp_reward, userId);
    }
  }
}

export default router;