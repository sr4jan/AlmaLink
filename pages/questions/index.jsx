import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from 'next/link';
import axios from "axios";
import styles from "../../styles/QuestionsPage.module.css";
import { 
  MessageSquare, 
  Edit2, 
  Trash2, 
  Send, 
  Save, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  User,
  Tag,
  Loader,
  LogIn
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Helper functions
const getUserDisplayName = (user) => {
  if (!user) return 'Anonymous';
  return user.username || user.name || user.email?.split('@')[0] || 'Anonymous';
};

const getUserAvatar = (user) => {
  return user?.profile?.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${getUserDisplayName(user)}`;
};

const getCategoryColor = (category) => {
  const colors = {
    'Pending': '#6c757d',
    'General': '#0d6efd',
    'Programming': '#198754',
    'Web Development': '#dc3545',
    'Mobile Development': '#fd7e14',
    'Database': '#6610f2',
    'Cloud Computing': '#0dcaf0',
    'DevOps': '#d63384',
    'Security': '#dc3545',
    'Machine Learning': '#198754',
    'Networking': '#6f42c1',
    'Other': '#6c757d'
  };
  return colors[category] || colors['Other'];
};

export default function QuestionsPage() {
  const { data: session, status } = useSession();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ title: "", description: "" });
  const [replyText, setReplyText] = useState({});
  const [filteredCount, setFilteredCount] = useState(0);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestion, setEditQuestion] = useState({ title: "", description: "" });
  const [loadingStates, setLoadingStates] = useState({
    post: false,
    replies: {},
    votes: {},
    delete: {}
  });
  const [userVotes, setUserVotes] = useState({});

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("/api/questions");
        setQuestions(res.data);
        setFilteredCount(res.data.length);
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast.error("Failed to fetch questions");
      }
    };
  
    fetchQuestions();
  }, []);

  const handlePost = async () => {
    if (!session) {
      toast.error("Please login to post a question");
      return;
    }
  
    if (!newQuestion.title.trim()) {
      toast.error("Please provide a question title");
      return;
    }
    
    try {
      setLoadingStates(prev => ({ ...prev, post: true }));
      
      const response = await axios.post("/api/questions", {
        title: newQuestion.title.trim(),
        description: newQuestion.description.trim()
      });
      
      if (response.data.category === 'Pending') {
        toast.loading("Classifying your question...", { duration: 3000 });
        setTimeout(fetchQuestions, 3000); // Refetch after 3 seconds to get updated category
      } else {
        setQuestions(prev => [response.data, ...prev]);
        toast.success(`Question posted in ${response.data.category} category!`);
      }
      
      setNewQuestion({ title: "", description: "" });
    } catch (error) {
      console.error("Error posting question:", error);
      toast.error(error.response?.data?.message || "Failed to post question");
    } finally {
      setLoadingStates(prev => ({ ...prev, post: false }));
    }
  };
  

  const handleReply = async (questionId) => {
    if (!session) {
      toast.error("Please login to reply");
      return;
    }

    if (!replyText[questionId]?.trim()) {
      toast.error("Please enter a reply");
      return;
    }
    
    try {
      setLoadingStates(prev => ({
        ...prev,
        replies: { ...prev.replies, [questionId]: true }
      }));

      await axios.patch("/api/questions/reply", {
        questionId,
        text: replyText[questionId]
      });
      
      setReplyText(prev => ({ ...prev, [questionId]: "" }));
      await fetchQuestions();
      toast.success("Reply posted successfully!");
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        replies: { ...prev.replies, [questionId]: false }
      }));
    }
  };

  const handleVote = async (id, direction) => {
    if (!session) {
      toast.error("Please login to vote");
      return;
    }
  
    try {
      setLoadingStates(prev => ({
        ...prev,
        votes: { ...prev.votes, [id]: true }
      }));
  
      const response = await axios.patch(`/api/questions/${id}/vote`, { direction });
      
      if (response.data) {
        // Update the specific question in the state
        setQuestions(prev => prev.map(q => 
          q._id === id ? { ...q, ...response.data } : q
        ));
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error(error.response?.data?.message || "Failed to register vote");
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        votes: { ...prev.votes, [id]: false }
      }));
    }
  };
  
  const handleDelete = async (id) => {
    if (!session) {
      toast.error("Please login to delete questions");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this question?");
    if (!confirmed) return;
    
    try {
      setLoadingStates(prev => ({
        ...prev,
        delete: { ...prev.delete, [id]: true }
      }));

      await axios.delete(`/api/questions/${id}`);
      await fetchQuestions();
      toast.success("Question deleted successfully!");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error(error.response?.data?.message || "Failed to delete question");
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        delete: { ...prev.delete, [id]: false }
      }));
    }
  };

  const getUserDisplayName = (user) => {
    if (!user) return 'Anonymous';
    return user.username || 
           user.name || 
           `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 
           user.email?.split('@')[0] || 
           'Anonymous';
  };
  
  const getUserAvatar = (user) => {
    if (!user) return null;
    return user.profile?.avatar || 
           user.avatar || 
           `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName(user))}&background=random`;
  };

  const hasUserVoted = (question, voteType) => {
    if (!session?.user?.id || !question.votes) return false;
    return question.votes.some(
      vote => vote.userId === session.user.id && vote.direction === voteType
    );
  };

  const handleEdit = (id) => {
    const question = questions.find((q) => q._id === id);
    setEditQuestion({
      title: question.title,
      description: question.description
    });
    setEditingQuestionId(id);
  };

  const canEditDelete = (question) => {
    if (!session || !question) return false;
    if (session.user.role === 'superadmin') return true;
    if (session.user.role === 'admin' && question.collegeId === session.user.collegeId) return true;
    
    // Safely check the postedBy property
    const questionUserId = question.postedBy?._id || question.postedBy;
    return questionUserId && questionUserId.toString() === session.user.id;
  };
  

  return (
    <div className={styles.pageContainer}>
      {/* Left Column - Ask Question */}
      <div className={styles.leftColumn}>
        <h1 className={styles.leftColumnHeading}>Post a Question</h1>
        {!session ? (
          <div className={styles.loginPrompt}>
            <LogIn size={24} />
            <p>Please <Link href="/auth/login">login</Link> to post a question</p>
          </div>
        ) : (
          <div className={styles.newQuestionCard}>
            <h2 className={styles.subHeading}>Ask a Question</h2>
            <input
              type="text"
              placeholder="What's your question? *"
              value={newQuestion.title}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
              className={styles.input}
              required
            />
            <textarea
              placeholder="Add more details about your question... (optional)"
              rows={8}
              value={newQuestion.description}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, description: e.target.value }))}
              className={styles.textarea}
            />
            <button 
              onClick={handlePost} 
              className={styles.postButton}
              disabled={loadingStates.post}
            >
              <Send size={18} style={{ marginRight: '8px' }} />
              {loadingStates.post ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        )}
      </div>
  
     {/* Right Column - Questions Feed */}
     <div className={styles.rightColumn}>
        <h1 className={styles.heading}>Recent Questions</h1>
        {session?.user?.role === 'alumni' && (
    <div className={styles.filterInfo}>
      Showing {questions.length} questions matching your skills
    </div>
  )}
        {questions.map((q) => (
          <div key={q._id} className={styles.questionThread}>
            <div className={styles.voteColumn}>
              <button 
                className={`${styles.voteButton} ${hasUserVoted(q, 'up') ? styles.voted : ''}`}
                onClick={() => handleVote(q._id, 'up')}
                disabled={loadingStates.votes[q._id]}
              >
                <ArrowUp size={20} />
              </button>
              <span className={styles.voteCount}>{q.voteCount || 0}</span>
              <button 
                className={`${styles.voteButton} ${hasUserVoted(q, 'down') ? styles.voted : ''}`}
                onClick={() => handleVote(q._id, 'down')}
                disabled={loadingStates.votes[q._id]}
              >
                <ArrowDown size={20} />
              </button>
            </div>

            <div className={styles.questionContent}>
              {editingQuestionId === q._id ? (
                <div className={styles.editForm}>
                  <input
                    type="text"
                    value={editQuestion.title}
                    onChange={(e) => setEditQuestion(prev => ({ ...prev, title: e.target.value }))}
                    className={styles.input}
                  />
                  <textarea
                    value={editQuestion.description}
                    onChange={(e) => setEditQuestion(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className={styles.textarea}
                  />
                  <div className={styles.buttonRow}>
                    <button 
                      onClick={() => handleEdit(q._id)} 
                      className={styles.saveBtn} 
                      disabled={loadingStates.edit}
                    >
                      <Save size={16} style={{ marginRight: '8px' }} />
                      {loadingStates.edit ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={() => setEditingQuestionId(null)} 
                      className={styles.cancelBtn}
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.questionHeader}>
                  <div className={styles.userInfo}>
  <img 
    src={getUserAvatar(q.postedBy || {})} 
    alt={getUserDisplayName(q.postedBy || {})}
    className={styles.userAvatar}
  />
  <div className={styles.userMeta}>
    <h3 className={styles.questionTitle}>{q.title}</h3>
    <div className={styles.questionMeta}>
      <span className={styles.metaItem}>
        <User size={14} />
        {getUserDisplayName(q.postedBy || {})}
      </span>
      <span className={styles.metaItem}>
        <Clock size={14} />
        {formatDate(q.createdAt)}
      </span>
      <span className={styles.metaItem}>
        <MessageSquare size={14} />
        {q.replies?.length || 0} replies
      </span>
      {/* ... rest of your meta items ... */}
      {/* Add the category display here */}
      <span 
                      className={`${styles.metaItem} ${styles.category}`}
                      style={{
                        backgroundColor: `${getCategoryColor(q.category)}20`,
                        color: getCategoryColor(q.category),
                        border: `1px solid ${getCategoryColor(q.category)}40`
                      }}
                    >
                      {q.category === 'Pending' ? (
                        <>
                          <Loader size={14} className={styles.spinner} />
                          Classifying...
                        </>
                      ) : (
                        <>
                          <Tag size={14} />
                          {q.category}
                        </>
                      )}
                    </span>
    </div>
  </div>
</div>

{canEditDelete(q) && (
  <div className={styles.questionActions}>
    <button 
      onClick={() => handleEdit(q._id)} 
      className={styles.actionButton}
    >
      <Edit2 size={14} /> Edit
    </button>
    <button 
      onClick={() => handleDelete(q._id)} 
      className={`${styles.actionButton} ${styles.deleteButton}`}
      disabled={loadingStates.delete[q._id]}
    >
      <Trash2 size={14} />
      {loadingStates.delete[q._id] ? 'Deleting...' : 'Delete'}
    </button>
  </div>
)}
                  </div>

                  <p className={styles.questionDescription}>
                    {q.description || 'No additional details provided.'}
                  </p>

                  <div className={styles.repliesSection}>
                    {q.replies?.map((r) => (
                      <div key={r._id} className={styles.replyThread}>
                        <div className={styles.replyContent}>
                          <div className={styles.replyMeta}>
                            <span className={styles.metaItem}>
                              <User size={12} />
                              {getUserDisplayName(r.postedBy)}
                            </span>
                            <span className={styles.metaItem}>
                              <Clock size={12} />
                              {formatDate(r.createdAt)}
                            </span>
                          </div>
                          <p>{r.text}</p>
                        </div>
                      </div>
                    ))}

                    {session ? (
                      <div className={styles.replyForm}>
                        <input
                          type="text"
                          placeholder="Write your reply..."
                          value={replyText[q._id] || ""}
                          onChange={(e) => setReplyText(prev => ({ 
                            ...prev, 
                            [q._id]: e.target.value 
                          }))}
                          className={styles.replyInput}
                        />
                        <button 
                          onClick={() => handleReply(q._id)} 
                          className={styles.replyButton}
                          disabled={loadingStates.replies[q._id]}
                        >
                          <Send size={14} />
                          {loadingStates.replies[q._id] ? 'Sending...' : 'Reply'}
                        </button>
                      </div>
                    ) : (
                      <div className={styles.loginPrompt}>
                        <p>Please <Link href="/auth/login">login</Link> to reply</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// Add this at the bottom of your file
export async function getServerSideProps(context) {
  return {
    props: {
      // This ensures the session is passed to the page
    },
  }
}