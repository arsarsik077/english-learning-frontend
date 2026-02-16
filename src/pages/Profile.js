import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePoints } from '../context/PointsContext';
import API_URL from '../config';
import { useAccessibility } from '../context/AccessibilityContext';
import './Profile.css';

const Profile = () => {
  const { stats, levelInfo, xpProgress, achievements } = usePoints();
  const { speak } = useAccessibility();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    avatarUrl: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('${API_URL}/api/user/profile');
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        avatarUrl: response.data.avatarUrl || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('${API_URL}/api/user/profile', formData);
      await fetchProfile();
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!profile) {
    return <div className="loading"><div className="loading-spinner"></div>Загрузка...</div>;
  }

  const unlockedAchievements = achievements.filter(a => stats.unlockedAchievements.includes(a.id));

  return (
    <div className="container">
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-card-header">
            <h2>👤 Мой профиль</h2>
            <button 
              className="tts-btn-sm"
              onClick={() => speak(`Профиль пользователя ${profile.username}. ${levelInfo.title}, уровень ${levelInfo.level}. Очков опыта: ${stats.totalXP}. Баллов: ${stats.totalPoints}. Серия: ${stats.streak} дней.`, 'ru-RU')}
              aria-label="Озвучить информацию профиля"
            >
              🔊
            </button>
          </div>
          {!editing ? (
            <div className="profile-info">
              <div className="profile-avatar">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="profile-details">
                <p><strong>Имя пользователя:</strong> {profile.username}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Имя:</strong> {profile.firstName || 'Не указано'}</p>
                <p><strong>Фамилия:</strong> {profile.lastName || 'Не указано'}</p>
                <p><strong>Роль:</strong> {profile.role === 'ADMIN' ? '⚙️ Администратор' : '🎓 Студент'}</p>
              </div>
              <button onClick={() => setEditing(true)} className="btn btn-primary">
                ✏️ Редактировать
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Имя</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Фамилия</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>URL аватара</label>
                <input type="url" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Сохранить</button>
                <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">Отмена</button>
              </div>
            </form>
          )}
        </div>

        {/* Progress Stats */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h2>📊 Мой прогресс</h2>
            <button 
              className="tts-btn-sm"
              onClick={() => speak(`Мой прогресс. ${levelInfo.title}, уровень ${levelInfo.level}. Очков опыта: ${stats.totalXP}. Баллов: ${stats.totalPoints}. Серия дней: ${stats.streak}. Правильных ответов: ${stats.correctAnswers}. Игр сыграно: ${stats.gamesPlayed}. Уроков пройдено: ${stats.lessonsCompleted}.`, 'ru-RU')}
              aria-label="Озвучить прогресс"
            >
              🔊
            </button>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div className="badge badge-xp" style={{ fontSize: 'var(--fs-lg)', padding: '10px 24px' }}>
              {levelInfo.title} — Уровень {levelInfo.level}
            </div>
            <div style={{ maxWidth: 400, margin: '16px auto' }}>
              <div className="xp-bar" role="progressbar" aria-valuenow={xpProgress} aria-valuemin="0" aria-valuemax="100" style={{ height: 12 }}>
                <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }}></div>
              </div>
              <small style={{ color: 'var(--text-muted)' }}>{stats.totalXP} / {levelInfo.nextLevelXP === Infinity ? '∞' : levelInfo.nextLevelXP} XP</small>
            </div>
          </div>
          <div className="profile-stats-grid">
            <div className="profile-stat">
              <div className="profile-stat-icon">⚡</div>
              <h4>{stats.totalXP}</h4>
              <p>Очки опыта</p>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-icon">🪙</div>
              <h4>{stats.totalPoints}</h4>
              <p>Баллы</p>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-icon">🔥</div>
              <h4>{stats.streak}</h4>
              <p>Серия (дней)</p>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-icon">✅</div>
              <h4>{stats.correctAnswers}</h4>
              <p>Правильных ответов</p>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-icon">🎮</div>
              <h4>{stats.gamesPlayed}</h4>
              <p>Игр сыграно</p>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-icon">📚</div>
              <h4>{stats.lessonsCompleted}</h4>
              <p>Уроков пройдено</p>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-icon">🃏</div>
              <h4>{stats.cardsLearned}</h4>
              <p>Карточек изучено</p>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-icon">💬</div>
              <h4>{stats.aiMessages}</h4>
              <p>Сообщений AI</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h2>🏆 Достижения ({unlockedAchievements.length}/{achievements.length})</h2>
            <button 
              className="tts-btn-sm"
              onClick={() => {
                const unlocked = unlockedAchievements.map(a => a.title).join(', ');
                speak(`Достижения. Получено ${unlockedAchievements.length} из ${achievements.length}. ${unlocked ? 'Разблокированные: ' + unlocked : 'Пока нет разблокированных достижений.'}`, 'ru-RU');
              }}
              aria-label="Озвучить достижения"
            >
              🔊
            </button>
          </div>
          <div className="profile-stats-grid">
            {achievements.map(a => (
              <div key={a.id} className="profile-stat" style={{
                opacity: stats.unlockedAchievements.includes(a.id) ? 1 : 0.4,
                borderColor: stats.unlockedAchievements.includes(a.id) ? 'var(--gold)' : 'var(--border)',
              }}>
                <div className="profile-stat-icon">{a.icon}</div>
                <h4 style={{ fontSize: 'var(--fs-sm)' }}>{a.title}</h4>
                <p>{a.description}</p>
                <span className="badge badge-xp" style={{ marginTop: 8 }}>+{a.xpReward} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
