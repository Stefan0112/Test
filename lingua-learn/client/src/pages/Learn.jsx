import { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

const CATEGORY_ICONS = { vocabulary: '📚', grammar: '✏️', speaking: '🎤', listening: '🎧' };
const CATEGORY_NAMES = { vocabulary: '词汇', grammar: '语法', speaking: '口语', listening: '听力' };
const CATEGORY_COLORS = {
  vocabulary: 'border-l-blue-400 bg-blue-50/50',
  grammar: 'border-l-green-400 bg-green-50/50',
  speaking: 'border-l-purple-400 bg-purple-50/50',
  listening: 'border-l-pink-400 bg-pink-50/50',
};

export default function Learn() {
  const { langId } = useParams();
  const { user } = useAuth();
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  const LANG_INFO = {
    1: { name: '英语', flag: '🇬🇧' },
    2: { name: '日语', flag: '🇯🇵' },
    3: { name: '韩语', flag: '🇰🇷' },
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([api.getAllCourses(langId), api.getLangProgress(langId)])
      .then(([d, p]) => {
        setLevels(d.levels);
        const progMap = {};
        p.progress.forEach(pr => { progMap[pr.course_id] = pr; });
        setProgress(progMap);
      })
      .finally(() => setLoading(false));
  }, [langId, user]);

  if (!user) return <Navigate to="/login" />;
  const lang = LANG_INFO[langId] || { name: '未知', flag: '🌐' };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">&larr; 返回</Link>
        <span className="text-3xl">{lang.flag}</span>
        <h1 className="text-2xl font-bold">{lang.name}课程</h1>
      </div>

      {loading ? <div className="text-center py-20 text-gray-400">加载中...</div> : (
        <div className="space-y-8">
          {levels.map(level => {
            const completed = level.courses.filter(c => progress[c.id]?.completed).length;
            const total = level.courses.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div key={level.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-lg">{level.name}</h2>
                    <p className="text-sm text-gray-400">{level.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{completed}/{total} 完成</div>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-success' : 'bg-primary-500'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {level.courses.map(course => {
                    const pr = progress[course.id];
                    const isCompleted = pr?.completed;

                    return (
                      <Link key={course.id} to={`/course/${course.id}`}
                        className={`border-l-4 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                          ${isCompleted ? 'border-l-success bg-green-50/50' : CATEGORY_COLORS[course.category] || 'border-l-gray-300 bg-gray-50/50'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span>{CATEGORY_ICONS[course.category] || '📖'}</span>
                          <span className="text-xs font-medium text-gray-400">{CATEGORY_NAMES[course.category]}</span>
                          {isCompleted && <span className="badge-success text-xs">已完成</span>}
                        </div>
                        <h3 className="font-medium text-sm mb-1">{course.title}</h3>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>+{course.xp_reward} XP</span>
                          {pr && !isCompleted && <span>{pr.score}/{pr.max_score}分</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}