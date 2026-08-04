import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([api.getAchievements(), api.getStats()])
      .then(([a, s]) => {
        setAchievements(a.achievements);
        setStats(s.stats);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <Navigate to="/login" />;
  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">成就系统</h1>
      <p className="text-gray-500 mb-6">完成学习任务，解锁成就徽章</p>

      {/* Overview */}
      <div className="card mb-8">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🏆</div>
          <div>
            <div className="text-2xl font-bold text-primary-600">{earnedCount} / {totalCount}</div>
            <div className="text-sm text-gray-400">已解锁成就</div>
          </div>
          <div className="flex-1" />
          <div className="text-right">
            <div className="text-lg font-bold text-yellow-600">{stats?.total_xp || 0} XP</div>
            <div className="text-sm text-gray-400">总经验值</div>
            <div className="text-sm text-orange-500 mt-1">🔥 连续 {stats?.streak_days || 0} 天打卡</div>
          </div>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {achievements.map(ach => (
          <div key={ach.id} className={`card transition-all ${ach.earned ? 'border-success/50 bg-green-50/30' : 'opacity-60'}`}>
            <div className="flex items-start gap-4">
              <div className={`text-3xl ${ach.earned ? '' : 'grayscale'}`}>
                {ach.earned ? ach.icon : '🔒'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{ach.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{ach.description}</p>
                <div className="flex items-center gap-2">
                  {ach.earned ? (
                    <span className="badge-success">已解锁</span>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-400">未解锁</span>
                  )}
                  <span className="text-xs text-yellow-500">+{ach.xp_reward} XP</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}