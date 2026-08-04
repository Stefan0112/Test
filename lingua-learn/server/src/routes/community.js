import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// 获取社区帖子列表
router.get('/posts', (req, res) => {
  const { language_id } = req.query;
  let query = `
    SELECT p.*, u.username, u.avatar,
      (SELECT COUNT(*) FROM replies r WHERE r.post_id = p.id) as reply_count
    FROM posts p JOIN users u ON p.user_id = u.id
  `;
  const params = [];
  if (language_id) {
    query += ' WHERE p.language_id = ?';
    params.push(language_id);
  }
  query += ' ORDER BY p.created_at DESC LIMIT 50';

  const posts = db.prepare(query).all(...params);
  res.json({ posts });
});

// 创建帖子
router.post('/posts', authMiddleware, (req, res) => {
  const { content, language_id } = req.body;
  if (!content) return res.status(400).json({ error: '内容不能为空' });

  const result = db.prepare('INSERT INTO posts (user_id, language_id, content) VALUES (?,?,?)')
    .run(req.user.id, language_id || null, content);

  // 检查成就
  const postCount = db.prepare('SELECT COUNT(*) as cnt FROM posts WHERE user_id = ?').get(req.user.id).cnt;
  const ach = db.prepare("SELECT * FROM achievements WHERE requirement_type = 'posts' AND requirement_value <= ?").all(postCount);
  for (const a of ach) {
    db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?,?)').run(req.user.id, a.id);
  }

  const post = db.prepare(`
    SELECT p.*, u.username, u.avatar FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?
  `).get(result.lastInsertRowid);

  res.json({ post });
});

// 获取帖子回复
router.get('/posts/:postId/replies', (req, res) => {
  const replies = db.prepare(`
    SELECT r.*, u.username, u.avatar FROM replies r
    JOIN users u ON r.user_id = u.id WHERE r.post_id = ?
    ORDER BY r.created_at
  `).all(req.params.postId);
  res.json({ replies });
});

// 回复帖子
router.post('/posts/:postId/replies', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: '内容不能为空' });

  const result = db.prepare('INSERT INTO replies (post_id, user_id, content) VALUES (?,?,?)')
    .run(req.params.postId, req.user.id, content);

  const reply = db.prepare(`
    SELECT r.*, u.username, u.avatar FROM replies r
    JOIN users u ON r.user_id = u.id WHERE r.id = ?
  `).get(result.lastInsertRowid);

  res.json({ reply });
});

// 点赞帖子
router.post('/posts/:postId/like', authMiddleware, (req, res) => {
  db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(req.params.postId);
  res.json({ success: true });
});

export default router;