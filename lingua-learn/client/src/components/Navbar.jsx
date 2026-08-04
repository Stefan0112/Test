import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-700">
          <span className="text-2xl">🌐</span>
          <span>LinguaLearn</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">仪表盘</Link>
              <Link to="/community" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">社区</Link>
              <Link to="/achievements" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">成就</Link>
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.username}</span>
                <button onClick={() => { logout(); navigate('/'); }} className="text-xs text-gray-400 hover:text-danger transition-colors ml-1">
                  退出
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">登录</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">免费注册</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}