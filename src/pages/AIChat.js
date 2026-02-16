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
  const isHappy = mood === 'happy';
  const isExcited = mood === 'excited';
  const isThinking = mood === 'thinking';
  const showOpenEyes = !isHappy && !isExcited;
  const blushOpacity = isHappy || isExcited ? 0.8 : 0.3;

  return (
    <div className={`luna-character ${mood} ${speaking ? 'speaking' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 200 260" className="luna-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bodyGrad" cx="50%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#C4A8E8" />
            <stop offset="50%" stopColor="#9B7FCC" />
            <stop offset="100%" stopColor="#7B5EAF" />
          </radialGradient>
          <radialGradient id="bellyGrad" cx="50%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#FFFAF5" />
            <stop offset="50%" stopColor="#F5ECFF" />
            <stop offset="100%" stopColor="#E8DBF5" />
          </radialGradient>
          <radialGradient id="faceGrad" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFCF7" />
            <stop offset="100%" stopColor="#F2E8FA" />
          </radialGradient>
          <radialGradient id="irisGradL" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </radialGradient>
          <radialGradient id="irisGradR" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </radialGradient>
          <linearGradient id="wingGradL" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B89CE0" />
            <stop offset="100%" stopColor="#7B5EAF" />
          </linearGradient>
          <linearGradient id="wingGradR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B89CE0" />
            <stop offset="100%" stopColor="#7B5EAF" />
          </linearGradient>
          <linearGradient id="earGrad" x1="0" y1="1" x2="0.3" y2="0">
            <stop offset="0%" stopColor="#9B7FCC" />
            <stop offset="100%" stopColor="#D4BEF0" />
          </linearGradient>
          <linearGradient id="scarfGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0" />
          </radialGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#6D28D9" floodOpacity="0.15"/>
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <g className="luna-float">
          {/* Ambient glow */}
          <ellipse cx="100" cy="120" rx="80" ry="90" fill="url(#glowGrad)" className="luna-glow" />

          {/* Ground shadow */}
          <ellipse cx="100" cy="248" rx="36" ry="6" fill="#7B5EAF" opacity="0.12" className="luna-shadow"/>

          {/* Ear tufts */}
          <g className="luna-ears">
            <path d="M62 58 Q55 22 72 48 Q63 32 62 58Z" fill="url(#earGrad)" />
            <path d="M60 55 Q52 18 70 44" stroke="#D4BEF0" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
            <path d="M58 48 Q54 28 66 42" stroke="#E9DDFB" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5"/>
            <path d="M138 58 Q145 22 128 48 Q137 32 138 58Z" fill="url(#earGrad)" />
            <path d="M140 55 Q148 18 130 44" stroke="#D4BEF0" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
            <path d="M142 48 Q146 28 134 42" stroke="#E9DDFB" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5"/>
          </g>

          {/* Body */}
          <ellipse cx="100" cy="172" rx="48" ry="58" fill="url(#bodyGrad)" filter="url(#softShadow)" className="luna-body"/>

          {/* Belly with feather pattern */}
          <ellipse cx="100" cy="178" rx="33" ry="42" fill="url(#bellyGrad)" />
          <path d="M78 158 Q100 152 122 158" stroke="#D6C8EE" strokeWidth="1" fill="none" opacity="0.5"/>
          <path d="M75 168 Q100 161 125 168" stroke="#D6C8EE" strokeWidth="1" fill="none" opacity="0.4"/>
          <path d="M77 178 Q100 171 123 178" stroke="#D6C8EE" strokeWidth="1" fill="none" opacity="0.35"/>
          <path d="M79 188 Q100 181 121 188" stroke="#D6C8EE" strokeWidth="1" fill="none" opacity="0.3"/>
          <path d="M82 198 Q100 192 118 198" stroke="#D6C8EE" strokeWidth="1" fill="none" opacity="0.25"/>

          {/* Wings */}
          <g className={`luna-wing-left ${isExcited ? 'wave' : ''}`}>
            <path d="M52 140 Q30 155 34 190 Q38 200 48 188 Q42 172 46 155Z" fill="url(#wingGradL)" />
            <path d="M48 155 Q36 165 38 182" stroke="#9B7FCC" strokeWidth="0.8" fill="none" opacity="0.4"/>
            <path d="M50 150 Q40 158 40 172" stroke="#B89CE0" strokeWidth="0.6" fill="none" opacity="0.3"/>
          </g>
          <g className={`luna-wing-right ${isExcited ? 'wave' : ''}`}>
            <path d="M148 140 Q170 155 166 190 Q162 200 152 188 Q158 172 154 155Z" fill="url(#wingGradR)" />
            <path d="M152 155 Q164 165 162 182" stroke="#9B7FCC" strokeWidth="0.8" fill="none" opacity="0.4"/>
            <path d="M150 150 Q160 158 160 172" stroke="#B89CE0" strokeWidth="0.6" fill="none" opacity="0.3"/>
          </g>

          {/* Head */}
          <ellipse cx="100" cy="88" rx="50" ry="46" fill="url(#bodyGrad)" />
          {/* Forehead highlight */}
          <ellipse cx="100" cy="70" rx="28" ry="14" fill="white" opacity="0.08" />

          {/* Face disc */}
          <ellipse cx="100" cy="92" rx="40" ry="34" fill="url(#faceGrad)" />

          {/* Eyes */}
          <g className="luna-eyes">
            {/* Left eye */}
            <g className="luna-eye-left">
              {isHappy ? (
                <path d="M68 90 Q78 82 88 90" stroke="#4C1D95" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              ) : isExcited ? (
                <>
                  <circle cx="78" cy="87" r="13" fill="white" stroke="#DDD6FE" strokeWidth="1"/>
                  <circle cx="78" cy="87" r="10" fill="#FDE68A" />
                  <path d="M78 77 L80 83 L86 83 L81 87 L83 93 L78 89 L73 93 L75 87 L70 83 L76 83Z" fill="#F59E0B" />
                  <circle cx="82" cy="83" r="3" fill="white" opacity="0.9"/>
                </>
              ) : (
                <>
                  <ellipse cx="78" cy="88" rx="13" ry="14" fill="white" stroke="#C4B5D9" strokeWidth="1.2"/>
                  <circle cx="78" cy="88" r="8.5" fill="url(#irisGradL)">
                    <animate attributeName="cx" values="78;76;80;78" dur="5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="78" cy="88" r="4.5" fill="#1E1040">
                    <animate attributeName="cx" values="78;76;80;78" dur="5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="81" cy="84" r="3" fill="white" opacity="0.95"/>
                  <circle cx="75" cy="91" r="1.5" fill="white" opacity="0.5"/>
                  {isThinking && <circle cx="78" cy="88" r="8.5" fill="none" stroke="#A78BFA" strokeWidth="0.5" opacity="0.6">
                    <animate attributeName="r" values="8.5;9.5;8.5" dur="2s" repeatCount="indefinite"/>
                  </circle>}
                </>
              )}
            </g>
            {/* Right eye */}
            <g className="luna-eye-right">
              {isHappy ? (
                <path d="M112 90 Q122 82 132 90" stroke="#4C1D95" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              ) : isExcited ? (
                <>
                  <circle cx="122" cy="87" r="13" fill="white" stroke="#DDD6FE" strokeWidth="1"/>
                  <circle cx="122" cy="87" r="10" fill="#FDE68A" />
                  <path d="M122 77 L124 83 L130 83 L125 87 L127 93 L122 89 L117 93 L119 87 L114 83 L120 83Z" fill="#F59E0B" />
                  <circle cx="126" cy="83" r="3" fill="white" opacity="0.9"/>
                </>
              ) : (
                <>
                  <ellipse cx="122" cy="88" rx="13" ry="14" fill="white" stroke="#C4B5D9" strokeWidth="1.2"/>
                  <circle cx="122" cy="88" r="8.5" fill="url(#irisGradR)">
                    <animate attributeName="cx" values="122;120;124;122" dur="5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="122" cy="88" r="4.5" fill="#1E1040">
                    <animate attributeName="cx" values="122;120;124;122" dur="5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="125" cy="84" r="3" fill="white" opacity="0.95"/>
                  <circle cx="119" cy="91" r="1.5" fill="white" opacity="0.5"/>
                  {isThinking && <circle cx="122" cy="88" r="8.5" fill="none" stroke="#A78BFA" strokeWidth="0.5" opacity="0.6">
                    <animate attributeName="r" values="8.5;9.5;8.5" dur="2s" repeatCount="indefinite"/>
                  </circle>}
                </>
              )}
            </g>
          </g>

          {/* Eyebrows */}
          {isThinking && (
            <g className="luna-brows">
              <path d="M66 74 Q78 70 88 74" stroke="#6D28D9" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
              <path d="M112 74 Q122 70 134 74" stroke="#6D28D9" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
            </g>
          )}

          {/* Blush */}
          <ellipse cx="62" cy="100" rx="9" ry="5" fill="#FBBFCA" opacity={blushOpacity} className="luna-blush">
            <animate attributeName="opacity" values={`${blushOpacity};${blushOpacity * 0.7};${blushOpacity}`} dur="3s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="138" cy="100" rx="9" ry="5" fill="#FBBFCA" opacity={blushOpacity} className="luna-blush">
            <animate attributeName="opacity" values={`${blushOpacity};${blushOpacity * 0.7};${blushOpacity}`} dur="3s" repeatCount="indefinite"/>
          </ellipse>

          {/* Beak */}
          <g className={`luna-beak ${speaking ? 'talking' : ''}`}>
            <path d="M93 104 L100 114 L107 104Z" fill="#F6AD55" stroke="#E8993C" strokeWidth="0.8" strokeLinejoin="round"/>
            <path d="M95 104 L100 110 L105 104" fill="#FBBF24" opacity="0.3"/>
            {speaking && (
              <ellipse cx="100" cy="116" rx="5" ry="3" fill="#E8993C" className="luna-mouth-open"/>
            )}
          </g>

          {/* Scarf */}
          <g className="luna-scarf">
            <path d="M64 120 Q100 130 136 120 Q138 128 136 132 Q100 142 64 132 Q62 128 64 120Z" fill="url(#scarfGrad)" opacity="0.9"/>
            <path d="M64 120 Q100 130 136 120" stroke="#DC2626" strokeWidth="0.5" fill="none" opacity="0.3"/>
            <path d="M92 132 Q90 148 86 155 Q84 158 88 156 Q92 150 94 135Z" fill="#EF4444" opacity="0.8"/>
            <path d="M96 133 Q98 150 102 157 Q104 160 100 158 Q96 152 94 136Z" fill="#F97316" opacity="0.8"/>
          </g>

          {/* Feet */}
          <g className="luna-feet">
            <path d="M80 222 Q76 232 71 230 Q73 234 78 232 Q80 236 84 232 Q86 230 84 222Z" fill="#F6AD55" stroke="#E8993C" strokeWidth="0.5"/>
            <path d="M120 222 Q116 232 111 230 Q113 234 118 232 Q120 236 124 232 Q126 230 124 222Z" fill="#F6AD55" stroke="#E8993C" strokeWidth="0.5"/>
          </g>

          {/* Sparkles (excited) */}
          {isExcited && (
            <g className="luna-sparkles">
              <circle cx="30" cy="60" r="3" fill="#FDE68A" className="sparkle-1"/>
              <circle cx="170" cy="50" r="2.5" fill="#FDE68A" className="sparkle-2"/>
              <circle cx="165" cy="105" r="2" fill="#C4B5FD" className="sparkle-3"/>
              <circle cx="35" cy="110" r="2.5" fill="#C4B5FD" className="sparkle-4"/>
              <path d="M25 80 L28 75 L31 80 L28 85Z" fill="#FDE68A" className="sparkle-1" opacity="0.8"/>
              <path d="M175 75 L178 70 L181 75 L178 80Z" fill="#A78BFA" className="sparkle-2" opacity="0.8"/>
            </g>
          )}

          {/* Thinking bubbles */}
          {isThinking && (
            <g className="luna-think-bubbles">
              <circle cx="150" cy="58" r="5" fill="white" stroke="#DDD6FE" strokeWidth="1.5" className="think-dot-1"/>
              <circle cx="162" cy="44" r="4" fill="white" stroke="#DDD6FE" strokeWidth="1" className="think-dot-2"/>
              <circle cx="170" cy="32" r="3" fill="white" stroke="#DDD6FE" strokeWidth="0.8" className="think-dot-3"/>
            </g>
          )}
        </g>
      </svg>
      <div className="luna-name">Luna</div>
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
