import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../config';
import './AdminSubmissions.css';

const AdminSubmissions = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignRes, subRes] = await Promise.all([
        axios.get(`${API_URL}/api/assignments`),
        axios.get(`${API_URL}/api/submissions`),
      ]);
      const aData = assignRes.data;
      setAssignments(Array.isArray(aData) ? aData : aData.content || []);
      const sData = subRes.data;
      setSubmissions(Array.isArray(sData) ? sData : sData.content || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(`Ошибка загрузки: ${err.response?.status || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    selectedAssignment === 'all'
      ? submissions
      : submissions.filter(
          (s) =>
            s.assignment?.id === Number(selectedAssignment) ||
            s.assignmentId === Number(selectedAssignment)
        );

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="submissions-page" role="main">
      <div className="container">
        <div className="submissions-header">
          <div>
            <Link to="/admin" className="back-link">← Админ-панель</Link>
            <h1>📝 Ответы на задания</h1>
            <p>Просмотр отправленных студентами ответов</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>
            🔄 Обновить
          </button>
        </div>

        {/* Filter */}
        <div className="submissions-filter">
          <label>Фильтр по заданию:</label>
          <select
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
          >
            <option value="all">Все задания ({submissions.length})</option>
            {assignments.map((a) => {
              const count = submissions.filter(
                (s) => s.assignment?.id === a.id || s.assignmentId === a.id
              ).length;
              return (
                <option key={a.id} value={a.id}>
                  {a.title} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Загрузка ответов...</p>
          </div>
        ) : error ? (
          <div className="admin-error">
            <p>❌ {error}</p>
            <button className="btn btn-primary btn-sm" onClick={fetchData}>
              Попробовать снова
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <p>Ответов пока нет</p>
          </div>
        ) : (
          <div className="submissions-list">
            {filtered.map((sub) => (
              <div key={sub.id} className="submission-card">
                <div className="submission-top">
                  <div className="submission-meta">
                    <span className="submission-user">
                      👤 {sub.user?.username || sub.username || 'Студент'}
                    </span>
                    <span className="submission-date">
                      🕐 {formatDate(sub.submittedAt || sub.createdAt)}
                    </span>
                  </div>
                  <span className="submission-assignment">
                    📋 {sub.assignment?.title || `Задание #${sub.assignmentId || sub.id}`}
                  </span>
                </div>

                <div className="submission-answer">
                  <strong>Ответ:</strong>
                  <p>{sub.answer || sub.content || '—'}</p>
                </div>

                {sub.score != null && (
                  <div className="submission-score">
                    Оценка: <strong>{sub.score}</strong>
                  </div>
                )}
                {sub.feedback && (
                  <div className="submission-feedback">
                    Отзыв: {sub.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminSubmissions;
