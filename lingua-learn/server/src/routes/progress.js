import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// 获取用户统计
router.get('/stats', authMiddleware, (req, res) => {
  const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(req.user.id);
  res.json({ stats: stats || {} });
});

// 获取用户学习进度（所有课程完成情况）
router.get('/courses', authMiddleware, (req, res) => {
  const progress = db.prepare(`
    SELECT p.*, c.title, c.category, c.language_id, c.level_id, c.xp_reward
    FROM progress p JOIN courses c ON p.course_id = c.id
    WHERE p.user_id = ? ORDER BY c.language_id, c.level_id, c.category
  `).all(req.user.id);
  res.json({ progress });
});

// 获取某语言学习进度
router.get('/language/:langId', authMiddleware, (req, res) => {
  const progress = db.prepare(`
    SELECT p.*, c.title, c.category, c.level_id
    FROM progress p JOIN courses c ON p.course_id = c.id
    WHERE p.user_id = ? AND c.language_id = ?
    ORDER BY c.level_id, c.category
  `).all(req.user.id, req.params.langId);

  const totalCourses = db.prepare('SELECT COUNT(*) as cnt FROM courses WHERE language_id = ?').get(req.params.langId);
  const completed = progress.filter(p => p.completed).length;

  res.json({ progress, totalCourses: totalCourses.cnt, completed });
});

// 获取个性化学习推荐
router.get('/recommendations', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(userId);

  // 获取所有语言
  const languages = db.prepare('SELECT * FROM languages').all();

  const recommendations = languages.map(lang => {
    // 获取该语言下用户已完成课程
    const completedCourses = db.prepare(`
      SELECT c.id, c.level_id, c.category, c.order_num FROM progress p
      JOIN courses c ON p.course_id = c.id
      WHERE p.user_id = ? AND c.language_id = ? AND p.completed = 1
    `).all(userId, lang.id);

    const completedIds = new Set(completedCourses.map(c => c.id));

    // 找到下一个推荐课程
    let nextCourse = null;
    const levels = db.prepare('SELECT * FROM levels WHERE language_id = ? ORDER BY level_order').all(lang.id);

    for (const level of levels) {
      const courses = db.prepare(`SELECT * FROM courses WHERE level_id = ? ORDER BY CASE category WHEN 'vocabulary' THEN 1 WHEN 'grammar' THEN 2 WHEN 'speaking' THEN 3 WHEN 'listening' THEN 4 END, order_num`).all(level.id);
      const uncompleted = courses.filter(c => !completedIds.has(c.id));
      if (uncompleted.length > 0) {
        nextCourse = uncompleted[0];
        break;
      }
    }

    // 计算进度
    const totalCourses = levels.reduce((sum, l) => {
      return sum + db.prepare('SELECT COUNT(*) as cnt FROM courses WHERE level_id = ?').get(l.id).cnt;
    }, 0);

    const completedCount = completedCourses.length;
    const progress = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0;

    // 找出薄弱环节
    const categoryCounts = { vocabulary: 0, grammar: 0, speaking: 0, listening: 0 };
    completedCourses.forEach(c => { categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1; });
    const weakestCategory = Object.entries(categoryCounts).sort((a, b) => a[1] - b[1])[0][0];

    return {
      language: lang,
      progress,
      completedCount,
      totalCourses,
      nextCourse,
      weakestCategory,
      recommendation: nextCourse
        ? `推荐继续学习「${nextCourse.title}」`
        : '恭喜！你已完成该语言所有课程！'
    };
  });

  res.json({ recommendations });
});

// 获取成就列表
router.get('/achievements', authMiddleware, (req, res) => {
  const allAchievements = db.prepare('SELECT * FROM achievements').all();
  const earned = db.prepare('SELECT achievement_id FROM user_achievements WHERE user_id = ?').all(req.user.id).map(r => r.achievement_id);
  const result = allAchievements.map(a => ({ ...a, earned: earned.includes(a.id) }));
  res.json({ achievements: result });
});

export default router;