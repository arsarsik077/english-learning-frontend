import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePoints } from '../context/PointsContext';
import { useAccessibility } from '../context/AccessibilityContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const { stats, levelInfo, xpProgress, achievements } = usePoints();
  const { speak } = useAccessibility();

  const features = [
    { icon: '📚', title: 'Уроки', desc: 'Интерактивные уроки для всех уровней', path: '/lessons', color: '#2B6CB0' },
    { icon: '🎬', title: 'Видео', desc: 'Обучающие видео для практики', path: '/videos', color: '#D69E2E' },
    { icon: '📝', title: 'Задания', desc: 'Практикуйтесь и закрепляйте знания', path: '/assignments', color: '#38A169' },
    { icon: '🃏', title: 'Карточки', desc: 'Изучайте слова с карточками', path: '/cards', color: '#9F7AEA' },
    { icon: '🎮', title: 'Игры', desc: 'Учитесь играя', path: '/games', color: '#ED8936' },
    { icon: '🤖', title: 'AI Помощник', desc: 'Общайтесь с AI на английском', path: '/ai-chat', color: '#E53E3E' },
  ];

  const unlockedCount = stats.unlockedAchievements.length;

  return (
    <main className="home" role="main">
      {/* Hero Section */}
      <section className="hero" aria-label="Приветствие">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">🌟 Платформа для изучения английского</div>
          <h1 className="hero-title">
            Изучайте <span className="gradient-text">английский</span> легко и с удовольствием
          </h1>
          <p className="hero-subtitle">
            Интерактивные уроки, игры, AI-помощник и система наград сделают ваше обучение эффективным и увлекательным
          </p>
          <button 
            className="tts-btn hero-tts"
            onClick={() => speak('Изучайте английский легко и с удовольствием! Интерактивные уроки, игры, AI-помощник и система наград сделают ваше обучение эффективным и увлекательным.', 'ru-RU')}
            aria-label="Озвучить приветствие"
            title="Озвучить"
          >
            🔊
          </button>
          {!user ? (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                🚀 Начать обучение
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Войти
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/lessons" className="btn btn-primary btn-lg">
                📚 Продолжить обучение
              </Link>
              <Link to="/ai-chat" className="btn btn-accent btn-lg">
                🤖 Общаться с AI
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* User Progress Section (if logged in) */}
      {user && (
        <section className="progress-section" aria-label="Ваш прогресс">
          <div className="container">
            <div className="progress-grid">
              <div className="progress-card level-card">
                <div className="progress-card-icon">🎓</div>
                <div className="progress-card-info">
                  <h3>{levelInfo.title}</h3>
                  <p>Уровень {levelInfo.level}</p>
                  <div className="xp-bar" role="progressbar" aria-valuenow={xpProgress} aria-valuemin="0" aria-valuemax="100">
                    <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }}></div>
                  </div>
                  <small>{stats.totalXP} / {levelInfo.nextLevelXP === Infinity ? '∞' : levelInfo.nextLevelXP} XP</small>
                </div>
              </div>
              <div className="progress-card">
                <div className="progress-card-icon">🔥</div>
                <div className="progress-card-info">
                  <h3>{stats.streak}</h3>
                  <p>Дней подряд</p>
                </div>
              </div>
              <div className="progress-card">
                <div className="progress-card-icon">⚡</div>
                <div className="progress-card-info">
                  <h3>{stats.totalXP}</h3>
                  <p>Очков опыта</p>
                </div>
              </div>
              <div className="progress-card">
                <div className="progress-card-icon">🏆</div>
                <div className="progress-card-info">
                  <h3>{unlockedCount}/{achievements.length}</h3>
                  <p>Достижений</p>
                </div>
              </div>
              <div className="progress-card">
                <div className="progress-card-icon">✅</div>
                <div className="progress-card-info">
                  <h3>{stats.correctAnswers}</h3>
                  <p>Правильных ответов</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="features-section" aria-label="Разделы обучения">
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-title">Инструменты для обучения</h2>
            <button 
              className="tts-btn-sm"
              onClick={() => speak('Инструменты для обучения. Уроки, видео, задания, карточки, игры и AI помощник.', 'ru-RU')}
              aria-label="Озвучить раздел"
            >
              🔊
            </button>
          </div>
          <p className="section-subtitle">Выберите удобный способ изучения английского языка</p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <Link
                key={feature.path}
                to={feature.path}
                className="feature-card"
                style={{ animationDelay: `${index * 0.1}s`, '--card-color': feature.color }}
                aria-label={`${feature.title} — ${feature.desc}`}
              >
                <div className="feature-icon-wrap">
                  <span className="feature-icon" aria-hidden="true">{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
                <span className="feature-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Preview */}
      <section className="achievements-section" aria-label="Достижения">
        <div className="container">
          <h2 className="section-title">🏆 Достижения</h2>
          <p className="section-subtitle">Зарабатывайте награды за прогресс в обучении</p>
          <div className="achievements-grid">
            {achievements.map(a => (
              <div
                key={a.id}
                className={`achievement-card ${stats.unlockedAchievements.includes(a.id) ? 'unlocked' : 'locked'}`}
                aria-label={`${a.title} - ${a.description}${stats.unlockedAchievements.includes(a.id) ? ' (получено)' : ' (не получено)'}`}
              >
                <span className="achievement-icon" aria-hidden="true">{a.icon}</span>
                <h4>{a.title}</h4>
                <p>{a.description}</p>
                <span className="achievement-xp">+{a.xpReward} XP</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section className="access-section" aria-label="Доступность">
        <div className="container">
          <div className="access-card">
            <div className="access-content">
              <div className="section-title-row">
                <h2>♿ Доступность для всех</h2>
                <button 
                  className="tts-btn-sm"
                  onClick={() => speak('Доступность для всех. Наша платформа адаптирована для людей с ограниченными возможностями. Поддержка экранных чтецов, текст в речь, увеличение текста, высокий контраст, специальный шрифт для дислексии и клавиатурная навигация.', 'ru-RU')}
                  aria-label="Озвучить раздел доступности"
                >
                  🔊
                </button>
              </div>
              <p>Наша платформа адаптирована для людей с ограниченными возможностями:</p>
              <div className="access-features">
                <div className="access-item">
                  <span aria-hidden="true">🔊</span>
                  <div>
                    <strong>Для незрячих</strong>
                    <p>Поддержка экранных чтецов, текст в речь</p>
                  </div>
                </div>
                <div className="access-item">
                  <span aria-hidden="true">👁️</span>
                  <div>
                    <strong>Для слабовидящих</strong>
                    <p>Увеличение текста, высокий контраст</p>
                  </div>
                </div>
                <div className="access-item">
                  <span aria-hidden="true">📖</span>
                  <div>
                    <strong>Для дислексии</strong>
                    <p>Специальный шрифт OpenDyslexic</p>
                  </div>
                </div>
                <div className="access-item">
                  <span aria-hidden="true">⌨️</span>
                  <div>
                    <strong>Клавиатурная навигация</strong>
                    <p>Полное управление без мыши</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
