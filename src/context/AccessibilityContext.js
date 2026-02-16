import React, { createContext, useState, useEffect, useContext } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'default');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'normal');
  const [reducedMotion, setReducedMotion] = useState(
    localStorage.getItem('reducedMotion') === 'true'
  );
  const [dyslexiaFont, setDyslexiaFont] = useState(
    localStorage.getItem('dyslexiaFont') === 'true'
  );
  const [ttsEnabled, setTtsEnabled] = useState(
    localStorage.getItem('ttsEnabled') !== 'false'
  );
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Apply theme
    if (theme === 'high-contrast') {
      document.documentElement.setAttribute('data-theme', 'high-contrast');
    } else if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Apply font size
    if (fontSize === 'large') {
      document.documentElement.setAttribute('data-font-scale', 'large');
    } else if (fontSize === 'x-large') {
      document.documentElement.setAttribute('data-font-scale', 'x-large');
    } else {
      document.documentElement.removeAttribute('data-font-scale');
    }
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('reducedMotion', reducedMotion);
    if (reducedMotion) {
      document.documentElement.style.setProperty('--transition', '0s');
      document.documentElement.style.setProperty('--transition-fast', '0s');
      document.documentElement.style.setProperty('--transition-slow', '0s');
    } else {
      document.documentElement.style.removeProperty('--transition');
      document.documentElement.style.removeProperty('--transition-fast');
      document.documentElement.style.removeProperty('--transition-slow');
    }
  }, [reducedMotion]);

  useEffect(() => {
    localStorage.setItem('dyslexiaFont', dyslexiaFont);
    if (dyslexiaFont) {
      document.body.style.fontFamily = '"OpenDyslexic", "Comic Sans MS", cursive, sans-serif';
      document.body.style.letterSpacing = '0.05em';
      document.body.style.wordSpacing = '0.1em';
      document.body.style.lineHeight = '1.8';
    } else {
      document.body.style.fontFamily = '';
      document.body.style.letterSpacing = '';
      document.body.style.wordSpacing = '';
      document.body.style.lineHeight = '';
    }
  }, [dyslexiaFont]);

  useEffect(() => {
    localStorage.setItem('ttsEnabled', ttsEnabled);
    if (ttsEnabled) {
      document.documentElement.removeAttribute('data-tts-off');
    } else {
      document.documentElement.setAttribute('data-tts-off', '');
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [ttsEnabled]);

  // Text-to-speech helper — respects the ttsEnabled toggle
  const speak = (text, lang = 'en-US') => {
    if (!ttsEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Announce for screen readers
  const announce = (message) => {
    const el = document.getElementById('aria-live-region');
    if (el) {
      el.textContent = '';
      setTimeout(() => { el.textContent = message; }, 100);
    }
  };

  const value = {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    reducedMotion,
    setReducedMotion,
    dyslexiaFont,
    setDyslexiaFont,
    ttsEnabled,
    setTtsEnabled,
    showPanel,
    setShowPanel,
    speak,
    stopSpeaking,
    announce,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Live region for screen reader announcements */}
      <div
        id="aria-live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </AccessibilityContext.Provider>
  );
};


