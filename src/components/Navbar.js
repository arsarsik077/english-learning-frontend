import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { usePoints } from '../context/PointsContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { setShowPanel } = useAccessibility();
  const { stats, levelInfo } = usePoints();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setShowPanel(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowPanel]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Главная', icon: '🏠' },
    { path: '/lessons', label: 'Уроки', icon: '📖' },
    { path: '/videos', label: 'Видео', icon: '🎬' },
    { path: '/assignments', label: 'Задания', icon: '✏️' },
    { path: '/cards', label: 'Карточки', icon: '🃏' },
    { path: '/games', label: 'Игры', icon: '🎮' },
    { path: '/ai-chat', label: 'Luna AI', icon: '🦉' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Основная навигация">
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo" aria-label="EduLang — На главную">
          <div className="nav-logo-icon">🦉</div>
          <div className="nav-logo-text">
            <span className="nav-logo-title">EduLang</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-item ${isActive(link.path) ? 'active' : ''}`}
              role="menuitem"
              aria-current={isActive(link.path) ? 'page' : undefined}
            >
              <span className="nav-item-icon" aria-hidden="true">{link.icon}</span>
              <span className="nav-item-label">{link.label}</span>
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`} role="menuitem">
              <span className="nav-item-icon" aria-hidden="true">⚙️</span>
              <span className="nav-item-label">Админ</span>
            </Link>
          )}
        </div>

        {/* Right section */}
        <div className="nav-right">
          {/* Compact stats */}
          {user && (
            <div className="nav-stats-compact" aria-label={`${stats.totalXP} XP`}>
              <span className="nav-stat-badge level-badge">
                Ур.{levelInfo.level}
              </span>
              <span className="nav-stat-badge xp-badge">
                ⚡{stats.totalXP}
              </span>
              {stats.streak >= 2 && (
                <span className="nav-stat-badge streak-badge">
                  🔥{stats.streak}
                </span>
              )}
            </div>
          )}

          {/* Accessibility */}
          <button 
            className="nav-icon-btn" 
            onClick={() => setShowPanel(true)}
            aria-label="Настройки доступности (Alt+A)"
            title="Доступность (Alt+A)"
          >
            ♿
          </button>

          {/* Auth */}
          {user ? (
            <div className="nav-user">
              <Link to="/profile" className="nav-user-btn" aria-label={`Профиль ${user.username}`}>
                <div className="nav-user-avatar">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              </Link>
              <button onClick={handleLogout} className="nav-icon-btn logout-btn" aria-label="Выйти">
                ↪
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="nav-auth-link">Вход</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Регистрация</Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button 
            className="nav-mobile-btn" 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileOpen}
          >
            <div className={`nav-hamburger ${mobileOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
