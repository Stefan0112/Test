import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([api.getStats(), api.getRecommendations()])
      .then(([s, r]) => { setStats(s.stats); setRecommendations(r.recommendations); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!user) return <Navigate to="/login" />;

  const statCards = stats ? [
    { label: '总经验值', value: `${stats.total_xp || 0} XP`, icon: '⚡', color: 'bg-yellow-50 text-yellow-700' },
    { label: '连续打卡', value: `${stats.streak_days || 0} 天`, icon: '🔥', color: 'bg-orange-50 text-orange-700' },
    { label: '词汇学习', value: stats.vocab_learned || 0, icon: '📚', color: 'bg-blue-50 text-blue-700' },
    { label: '语法练习', value: stats.grammar_done || 0, icon: '✏️', color: 'bg-green-50 text-green-700' },
    { label: '口语练习', value: stats.speaking_done || 0, icon: '🎤', color: 'bg-purple-50 text-purple-700' },
    { label: '听力训练', value: stats.listening_done || 0, icon: '🎧', color: 'bg-pink-50 text-pink-700' },
  ] : [];

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6">学习仪表盘</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className={`${s.color} rounded-2xl p-4 text-center`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <h2 className="text-xl font-bold mb-4">个性化学习推荐</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {recommendations.map((rec, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{rec.language.flag}</span>
              <div>
                <h3 className="font-bold">{rec.language.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${rec.progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{rec.progress}%</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-3">{rec.recommendation}</p>
            {rec.nextCourse && (
              <Link to={`/course/${rec.nextCourse.id}`} className="btn-primary text-sm w-full block text-center">
                继续学习
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className="text-xl font-bold mb-4">选择语言开始学习</h2>
      <div className="grid grid-cols-3 gap-4">
        {[
          { id: 1, name: '英语', flag: '🇬🇧', color: 'from-blue-500 to-blue-600' },
          { id: 2, name: '日语', flag: '🇯🇵', color: 'from-red-500 to-red-600' },
          { id: 3, name: '韩语', flag: '🇰🇷', color: 'from-purple-500 to-purple-600' },
        ].map(lang => (
          <Link key={lang.id} to={`/learn/${lang.id}`}
            className={`bg-gradient-to-br ${lang.color} rounded-2xl p-6 text-white text-center hover:scale-105 transition-transform duration-200 shadow-lg`}
          >
            <div className="text-4xl mb-2">{lang.flag}</div>
            <div className="font-bold text-lg">{lang.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}