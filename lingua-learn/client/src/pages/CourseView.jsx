import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

export default function CourseView() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [items, setItems] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.getCourse(courseId)
      .then(d => {
        setCourse(d.course);
        setItems(d.items);
      })
      .finally(() => setLoading(false));
  }, [courseId, user]);

  if (!user) return <Navigate to="/login" />;
  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!course) return <div className="text-center py-20 text-gray-400">课程不存在</div>;

  const currentItem = items[currentIdx];
  const totalItems = items.length;
  const score = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;

  const handleAnswer = (idx) => {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === currentItem.correct_index) {
      setCorrectCount(c => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < totalItems - 1) {
      setCurrentIdx(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.submitProgress(courseId, score);
    } catch (e) { /* ignore */ }
    setSubmitting(false);
  };

  const renderVocabulary = () => (
    <div className="text-center">
      <div className="text-4xl font-bold text-primary-700 mb-2">{currentItem.word}</div>
      {currentItem.pronunciation && (
        <div className="text-lg text-gray-400 mb-4">{currentItem.pronunciation}</div>
      )}
      <div className="bg-gray-50 rounded-2xl p-6 mb-4">
        <div className="text-2xl font-bold text-gray-800 mb-2">{currentItem.translation}</div>
        {currentItem.example_sentence && (
          <p className="text-gray-500 italic">{currentItem.example_sentence}</p>
        )}
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { setCorrectCount(c => c + 1); handleNext(); }}
          className="btn-primary">我记住了</button>
        <button onClick={handleNext} className="btn-secondary">再看一遍</button>
      </div>
    </div>
  );

  const renderGrammar = () => {
    const options = JSON.parse(currentItem.options);
    return (
      <div>
        <div className="text-lg font-medium text-gray-800 mb-6">{currentItem.question}</div>
        <div className="space-y-3 mb-4">
          {options.map((opt, i) => {
            let btnClass = 'w-full text-left px-5 py-3.5 rounded-xl border-2 transition-all duration-200 ';
            if (!showResult) {
              btnClass += 'border-gray-100 hover:border-primary-300 hover:bg-primary-50';
            } else if (i === currentItem.correct_index) {
              btnClass += 'border-success bg-green-50 text-success font-medium';
            } else if (i === selectedAnswer) {
              btnClass += 'border-danger bg-red-50 text-danger font-medium';
            } else {
              btnClass += 'border-gray-100 opacity-50';
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} className={btnClass} disabled={showResult}>
                <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>
        {showResult && currentItem.explanation && (
          <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm mb-4">
            解析：{currentItem.explanation}
          </div>
        )}
        {showResult && (
          <button onClick={handleNext} className="btn-primary">
            {currentIdx < totalItems - 1 ? '下一题' : '完成'}
          </button>
        )}
      </div>
    );
  };

  const renderSpeaking = () => (
    <div className="text-center">
      <div className="text-6xl mb-6">🎤</div>
      <div className="bg-accent-50 rounded-2xl p-6 mb-4">
        <h3 className="font-bold text-lg text-accent-700 mb-2">请大声朗读</h3>
        <p className="text-xl text-gray-800 mb-4">{currentItem.prompt_text}</p>
        <div className="bg-white rounded-xl p-4 text-left">
          <p className="text-sm text-gray-400 mb-1">参考文本：</p>
          <p className="text-gray-600">{currentItem.reference_text}</p>
        </div>
        {currentItem.tips && (
          <p className="text-sm text-accent-500 mt-3">提示：{currentItem.tips}</p>
        )}
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { setCorrectCount(c => c + 1); handleNext(); }}
          className="btn-primary">完成朗读</button>
        <button onClick={handleNext} className="btn-secondary">跳过</button>
      </div>
    </div>
  );

  const renderListening = () => {
    const options = JSON.parse(currentItem.options);
    return (
      <div>
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🎧</div>
          <div className="bg-gray-100 rounded-2xl p-6 inline-block">
            <p className="text-lg text-gray-700 italic">"{currentItem.audio_text}"</p>
          </div>
          {currentItem.transcript && showResult && (
            <div className="mt-3 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm inline-block">
              原文：{currentItem.transcript}
            </div>
          )}
        </div>
        <div className="text-lg font-medium text-gray-800 mb-4">{currentItem.question}</div>
        <div className="space-y-3 mb-4">
          {options.map((opt, i) => {
            let btnClass = 'w-full text-left px-5 py-3.5 rounded-xl border-2 transition-all duration-200 ';
            if (!showResult) {
              btnClass += 'border-gray-100 hover:border-primary-300 hover:bg-primary-50';
            } else if (i === currentItem.correct_index) {
              btnClass += 'border-success bg-green-50 text-success font-medium';
            } else if (i === selectedAnswer) {
              btnClass += 'border-danger bg-red-50 text-danger font-medium';
            } else {
              btnClass += 'border-gray-100 opacity-50';
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} className={btnClass} disabled={showResult}>
                <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>
        {showResult && (
          <button onClick={handleNext} className="btn-primary">
            {currentIdx < totalItems - 1 ? '下一题' : '完成'}
          </button>
        )}
      </div>
    );
  };

  const renderItem = () => {
    switch (course.category) {
      case 'vocabulary': return renderVocabulary();
      case 'grammar': return renderGrammar();
      case 'speaking': return renderSpeaking();
      case 'listening': return renderListening();
      default: return null;
    }
  };

  if (finished) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center animate-fadeIn">
        <div className="card">
          <div className="text-6xl mb-4">{score >= 60 ? '🎉' : '💪'}</div>
          <h1 className="text-2xl font-bold mb-2">课程完成！</h1>
          <p className="text-gray-500 mb-2">{course.title}</p>
          <div className="text-4xl font-bold text-primary-600 mb-2">{score}分</div>
          <p className="text-sm text-gray-400 mb-1">
            正确 {correctCount}/{totalItems} 题
          </p>
          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden mx-auto mb-4">
            <div className={`h-full rounded-full ${score >= 60 ? 'bg-success' : 'bg-warning'}`} style={{ width: `${score}%` }} />
          </div>
          {score >= 60 && <p className="text-success font-medium mb-4">+{course.xp_reward} XP 已获得！</p>}
          <div className="flex gap-3 justify-center">
            <button onClick={handleSubmit} disabled={submitting}
              className="btn-primary">{submitting ? '提交中...' : '提交成绩'}</button>
            <Link to={`/learn/${course.language_id}`} className="btn-secondary">返回课程</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/learn/${course.language_id}`} className="text-gray-400 hover:text-gray-600">&larr; 返回</Link>
        <h1 className="text-xl font-bold">{course.title}</h1>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>进度</span>
          <span>{currentIdx + 1} / {totalItems}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + (showResult ? 1 : 0)) / totalItems) * 100}%` }} />
        </div>
      </div>

      {/* Content */}
      <div className="card">
        {items.length > 0 ? renderItem() : (
          <div className="text-center py-10 text-gray-400">暂无学习内容</div>
        )}
      </div>
    </div>
  );
}