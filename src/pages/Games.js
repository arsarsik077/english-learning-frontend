import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePoints } from '../context/PointsContext';
import { useAccessibility } from '../context/AccessibilityContext';
import './Games.css';

/* ====================================
   WORD DATA FOR GAMES
   ==================================== */
const WORD_PAIRS = [
  { en: 'apple', ru: 'яблоко', hint: 'A common fruit' },
  { en: 'house', ru: 'дом', hint: 'Where people live' },
  { en: 'cat', ru: 'кот', hint: 'A fluffy pet' },
  { en: 'dog', ru: 'собака', hint: 'Man\'s best friend' },
  { en: 'book', ru: 'книга', hint: 'You read it' },
  { en: 'water', ru: 'вода', hint: 'You drink it' },
  { en: 'sun', ru: 'солнце', hint: 'Shines in the sky' },
  { en: 'moon', ru: 'луна', hint: 'Visible at night' },
  { en: 'tree', ru: 'дерево', hint: 'Has leaves and branches' },
  { en: 'flower', ru: 'цветок', hint: 'Beautiful plant' },
  { en: 'car', ru: 'машина', hint: 'Vehicle with 4 wheels' },
  { en: 'bird', ru: 'птица', hint: 'It can fly' },
  { en: 'fish', ru: 'рыба', hint: 'Lives in water' },
  { en: 'school', ru: 'школа', hint: 'Place of learning' },
  { en: 'friend', ru: 'друг', hint: 'Someone you trust' },
  { en: 'music', ru: 'музыка', hint: 'You listen to it' },
  { en: 'cloud', ru: 'облако', hint: 'White and fluffy in sky' },
  { en: 'star', ru: 'звезда', hint: 'Twinkles at night' },
  { en: 'rain', ru: 'дождь', hint: 'Falls from clouds' },
  { en: 'snow', ru: 'снег', hint: 'Cold and white' },
  { en: 'mountain', ru: 'гора', hint: 'Very tall land' },
  { en: 'river', ru: 'река', hint: 'Flowing water' },
  { en: 'ocean', ru: 'океан', hint: 'Very large body of water' },
  { en: 'forest', ru: 'лес', hint: 'Full of trees' },
  { en: 'garden', ru: 'сад', hint: 'Where flowers grow' },
  { en: 'kitchen', ru: 'кухня', hint: 'Room for cooking' },
  { en: 'window', ru: 'окно', hint: 'You look through it' },
  { en: 'table', ru: 'стол', hint: 'Furniture for eating' },
  { en: 'phone', ru: 'телефон', hint: 'For making calls' },
  { en: 'happy', ru: 'счастливый', hint: 'Feeling of joy' },
];

const SENTENCES = [
  { words: ['I', 'like', 'to', 'read', 'books'], translation: 'Я люблю читать книги' },
  { words: ['The', 'cat', 'is', 'sleeping'], translation: 'Кот спит' },
  { words: ['She', 'goes', 'to', 'school'], translation: 'Она ходит в школу' },
  { words: ['We', 'are', 'learning', 'English'], translation: 'Мы изучаем английский' },
  { words: ['He', 'plays', 'the', 'guitar'], translation: 'Он играет на гитаре' },
  { words: ['They', 'live', 'in', 'a', 'big', 'house'], translation: 'Они живут в большом доме' },
  { words: ['The', 'weather', 'is', 'nice', 'today'], translation: 'Погода сегодня хорошая' },
  { words: ['I', 'want', 'to', 'travel'], translation: 'Я хочу путешествовать' },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

/* ====================================
   MAIN GAMES COMPONENT
   ==================================== */
const Games = () => {
  const [activeGame, setActiveGame] = useState(null);

  const gameList = [
    { id: 'word-match', title: '🔗 Найди пару', desc: 'Сопоставьте английские слова с переводами', color: '#2B6CB0', difficulty: 'Легко' },
    { id: 'spelling-bee', title: '🐝 Правописание', desc: 'Напечатайте слово правильно по подсказке', color: '#38A169', difficulty: 'Средне' },
    { id: 'hangman', title: '🎪 Виселица', desc: 'Угадайте слово по буквам', color: '#9F7AEA', difficulty: 'Средне' },
    { id: 'sentence-builder', title: '🧩 Собери предложение', desc: 'Расставьте слова в правильном порядке', color: '#ED8936', difficulty: 'Средне' },
    { id: 'memory-cards', title: '🧠 Мемори', desc: 'Найдите пары карточек слово-перевод', color: '#E53E3E', difficulty: 'Легко' },
    { id: 'quiz', title: '❓ Викторина', desc: 'Выберите правильный перевод слова', color: '#D69E2E', difficulty: 'Легко' },
    { id: 'word-scramble', title: '🔀 Анаграмма', desc: 'Расшифруйте перемешанные буквы', color: '#319795', difficulty: 'Сложно' },
    { id: 'speed-translate', title: '⚡ Быстрый перевод', desc: 'Переведите как можно больше слов за время', color: '#DD6B20', difficulty: 'Сложно' },
  ];

  if (activeGame) {
    return (
      <div className="container">
        <button onClick={() => setActiveGame(null)} className="btn btn-secondary back-btn" aria-label="Вернуться к списку игр">
          ← Назад к играм
        </button>
        {activeGame === 'word-match' && <WordMatchGame />}
        {activeGame === 'spelling-bee' && <SpellingBeeGame />}
        {activeGame === 'hangman' && <HangmanGame />}
        {activeGame === 'sentence-builder' && <SentenceBuilderGame />}
        {activeGame === 'memory-cards' && <MemoryCardsGame />}
        {activeGame === 'quiz' && <QuizGame />}
        {activeGame === 'word-scramble' && <WordScrambleGame />}
        {activeGame === 'speed-translate' && <SpeedTranslateGame />}
      </div>
    );
  }

  return (
    <main className="container" role="main">
      <div className="page-header">
        <h1>🎮 Игры для изучения английского</h1>
        <p>Учитесь играя — выберите игру и зарабатывайте очки!</p>
      </div>

      <div className="games-grid" role="list">
        {gameList.map((game, i) => (
          <button
            key={game.id}
            className="game-card"
            onClick={() => setActiveGame(game.id)}
            style={{ '--game-color': game.color, animationDelay: `${i * 0.08}s` }}
            role="listitem"
            aria-label={`${game.title} — ${game.desc}`}
          >
            <div className="game-difficulty">{game.difficulty}</div>
            <h3>{game.title}</h3>
            <p>{game.desc}</p>
            <span className="game-play-btn">Играть →</span>
          </button>
        ))}
      </div>
    </main>
  );
};

/* ====================================
   GAME 1: Word Match
   ==================================== */
const WordMatchGame = () => {
  const { recordCorrectAnswer, recordWrongAnswer, playGame } = usePoints();
  const { speak } = useAccessibility();
  const [pairs, setPairs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    const chosen = shuffle(WORD_PAIRS).slice(0, 6);
    const left = chosen.map((p, i) => ({ id: `en-${i}`, text: p.en, type: 'en', pairIndex: i }));
    const right = shuffle(chosen.map((p, i) => ({ id: `ru-${i}`, text: p.ru, type: 'ru', pairIndex: i })));
    setPairs([...left, ...right]);
    setSelected(null);
    setMatched([]);
    setWrong(null);
    setScore(0);
    setGameOver(false);
  };

  const handleClick = (item) => {
    if (matched.includes(item.pairIndex)) return;
    if (wrong) return;

    if (!selected) {
      setSelected(item);
      if (item.type === 'en') speak(item.text);
    } else {
      if (selected.type === item.type) {
        setSelected(item);
        if (item.type === 'en') speak(item.text);
        return;
      }
      if (selected.pairIndex === item.pairIndex) {
        const newMatched = [...matched, item.pairIndex];
        setMatched(newMatched);
        setScore(s => s + 1);
        recordCorrectAnswer();
        setSelected(null);
        if (newMatched.length === 6) {
          setGameOver(true);
          playGame(true);
        }
      } else {
        setWrong(item);
        recordWrongAnswer();
        setTimeout(() => { setWrong(null); setSelected(null); }, 800);
      }
    }
  };

  const leftItems = pairs.filter(p => p.type === 'en');
  const rightItems = pairs.filter(p => p.type === 'ru');

  return (
    <div className="game-container" role="region" aria-label="Игра Найди пару">
      <h2 className="game-title">🔗 Найди пару</h2>
      <p className="game-desc">Соедините английское слово с его переводом</p>
      <div className="game-score">Совпадений: {score}/6</div>
      
      {gameOver ? (
        <div className="game-result">
          <div className="result-icon">🎉</div>
          <h3>Отлично! Все пары найдены!</h3>
          <p>+100 XP</p>
          <button onClick={startGame} className="btn btn-primary">Играть снова</button>
        </div>
      ) : (
        <div className="match-grid">
          <div className="match-column">
            {leftItems.map(item => (
              <button
                key={item.id}
                className={`match-item ${matched.includes(item.pairIndex) ? 'matched' : ''} ${selected?.id === item.id ? 'selected' : ''} ${wrong?.pairIndex === item.pairIndex && selected?.type === 'en' ? 'wrong' : ''}`}
                onClick={() => handleClick(item)}
                disabled={matched.includes(item.pairIndex)}
                aria-label={`Английское слово: ${item.text}`}
              >
                {item.text}
                <button className="speak-btn" onClick={(e) => { e.stopPropagation(); speak(item.text); }} aria-label={`Произнести ${item.text}`}>🔊</button>
              </button>
            ))}
          </div>
          <div className="match-column">
            {rightItems.map(item => (
              <button
                key={item.id}
                className={`match-item ru ${matched.includes(item.pairIndex) ? 'matched' : ''} ${selected?.id === item.id ? 'selected' : ''} ${wrong?.id === item.id ? 'wrong' : ''}`}
                onClick={() => handleClick(item)}
                disabled={matched.includes(item.pairIndex)}
                aria-label={`Перевод: ${item.text}`}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ====================================
   GAME 2: Spelling Bee
   ==================================== */
const SpellingBeeGame = () => {
  const { recordCorrectAnswer, recordWrongAnswer, playGame } = usePoints();
  const { speak } = useAccessibility();
  const [words, setWords] = useState([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    setWords(shuffle(WORD_PAIRS).slice(0, 8));
    setCurrent(0);
    setInput('');
    setFeedback(null);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [current, feedback]);

  const checkAnswer = () => {
    if (!input.trim()) return;
    const correct = words[current].en.toLowerCase() === input.trim().toLowerCase();
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      setScore(s => s + 1);
      recordCorrectAnswer();
    } else {
      recordWrongAnswer();
    }
    setTimeout(() => {
      setFeedback(null);
      setInput('');
      if (current + 1 >= words.length) {
        setGameOver(true);
        playGame(score + (correct ? 1 : 0) === words.length);
      } else {
        setCurrent(c => c + 1);
      }
    }, 1500);
  };

  if (words.length === 0) return null;

  return (
    <div className="game-container" role="region" aria-label="Игра Правописание">
      <h2 className="game-title">🐝 Правописание</h2>
      <p className="game-desc">Напишите английское слово по подсказке</p>
      <div className="game-score">Счёт: {score}/{words.length} | Слово {current + 1}/{words.length}</div>

      {gameOver ? (
        <div className="game-result">
          <div className="result-icon">{score === words.length ? '🏆' : '👍'}</div>
          <h3>{score === words.length ? 'Идеально!' : `Результат: ${score}/${words.length}`}</h3>
          <button onClick={startGame} className="btn btn-primary">Играть снова</button>
        </div>
      ) : (
        <div className="spelling-game">
          <div className="spelling-hint">
            <div className="hint-translation">{words[current].ru}</div>
            <div className="hint-text">💡 {words[current].hint}</div>
            <button className="btn btn-sm btn-outline" onClick={() => speak(words[current].en)} aria-label="Прослушать произношение">
              🔊 Послушать
            </button>
          </div>
          <div className={`spelling-input ${feedback || ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
              placeholder="Введите слово на английском..."
              disabled={feedback !== null}
              aria-label="Введите слово на английском"
              autoComplete="off"
            />
            <button onClick={checkAnswer} className="btn btn-primary" disabled={feedback !== null || !input.trim()}>
              Проверить
            </button>
          </div>
          {feedback === 'correct' && <div className="feedback correct" role="alert">✅ Правильно!</div>}
          {feedback === 'wrong' && <div className="feedback wrong" role="alert">❌ Неправильно. Правильный ответ: {words[current].en}</div>}
        </div>
      )}
    </div>
  );
};

/* ====================================
   GAME 3: Hangman
   ==================================== */
const HangmanGame = () => {
  const { recordCorrectAnswer, recordWrongAnswer, playGame } = usePoints();
  const { speak } = useAccessibility();
  const [word, setWord] = useState(null);
  const [guessed, setGuessed] = useState([]);
  const [wrong, setWrong] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const maxWrong = 6;

  useEffect(() => { startGame(); }, []);

  const startGame = () => {
    const chosen = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
    setWord(chosen);
    setGuessed([]);
    setWrong(0);
    setGameOver(false);
    setWon(false);
  };

  const guessLetter = useCallback((letter) => {
    if (gameOver || guessed.includes(letter)) return;
    const newGuessed = [...guessed, letter];
    setGuessed(newGuessed);

    if (!word.en.toLowerCase().includes(letter)) {
      const newWrong = wrong + 1;
      setWrong(newWrong);
      if (newWrong >= maxWrong) {
        setGameOver(true);
        setWon(false);
        recordWrongAnswer();
        playGame(false);
      }
    } else {
      const allGuessed = word.en.toLowerCase().split('').every(l => newGuessed.includes(l));
      if (allGuessed) {
        setGameOver(true);
        setWon(true);
        recordCorrectAnswer();
        playGame(wrong === 0);
      }
    }
  }, [gameOver, guessed, word, wrong, recordCorrectAnswer, recordWrongAnswer, playGame]);

  useEffect(() => {
    const handleKey = (e) => {
      if (/^[a-z]$/.test(e.key)) guessLetter(e.key);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [guessLetter]);

  if (!word) return null;

  const displayWord = word.en.split('').map((l, i) => (
    <span key={i} className={`hangman-letter ${guessed.includes(l.toLowerCase()) ? 'revealed' : ''}`}>
      {guessed.includes(l.toLowerCase()) ? l : '_'}
    </span>
  ));

  const hangmanParts = [
    <circle key="head" cx="200" cy="80" r="20" />,
    <line key="body" x1="200" y1="100" x2="200" y2="160" />,
    <line key="larm" x1="200" y1="120" x2="170" y2="145" />,
    <line key="rarm" x1="200" y1="120" x2="230" y2="145" />,
    <line key="lleg" x1="200" y1="160" x2="170" y2="195" />,
    <line key="rleg" x1="200" y1="160" x2="230" y2="195" />,
  ];

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  return (
    <div className="game-container" role="region" aria-label="Игра Виселица">
      <h2 className="game-title">🎪 Виселица</h2>
      <p className="game-desc">Угадайте слово, выбирая буквы. Перевод: <strong>{word.ru}</strong></p>
      <div className="game-score">Ошибок: {wrong}/{maxWrong}</div>

      {gameOver ? (
        <div className="game-result">
          <div className="result-icon">{won ? '🎉' : '😢'}</div>
          <h3>{won ? 'Вы угадали!' : `Слово было: ${word.en}`}</h3>
          <button className="btn btn-sm btn-outline" onClick={() => speak(word.en)} style={{marginBottom: 16}}>🔊 Произношение</button>
          <br/>
          <button onClick={startGame} className="btn btn-primary">Играть снова</button>
        </div>
      ) : (
        <div className="hangman-game">
          <svg className="hangman-svg" viewBox="0 0 300 220" aria-hidden="true">
            <line x1="60" y1="210" x2="240" y2="210" stroke="var(--text-muted)" strokeWidth="3" />
            <line x1="100" y1="210" x2="100" y2="30" stroke="var(--text-muted)" strokeWidth="3" />
            <line x1="100" y1="30" x2="200" y2="30" stroke="var(--text-muted)" strokeWidth="3" />
            <line x1="200" y1="30" x2="200" y2="60" stroke="var(--text-muted)" strokeWidth="3" />
            {hangmanParts.slice(0, wrong).map(part => React.cloneElement(part, {
              stroke: 'var(--error-dark)',
              strokeWidth: 3,
              fill: 'none'
            }))}
          </svg>
          <div className="hangman-word" aria-label={`Слово: ${displayWord}`}>{displayWord}</div>
          <div className="hangman-keyboard" role="group" aria-label="Клавиатура">
            {alphabet.map(letter => (
              <button
                key={letter}
                className={`key-btn ${guessed.includes(letter) ? (word.en.toLowerCase().includes(letter) ? 'correct' : 'wrong') : ''}`}
                onClick={() => guessLetter(letter)}
                disabled={guessed.includes(letter)}
                aria-label={`Буква ${letter}`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ====================================
   GAME 4: Sentence Builder
   ==================================== */
const SentenceBuilderGame = () => {
  const { recordCorrectAnswer, recordWrongAnswer, playGame } = usePoints();
  const { speak } = useAccessibility();
  const [sentences, setSentences] = useState([]);
  const [current, setCurrent] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [available, setAvailable] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => { startGame(); }, []);

  const startGame = () => {
    const chosen = shuffle(SENTENCES).slice(0, 5);
    setSentences(chosen);
    setCurrent(0);
    setScore(0);
    setGameOver(false);
    setFeedback(null);
    if (chosen.length > 0) {
      setAvailable(shuffle(chosen[0].words));
      setPlaced([]);
    }
  };

  useEffect(() => {
    if (sentences[current]) {
      setAvailable(shuffle(sentences[current].words));
      setPlaced([]);
      setFeedback(null);
    }
  }, [current, sentences]);

  const addWord = (word, index) => {
    setPlaced([...placed, word]);
    setAvailable(available.filter((_, i) => i !== index));
  };

  const removeWord = (index) => {
    setAvailable([...available, placed[index]]);
    setPlaced(placed.filter((_, i) => i !== index));
  };

  const checkSentence = () => {
    const correct = placed.join(' ') === sentences[current].words.join(' ');
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      setScore(s => s + 1);
      recordCorrectAnswer();
    } else {
      recordWrongAnswer();
    }
    setTimeout(() => {
      if (current + 1 >= sentences.length) {
        setGameOver(true);
        playGame(score + (correct ? 1 : 0) === sentences.length);
      } else {
        setCurrent(c => c + 1);
      }
    }, 1500);
  };

  if (sentences.length === 0) return null;

  return (
    <div className="game-container" role="region" aria-label="Игра Собери предложение">
      <h2 className="game-title">🧩 Собери предложение</h2>
      <p className="game-desc">Расставьте слова в правильном порядке</p>
      <div className="game-score">Счёт: {score}/{sentences.length} | Предложение {current + 1}/{sentences.length}</div>

      {gameOver ? (
        <div className="game-result">
          <div className="result-icon">{score === sentences.length ? '🏆' : '👍'}</div>
          <h3>{score === sentences.length ? 'Все предложения собраны!' : `Результат: ${score}/${sentences.length}`}</h3>
          <button onClick={startGame} className="btn btn-primary">Играть снова</button>
        </div>
      ) : (
        <div className="sentence-game">
          <div className="sentence-translation">
            📝 {sentences[current].translation}
            <button 
              className="tts-btn-inline"
              onClick={() => speak(sentences[current].words.join(' '), 'en-US')}
              aria-label="Прослушать предложение"
              title="Прослушать правильное предложение"
            >
              🔊
            </button>
          </div>
          <div className="sentence-placed" aria-label="Собранное предложение">
            {placed.length === 0 && <span className="placeholder-text">Нажимайте на слова ниже...</span>}
            {placed.map((word, i) => (
              <button key={i} className="word-chip placed" onClick={() => removeWord(i)} aria-label={`Убрать слово ${word}`}>
                {word} ✕
              </button>
            ))}
          </div>
          <div className="sentence-available" aria-label="Доступные слова">
            {available.map((word, i) => (
              <button key={i} className="word-chip" onClick={() => addWord(word, i)} aria-label={`Добавить слово ${word}`}>
                {word}
              </button>
            ))}
          </div>
          {placed.length === sentences[current].words.length && !feedback && (
            <button onClick={checkSentence} className="btn btn-primary" style={{marginTop: 20}}>Проверить</button>
          )}
          {feedback === 'correct' && <div className="feedback correct" role="alert">✅ Правильно!</div>}
          {feedback === 'wrong' && <div className="feedback wrong" role="alert">❌ Правильный порядок: {sentences[current].words.join(' ')}</div>}
        </div>
      )}
    </div>
  );
};

/* ====================================
   GAME 5: Memory Cards
   ==================================== */
const MemoryCardsGame = () => {
  const { recordCorrectAnswer, playGame } = usePoints();
  const { speak } = useAccessibility();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => { startGame(); }, []);

  const startGame = () => {
    const chosen = shuffle(WORD_PAIRS).slice(0, 6);
    const allCards = shuffle([
      ...chosen.map((p, i) => ({ id: `en-${i}`, text: p.en, pairId: i, type: 'en' })),
      ...chosen.map((p, i) => ({ id: `ru-${i}`, text: p.ru, pairId: i, type: 'ru' })),
    ]);
    setCards(allCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameOver(false);
  };

  const flipCard = (index) => {
    if (flipped.length === 2) return;
    if (flipped.includes(index)) return;
    if (matched.includes(cards[index].pairId)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    // Speak the card text when flipped
    if (cards[index].type === 'en') speak(cards[index].text, 'en-US');

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].pairId === cards[second].pairId && cards[first].type !== cards[second].type) {
        const newMatched = [...matched, cards[first].pairId];
        setMatched(newMatched);
        recordCorrectAnswer();
        setFlipped([]);
        if (newMatched.length === 6) {
          setGameOver(true);
          playGame(moves <= 10);
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div className="game-container" role="region" aria-label="Игра Мемори">
      <h2 className="game-title">🧠 Мемори</h2>
      <p className="game-desc">Найдите пары: английское слово + перевод</p>
      <div className="game-score">Ходов: {moves} | Найдено: {matched.length}/6</div>

      {gameOver ? (
        <div className="game-result">
          <div className="result-icon">🎉</div>
          <h3>Все пары найдены за {moves} ходов!</h3>
          <button onClick={startGame} className="btn btn-primary">Играть снова</button>
        </div>
      ) : (
        <div className="memory-grid">
          {cards.map((card, index) => (
            <button
              key={card.id}
              className={`memory-card ${flipped.includes(index) || matched.includes(card.pairId) ? 'flipped' : ''} ${matched.includes(card.pairId) ? 'matched' : ''}`}
              onClick={() => flipCard(index)}
              aria-label={flipped.includes(index) || matched.includes(card.pairId) ? card.text : 'Закрытая карточка'}
            >
              <div className="memory-card-inner">
                <div className="memory-card-front">?</div>
                <div className="memory-card-back">{card.text}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ====================================
   GAME 6: Quiz
   ==================================== */
const QuizGame = () => {
  const { recordCorrectAnswer, recordWrongAnswer, playGame } = usePoints();
  const { speak } = useAccessibility();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => { startGame(); }, []);

  const startGame = () => {
    const chosen = shuffle(WORD_PAIRS).slice(0, 10);
    const qs = chosen.map(word => {
      const wrongAnswers = shuffle(WORD_PAIRS.filter(w => w.ru !== word.ru)).slice(0, 3).map(w => w.ru);
      const options = shuffle([word.ru, ...wrongAnswers]);
      return { word: word.en, correct: word.ru, options };
    });
    setQuestions(qs);
    setCurrent(0);
    setScore(0);
    setGameOver(false);
    setFeedback(null);
  };

  const answer = (option) => {
    if (feedback) return;
    const correct = option === questions[current].correct;
    setFeedback({ option, correct });
    if (correct) {
      setScore(s => s + 1);
      recordCorrectAnswer();
    } else {
      recordWrongAnswer();
    }
    setTimeout(() => {
      setFeedback(null);
      if (current + 1 >= questions.length) {
        setGameOver(true);
        playGame(score + (correct ? 1 : 0) === questions.length);
      } else {
        setCurrent(c => c + 1);
      }
    }, 1200);
  };

  if (questions.length === 0) return null;

  return (
    <div className="game-container" role="region" aria-label="Игра Викторина">
      <h2 className="game-title">❓ Викторина</h2>
      <p className="game-desc">Выберите правильный перевод слова</p>
      <div className="game-score">Счёт: {score}/{questions.length} | Вопрос {current + 1}/{questions.length}</div>

      {gameOver ? (
        <div className="game-result">
          <div className="result-icon">{score >= questions.length * 0.8 ? '🏆' : score >= questions.length * 0.5 ? '👍' : '📚'}</div>
          <h3>Результат: {score}/{questions.length}</h3>
          <p>{score >= questions.length * 0.8 ? 'Великолепно!' : 'Продолжайте практиковаться!'}</p>
          <button onClick={startGame} className="btn btn-primary">Играть снова</button>
        </div>
      ) : (
        <div className="quiz-game">
          <div className="quiz-word">
            <span>{questions[current].word}</span>
            <button className="speak-btn" onClick={() => speak(questions[current].word)} aria-label="Произнести">🔊</button>
          </div>
          <div className="quiz-options" role="group" aria-label="Варианты ответа">
            {questions[current].options.map((option, i) => (
              <button
                key={i}
                className={`quiz-option ${feedback?.option === option ? (feedback.correct ? 'correct' : 'wrong') : ''} ${feedback && option === questions[current].correct ? 'correct' : ''}`}
                onClick={() => answer(option)}
                disabled={feedback !== null}
                aria-label={`Вариант: ${option}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ====================================
   GAME 7: Word Scramble
   ==================================== */
const WordScrambleGame = () => {
  const { recordCorrectAnswer, recordWrongAnswer, playGame } = usePoints();
  const { speak } = useAccessibility();
  const [words, setWords] = useState([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { startGame(); }, []);

  const startGame = () => {
    const chosen = shuffle(WORD_PAIRS).filter(w => w.en.length >= 4).slice(0, 8);
    const withScramble = chosen.map(w => ({
      ...w,
      scrambled: shuffle(w.en.split('')).join(''),
    }));
    setWords(withScramble);
    setCurrent(0);
    setInput('');
    setScore(0);
    setGameOver(false);
    setFeedback(null);
  };

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [current, feedback]);

  const check = () => {
    if (!input.trim()) return;
    const correct = input.trim().toLowerCase() === words[current].en.toLowerCase();
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) { setScore(s => s + 1); recordCorrectAnswer(); }
    else { recordWrongAnswer(); }
    setTimeout(() => {
      setFeedback(null);
      setInput('');
      if (current + 1 >= words.length) {
        setGameOver(true);
        playGame(score + (correct ? 1 : 0) === words.length);
      } else {
        setCurrent(c => c + 1);
      }
    }, 1500);
  };

  if (words.length === 0) return null;

  return (
    <div className="game-container" role="region" aria-label="Игра Анаграмма">
      <h2 className="game-title">🔀 Анаграмма</h2>
      <p className="game-desc">Расшифруйте перемешанные буквы</p>
      <div className="game-score">Счёт: {score}/{words.length} | Слово {current + 1}/{words.length}</div>

      {gameOver ? (
        <div className="game-result">
          <div className="result-icon">{score === words.length ? '🏆' : '👍'}</div>
          <h3>Результат: {score}/{words.length}</h3>
          <button onClick={startGame} className="btn btn-primary">Играть снова</button>
        </div>
      ) : (
        <div className="scramble-game">
          <div className="scramble-hint">
            Перевод: {words[current].ru}
            <button 
              className="btn btn-sm btn-outline" 
              onClick={() => speak(words[current].en, 'en-US')} 
              aria-label="Прослушать произношение"
              style={{marginLeft: 12}}
            >
              🔊 Послушать
            </button>
          </div>
          <div className="scramble-letters" aria-label="Перемешанные буквы">
            {words[current].scrambled.split('').map((l, i) => (
              <span key={i} className="scramble-letter">{l}</span>
            ))}
          </div>
          <div className={`spelling-input ${feedback || ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              placeholder="Введите слово..."
              disabled={feedback !== null}
              aria-label="Ваш ответ"
              autoComplete="off"
            />
            <button onClick={check} className="btn btn-primary" disabled={feedback !== null || !input.trim()}>
              Проверить
            </button>
          </div>
          {feedback === 'correct' && <div className="feedback correct" role="alert">✅ Правильно!</div>}
          {feedback === 'wrong' && <div className="feedback wrong" role="alert">❌ Правильный ответ: {words[current].en}</div>}
        </div>
      )}
    </div>
  );
};

/* ====================================
   GAME 8: Speed Translate
   ==================================== */
const SpeedTranslateGame = () => {
  const { recordCorrectAnswer, recordWrongAnswer, playGame } = usePoints();
  const { speak } = useAccessibility();
  const [words, setWords] = useState([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const startGame = () => {
    setWords(shuffle(WORD_PAIRS));
    setCurrent(0);
    setInput('');
    setScore(0);
    setTimeLeft(60);
    setGameStarted(true);
    setGameOver(false);
  };

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gameStarted) {
      setGameOver(true);
      setGameStarted(false);
      playGame(score >= 15);
    }
    return () => clearTimeout(timerRef.current);
  }, [gameStarted, timeLeft, score, playGame]);

  useEffect(() => {
    if (inputRef.current && gameStarted) inputRef.current.focus();
  }, [current, gameStarted]);

  const check = () => {
    if (!input.trim()) return;
    const correct = input.trim().toLowerCase() === words[current % words.length].en.toLowerCase();
    if (correct) {
      setScore(s => s + 1);
      recordCorrectAnswer();
      speak(words[current % words.length].en);
    } else {
      recordWrongAnswer();
    }
    setInput('');
    setCurrent(c => c + 1);
  };

  return (
    <div className="game-container" role="region" aria-label="Игра Быстрый перевод">
      <h2 className="game-title">⚡ Быстрый перевод</h2>
      <p className="game-desc">Переведите как можно больше слов за 60 секунд</p>

      {!gameStarted && !gameOver && (
        <div className="game-result">
          <div className="result-icon">⚡</div>
          <h3>Готовы? У вас 60 секунд!</h3>
          <button onClick={startGame} className="btn btn-primary btn-lg">Начать!</button>
        </div>
      )}

      {gameOver && (
        <div className="game-result">
          <div className="result-icon">{score >= 15 ? '🏆' : score >= 10 ? '⭐' : '👍'}</div>
          <h3>Время вышло! Вы перевели {score} слов!</h3>
          <button onClick={startGame} className="btn btn-primary">Играть снова</button>
        </div>
      )}

      {gameStarted && !gameOver && words.length > 0 && (
        <div className="speed-game">
          <div className="speed-timer" style={{ color: timeLeft <= 10 ? 'var(--error-dark)' : 'var(--text-primary)' }}>
            ⏱️ {timeLeft}s
          </div>
          <div className="speed-score">Переведено: {score}</div>
          <div className="speed-word">
            <div className="speed-ru">{words[current % words.length].ru}</div>
          </div>
          <div className="spelling-input">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              placeholder="Перевод на английский..."
              aria-label="Введите перевод"
              autoComplete="off"
            />
            <button onClick={check} className="btn btn-primary">→</button>
          </div>
        </div>
      )}
    </div>
  );
};export default Games;
