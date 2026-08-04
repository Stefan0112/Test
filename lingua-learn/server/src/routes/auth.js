import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

// 注册
router.post('/register', (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6位' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) {
      return res.status(400).json({ error: '用户名或邮箱已被注册' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?,?,?)').run(username, email, hashed);

    // 初始化统计
    db.prepare('INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)').run(result.lastInsertRowid);

    const user = { id: result.lastInsertRowid, username };
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, username, email } });
  } catch (e) {
    res.status(500).json({ error: '注册失败: ' + e.message });
  }
});

// 登录
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);
    if (!user) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }
    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar }
    });
  } catch (e) {
    res.status(500).json({ error: '登录失败: ' + e.message });
  }
});

// 获取当前用户信息
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, username, email, avatar, native_lang, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json({ user });
});

// 更新用户信息
router.put('/me', authMiddleware, (req, res) => {
  const { avatar, native_lang } = req.body;
  db.prepare('UPDATE users SET avatar = COALESCE(?, avatar), native_lang = COALESCE(?, native_lang) WHERE id = ?')
    .run(avatar, native_lang, req.user.id);
  res.json({ success: true });
});

export default router;