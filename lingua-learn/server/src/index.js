import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import progressRoutes from './routes/progress.js';
import communityRoutes from './routes/community.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/community', communityRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`LinguaLearn Server running on http://localhost:${PORT}`);
});