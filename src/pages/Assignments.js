import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { useAccessibility } from '../context/AccessibilityContext';
import { usePoints } from '../context/PointsContext';
import './Assignments.css';

const Assignments = () => {
  const { user } = useAuth();
  const { speak } = useAccessibility();
  const { addXP } = usePoints();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('${API_URL}/api/assignments');
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (assignmentId) => {
    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/api/assignments/${assignmentId}/submit`, {
        answer: answer,
      });
      setAnswer('');
      setSelectedAssignment(null);
      addXP(15, 'выполнение задания');
      speak('Задание отправлено! Молодец!', 'ru-RU');
      await fetchAssignments();
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Загрузка заданий...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="assignments-page" role="main">
      <div className="container">
        {/* Header */}
        <div className="page-hero">
          <div className="page-hero-content">
            <span className="page-hero-emoji" aria-hidden="true">✏️</span>
            <div>
              <h1>Домашние задания</h1>
              <p>Практикуйтесь и закрепляйте знания</p>
            </div>
          </div>
          <button 
            className="tts-btn"
            onClick={() => speak('Домашние задания. Практикуйтесь и закрепляйте знания.', 'ru-RU')}
            aria-label="Озвучить заголовок"
          >
            🔊
          </button>
        </div>

        {/* Assignments */}
        {assignments.length === 0 ? (
          <div className="empty-state">
            <span>📝</span>
            <p>Заданий пока нет</p>
          </div>
        ) : (
          <div className="assignments-list">
            {assignments.map((assignment, index) => (
              <div 
                key={assignment.id} 
                className="assign-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="assign-card-header">
                  <div className="assign-card-title">
                    <div className="assign-number">{index + 1}</div>
                    <div>
                      <h3>{assignment.title}</h3>
                      <p className="assign-desc">{assignment.description}</p>
                    </div>
                  </div>
                  <div className="assign-actions-top">
                    <button 
                      className="tts-btn-sm"
                      onClick={() => speak(
                        assignment.title + '. ' + assignment.description + '. Инструкции: ' + assignment.instructions, 
                        'ru-RU'
                      )}
                      aria-label={`Озвучить задание: ${assignment.title}`}
                    >
                      🔊
                    </button>
                    <span className="assign-xp-badge">+15 XP</span>
                  </div>
                </div>

                <div className="assign-instructions">
                  <div className="assign-instructions-header">
                    <span className="assign-instructions-icon">📋</span>
                    <strong>Инструкции</strong>
                    <button 
                      className="tts-btn-inline"
                      onClick={() => speak(assignment.instructions, 'ru-RU')}
                      aria-label="Озвучить инструкции"
                    >
                      🔊
                    </button>
                  </div>
                  <p>{assignment.instructions}</p>
                </div>

                {user && (
                  <div className="assign-submit-area">
                    {submissions[assignment.id] ? (
                      <div className="assign-done">
                        <span className="assign-done-icon">✅</span>
                        <div>
                          <p className="assign-done-text">Задание выполнено</p>
                          {submissions[assignment.id].score && (
                            <p className="assign-score">Оценка: {submissions[assignment.id].score}</p>
                          )}
                          {submissions[assignment.id].feedback && (
                            <p className="assign-feedback">{submissions[assignment.id].feedback}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {selectedAssignment === assignment.id ? (
                          <div className="assign-form">
                            <textarea
                              value={answer}
                              onChange={(e) => setAnswer(e.target.value)}
                              placeholder="Введите ваш ответ здесь..."
                              rows={5}
                              aria-label="Поле для ответа"
                            />
                            <div className="assign-form-actions">
                              <button
                                onClick={() => handleSubmit(assignment.id)}
                                className="btn btn-primary"
                                disabled={!answer.trim() || submitting}
                              >
                                {submitting ? '⏳ Отправка...' : '📤 Отправить'}
                              </button>
                              <button
                                onClick={() => { setSelectedAssignment(null); setAnswer(''); }}
                                className="btn btn-secondary"
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedAssignment(assignment.id)}
                            className="btn btn-primary assign-start-btn"
                          >
                            ✏️ Выполнить задание
                          </button>
                        )}
                      </>
                    )}
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

export default Assignments;
