import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const PointsContext = createContext();

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error('usePoints must be used within PointsProvider');
  }
  return context;
};

const ACHIEVEMENTS = [
  { id: 'first_lesson', title: 'Первый шаг', description: 'Завершите первый урок', icon: '📚', xpReward: 50, condition: (stats) => stats.lessonsCompleted >= 1 },
  { id: 'word_learner', title: 'Знаток слов', description: 'Изучите 10 карточек', icon: '🃏', xpReward: 100, condition: (stats) => stats.cardsLearned >= 10 },
  { id: 'game_master', title: 'Игрок', description: 'Сыграйте 5 игр', icon: '🎮', xpReward: 75, condition: (stats) => stats.gamesPlayed >= 5 },
  { id: 'streak_3', title: 'Серия 3 дня', description: '3 дня подряд на платформе', icon: '🔥', xpReward: 150, condition: (stats) => stats.streak >= 3 },
  { id: 'streak_7', title: 'Недельная серия', description: '7 дней подряд', icon: '⚡', xpReward: 300, condition: (stats) => stats.streak >= 7 },
  { id: 'perfect_score', title: 'Отличник', description: 'Получите 100% в игре', icon: '⭐', xpReward: 200, condition: (stats) => stats.perfectGames >= 1 },
  { id: 'chat_explorer', title: 'Разговорчивый', description: 'Отправьте 10 сообщений AI', icon: '💬', xpReward: 80, condition: (stats) => stats.aiMessages >= 10 },
  { id: 'video_watcher', title: 'Зритель', description: 'Просмотрите 5 видео', icon: '🎬', xpReward: 100, condition: (stats) => stats.videosWatched >= 5 },
  { id: 'xp_500', title: 'Прогресс 500', description: 'Наберите 500 XP', icon: '🏆', xpReward: 100, condition: (stats) => stats.totalXP >= 500 },
  { id: 'xp_1000', title: 'Мастер 1000', description: 'Наберите 1000 XP', icon: '👑', xpReward: 200, condition: (stats) => stats.totalXP >= 1000 },
];

const getLevel = (xp) => {
  if (xp < 100) return { level: 1, title: 'Новичок', nextLevelXP: 100 };
  if (xp < 300) return { level: 2, title: 'Ученик', nextLevelXP: 300 };
  if (xp < 600) return { level: 3, title: 'Студент', nextLevelXP: 600 };
  if (xp < 1000) return { level: 4, title: 'Знаток', nextLevelXP: 1000 };
  if (xp < 1500) return { level: 5, title: 'Эксперт', nextLevelXP: 1500 };
  if (xp < 2500) return { level: 6, title: 'Мастер', nextLevelXP: 2500 };
  if (xp < 4000) return { level: 7, title: 'Профессор', nextLevelXP: 4000 };
  return { level: 8, title: 'Гуру английского', nextLevelXP: Infinity };
};

const getDefaultStats = () => ({
  totalXP: 0,
  totalPoints: 0,
  lessonsCompleted: 0,
  cardsLearned: 0,
  gamesPlayed: 0,
  perfectGames: 0,
  streak: 0,
  lastVisit: null,
  aiMessages: 0,
  videosWatched: 0,
  unlockedAchievements: [],
  correctAnswers: 0,
  totalAnswers: 0,
});

export const PointsProvider = ({ children }) => {
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('userStats');
    if (saved) {
      try { return { ...getDefaultStats(), ...JSON.parse(saved) }; }
      catch { return getDefaultStats(); }
    }
    return getDefaultStats();
  });

  const [notification, setNotification] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    localStorage.setItem('userStats', JSON.stringify(stats));
  }, [stats]);

  // Check streak on load
  useEffect(() => {
    const today = new Date().toDateString();
    if (stats.lastVisit) {
      const lastDate = new Date(stats.lastVisit);
      const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        // Consecutive day
        setStats(prev => ({ ...prev, streak: prev.streak + 1, lastVisit: today }));
      } else if (diffDays > 1) {
        // Streak broken
        setStats(prev => ({ ...prev, streak: 1, lastVisit: today }));
      }
    } else {
      setStats(prev => ({ ...prev, streak: 1, lastVisit: today }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = useCallback((message, type = 'xp') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const celebrate = useCallback(() => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
  }, []);

  const checkAchievements = useCallback((newStats) => {
    ACHIEVEMENTS.forEach(achievement => {
      if (!newStats.unlockedAchievements.includes(achievement.id) && achievement.condition(newStats)) {
        newStats.unlockedAchievements = [...newStats.unlockedAchievements, achievement.id];
        newStats.totalXP += achievement.xpReward;
        showNotification(`🏆 Достижение: ${achievement.title}! +${achievement.xpReward} XP`, 'achievement');
        celebrate();
      }
    });
    return newStats;
  }, [showNotification, celebrate]);

  const addXP = useCallback((amount, reason = '') => {
    setStats(prev => {
      const newStats = { ...prev, totalXP: prev.totalXP + amount };
      const updated = checkAchievements(newStats);
      showNotification(`+${amount} XP${reason ? ` за ${reason}` : ''}`, 'xp');
      return updated;
    });
  }, [checkAchievements, showNotification]);

  const addPoints = useCallback((amount, reason = '') => {
    setStats(prev => {
      const newStats = { ...prev, totalPoints: prev.totalPoints + amount };
      showNotification(`+${amount} баллов${reason ? ` за ${reason}` : ''}`, 'points');
      return newStats;
    });
  }, [showNotification]);

  const recordCorrectAnswer = useCallback(() => {
    setStats(prev => {
      const newStats = {
        ...prev,
        correctAnswers: prev.correctAnswers + 1,
        totalAnswers: prev.totalAnswers + 1,
      };
      return newStats;
    });
    addXP(10, 'правильный ответ');
    addPoints(5);
  }, [addXP, addPoints]);

  const recordWrongAnswer = useCallback(() => {
    setStats(prev => ({
      ...prev,
      totalAnswers: prev.totalAnswers + 1,
    }));
  }, []);

  const completeLesson = useCallback(() => {
    setStats(prev => {
      const newStats = { ...prev, lessonsCompleted: prev.lessonsCompleted + 1 };
      return checkAchievements(newStats);
    });
    addXP(50, 'завершение урока');
    addPoints(25);
    celebrate();
  }, [addXP, addPoints, checkAchievements, celebrate]);

  const learnCard = useCallback(() => {
    setStats(prev => {
      const newStats = { ...prev, cardsLearned: prev.cardsLearned + 1 };
      return checkAchievements(newStats);
    });
    addXP(5, 'изучение карточки');
  }, [addXP, checkAchievements]);

  const playGame = useCallback((isPerfect = false) => {
    setStats(prev => {
      const newStats = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        perfectGames: isPerfect ? prev.perfectGames + 1 : prev.perfectGames,
      };
      return checkAchievements(newStats);
    });
    addXP(isPerfect ? 100 : 30, isPerfect ? 'идеальную игру' : 'игру');
    addPoints(isPerfect ? 50 : 15);
    if (isPerfect) celebrate();
  }, [addXP, addPoints, checkAchievements, celebrate]);

  const recordAIMessage = useCallback(() => {
    setStats(prev => {
      const newStats = { ...prev, aiMessages: prev.aiMessages + 1 };
      return checkAchievements(newStats);
    });
    addXP(3, 'общение с AI');
  }, [addXP, checkAchievements]);

  const watchVideo = useCallback(() => {
    setStats(prev => {
      const newStats = { ...prev, videosWatched: prev.videosWatched + 1 };
      return checkAchievements(newStats);
    });
    addXP(20, 'просмотр видео');
    addPoints(10);
  }, [addXP, addPoints, checkAchievements]);

  const levelInfo = getLevel(stats.totalXP);
  const xpProgress = levelInfo.nextLevelXP === Infinity ? 100 :
    ((stats.totalXP - (getLevel(stats.totalXP - 1).nextLevelXP || 0)) /
    (levelInfo.nextLevelXP - (getLevel(stats.totalXP - 1).nextLevelXP || 0))) * 100;

  const value = {
    stats,
    levelInfo,
    xpProgress: Math.min(Math.max(xpProgress, 0), 100),
    achievements: ACHIEVEMENTS,
    notification,
    showCelebration,
    addXP,
    addPoints,
    recordCorrectAnswer,
    recordWrongAnswer,
    completeLesson,
    learnCard,
    playGame,
    recordAIMessage,
    watchVideo,
    celebrate,
  };

  return (
    <PointsContext.Provider value={value}>
      {children}
    </PointsContext.Provider>
  );
};


