'use client';
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Search,
  MessageCircle,
  Plus,
  UserPlus,
  Mail,
  ExternalLink,
  MapPin,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import styles from '/styles/Connections.module.css';

// Keep your MOCK_STORIES for now
const MOCK_STORIES = [/* ... your existing mock stories ... */];

export default function ConnectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stories, setStories] = useState(MOCK_STORIES);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/login');
      return;
    }

    if (status === "authenticated") {
      fetchConnections();
    }
  }, [status]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/connections');
      
      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }
      
      const data = await response.json();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStory = (story) => {
    setSelectedStory(story);
    setStories(prev => 
      prev.map(s => 
        s.id === story.id 
          ? { ...s, user: { ...s.user, hasUpdate: false } }
          : s
      )
    );
  };

  // Filter connections based on search and filter
  const filteredConnections = connections.filter(connection => {
    const matchesSearch = (
      connection.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.skills?.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (filter === 'all') return matchesSearch;
    
    // Filter by role/category
    const filterMap = {
      'tech': ['software', 'engineer', 'developer', 'tech'],
      'research': ['researcher', 'scientist', 'phd', 'research'],
      'business': ['manager', 'consultant', 'analyst', 'business']
    };

    return matchesSearch && (
      connection.role?.toLowerCase().split(' ').some(term => 
        filterMap[filter]?.some(filterTerm => 
          term.includes(filterTerm)
        )
      )
    );
  });

  if (status === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading connections...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Search Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stories Section */}
      <section className={styles.storiesSection}>
        {/* ... your existing stories section ... */}
      </section>

      {/* Connections Grid */}
      <section className={styles.connectionsSection}>
        <div className={styles.sectionHeader}>
          <h2>Your Connections</h2>
          <div className={styles.filters}>
            {['all', 'tech', 'research', 'business'].map((filterType) => (
              <button
                key={filterType}
                className={`${styles.filterButton} ${filter === filterType ? styles.active : ''}`}
                onClick={() => setFilter(filterType)}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.connectionsGrid}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading connections...</p>
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className={styles.noResults}>
              {searchTerm 
                ? "No connections found matching your search"
                : "No connections available yet"
              }
            </div>
          ) : (
            filteredConnections.map((connection) => (
              <div key={connection.id} className={styles.connectionCard}>
                <div className={styles.cardHeader}>
                  <img
                    src={connection.avatar}
                    alt={connection.name}
                    className={styles.avatar}
                  />
                  <div className={styles.headerInfo}>
                    <h3>{connection.name}</h3>
                    <p className={styles.role}>{connection.role}</p>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  {connection.company && (
                    <div className={styles.infoItem}>
                      <Briefcase size={16} />
                      <span>{connection.company}</span>
                    </div>
                  )}
                  {connection.location && (
                    <div className={styles.infoItem}>
                      <MapPin size={16} />
                      <span>{connection.location}</span>
                    </div>
                  )}
                  {connection.education && (
                    <div className={styles.infoItem}>
                      <GraduationCap size={16} />
                      <span>{connection.education}</span>
                    </div>
                  )}

                  {connection.bio && (
                    <p className={styles.bio}>{connection.bio}</p>
                  )}

                  {connection.skills?.length > 0 && (
                    <div className={styles.skills}>
                      {connection.skills.map((skill, index) => (
                        <span key={index} className={styles.skill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {connection.achievements?.length > 0 && (
                    <div className={styles.achievements}>
                      {connection.achievements.map((achievement, index) => (
                        <div key={index} className={styles.achievement}>
                          <span>🏆</span> {achievement}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button className={styles.actionButton}>
                    <MessageCircle size={18} />
                    Message
                  </button>
                  <button className={styles.actionButton}>
                    <Mail size={18} />
                    Email
                  </button>
                  <button className={styles.actionButton}>
                    <LinkIcon size={18} />
                    Connect
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Story Modal */}
      {selectedStory && (
        <div 
          className={styles.storyModal}
          onClick={() => setSelectedStory(null)}
        >
          <div 
            className={styles.storyContent}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.storyHeader}>
              <img 
                src={selectedStory.user.avatar} 
                alt={selectedStory.user.name} 
              />
              <div>
                <h3>{selectedStory.user.name}</h3>
                <p>{selectedStory.user.role}</p>
              </div>
            </div>
            <div className={styles.storyBody}>
              <p>{selectedStory.content.text}</p>
              <span className={styles.timestamp}>
                {new Date(selectedStory.content.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}