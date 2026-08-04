import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 animate-fadeIn">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">欢迎回来</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名或邮箱</label>
            <input className="input-field" value={username} onChange={e => setUsername(e.target.value)} placeholder="请输入用户名或邮箱" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入密码" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          还没有账号？<Link to="/register" className="text-primary-600 font-medium hover:underline">立即注册</Link>
        </p>
      </div>
    </div>
  );
}