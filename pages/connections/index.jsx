'use client';
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProfileModal from "@/components/ProfileModal";
import MessageModal from "@/components/MessageModal";
import { 
  Search,
  MessageCircle,
  Mail,
  UserPlus,
  Users,
  GraduationCap,
  Briefcase,
  X
} from 'lucide-react';
import styles from '@/styles/Connections.module.css';

export default function ConnectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('alumni');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/login');
      return;
    }

    if (status === "authenticated") {
      fetchConnections(activeTab);
    }
  }, [status, activeTab]);

  // Add to your existing useEffect
useEffect(() => {
  const handleScroll = () => {
    const tabsElement = document.querySelector(`.${styles.tabs}`);
    if (tabsElement) {
      if (window.scrollY > 64) { // Adjust this value based on your navbar height
        tabsElement.classList.add(styles.sticky);
      } else {
        tabsElement.classList.remove(styles.sticky);
      }
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

  const fetchConnections = async (filter) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/connections/filtered?filter=${filter}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }
      
      const data = await response.json();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setError('Failed to load connections');
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
  };

  const handleMessage = (profile) => {
    setSelectedProfile(profile);
    setShowMessageModal(true);
  };

  const handleSendMessage = async (message) => {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          receiver: selectedProfile.id
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      toast.success('Message sent successfully!');
      setShowMessageModal(false);
      router.push('/chat'); // Redirect to chat page
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Filter connections based on search
  const filteredConnections = connections.filter(connection => {
    const searchLower = searchTerm.toLowerCase();
    return (
      connection.name?.toLowerCase().includes(searchLower) ||
      connection.bio?.toLowerCase().includes(searchLower) ||
      connection.company?.toLowerCase().includes(searchLower) ||
      connection.position?.toLowerCase().includes(searchLower) ||
      connection.skills?.some(skill => skill.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className={styles.container}>
      {/* Header Section */}
      {/* Header Section - Combined Search and Tabs */}
<div className={styles.header}>
  <div className={styles.headerContent}>
    <div className={styles.searchBar}>
      <Search size={20} />
      <input
        type="text"
        placeholder={`Search ${activeTab === 'alumni' ? 'alumni' : 'students'}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${activeTab === 'alumni' ? styles.active : ''}`}
        onClick={() => setActiveTab('alumni')}
      >
        <GraduationCap size={18} />
        Alumni
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'students' ? styles.active : ''}`}
        onClick={() => setActiveTab('students')}
      >
        <Users size={18} />
        Students
      </button>
    </div>
  </div>
</div>

      {/* Connections Grid */}
      <div className={styles.connectionsGrid}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading {activeTab}...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={() => fetchConnections(activeTab)}>Retry</button>
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className={styles.noResults}>
            {searchTerm 
              ? `No ${activeTab} found matching your search`
              : `No ${activeTab} available`
            }
          </div>
        ) : (
          filteredConnections.map((connection) => (
            <div 
              key={connection.id} 
              className={styles.connectionCard}
              onClick={() => handleProfileClick(connection)}
            >
              <div className={styles.cardHeader}>
                <img
                  src={connection.avatar}
                  alt={connection.name}
                  className={styles.avatar}
                />
                <div className={styles.headerInfo}>
                  <h3>{connection.name}</h3>
                  <p className={styles.role}>
                    {connection.position || connection.major}
                  </p>
                </div>
              </div>

              <div className={styles.cardBody}>
                {connection.company && (
                  <div className={styles.infoItem}>
                    <Briefcase size={16} />
                    <span>{connection.company}</span>
                  </div>
                )}
                <div className={styles.cardActions}>
                  <button 
                    className={styles.actionButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMessage(connection);
                    }}
                  >
                    <MessageCircle size={18} />
                    Message
                  </button>
                  <button 
                    className={styles.actionButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `mailto:${connection.email}`;
                    }}
                  >
                    <Mail size={18} />
                    Email
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onMessage={handleMessage}
        />
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <MessageModal
          recipient={selectedProfile}
          onClose={() => setShowMessageModal(false)}
          onSend={handleSendMessage}
        />
      )}
    </div>
  );
}