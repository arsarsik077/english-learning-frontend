import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAccessibility } from '../context/AccessibilityContext';
import { usePoints } from '../context/PointsContext';
import API_URL from '../config';
import './Videos.css';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const { speak } = useAccessibility();
  const { watchVideo } = usePoints();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/videos`);
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayVideo = (videoId) => {
    setPlayingId(videoId);
    if (watchVideo) watchVideo();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Загрузка видео...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="videos-page" role="main">
      <div className="container">
        {/* Header */}
        <div className="page-hero">
          <div className="page-hero-content">
            <span className="page-hero-emoji" aria-hidden="true">🎬</span>
            <div>
              <h1>Видеоматериалы</h1>
              <p>Обучающие видео для улучшения навыков английского</p>
            </div>
          </div>
          <button 
            className="tts-btn"
            onClick={() => speak('Видеоматериалы. Обучающие видео для улучшения навыков английского.', 'ru-RU')}
            aria-label="Озвучить заголовок"
          >
            🔊
          </button>
        </div>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="empty-state">
            <span>🎬</span>
            <p>Видео пока нет</p>
          </div>
        ) : (
          <div className="videos-grid">
            {videos.map((video, index) => (
              <div 
                key={video.id} 
                className="video-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Video Player / Thumbnail */}
                <div className="video-player-wrap">
                  {playingId === video.id ? (
                    <div className="video-iframe-container">
                      <iframe
                        src={video.videoUrl}
                        title={video.title}
                        allowFullScreen
                        className="video-iframe"
                      />
                    </div>
                  ) : (
                    <div 
                      className="video-thumbnail-wrap"
                      onClick={() => handlePlayVideo(video.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Воспроизвести: ${video.title}`}
                      onKeyDown={(e) => e.key === 'Enter' && handlePlayVideo(video.id)}
                    >
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.title} className="video-thumb-img" />
                      ) : (
                        <div className="video-thumb-placeholder">
                          <span>▶️</span>
                        </div>
                      )}
                      <div className="video-play-overlay">
                        <div className="play-btn-circle">▶</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="video-info-section">
                  <div className="video-info-header">
                    <h3>{video.title}</h3>
                    <button 
                      className="tts-btn-sm"
                      onClick={() => speak(video.title + '. ' + (video.description || ''), 'en-US')}
                      aria-label={`Озвучить: ${video.title}`}
                    >
                      🔊
                    </button>
                  </div>
                  {video.description && <p className="video-desc">{video.description}</p>}
                  <div className="video-meta">
                    {video.duration && (
                      <span className="video-duration-tag">
                        ⏱ {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                    <span className="video-xp-tag">+5 XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Videos;
