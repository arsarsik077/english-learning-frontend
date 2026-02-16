import React from 'react';
import { usePoints } from '../context/PointsContext';
import './Notifications.css';

const Notifications = () => {
  const { notification, showCelebration } = usePoints();

  return (
    <>
      {/* XP / Points Notification */}
      {notification && (
        <div className={`notif notif-${notification.type}`} role="alert" aria-live="assertive">
          <span className="notif-icon">
            {notification.type === 'xp' && '⚡'}
            {notification.type === 'points' && '🪙'}
            {notification.type === 'achievement' && '🏆'}
          </span>
          <span className="notif-text">{notification.message}</span>
        </div>
      )}

      {/* Celebration confetti */}
      {showCelebration && (
        <div className="celebration" aria-hidden="true">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random() * 1.5}s`,
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'][i % 8],
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
              }}
            />
          ))}
          <div className="celebration-text">🎉 Отлично! 🎉</div>
        </div>
      )}
    </>
  );
};

export default Notifications;


