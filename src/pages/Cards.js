import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAccessibility } from '../context/AccessibilityContext';
import { usePoints } from '../context/PointsContext';
import API_URL from '../config';
import './Cards.css';

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const { speak } = useAccessibility();
  const { learnCard } = usePoints();
  const [learnedIds, setLearnedIds] = useState(new Set());

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cards`);
      setCards(response.data);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleFlip = () => {
    setFlipped(!flipped);
    const card = cards[currentIndex];
    if (!flipped) {
      // Flipping to translation side - speak the translation
      speak(card.translation, 'ru-RU');
    } else {
      // Flipping back - speak English word
      speak(card.englishWord, 'en-US');
    }
  };

  const markLearned = () => {
    const card = cards[currentIndex];
    if (!learnedIds.has(card.id)) {
      setLearnedIds(prev => new Set([...prev, card.id]));
      if (learnCard) learnCard();
      speak('Отлично! Слово выучено!', 'ru-RU');
    }
    nextCard();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Загрузка карточек...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="container">
        <div className="page-hero">
          <div className="page-hero-content">
            <span className="page-hero-emoji" aria-hidden="true">🃏</span>
            <div>
              <h1>Карточки</h1>
              <p>Карточки не найдены</p>
            </div>
          </div>
        </div>
        <div className="empty-state">
          <span>🃏</span>
          <p>Карточек пока нет</p>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <main className="cards-page" role="main">
      <div className="container">
        {/* Header */}
        <div className="page-hero">
          <div className="page-hero-content">
            <span className="page-hero-emoji" aria-hidden="true">🃏</span>
            <div>
              <h1>Карточки для изучения</h1>
              <p>Нажимайте на карточку, чтобы увидеть перевод. Слушайте произношение!</p>
            </div>
          </div>
          <button 
            className="tts-btn"
            onClick={() => speak('Карточки для изучения. Нажимайте на карточку, чтобы увидеть перевод.', 'ru-RU')}
            aria-label="Озвучить заголовок"
          >
            🔊
          </button>
        </div>

        {/* Progress */}
        <div className="cards-progress" aria-label={`Карточка ${currentIndex + 1} из ${cards.length}. Выучено: ${learnedIds.size}`}>
          <div className="cards-progress-bar">
            <div 
              className="cards-progress-fill" 
              style={{ width: `${(learnedIds.size / cards.length) * 100}%` }}
              role="progressbar"
              aria-valuenow={learnedIds.size}
              aria-valuemin={0}
              aria-valuemax={cards.length}
            ></div>
          </div>
          <span className="cards-progress-text">
            Выучено: {learnedIds.size}/{cards.length} | Карточка {currentIndex + 1}/{cards.length}
          </span>
        </div>

        <div className="cards-container">
          <div className="card-flip-container">
            <div
              className={`card-flip ${flipped ? 'flipped' : ''} ${learnedIds.has(currentCard.id) ? 'learned' : ''}`}
              onClick={handleFlip}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
              aria-label={flipped 
                ? `Перевод: ${currentCard.translation}. Нажмите, чтобы перевернуть.` 
                : `Слово: ${currentCard.englishWord}. Нажмите, чтобы перевернуть.`
              }
            >
              <div className="card-front">
                {currentCard.imageUrl && (
                  <img src={currentCard.imageUrl} alt={currentCard.englishWord} />
                )}
                <h2>{currentCard.englishWord}</h2>
                <p className="card-hint">Нажмите, чтобы перевернуть</p>
                {learnedIds.has(currentCard.id) && <span className="card-learned-badge">✅ Выучено</span>}
              </div>
              <div className="card-back">
                <h2>{currentCard.translation}</h2>
                {currentCard.example && (
                  <p className="example">{currentCard.example}</p>
                )}
                <p className="card-hint">Нажмите, чтобы перевернуть</p>
              </div>
            </div>
          </div>

          {/* TTS buttons */}
          <div className="card-tts-actions">
            <button
              className="btn btn-outline btn-sm tts-action-btn"
              onClick={(e) => { e.stopPropagation(); speak(currentCard.englishWord, 'en-US'); }}
              aria-label={`Произнести: ${currentCard.englishWord}`}
              title="Произнести слово"
            >
              🔊 Произнести слово
            </button>
            <button
              className="btn btn-outline btn-sm tts-action-btn"
              onClick={(e) => { e.stopPropagation(); speak(currentCard.translation, 'ru-RU'); }}
              aria-label={`Произнести перевод: ${currentCard.translation}`}
              title="Произнести перевод"
            >
              🔊 Произнести перевод
            </button>
            {currentCard.example && (
              <button
                className="btn btn-outline btn-sm tts-action-btn"
                onClick={(e) => { e.stopPropagation(); speak(currentCard.example, 'en-US'); }}
                aria-label="Произнести пример"
                title="Произнести пример"
              >
                🔊 Пример
              </button>
            )}
          </div>

          <div className="card-navigation">
            <button onClick={prevCard} className="btn btn-secondary" aria-label="Предыдущая карточка">
              ← Предыдущая
            </button>
            <button 
              onClick={markLearned} 
              className={`btn ${learnedIds.has(currentCard.id) ? 'btn-secondary' : 'btn-accent'}`}
              aria-label="Отметить как выученное и перейти дальше"
            >
              {learnedIds.has(currentCard.id) ? '✅ Выучено' : '✨ Запомнил!'}
            </button>
            <button onClick={nextCard} className="btn btn-primary" aria-label="Следующая карточка">
              Следующая →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cards;
