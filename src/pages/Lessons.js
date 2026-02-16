import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAccessibility } from '../context/AccessibilityContext';
import API_URL from '../config';
import './Lessons.css';

const LEVEL_CONFIG = {
  BEGINNER: { label: 'Начальный', emoji: '🌱', color: '#38A169' },
  INTERMEDIATE: { label: 'Средний', emoji: '📘', color: '#2B6CB0' },
  ADVANCED: { label: 'Продвинутый', emoji: '🚀', color: '#9F7AEA' },
};

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { speak } = useAccessibility();

  useEffect(() => {
    fetchLessons();
  }, [filter]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const url = filter !== 'all' 
        ? `${API_URL}/api/lessons?level=${filter.toUpperCase()}`
        : '${API_URL}/api/lessons';
      const response = await axios.get(url);
      setLessons(response.data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    speak(text, 'ru-RU');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Загрузка уроков...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="lessons-page" role="main">
      <div className="container">
        {/* Header */}
        <div className="page-hero">
          <div className="page-hero-content">
            <span className="page-hero-emoji" aria-hidden="true">📖</span>
            <div>
              <h1>Уроки английского</h1>
              <p>Выберите урок и начните обучение прямо сейчас</p>
            </div>
          </div>
          <button 
            className="tts-btn" 
            onClick={() => speakText('Уроки английского. Выберите урок и начните обучение.')}
            aria-label="Озвучить заголовок"
            title="Озвучить"
          >
            🔊
          </button>
        </div>

        {/* Filters */}
        <div className="filter-bar" role="tablist" aria-label="Фильтр по уровню">
          <button
            className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            role="tab"
            aria-selected={filter === 'all'}
          >
            📋 Все уровни
          </button>
          {Object.entries(LEVEL_CONFIG).map(([key, val]) => (
            <button
              key={key}
              className={`filter-chip ${filter === key.toLowerCase() ? 'active' : ''}`}
              onClick={() => setFilter(key.toLowerCase())}
              role="tab"
              aria-selected={filter === key.toLowerCase()}
              style={filter === key.toLowerCase() ? { '--chip-color': val.color } : {}}
            >
              {val.emoji} {val.label}
            </button>
          ))}
        </div>

        {/* Lessons Grid */}
        {lessons.length === 0 ? (
          <div className="empty-state">
            <span aria-hidden="true">📭</span>
            <p>Нет уроков для выбранного уровня</p>
          </div>
        ) : (
          <div className="lessons-grid">
            {lessons.map((lesson, index) => {
              const config = LEVEL_CONFIG[lesson.level] || LEVEL_CONFIG.BEGINNER;
              return (
                <Link 
                  key={lesson.id} 
                  to={`/lessons/${lesson.id}`} 
                  className="lesson-card"
                  style={{ animationDelay: `${index * 0.05}s`, '--level-color': config.color }}
                  aria-label={`${lesson.title} — уровень ${config.label}`}
                >
                  <div className="lesson-card-top">
                    <span className="lesson-level-tag" style={{ background: config.color }}>
                      {config.emoji} {config.label}
                    </span>
                    <button 
                      className="tts-btn-sm"
                      onClick={(e) => { e.preventDefault(); speak(lesson.title, 'en-US'); }}
                      aria-label={`Озвучить: ${lesson.title}`}
                      title="Озвучить название"
                    >
                      🔊
                    </button>
                  </div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                  <div className="lesson-card-footer">
                    <span className="lesson-go">Начать →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Lessons;
