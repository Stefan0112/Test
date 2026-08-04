import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '..', 'lingua.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ===== 用户表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    native_lang TEXT DEFAULT 'zh',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ===== 语言表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS languages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    flag TEXT DEFAULT '',
    description TEXT DEFAULT ''
  )
`);

// ===== 课程等级表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    level_order INTEGER NOT NULL,
    description TEXT DEFAULT '',
    FOREIGN KEY (language_id) REFERENCES languages(id)
  )
`);

// ===== 课程表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language_id INTEGER NOT NULL,
    level_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT NOT NULL CHECK(category IN ('vocabulary','grammar','speaking','listening')),
    order_num INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 10,
    FOREIGN KEY (language_id) REFERENCES languages(id),
    FOREIGN KEY (level_id) REFERENCES levels(id)
  )
`);

// ===== 单词表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    word TEXT NOT NULL,
    translation TEXT NOT NULL,
    pronunciation TEXT DEFAULT '',
    example_sentence TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    FOREIGN KEY (course_id) REFERENCES courses(id)
  )
`);

// ===== 语法题表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS grammar_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_index INTEGER NOT NULL,
    explanation TEXT DEFAULT '',
    FOREIGN KEY (course_id) REFERENCES courses(id)
  )
`);

// ===== 口语练习表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS speaking_prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    prompt_text TEXT NOT NULL,
    reference_text TEXT NOT NULL,
    tips TEXT DEFAULT '',
    FOREIGN KEY (course_id) REFERENCES courses(id)
  )
`);

// ===== 听力练习表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS listening_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    audio_text TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_index INTEGER NOT NULL,
    transcript TEXT DEFAULT '',
    FOREIGN KEY (course_id) REFERENCES courses(id)
  )
`);

// ===== 学习进度表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    completed INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 100,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE(user_id, course_id)
  )
`);

// ===== 用户学习统计表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    total_xp INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_study_date DATE,
    vocab_learned INTEGER DEFAULT 0,
    grammar_done INTEGER DEFAULT 0,
    speaking_done INTEGER DEFAULT 0,
    listening_done INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// ===== 成就表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT '',
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 50
  )
`);

// ===== 用户成就表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE(user_id, achievement_id)
  )
`);

// ===== 社区帖子表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    language_id INTEGER,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// ===== 帖子回复表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// ===== 学习路径推荐表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS learning_paths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    language_id INTEGER NOT NULL,
    recommended_courses TEXT DEFAULT '[]',
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

export default db;