import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('lessons');
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, endpoint) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/${endpoint}`, formData);
      alert('Успешно создано!');
      setFormData({});
    } catch (error) {
      console.error('Error creating:', error);
      alert('Ошибка при создании');
    }
  };

  return (
    <div className="container">
      <div className="admin-panel">
        <h1>Админ-панель</h1>
        <div className="admin-tabs">
          <button
            className={activeTab === 'lessons' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('lessons')}
          >
            Уроки
          </button>
          <button
            className={activeTab === 'videos' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('videos')}
          >
            Видео
          </button>
          <button
            className={activeTab === 'assignments' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('assignments')}
          >
            Задания
          </button>
          <button
            className={activeTab === 'cards' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('cards')}
          >
            Карточки
          </button>
          <button
            className={activeTab === 'games' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('games')}
          >
            Игры
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'lessons' && (
            <form onSubmit={(e) => handleSubmit(e, 'lessons')} className="admin-form">
              <h2>Создать урок</h2>
              <div className="input-group">
                <label>Название</label>
                <input type="text" name="title" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Описание</label>
                <textarea name="description" onChange={handleChange} rows={4} />
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
              <button type="submit" className="btn btn-primary">Создать</button>
            </form>
          )}

          {activeTab === 'videos' && (
            <form onSubmit={(e) => handleSubmit(e, 'videos')} className="admin-form">
              <h2>Создать видео</h2>
              <div className="input-group">
                <label>Название</label>
                <input type="text" name="title" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Описание</label>
                <textarea name="description" onChange={handleChange} rows={4} />
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
              <button type="submit" className="btn btn-primary">Создать</button>
            </form>
          )}

          {activeTab === 'assignments' && (
            <form onSubmit={(e) => handleSubmit(e, 'assignments')} className="admin-form">
              <h2>Создать задание</h2>
              <div className="input-group">
                <label>Название</label>
                <input type="text" name="title" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Описание</label>
                <textarea name="description" onChange={handleChange} rows={4} />
              </div>
              <div className="input-group">
                <label>Инструкции</label>
                <textarea name="instructions" onChange={handleChange} rows={4} />
              </div>
              <div className="input-group">
                <label>ID урока</label>
                <input type="number" name="lesson.id" onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary">Создать</button>
            </form>
          )}

          {activeTab === 'cards' && (
            <form onSubmit={(e) => handleSubmit(e, 'cards')} className="admin-form">
              <h2>Создать карточку</h2>
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
                <textarea name="example" onChange={handleChange} rows={3} />
              </div>
              <div className="input-group">
                <label>URL изображения</label>
                <input type="url" name="imageUrl" onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>ID урока</label>
                <input type="number" name="lesson.id" onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary">Создать</button>
            </form>
          )}

          {activeTab === 'games' && (
            <form onSubmit={(e) => handleSubmit(e, 'games')} className="admin-form">
              <h2>Создать игру</h2>
              <div className="input-group">
                <label>Название</label>
                <input type="text" name="title" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Описание</label>
                <textarea name="description" onChange={handleChange} rows={4} />
              </div>
              <div className="input-group">
                <label>Тип игры</label>
                <input type="text" name="gameType" onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Данные игры (JSON)</label>
                <textarea name="gameData" onChange={handleChange} rows={6} />
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
              <button type="submit" className="btn btn-primary">Создать</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;


