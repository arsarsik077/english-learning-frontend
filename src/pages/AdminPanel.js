import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../config';
import './AdminPanel.css';

const TABS = [
  { key: 'lessons', label: 'Уроки', emoji: '📖' },
  { key: 'videos', label: 'Видео', emoji: '🎬' },
  { key: 'assignments', label: 'Задания', emoji: '✏️' },
  { key: 'cards', label: 'Карточки', emoji: '🃏' },
  { key: 'games', label: 'Игры', emoji: '🎮' },
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('lessons');
  const [formData, setFormData] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/${activeTab}`);
      setItems(response.data);
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchItems();
    setDeleteConfirm(null);
  }, [fetchItems]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/${activeTab}`, formData);
      alert('Успешно создано!');
      setFormData({});
      e.target.reset();
      fetchItems();
    } catch (error) {
      console.error('Error creating:', error);
      alert('Ошибка при создании');
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/api/${activeTab}/${id}`);
      setDeleteConfirm(null);
      fetchItems();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Ошибка при удалении');
    } finally {
      setDeleting(false);
    }
  };

  const renderItemInfo = (item) => {
    switch (activeTab) {
      case 'lessons':
        return (
          <>
            <span className="item-title">{item.title}</span>
            {item.level && <span className="item-badge">{item.level}</span>}
            {item.description && <span className="item-desc">{item.description}</span>}
          </>
        );
      case 'videos':
        return (
          <>
            <span className="item-title">{item.title}</span>
            {item.duration && (
              <span className="item-badge">
                {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
              </span>
            )}
            {item.description && <span className="item-desc">{item.description}</span>}
          </>
        );
      case 'assignments':
        return (
          <>
            <span className="item-title">{item.title}</span>
            {item.description && <span className="item-desc">{item.description}</span>}
          </>
        );
      case 'cards':
        return (
          <>
            <span className="item-title">{item.englishWord}</span>
            <span className="item-badge">{item.translation}</span>
            {item.example && <span className="item-desc">{item.example}</span>}
          </>
        );
      case 'games':
        return (
          <>
            <span className="item-title">{item.title}</span>
            {item.gameType && <span className="item-badge">{item.gameType}</span>}
            {item.level && <span className="item-badge">{item.level}</span>}
          </>
        );
      default:
        return <span className="item-title">{item.title || item.id}</span>;
    }
  };

  return (
    <div className="container">
      <div className="admin-panel">
        <h1>Админ-панель</h1>

        <div className="admin-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'tab active' : 'tab'}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        <div className="admin-content">
          {/* ── Create Form ── */}
          <div className="admin-section">
            <h2>Создать</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              {activeTab === 'lessons' && (
                <>
                  <div className="input-group">
                    <label>Название</label>
                    <input type="text" name="title" onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Описание</label>
                    <textarea name="description" onChange={handleChange} rows={3} />
                  </div>
                  <div className="input-group">
                    <label>Уровень</label>
                    <select name="level" onChange={handleChange} required>
                      <option value="">Выберите уровень</option>
                      <option value="BEGINNER">Начальный</option>
                      <option value="INTERMEDIATE">Средний</option>
                      <option value="ADVANCED">Продвинутый</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'videos' && (
                <>
                  <div className="input-group">
                    <label>Название</label>
                    <input type="text" name="title" onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Описание</label>
                    <textarea name="description" onChange={handleChange} rows={3} />
                  </div>
                  <div className="input-group">
                    <label>URL видео</label>
                    <input type="url" name="videoUrl" onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>URL миниатюры</label>
                    <input type="url" name="thumbnailUrl" onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>Длительность (секунды)</label>
                    <input type="number" name="duration" onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>ID урока</label>
                    <input type="number" name="lesson.id" onChange={handleChange} />
                  </div>
                </>
              )}

              {activeTab === 'assignments' && (
                <>
                  <div className="input-group">
                    <label>Название</label>
                    <input type="text" name="title" onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Описание</label>
                    <textarea name="description" onChange={handleChange} rows={3} />
                  </div>
                  <div className="input-group">
                    <label>Инструкции</label>
                    <textarea name="instructions" onChange={handleChange} rows={3} />
                  </div>
                  <div className="input-group">
                    <label>ID урока</label>
                    <input type="number" name="lesson.id" onChange={handleChange} />
                  </div>
                </>
              )}

              {activeTab === 'cards' && (
                <>
                  <div className="input-group">
                    <label>Английское слово</label>
                    <input type="text" name="englishWord" onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Перевод</label>
                    <input type="text" name="translation" onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Пример</label>
                    <textarea name="example" onChange={handleChange} rows={2} />
                  </div>
                  <div className="input-group">
                    <label>URL изображения</label>
                    <input type="url" name="imageUrl" onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>ID урока</label>
                    <input type="number" name="lesson.id" onChange={handleChange} />
                  </div>
                </>
              )}

              {activeTab === 'games' && (
                <>
                  <div className="input-group">
                    <label>Название</label>
                    <input type="text" name="title" onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Описание</label>
                    <textarea name="description" onChange={handleChange} rows={3} />
                  </div>
                  <div className="input-group">
                    <label>Тип игры</label>
                    <input type="text" name="gameType" onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Данные игры (JSON)</label>
                    <textarea name="gameData" onChange={handleChange} rows={4} />
                  </div>
                  <div className="input-group">
                    <label>Уровень</label>
                    <select name="level" onChange={handleChange} required>
                      <option value="">Выберите уровень</option>
                      <option value="BEGINNER">Начальный</option>
                      <option value="INTERMEDIATE">Средний</option>
                      <option value="ADVANCED">Продвинутый</option>
                    </select>
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary">Создать</button>
            </form>
          </div>

          {/* ── Records List ── */}
          <div className="admin-section">
            <div className="section-header">
              <h2>
                Все записи
                <span className="records-count">{items.length}</span>
              </h2>
              <button className="btn btn-secondary btn-sm" onClick={fetchItems}>
                🔄 Обновить
              </button>
            </div>

            {loading ? (
              <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Загрузка...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="admin-empty">
                <p>Записей пока нет</p>
              </div>
            ) : (
              <div className="records-list">
                {items.map((item) => (
                  <div key={item.id} className="record-item">
                    <div className="record-info">
                      <span className="record-id">#{item.id}</span>
                      {renderItemInfo(item)}
                    </div>
                    <div className="record-actions">
                      {deleteConfirm === item.id ? (
                        <div className="delete-confirm">
                          <span className="confirm-text">Удалить?</span>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting}
                          >
                            {deleting ? '...' : 'Да'}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setDeleteConfirm(null)}
                            disabled={deleting}
                          >
                            Нет
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-danger-outline btn-sm"
                          onClick={() => setDeleteConfirm(item.id)}
                        >
                          🗑 Удалить
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
