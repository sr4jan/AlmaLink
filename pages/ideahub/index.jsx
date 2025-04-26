'use client';
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { MessageCircle, X, ExternalLink, ChevronRight, Trash2, Edit2, ThumbsUp, Share2, Clock } from 'lucide-react';
import Link from 'next/link';
import styles from '@/styles/Ideahub.module.css';

export default function IdeaHubPage() {
  const { data: session } = useSession();
  const [ideas, setIdeas] = useState([]);
  const [viewMode, setViewMode] = useState('all');
  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    tags: [],
    collegeId: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [filters, setFilters] = useState({
    college: "all",
    sort: "recent",
    search: "",
  });

  useEffect(() => {
    fetchIdeas();
  }, [filters]);

  const getUserDisplayName = (user) => {
    if (!user) return 'Anonymous';
    return user.name || user.username || user.email?.split('@')[0] || 'Anonymous';
  };
  
  // Add a helper function for getting user avatar
  const getUserAvatar = (user) => {
    if (!user) return null;
    return user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName(user))}&background=random`;
  };

  const fetchIdeas = async () => {
    try {
      const response = await axios.get("/api/ideas", {
        params: filters,
        headers: { 'Accept': 'application/json' }
      });

      if (response.data.success) {
        setIdeas(response.data.ideas || []);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load ideas");
    }
  };

  const handleViewIdea = async (idea) => {
    setSelectedIdea(idea);
    setShowIdeaModal(true);
  };

  const handleViewProfile = async (userId) => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      if (response.data.success) {
        setSelectedProfile(response.data.user);
        setShowProfileModal(true);
      }
    } catch (error) {
      toast.error("Failed to load user profile");
    }
  };

  const startChat = async (userId) => {
    try {
      const response = await axios.post("/api/chat/create", {
        recipientId: userId
      });
      if (response.data.success) {
        window.location.href = `/chat?conversation=${response.data.conversationId}`;
      }
    } catch (error) {
      toast.error("Failed to start conversation");
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  

  // In your IdeaHubPage component, update the handleSubmit function:

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!session?.user) {
    toast.error('Please sign in to submit ideas');
    return;
  }

  if (!validateIdea()) {
    return;
  }

  try {
    setLoading(true);

    // Get user info from session
    const userId = session.user?.id;
    const userCollegeId = session.user?.collegeId; // Get collegeId from session

    if (!userId || !userCollegeId) {
      toast.error('Session error: Missing user information. Please sign in again.');
      return;
    }

    const ideaData = {
      title: newIdea.title.trim(),
      description: newIdea.description.trim(),
      postedBy: userId,
      collegeId: userCollegeId, // Include collegeId in the request
      tags: Array.isArray(newIdea.tags) ? newIdea.tags : []
    };

    console.log('Submitting idea:', ideaData);

    const response = await axios.post("/api/ideas", ideaData);
    
    if (response.data.success) {
      toast.success("Idea submitted successfully!");
      
      // Reset form
      setNewIdea({
        title: "",
        description: "",
        tags: []
      });
      
      // Refresh ideas list
      fetchIdeas();
    }
  } catch (error) {
    console.error('Submit idea error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    toast.error(error.response?.data?.message || 'Failed to submit idea');
  } finally {
    setLoading(false);
  }
};
  
  // Update validateIdea function to include more checks
  const validateIdea = () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to submit ideas");
      return false;
    }
  
    if (!newIdea.title?.trim()) {
      toast.error("Please enter a title");
      return false;
    }
  
    if (!newIdea.description?.trim()) {
      toast.error("Please enter a description");
      return false;
    }
  
    if (newIdea.title.length > 100) {
      toast.error("Title is too long (max 100 characters)");
      return false;
    }
  
    if (newIdea.description.length > 2000) {
      toast.error("Description is too long (max 2000 characters)");
      return false;
    }
  
    return true;
  };
  
  // In your IdeaHubPage component
  const handleLike = async (ideaId, e) => {
    if (e) e.stopPropagation();
    
    if (!session?.user) {
      toast.error('Please sign in to upvote ideas');
      return;
    }
  
    try {
      const response = await axios.patch(`/api/ideas/${ideaId}/upvote`, {
        userId: session.user.id
      });
  
      if (response.data.success) {
        await fetchIdeas();
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error updating vote:', error);
      toast.error(error.response?.data?.message || 'Failed to update vote');
    }
  };

// Update your isIdeaUpvoted helper function
const isIdeaUpvoted = (idea) => {
  return Array.isArray(idea.upvotes) && 
         idea.upvotes.includes(session?.user?.id);
};

  // Render idea card
  const renderIdeaCard = (idea) => (
    <div 
      key={idea._id} 
      className={styles.ideaCard}
      onClick={() => handleViewIdea(idea)}
    >
      <h3 className={styles.ideaTitle}>{idea.title}</h3>
      <p className={styles.ideaDescription}>
        {idea.description.substring(0, 150)}
        {idea.description.length > 150 && '...'}
      </p>
      <div className={styles.ideaMeta}>
      <div className={styles.authorInfo}>
  <div className={styles.avatarContainer}>
    <img 
      src={getUserAvatar(idea.postedBy)}
      alt={getUserDisplayName(idea.postedBy)}
      className={styles.authorAvatar}
    />
  </div>
  <div className={styles.authorDetails}>
    <span className={styles.authorName}>
      {getUserDisplayName(idea.postedBy)}
    </span>
    <span className={styles.postedDate}>
      <Clock size={14} />
      {formatDate(idea.createdAt)}
    </span>
  </div>
</div>
        <span className={styles.postedDate}>
          {formatDate(idea.createdAt)}
        </span>
      </div>
      {idea.tags?.length > 0 && (
        <div className={styles.tagsList}>
          {idea.tags.map((tag, index) => (
            <span key={index} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}
      <ChevronRight size={16} className={styles.chevronIcon} />
    </div>
  );
  const IdeaModal = ({ idea, onClose }) => (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>{idea.title}</h2>
          <p className={styles.modalDescription}>{idea.description}</p>
          
          {idea.tags?.length > 0 && (
            <div className={styles.tagsList}>
              {idea.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}

          <div className={styles.modalMeta}>
            <div className={styles.authorInfo}>
              <div className={styles.avatarContainer}>
                {idea.postedBy?.avatar ? (
                  <img 
                    src={idea.postedBy.avatar}
                    alt={idea.postedBy.name}
                    className={styles.authorAvatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {(idea.postedBy?.name?.[0] || 'U').toUpperCase()}
                  </div>
                )}
              </div>
              <div className={styles.authorDetails}>
                <span className={styles.authorName}>{idea.postedBy?.name}</span>
                <span className={styles.postedDate}>{formatDate(idea.createdAt)}</span>
              </div>
            </div>
            
            {session?.user?.role === 'alumni' && (
              <div className={styles.modalActions}>
                <button 
                  onClick={() => handleViewProfile(idea.postedBy?._id)}
                  className={styles.actionButton}
                >
                  View Profile <ExternalLink size={16} />
                </button>
                <button 
                  onClick={() => startChat(idea.postedBy?._id)}
                  className={styles.actionButton}
                >
                  Message <MessageCircle size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Filter ideas based on viewMode
  const filteredIdeas = ideas.filter(idea => {
    if (viewMode === 'my-ideas') {
      return idea.postedBy?._id === session?.user?.id;
    }
    return true;
  });

  const handleDelete = async (ideaId, e) => {
    e.stopPropagation(); // Prevent modal from opening
    if (!confirm('Are you sure you want to delete this idea?')) return;

    try {
      const response = await axios.delete(`/api/ideas/${ideaId}`);
      if (response.data.success) {
        toast.success('Idea deleted successfully');
        fetchIdeas();
      }
    } catch (error) {
      toast.error('Failed to delete idea');
    }
  };

  return (
    <div className={styles.ideaHubContainer}>
      <Toaster position="top-center" />
      
      <h1 className={styles.ideaHubTitle}>IdeaHub</h1>
      
      {/* Filters Section */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <select 
            value={filters.college}
            onChange={(e) => setFilters({ ...filters, college: e.target.value })}
            className={styles.filterSelect}
          >
            <option value="all">All Colleges</option>
          </select>

          <select 
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className={styles.filterSelect}
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        <input
          type="search"
          placeholder="Search ideas..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className={styles.searchInput}
        />
      </div>
      
      {/* Submit Idea Form */}
      {session?.user?.role === 'student' && (
        <form onSubmit={handleSubmit} className={styles.ideaForm}>
          <h2 className={styles.formTitle}>Share Your Idea</h2>
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Enter idea title"
              value={newIdea.title}
              onChange={(e) => setNewIdea({ 
                ...newIdea, 
                title: e.target.value.slice(0, 100) 
              })}
              className={styles.inputField}
              disabled={loading}
              required
            />
            <div className={styles.charCount}>
              {newIdea.title.length}/100 characters
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <textarea
              placeholder="Enter idea description"
              value={newIdea.description}
              onChange={(e) => setNewIdea({ 
                ...newIdea, 
                description: e.target.value 
              })}
              className={styles.inputField}
              disabled={loading}
              required
              rows="4"
            />
          </div>
          
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Add tags (comma separated)"
              value={newIdea.tags.join(", ")}
              onChange={(e) => setNewIdea({ 
                ...newIdea, 
                tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag)
              })}
              className={styles.inputField}
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <div className={styles.spinnerContainer}>
                <div className={styles.spinner} />
                <span>Submitting...</span>
              </div>
            ) : (
              "Share Idea"
            )}
          </button>
        </form>
      )}

      {/* Ideas Tabs */}
      {session?.user?.role === 'student' && (
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabButton} ${viewMode === 'all' ? styles.activeTab : ''}`}
            onClick={() => setViewMode('all')}
          >
            All Ideas
          </button>
          <button 
            className={`${styles.tabButton} ${viewMode === 'my-ideas' ? styles.activeTab : ''}`}
            onClick={() => setViewMode('my-ideas')}
          >
            My Ideas
          </button>
        </div>
      )}

<div className={styles.ideasGrid}>
  {filteredIdeas.length > 0 ? (
    filteredIdeas.map((idea) => (
      <div 
        key={idea._id} 
        className={styles.ideaCard}
        onClick={() => handleViewIdea(idea)}
      >
        <div className={styles.cardHeader}>
          <div className={styles.authorInfo}>
            <div className={styles.avatarContainer}>
              {idea.postedBy?.avatar ? (
                <img 
                  src={idea.postedBy.avatar}
                  alt={idea.postedBy.name || 'User'}
                  className={styles.authorAvatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {(idea.postedBy?.name?.[0] || 'U').toUpperCase()}
                </div>
              )}
            </div>
            <div className={styles.authorDetails}>
              <span className={styles.authorName}>
                {idea.postedBy?.name || 'Anonymous'}
              </span>
              <span className={styles.postedDate}>
                <Clock size={14} />
                {formatDate(idea.createdAt)}
              </span>
            </div>
          </div>
          
          <div className={styles.cardActions}>
            {idea.postedBy?._id === session?.user?.id && (
              <>
                <button 
                  onClick={(e) => handleDelete(idea._id, e)}
                  className={`${styles.iconButton} ${styles.deleteButton}`}
                  title="Delete idea"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(idea);
                  }}
                  className={`${styles.iconButton} ${styles.editButton}`}
                  title="Edit idea"
                >
                  <Edit2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.ideaTitle}>{idea.title}</h3>
          <p className={styles.ideaDescription}>
            {idea.description.substring(0, 150)}
            {idea.description.length > 150 && '...'}
          </p>
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.tagsList}>
            {idea.tags?.map((tag, index) => (
              <span key={index} className={styles.tag}>{tag}</span>
            ))}
          </div>
          
          <div className={styles.footerActions}>
            <button 
              className={`${styles.iconButton} ${styles.shareButton}`}
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(window.location.origin + `/ideas/${idea._id}`);
                toast.success('Link copied to clipboard!');
              }}
              title="Share idea"
            >
              <Share2 size={18} />
            </button>
            <button 
              className={`${styles.iconButton} ${styles.upvoteButton} ${
                idea.upvotedBy?.includes(session?.user?.id) ? styles.upvoted : ''
              }`}
              onClick={(e) => handleLike(idea._id, e)}
              title={
                idea.upvotedBy?.includes(session?.user?.id) 
                  ? "Remove upvote" 
                  : "Upvote idea"
              }
              disabled={!session?.user}
            >
              <ThumbsUp size={18} />
              <span className={styles.upvoteCount}>
                {idea.upvotes?.length || 0}
              </span>
            </button>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className={styles.noIdeas}>
      <p>
        {viewMode === 'my-ideas' 
          ? "You haven't posted any ideas yet"
          : "No ideas found"}
      </p>
    </div>
  )}
</div>

      {/* Modals */}
      {showIdeaModal && selectedIdea && (
        <IdeaModal 
          idea={selectedIdea} 
          onClose={() => setShowIdeaModal(false)} 
        />
      )}

      {showProfileModal && selectedProfile && (
        <ProfileModal 
          profile={selectedProfile} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </div>
  );
}