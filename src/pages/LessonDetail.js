import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAccessibility } from '../context/AccessibilityContext';
import API_URL from '../config';
import './LessonDetail.css';

const LessonDetail = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [videos, setVideos] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { speak } = useAccessibility();

  useEffect(() => {
    fetchLessonData();
  }, [id]);

  const fetchLessonData = async () => {
    try {
      const [lessonRes, videosRes, assignmentsRes, cardsRes] = await Promise.all([
        axios.get(`${API_URL}/api/lessons/${id}`),
        axios.get(`${API_URL}/api/videos/lesson/${id}`),
        axios.get(`${API_URL}/api/assignments/lesson/${id}`),
        axios.get(`${API_URL}/api/cards/lesson/${id}`),
      ]);
      setLesson(lessonRes.data);
      setVideos(videosRes.data);
      setAssignments(assignmentsRes.data);
      setCards(cardsRes.data);
    } catch (error) {
      console.error('Error fetching lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Загрузка урока...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container">
        <div className="empty-state">
          <span>📭</span>
          <p>Урок не найден</p>
          <Link to="/lessons" className="btn btn-primary">← К урокам</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="lesson-detail-page" role="main">
      <div className="container">
        {/* Back link */}
        <Link to="/lessons" className="back-link">← Все уроки</Link>

        {/* Header */}
        <div className="lesson-hero">
          <div className="lesson-hero-top">
            <span className="lesson-badge">{lesson.level}</span>
            <button 
              className="tts-btn"
              onClick={() => {
                speak(lesson.title, 'en-US');
                setTimeout(() => speak(lesson.description, 'ru-RU'), 2000);
              }}
              aria-label="Озвучить название и описание урока"
              title="Озвучить"
            >
              🔊
            </button>
          </div>
          <h1>{lesson.title}</h1>
          <p className="lesson-desc">{lesson.description}</p>
        </div>

        {/* Videos Section */}
        {videos.length > 0 && (
          <section className="lesson-section" aria-label="Видеоматериалы">
            <div className="section-header">
              <h2>🎬 Видеоматериалы</h2>
              <button 
                className="tts-btn-sm"
                onClick={() => speak('Видеоматериалы к уроку', 'ru-RU')}
                aria-label="Озвучить: Видеоматериалы"
              >
                🔊
              </button>
            </div>
            <div className="videos-list">
              {videos.map((video) => (
                <div key={video.id} className="detail-video-item">
                  <div className="detail-video-info">
                    <h3>{video.title}</h3>
                    <p>{video.description}</p>
                    <button 
                      className="tts-btn-sm"
                      onClick={() => speak(video.title + '. ' + video.description, 'en-US')}
                      aria-label={`Озвучить: ${video.title}`}
                    >
                      🔊
                    </button>
                  </div>
                  <div className="detail-video-player">
                    <iframe
                      src={video.videoUrl}
                      title={video.title}
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Assignments Section */}
        {assignments.length > 0 && (
          <section className="lesson-section" aria-label="Домашние задания">
            <div className="section-header">
              <h2>✏️ Домашние задания</h2>
              <button 
                className="tts-btn-sm"
                onClick={() => speak('Домашние задания к уроку', 'ru-RU')}
                aria-label="Озвучить: Домашние задания"
              >
                🔊
              </button>
            </div>
            <div className="detail-assignments-list">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="detail-assignment-card">
                  <div className="detail-assignment-header">
                    <h3>{assignment.title}</h3>
                    <button 
                      className="tts-btn-sm"
                      onClick={() => speak(assignment.title + '. ' + assignment.instructions, 'ru-RU')}
                      aria-label={`Озвучить задание: ${assignment.title}`}
                    >
                      🔊
                    </button>
                  </div>
                  <p>{assignment.description}</p>
                  <div className="detail-instructions">
                    <strong>📝 Инструкции:</strong>
                    <p>{assignment.instructions}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cards Section */}
        {cards.length > 0 && (
          <section className="lesson-section" aria-label="Карточки для изучения">
            <div className="section-header">
              <h2>🃏 Карточки для изучения</h2>
              <button 
                className="tts-btn-sm"
                onClick={() => speak('Карточки для изучения слов', 'ru-RU')}
                aria-label="Озвучить: Карточки"
              >
                🔊
              </button>
            </div>
            <div className="detail-cards-grid">
              {cards.map((card) => (
                <div key={card.id} className="detail-word-card">
                  {card.imageUrl && (
                    <img src={card.imageUrl} alt={card.englishWord} className="detail-card-img" />
                  )}
                  <div className="detail-card-body">
                    <div className="detail-card-word-row">
                      <h3>{card.englishWord}</h3>
                      <button 
                        className="tts-btn-sm"
                        onClick={() => speak(card.englishWord, 'en-US')}
                        aria-label={`Озвучить: ${card.englishWord}`}
                      >
                        🔊
                      </button>
                    </div>
                    <p className="detail-card-translation">{card.translation}</p>
                    {card.example && (
                      <p className="detail-card-example">
                        💬 {card.example}
                        <button 
                          className="tts-btn-inline"
                          onClick={() => speak(card.example, 'en-US')}
                          aria-label="Озвучить пример"
                        >
                          🔊
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default LessonDetail;
