import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const [languages, setLanguages] = useState([]);
  const { user } = useAuth();

  useEffect(() => { api.getLanguages().then(d => setLanguages(d.languages)).catch(() => {}); }, []);

  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          开启你的<span className="text-primary-600">多语种</span>学习之旅
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          沉浸式语言学习体验，涵盖英语、日语、韩语等主流语言。分级课程体系，互动式学习模块，让学习更高效。
        </p>
        <div className="flex gap-4 justify-center">
          {user ? (
            <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">进入学习</Link>
          ) : (
            <Link to="/register" className="btn-primary text-lg px-8 py-3">免费开始学习</Link>
          )}
          <Link to="/community" className="btn-secondary text-lg px-8 py-3">探索社区</Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: '📚', title: '分级课程体系', desc: '从入门到高级，循序渐进的学习路径，适配不同水平的学习者' },
          { icon: '🎯', title: '互动式学习', desc: '单词记忆、语法练习、口语跟读、听力训练，全方位提升语言能力' },
          { icon: '📊', title: '进度追踪', desc: '实时追踪学习进度，个性化推荐学习路径，激励持续进步' },
        ].map((f, i) => (
          <div key={i} className="card text-center animate-slideUp" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Languages */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">选择你要学习的语言</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {languages.map(lang => (
            <Link key={lang.id} to={user ? `/learn/${lang.id}` : '/login'}
              className="card group cursor-pointer hover:border-primary-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{lang.flag}</span>
                <div>
                  <h3 className="font-bold text-xl group-hover:text-primary-600 transition-colors">{lang.name}</h3>
                  <p className="text-sm text-gray-400">{lang.name_en}</p>
                  <p className="text-sm text-gray-500 mt-1">{lang.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Achievements Preview */}
      <section className="card border-dashed border-2 border-primary-100 bg-primary-50/50 mb-8">
        <div className="flex items-center gap-4 flex-wrap justify-between">
          <div>
            <h3 className="font-bold text-lg text-primary-800">成就激励系统</h3>
            <p className="text-sm text-gray-500">完成任务获得成就徽章，让学习更有动力</p>
          </div>
          <Link to={user ? '/achievements' : '/register'} className="btn-primary">
            查看成就
          </Link>
        </div>
      </section>
    </div>
  );
}