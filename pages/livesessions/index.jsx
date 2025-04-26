'use client';
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { 
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Radio,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Disc,
  Bookmark,
  MoreVertical,
  DollarSign
} from 'lucide-react';
import styles from '/styles/LiveSessions.module.css';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// Mock data for testing
const MOCK_LIVE_SESSIONS = [
  {
    _id: '1',
    title: 'Introduction to React Development',
    host: {
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=john',
    },
    thumbnail: 'https://source.unsplash.com/random/800x450?react',
    viewers: 1234,
    duration: 3600,
    tags: ['React', 'JavaScript', 'Programming'],
    createdAt: '2025-04-20 16:26:31'
  },
  // Add more mock sessions as needed
];

const MOCK_RECORDED_SESSIONS = [
  {
    _id: '2',
    title: 'Advanced TypeScript Patterns',
    host: {
      name: 'Jane Smith',
      avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=jane',
    },
    thumbnail: 'https://source.unsplash.com/random/800x450?typescript',
    views: 5678,
    duration: 5400,
    likes: 789,
    comments: 123,
    recordedAt: '2025-04-19 14:30:00',
    tags: ['TypeScript', 'Advanced', 'Programming']
  },
  // Add more mock sessions as needed
];

export default function LiveSessionsPage() {
  const [activeSessions, setActiveSessions] = useState(MOCK_LIVE_SESSIONS);
  const [recordedSessions, setRecordedSessions] = useState(MOCK_RECORDED_SESSIONS);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showChat, setShowChat] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const videoRef = useRef(null);

  const formatViewers = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setIsPlaying(true);
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-center" />

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Live Learning Hub</h1>
          <div className={styles.searchBar}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={styles.filterButton}>
              <Filter size={20} />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Live Sessions Section */}
        <section className={styles.liveSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <Radio className={styles.liveIcon} size={20} />
              Live Now
            </h2>
            <div className={styles.sessionControls}>
              <button className={styles.controlButton}>
                <ChevronLeft size={20} />
              </button>
              <button className={styles.controlButton}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className={styles.sessionGrid}>
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Loading live sessions...</p>
              </div>
            ) : activeSessions.map(session => (
              <div 
                key={session._id} 
                className={styles.liveCard}
                onClick={() => handleSelectSession(session)}
              >
                <div className={styles.thumbnail}>
                  <img src={session.thumbnail} alt={session.title} />
                  <div className={styles.liveIndicator}>
                    <span className={styles.liveDot} />
                    LIVE
                  </div>
                  <div className={styles.viewerCount}>
                    <Eye size={16} />
                    {formatViewers(session.viewers)} watching
                  </div>
                </div>
                <div className={styles.sessionInfo}>
                  <div className={styles.hostInfo}>
                    <img src={session.host.avatar} alt={session.host.name} />
                    <h3>{session.title}</h3>
                  </div>
                  <p className={styles.hostName}>{session.host.name}</p>
                  <div className={styles.sessionMeta}>
                    <span>
                      <Clock size={14} />
                      {formatDuration(session.duration)}
                    </span>
                    <div className={styles.tags}>
                      {session.tags.map((tag, i) => (
                        <span key={i} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recorded Sessions Section */}
        <section className={styles.recordedSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <Disc size={20} />
              Recorded Sessions
            </h2>
          </div>

          <div className={styles.recordedGrid}>
            {recordedSessions.map(session => (
              <div 
                key={session._id} 
                className={styles.recordedCard}
                onClick={() => handleSelectSession(session)}
              >
                <div className={styles.thumbnail}>
                  <img src={session.thumbnail} alt={session.title} />
                  <div className={styles.duration}>
                    {formatDuration(session.duration)}
                  </div>
                  <button className={styles.playButton}>
                    <Play size={24} />
                  </button>
                </div>
                <div className={styles.sessionInfo}>
                  <div className={styles.recordedHeader}>
                    <h3>{session.title}</h3>
                    <button className={styles.moreButton}>
                      <MoreVertical size={20} />
                    </button>
                  </div>
                  <div className={styles.recordedMeta}>
                    <span>
                      <Eye size={14} />
                      {formatViewers(session.views)} views
                    </span>
                    <span>
                      <Calendar size={14} />
                      {formatDate(session.recordedAt)}
                    </span>
                  </div>
                  <div className={styles.recordedActions}>
                    <button className={styles.actionButton}>
                      <Heart size={16} />
                      {formatViewers(session.likes)}
                    </button>
                    <button className={styles.actionButton}>
                      <MessageCircle size={16} />
                      {formatViewers(session.comments)}
                    </button>
                    <button className={styles.actionButton}>
                      <Share2 size={16} />
                    </button>
                    <button className={styles.actionButton}>
                      <Bookmark size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Video Modal */}
      {selectedSession && (
        <div className={styles.videoModal} onClick={() => setSelectedSession(null)}>
          <div className={styles.videoContainer} onClick={e => e.stopPropagation()}>
            {/* Video Player would go here */}
            <div className={styles.videoControls}>
              <button onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progress}
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <button onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <button onClick={() => {}}>
                <Maximize size={24} />
              </button>
            </div>
          </div>

          {showChat && (
            <div className={styles.chatSection}>
              <div className={styles.chatHeader}>
                <h3>Live Chat</h3>
                <button onClick={() => setShowChat(false)}>Hide</button>
              </div>
              <div className={styles.chatMessages}>
                {messages.map((msg, i) => (
                  <div key={i} className={styles.message}>
                    <img src={msg.user?.avatar} alt={msg.user?.name} />
                    <div>
                      <span className={styles.userName}>{msg.user?.name}</span>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.chatInput}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newMessage.trim()) {
                      // Handle send message
                    }
                  }}
                />
                <button onClick={() => {
                  if (newMessage.trim()) {
                    // Handle send message
                  }
                }}>
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}