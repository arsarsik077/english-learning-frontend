import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePoints } from '../context/PointsContext';
import { useAccessibility } from '../context/AccessibilityContext';
import './AIChat.css';

/* ====================================
   AI English Tutor with Real AI
   Cute Owl Character "Luna"
   ==================================== */

// ---- Gemini AI Integration ----
const SYSTEM_PROMPT = `Ты — Luna (Луна), милая и дружелюбная AI-сова, которая помогает изучать английский язык. 
Ты общаешься тепло, с добротой, как лучший друг и учитель одновременно.

Твои правила:
1. Отвечай кратко но содержательно (2-4 предложения обычно).
2. Если пользователь пишет на русском — отвечай на русском, но включай английские слова/фразы для обучения.
3. Если пользователь пишет на английском — хвали за это и мягко исправляй ошибки если есть.
4. Используй эмодзи умеренно (1-2 на сообщение).
5. Давай практические примеры и предлагай попрактиковаться.
6. Будь поддерживающей и позитивной.
7. Адаптируйся к уровню пользователя.
8. Иногда предлагай мини-задания: "Попробуй составить предложение с этим словом!"
9. Если просят перевод — давай перевод с примером использования.
10. Не используй markdown форматирование (жирный текст, списки). Пиши простым текстом.`;

const DEFAULT_GEMINI_KEY = 'AIzaSyBUTeYW7NEst7RRPH1MqJJjleQRkh4P-So';
const getApiKey = () => localStorage.getItem('gemini_api_key') || DEFAULT_GEMINI_KEY;

// Models to try in order (fallback chain)
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash-lite',
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callGeminiAPI = async (messages) => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const contents = messages.map(msg => ({
    role: msg.type === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const requestBody = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents: contents,
    generationConfig: {
      temperature: 0.8,
      topP: 0.9,
      maxOutputTokens: 500,
    }
  };

  // Try each model in the fallback chain
  for (let i = 0; i < GEMINI_MODELS.length; i++) {
    const model = GEMINI_MODELS[i];
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 429) {
        // Rate limited — try next model or retry after delay
        console.warn(`Model ${model} rate limited, trying next...`);
        
        // If last model, wait and retry once
        if (i === GEMINI_MODELS.length - 1) {
          console.log('All models rate limited, waiting 5s and retrying...');
          await sleep(5000);
          const retryRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            const retryText = retryData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (retryText) return { success: true, text: retryText };
          }
          return { success: false, error: 'Превышен лимит запросов. Подождите минуту и попробуйте снова.' };
        }
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.error?.message || `HTTP ${response.status}`;
        // If it's a model-not-found error, try the next one
        if (response.status === 404) {
          console.warn(`Model ${model} not found, trying next...`);
          continue;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response');
      return { success: true, text };

    } catch (error) {
      console.error(`Gemini API error (${model}):`, error);
      // If not the last model, try the next one
      if (i < GEMINI_MODELS.length - 1) continue;
      return { success: false, error: error.message };
    }
  }

  return { success: false, error: 'Не удалось получить ответ от AI.' };
};

// ---- Beautiful Luna Character (SVG) ----
const LunaCharacter = ({ mood = 'idle', speaking = false }) => {
  // Dynamic eye shapes based on mood
  const getLeftEye = () => {
    switch (mood) {
      case 'happy': return <path d="M62 82 Q70 76 78 82" stroke="#2D1B4E" strokeWidth="3" fill="none" strokeLinecap="round" />;
      case 'thinking': return <ellipse cx="70" cy="80" rx="9" ry="10" fill="white" stroke="#C4B5D9" strokeWidth="1.5"><animate attributeName="ry" values="10;8;10" dur="2s" repeatCount="indefinite"/></ellipse>;
      case 'excited': return <text x="70" y="85" textAnchor="middle" fontSize="16" fill="#FFD700">★</text>;
      default: return <ellipse cx="70" cy="80" rx="9" ry="10" fill="white" stroke="#C4B5D9" strokeWidth="1.5"/>;
    }
  };
  const getRightEye = () => {
    switch (mood) {
      case 'happy': return <path d="M102 82 Q110 76 118 82" stroke="#2D1B4E" strokeWidth="3" fill="none" strokeLinecap="round" />;
      case 'thinking': return <ellipse cx="110" cy="80" rx="9" ry="10" fill="white" stroke="#C4B5D9" strokeWidth="1.5"><animate attributeName="ry" values="10;8;10" dur="2s" repeatCount="indefinite"/></ellipse>;
      case 'excited': return <text x="110" y="85" textAnchor="middle" fontSize="16" fill="#FFD700">★</text>;
      default: return <ellipse cx="110" cy="80" rx="9" ry="10" fill="white" stroke="#C4B5D9" strokeWidth="1.5"/>;
    }
  };

  return (
    <div className={`luna-character ${mood} ${speaking ? 'speaking' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 180 220" className="luna-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Gradients */}
          <radialGradient id="bodyGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#A78BDA" />
            <stop offset="100%" stopColor="#7C5CBF" />
          </radialGradient>
          <radialGradient id="bellyGrad" cx="50%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#F5F0FF" />
            <stop offset="100%" stopColor="#E8DFF5" />
          </radialGradient>
          <radialGradient id="faceGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFF8F0" />
            <stop offset="100%" stopColor="#F0E6F6" />
          </radialGradient>
          <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3D3D5C" />
            <stop offset="100%" stopColor="#2D2B4E" />
          </linearGradient>
          <linearGradient id="wingGradL" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9B7FCC" />
            <stop offset="100%" stopColor="#6B4FA8" />
          </linearGradient>
          <linearGradient id="wingGradR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B7FCC" />
            <stop offset="100%" stopColor="#6B4FA8" />
          </linearGradient>
          {/* Soft shadow */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7C5CBF" floodOpacity="0.18"/>
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Floating animation container */}
        <g className="luna-float">
          {/* Shadow on ground */}
          <ellipse cx="90" cy="212" rx="38" ry="7" fill="#7C5CBF" opacity="0.13" className="luna-shadow"/>

          {/* Ear tufts */}
          <g className="luna-ears">
            <path d="M58 52 Q54 28 66 42 Q60 36 58 52Z" fill="#8B6FC0" />
            <path d="M56 50 Q50 22 64 38" stroke="#A78BDA" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M122 52 Q126 28 114 42 Q120 36 122 52Z" fill="#8B6FC0" />
            <path d="M124 50 Q130 22 116 38" stroke="#A78BDA" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </g>

          {/* Body */}
          <ellipse cx="90" cy="155" rx="44" ry="52" fill="url(#bodyGrad)" filter="url(#softShadow)"/>
          
          {/* Belly */}
          <ellipse cx="90" cy="162" rx="30" ry="38" fill="url(#bellyGrad)" />
          {/* Belly feather lines */}
          <path d="M75 148 Q90 143 105 148" stroke="#D6C8EE" strokeWidth="1.2" fill="none" opacity="0.6"/>
          <path d="M72 158 Q90 152 108 158" stroke="#D6C8EE" strokeWidth="1.2" fill="none" opacity="0.5"/>
          <path d="M74 168 Q90 162 106 168" stroke="#D6C8EE" strokeWidth="1.2" fill="none" opacity="0.4"/>

          {/* Wings */}
          <g className={`luna-wing-left ${mood === 'excited' ? 'wave' : ''}`}>
            <path d="M46 130 Q28 145 35 175 Q42 185 50 170 Q45 155 48 140Z" fill="url(#wingGradL)" />
          </g>
          <g className={`luna-wing-right ${mood === 'excited' ? 'wave' : ''}`}>
            <path d="M134 130 Q152 145 145 175 Q138 185 130 170 Q135 155 132 140Z" fill="url(#wingGradR)" />
          </g>

          {/* Head */}
          <ellipse cx="90" cy="78" rx="46" ry="42" fill="url(#bodyGrad)" />

          {/* Face disc */}
          <ellipse cx="90" cy="82" rx="36" ry="30" fill="url(#faceGrad)" />

          {/* Eyes */}
          <g className="luna-eyes">
            {/* Left eye */}
            <g className="luna-eye-left">
              {getLeftEye()}
              {mood !== 'happy' && mood !== 'excited' && (
                <>
                  <circle cx="70" cy="79" r="5.5" fill="#2D1B4E" className="luna-pupil-l">
                    <animate attributeName="cx" values="70;68;72;70" dur="4s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="72" cy="77" r="2" fill="white" opacity="0.9"/>
                  <circle cx="67" cy="81" r="1" fill="white" opacity="0.5"/>
                </>
              )}
            </g>
            {/* Right eye */}
            <g className="luna-eye-right">
              {getRightEye()}
              {mood !== 'happy' && mood !== 'excited' && (
                <>
                  <circle cx="110" cy="79" r="5.5" fill="#2D1B4E" className="luna-pupil-r">
                    <animate attributeName="cx" values="110;108;112;110" dur="4s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="112" cy="77" r="2" fill="white" opacity="0.9"/>
                  <circle cx="107" cy="81" r="1" fill="white" opacity="0.5"/>
                </>
              )}
            </g>
          </g>

          {/* Blush */}
          <ellipse cx="58" cy="90" rx="8" ry="4.5" fill="#FFB8C6" opacity={mood === 'happy' || mood === 'excited' ? 0.7 : 0.35} className="luna-blush"/>
          <ellipse cx="122" cy="90" rx="8" ry="4.5" fill="#FFB8C6" opacity={mood === 'happy' || mood === 'excited' ? 0.7 : 0.35} className="luna-blush"/>

          {/* Beak */}
          <g className={`luna-beak ${speaking ? 'talking' : ''}`}>
            <path d="M84 95 L90 103 L96 95Z" fill="#F6AD55" stroke="#E8993C" strokeWidth="0.5"/>
            {speaking && (
              <path d="M85 103 Q90 108 95 103" fill="#E8993C" className="luna-mouth-open"/>
            )}
          </g>

          {/* Feet */}
          <g className="luna-feet">
            <path d="M72 200 Q68 208 64 206 Q66 210 70 208 Q72 212 76 208 Q78 206 76 200Z" fill="#F6AD55"/>
            <path d="M108 200 Q104 208 100 206 Q102 210 106 208 Q108 212 112 208 Q114 206 112 200Z" fill="#F6AD55"/>
          </g>

          {/* Graduation cap */}
          <g className="luna-cap">
            <rect x="65" y="40" width="50" height="6" rx="1" fill="url(#capGrad)"/>
            <polygon points="90,28 60,43 120,43" fill="url(#capGrad)"/>
            {/* Tassel */}
            <line x1="119" y1="43" x2="130" y2="56" stroke="#F6E05E" strokeWidth="2" strokeLinecap="round" className="luna-tassel"/>
            <circle cx="130" cy="58" r="3.5" fill="#F6E05E" className="luna-tassel"/>
          </g>

          {/* Small sparkles around (when excited) */}
          {mood === 'excited' && (
            <g className="luna-sparkles">
              <text x="30" y="65" fontSize="12" opacity="0.8" className="sparkle-1">✨</text>
              <text x="148" y="55" fontSize="10" opacity="0.7" className="sparkle-2">✨</text>
              <text x="140" y="100" fontSize="8" opacity="0.6" className="sparkle-3">💫</text>
              <text x="36" y="105" fontSize="9" opacity="0.7" className="sparkle-4">⭐</text>
            </g>
          )}

          {/* Thinking bubble */}
          {mood === 'thinking' && (
            <g className="luna-think-bubbles">
              <circle cx="140" cy="55" r="4" fill="white" stroke="#D6C8EE" strokeWidth="1" opacity="0.7" className="think-dot-1"/>
              <circle cx="150" cy="45" r="3" fill="white" stroke="#D6C8EE" strokeWidth="1" opacity="0.5" className="think-dot-2"/>
              <circle cx="156" cy="37" r="2" fill="white" stroke="#D6C8EE" strokeWidth="1" opacity="0.3" className="think-dot-3"/>
            </g>
          )}
        </g>
      </svg>
      <div className="luna-name">Luna 🦉</div>
    </div>
  );
};

/* ====================================
   Main AI Chat Component
   ==================================== */
/* ====================================
   API Key Setup Component
   ==================================== */
const ApiKeySetup = ({ onSave }) => {
  const [key, setKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  const testAndSave = async () => {
    if (!key.trim()) return;
    setTesting(true);
    setError('');

    try {
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key.trim()}`;
      const res = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Say "Hello!" in one word.' }] }],
          generationConfig: { maxOutputTokens: 10 }
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Ошибка ${res.status}`);
      }

      localStorage.setItem('gemini_api_key', key.trim());
      onSave(key.trim());
    } catch (err) {
      setError(err.message || 'Не удалось подключиться. Проверьте ключ.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="api-key-setup">
      <div className="api-key-card">
        <div className="api-key-icon">🔑</div>
        <h2>Настройка AI помощника Luna</h2>
        <p>
          Для работы Luna нужен бесплатный API ключ от Google Gemini. 
          Получить его можно за 1 минуту:
        </p>
        
        <div className="api-key-steps">
          <div className="api-step">
            <span className="step-num">1</span>
            <div>
              <strong>Перейдите на сайт Google AI Studio:</strong>
              <a 
                href="https://aistudio.google.com/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="api-link"
              >
                aistudio.google.com/apikey ↗
              </a>
            </div>
          </div>
          <div className="api-step">
            <span className="step-num">2</span>
            <div>
              <strong>Войдите в Google аккаунт</strong> (если ещё не вошли)
            </div>
          </div>
          <div className="api-step">
            <span className="step-num">3</span>
            <div>
              <strong>Нажмите "Create API Key"</strong> и скопируйте ключ
            </div>
          </div>
          <div className="api-step">
            <span className="step-num">4</span>
            <div>
              <strong>Вставьте ключ ниже</strong> и нажмите "Подключить"
            </div>
          </div>
        </div>

        <div className="api-key-input-area">
          <input
            type="password"
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(''); }}
            placeholder="Вставьте API ключ сюда..."
            className="api-key-input"
            onKeyDown={(e) => e.key === 'Enter' && testAndSave()}
          />
          <button 
            className="btn btn-primary" 
            onClick={testAndSave}
            disabled={!key.trim() || testing}
          >
            {testing ? '⏳ Проверка...' : '🚀 Подключить'}
          </button>
        </div>

        {error && (
          <div className="api-key-error">
            ❌ {error}
          </div>
        )}

        <div className="api-key-note">
          <span>🔒</span>
          <p>Ключ хранится только на вашем устройстве в браузере и никуда не отправляется кроме серверов Google.</p>
        </div>
      </div>
    </div>
  );
};

/* ====================================
   Main AI Chat Component
   ==================================== */
const AIChat = () => {
  const { recordAIMessage, addXP } = usePoints();
  const { speak } = useAccessibility();
  const [apiKey, setApiKey] = useState(getApiKey() || DEFAULT_GEMINI_KEY);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: "Привет! 🦉 Я Luna — твоя персональная сова-учитель английского! Я умная AI и могу помочь тебе с чем угодно: грамматика, новые слова, разговорная практика или просто поболтать на английском. Спрашивай что хочешь!",
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [owlMood, setOwlMood] = useState('idle');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleApiKeySaved = (newKey) => {
    setApiKey(newKey);
    setShowSettings(false);
    setMessages(prev => [...prev, {
      type: 'ai',
      text: "Отлично, я подключена! 🎉 Теперь я настоящая AI и могу отвечать на любые вопросы. Давай начнём изучать английский вместе! Что хочешь попрактиковать?",
    }]);
    setOwlMood('excited');
    setTimeout(() => setOwlMood('idle'), 3000);
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setShowSettings(false);
  };

  const sendMessage = useCallback(async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg || isTyping) return;

    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setInput('');
    const newMessages = [...messages, { type: 'user', text: userMsg }];
    setMessages(newMessages);
    setIsTyping(true);
    setOwlMood('thinking');

    try {
      const result = await callGeminiAPI(newMessages);
      
      if (result && result.success) {
        setMessages(prev => [...prev, { type: 'ai', text: result.text }]);
        setOwlMood('happy');
        recordAIMessage();
        addXP(5, 'общение с Luna');
      } else {
        const errorMsg = result?.error || 'Неизвестная ошибка';
        
        // Check for specific API key errors
        if (errorMsg.toLowerCase().includes('api key') || errorMsg.includes('401') || errorMsg.includes('403')) {
          setMessages(prev => [...prev, {
            type: 'ai',
            text: `Ой, похоже API ключ не работает 😅 Ошибка: "${errorMsg}". Нажмите кнопку ⚙️ вверху, чтобы обновить ключ.`,
          }]);
        } else {
          setMessages(prev => [...prev, {
            type: 'ai',
            text: "Ой, что-то пошло не так 😅 Попробуй спросить ещё раз через секунду!",
          }]);
        }
        setOwlMood('idle');
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        type: 'ai',
        text: "Извини, произошла ошибка соединения. Проверь интернет и попробуй ещё раз! 🦉",
      }]);
      setOwlMood('idle');
    } finally {
      setIsTyping(false);
      setTimeout(() => setOwlMood('idle'), 3000);
    }
  }, [input, isTyping, messages, recordAIMessage, addXP, apiKey]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const speakMessage = (text) => {
    const clean = text.replace(/[🦉🌟💫✨🎉🎓📚📝💬🌐✍️🎯🤔💫📖👋😊😅❤️🔥⭐💪🔤👏🍕🤝🗺️💼🔑]/g, '');
    speak(clean, 'en-US');
  };

  const handleQuickAction = (prompt) => {
    setInput(prompt);
    setTimeout(() => sendMessage(prompt), 50);
  };

  // Show API key setup if no key is set
  if (!apiKey && !showSettings) {
    return (
      <main className="ai-chat-page" role="main">
        <div className="container">
          <ApiKeySetup onSave={handleApiKeySaved} />
        </div>
      </main>
    );
  }

  // Show settings overlay
  if (showSettings) {
    return (
      <main className="ai-chat-page" role="main">
        <div className="container">
          <button className="btn btn-secondary" onClick={() => setShowSettings(false)} style={{marginBottom: 16}}>
            ← Назад к чату
          </button>
          <ApiKeySetup onSave={handleApiKeySaved} />
          {apiKey && (
            <div style={{textAlign: 'center', marginTop: 16}}>
              <button className="btn btn-secondary" onClick={handleRemoveKey} style={{color: '#E53E3E'}}>
                🗑️ Удалить текущий ключ
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="ai-chat-page" role="main">
      <div className="container">
        <div className="chat-layout">
          {/* Character sidebar */}
          <aside className="chat-sidebar" aria-label="AI Персонаж Luna">
            <LunaCharacter mood={owlMood} speaking={isTyping} />
            <div className="char-status">
              <span className={`status-dot ${isTyping ? 'typing' : 'online'}`}></span>
              {isTyping ? 'Думает...' : 'Онлайн'}
            </div>
            <div className="char-info">
              <h3>🦉 Luna</h3>
              <p>AI-сова учитель</p>
              <div className="char-skills">
                <span className="skill-tag">Грамматика</span>
                <span className="skill-tag">Лексика</span>
                <span className="skill-tag">Разговор</span>
                <span className="skill-tag">Перевод</span>
              </div>
            </div>
            <button 
              className="btn btn-sm btn-outline sidebar-settings-btn"
              onClick={() => setShowSettings(true)}
              title="Настройки API ключа"
            >
              ⚙️ Настройки
            </button>
          </aside>

          {/* Chat area */}
          <div className="chat-main">
            <div className="chat-header">
              <div className="chat-header-left">
                <h1>🦉 Luna — AI Помощник</h1>
                <p>Умная сова для изучения английского</p>
              </div>
              <button 
                className="btn btn-sm btn-outline chat-settings-btn"
                onClick={() => setShowSettings(true)}
                title="Настройки API ключа"
                aria-label="Настройки"
              >
                ⚙️
              </button>
            </div>

            <div className="chat-messages" role="log" aria-label="Сообщения чата" aria-live="polite">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.type}`} role="article">
                  {msg.type === 'ai' && (
                    <div className="msg-avatar" aria-hidden="true">🦉</div>
                  )}
                  <div className="msg-content">
                    <div className="msg-bubble">
                      {msg.text}
                    </div>
                    {msg.type === 'ai' && (
                      <button 
                        className="msg-speak-btn" 
                        onClick={() => speakMessage(msg.text)}
                        aria-label="Прослушать сообщение"
                        title="Прослушать"
                      >
                        🔊
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-message ai">
                  <div className="msg-avatar" aria-hidden="true">🦉</div>
                  <div className="msg-content">
                    <div className="msg-bubble typing-indicator" aria-label="Luna думает">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <div className="quick-actions">
                <button className="quick-btn" onClick={() => handleQuickAction('Давай выучим новые слова!')}>📚 Слова</button>
                <button className="quick-btn" onClick={() => handleQuickAction('Объясни мне грамматику Present Perfect')}>📝 Грамматика</button>
                <button className="quick-btn" onClick={() => handleQuickAction('Давай поговорим на английском!')}>💬 Разговор</button>
                <button className="quick-btn" onClick={() => handleQuickAction('Как перевести на английский "Я люблю учиться"?')}>🌐 Перевод</button>
                <button className="quick-btn" onClick={() => handleQuickAction('Дай мне мини-тест по английскому!')}>🧪 Тест</button>
              </div>
              <div className="chat-input-row">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Напишите сообщение Luna..."
                  rows={1}
                  aria-label="Ваше сообщение"
                  disabled={isTyping}
                />
                <button 
                  className="btn btn-primary send-btn" 
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  aria-label="Отправить сообщение"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AIChat;
