import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedLang, setSelectedLang] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState({});

  useEffect(() => {
    loadPosts();
  }, [selectedLang]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const d = await api.getPosts(selectedLang || null);
      setPosts(d.posts);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    try {
      await api.createPost({ content: newPost, language_id: selectedLang || null });
      setNewPost('');
      loadPosts();
    } catch (e) { alert(e.message); }
  };

  const handleReply = async (postId) => {
    if (!replyText.trim()) return;
    try {
      await api.createReply(postId, replyText);
      setReplyText('');
      setReplyTo(null);
      const d = await api.getReplies(postId);
      setReplies({ ...replies, [postId]: d.replies });
    } catch (e) { alert(e.message); }
  };

  const toggleReplies = async (postId) => {
    if (replies[postId]) {
      setReplies({ ...replies, [postId]: null });
      setReplyTo(null);
    } else {
      const d = await api.getReplies(postId);
      setReplies({ ...replies, [postId]: d.replies });
      setReplyTo(null);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.likePost(postId);
      loadPosts();
    } catch (e) { /* ignore */ }
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">学习社区</h1>

      {/* Language filter */}
      <div className="flex gap-2 mb-4">
        {['', '1', '2', '3'].map(v => {
          const labels = { '': '全部', '1': '🇬🇧 英语', '2': '🇯🇵 日语', '3': '🇰🇷 韩语' };
          return (
            <button key={v} onClick={() => setSelectedLang(v)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${selectedLang === v ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >{labels[v]}</button>
          );
        })}
      </div>

      {/* New Post */}
      <div className="card mb-6">
        <textarea value={newPost} onChange={e => setNewPost(e.target.value)}
          placeholder="分享你的学习心得..." className="input-field min-h-[80px] resize-none" />
        <button onClick={handleCreatePost} className="btn-primary mt-3">发布帖子</button>
      </div>

      {/* Post List */}
      {loading ? <div className="text-center py-10 text-gray-400">加载中...</div> : (
        <div className="space-y-4">
          {posts.length === 0 && <div className="text-center py-10 text-gray-400">暂无帖子，快来发布第一条吧！</div>}
          {posts.map(post => (
            <div key={post.id} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                  {post.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-sm">{post.username}</div>
                  <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString('zh-CN')}</div>
                </div>
              </div>
              <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.content}</p>
              <div className="flex items-center gap-4 text-sm">
                <button onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors">
                  ❤️ {post.likes}
                </button>
                <button onClick={() => toggleReplies(post.id)}
                  className="flex items-center gap-1 text-gray-400 hover:text-primary-500 transition-colors">
                  💬 {post.reply_count} 回复
                </button>
              </div>

              {/* Replies */}
              {replies[post.id] && (
                <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                  {replies[post.id].map(reply => (
                    <div key={reply.id} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary-600">{reply.username}</span>
                        <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleString('zh-CN')}</span>
                      </div>
                      <p className="text-sm text-gray-600">{reply.content}</p>
                    </div>
                  ))}
                  {replyTo === post.id ? (
                    <div className="flex gap-2">
                      <input value={replyText} onChange={e => setReplyText(e.target.value)}
                        placeholder="写下你的回复..." className="input-field flex-1 text-sm py-2" />
                      <button onClick={() => handleReply(post.id)} className="btn-primary text-sm py-2">回复</button>
                      <button onClick={() => setReplyTo(null)} className="text-sm text-gray-400">取消</button>
                    </div>
                  ) : (
                    <button onClick={() => setReplyTo(post.id)} className="text-sm text-primary-500 hover:underline">
                      写回复...
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}