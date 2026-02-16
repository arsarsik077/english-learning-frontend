import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import './AccessibilityPanel.css';

const AccessibilityPanel = () => {
  const {
    theme, setTheme,
    fontSize, setFontSize,
    screenReaderMode, setScreenReaderMode,
    reducedMotion, setReducedMotion,
    dyslexiaFont, setDyslexiaFont,
    showPanel, setShowPanel,
  } = useAccessibility();

  if (!showPanel) return null;

  return (
    <div className="a11y-overlay" onClick={() => setShowPanel(false)} role="dialog" aria-label="Настройки доступности">
      <div className="a11y-panel" onClick={(e) => e.stopPropagation()} role="document">
        <div className="a11y-header">
          <h2>♿ Доступность</h2>
          <button 
            className="a11y-close" 
            onClick={() => setShowPanel(false)}
            aria-label="Закрыть панель доступности"
          >
            ✕
          </button>
        </div>

        <div className="a11y-section">
          <h3>🎨 Тема оформления</h3>
          <div className="a11y-options">
            <button 
              className={`a11y-option ${theme === 'default' ? 'active' : ''}`}
              onClick={() => setTheme('default')}
              aria-pressed={theme === 'default'}
            >
              <span className="a11y-icon">☀️</span>
              Светлая
            </button>
            <button 
              className={`a11y-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
              aria-pressed={theme === 'dark'}
            >
              <span className="a11y-icon">🌙</span>
              Тёмная
            </button>
            <button 
              className={`a11y-option ${theme === 'high-contrast' ? 'active' : ''}`}
              onClick={() => setTheme('high-contrast')}
              aria-pressed={theme === 'high-contrast'}
            >
              <span className="a11y-icon">🔲</span>
              Контрастная
            </button>
          </div>
        </div>

        <div className="a11y-section">
          <h3>🔤 Размер текста</h3>
          <div className="a11y-options">
            <button 
              className={`a11y-option ${fontSize === 'normal' ? 'active' : ''}`}
              onClick={() => setFontSize('normal')}
              aria-pressed={fontSize === 'normal'}
            >
              <span style={{fontSize: '14px'}}>A</span>
              Обычный
            </button>
            <button 
              className={`a11y-option ${fontSize === 'large' ? 'active' : ''}`}
              onClick={() => setFontSize('large')}
              aria-pressed={fontSize === 'large'}
            >
              <span style={{fontSize: '18px'}}>A</span>
              Большой
            </button>
            <button 
              className={`a11y-option ${fontSize === 'x-large' ? 'active' : ''}`}
              onClick={() => setFontSize('x-large')}
              aria-pressed={fontSize === 'x-large'}
            >
              <span style={{fontSize: '22px'}}>A</span>
              Очень большой
            </button>
          </div>
        </div>

        <div className="a11y-section">
          <h3>⚙️ Дополнительно</h3>
          
          <label className="a11y-toggle">
            <input 
              type="checkbox" 
              checked={screenReaderMode} 
              onChange={(e) => setScreenReaderMode(e.target.checked)}
              aria-label="Режим для экранного чтеца"
            />
            <span className="a11y-toggle-slider"></span>
            <span className="a11y-toggle-label">
              <span className="a11y-icon">🔊</span>
              Режим экранного чтеца
              <small>Дополнительные aria-метки для незрячих</small>
            </span>
          </label>

          <label className="a11y-toggle">
            <input 
              type="checkbox" 
              checked={reducedMotion} 
              onChange={(e) => setReducedMotion(e.target.checked)}
              aria-label="Уменьшить анимации"
            />
            <span className="a11y-toggle-slider"></span>
            <span className="a11y-toggle-label">
              <span className="a11y-icon">🚫</span>
              Уменьшить анимации
              <small>Отключает движения для эпилепсии</small>
            </span>
          </label>

          <label className="a11y-toggle">
            <input 
              type="checkbox" 
              checked={dyslexiaFont} 
              onChange={(e) => setDyslexiaFont(e.target.checked)}
              aria-label="Шрифт для дислексии"
            />
            <span className="a11y-toggle-slider"></span>
            <span className="a11y-toggle-label">
              <span className="a11y-icon">📖</span>
              Шрифт для дислексии
              <small>Более читаемый шрифт OpenDyslexic</small>
            </span>
          </label>
        </div>

        <div className="a11y-section a11y-info">
          <h3>ℹ️ Горячие клавиши</h3>
          <div className="a11y-shortcuts">
            <div><kbd>Tab</kbd> — Навигация по элементам</div>
            <div><kbd>Enter</kbd> — Активация элемента</div>
            <div><kbd>Esc</kbd> — Закрыть панель</div>
            <div><kbd>Alt+A</kbd> — Открыть доступность</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;


