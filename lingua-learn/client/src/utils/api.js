const API_BASE = '/api';

async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateMe: (body) => request('/auth/me', { method: 'PUT', body: JSON.stringify(body) }),

  // Courses
  getLanguages: () => request('/languages'),
  getLevels: (langId) => request(`/languages/${langId}/levels`),
  getCourses: (levelId) => request(`/levels/${levelId}/courses`),
  getCourse: (courseId) => request(`/courses/${courseId}`),
  getAllCourses: (langId) => request(`/languages/${langId}/all-courses`),
  submitProgress: (courseId, score) => request(`/courses/${courseId}/progress`, {
    method: 'POST', body: JSON.stringify({ score })
  }),

  // Progress
  getStats: () => request('/progress/stats'),
  getProgress: () => request('/progress/courses'),
  getLangProgress: (langId) => request(`/progress/language/${langId}`),
  getRecommendations: () => request('/progress/recommendations'),
  getAchievements: () => request('/progress/achievements'),

  // Community
  getPosts: (langId) => request(`/community/posts${langId ? `?language_id=${langId}` : ''}`),
  createPost: (body) => request('/community/posts', { method: 'POST', body: JSON.stringify(body) }),
  getReplies: (postId) => request(`/community/posts/${postId}/replies`),
  createReply: (postId, content) => request(`/community/posts/${postId}/replies`, {
    method: 'POST', body: JSON.stringify({ content })
  }),
  likePost: (postId) => request(`/community/posts/${postId}/like`, { method: 'POST' }),
};