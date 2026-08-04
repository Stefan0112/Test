import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('两次密码不一致');
    if (form.password.length < 6) return setError('密码至少6位');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
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
        <h1 className="text-2xl font-bold text-center mb-6">创建账号</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input className="input-field" value={form.username} onChange={update('username')} placeholder="请输入用户名" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input className="input-field" type="email" value={form.email} onChange={update('email')} placeholder="请输入邮箱" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input className="input-field" type="password" value={form.password} onChange={update('password')} placeholder="至少6位密码" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
            <input className="input-field" type="password" value={form.confirm} onChange={update('confirm')} placeholder="再次输入密码" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? '注册中...' : '免费注册'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          已有账号？<Link to="/login" className="text-primary-600 font-medium hover:underline">立即登录</Link>
        </p>
      </div>
    </div>
  );
}