'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  ChevronDown,
  Plus,
  Calendar as CalendarIcon,
  Trash2,
  Tag,
  Link as LinkIcon,
  UserCircle,
  Share2,
  Star,
  ExternalLink
} from 'lucide-react';
import styles from '/styles/Events.module.css';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    category: "tech",
    type: "In-Person",
    date: "",
    time: "",
    location: "",
    capacity: "",
    image: "", // New field for event image URL
    tags: "",
    registrationLink: "",
    organizer: "",
    userId: "sr4jan"
  });

  // Example categories - you can modify these
  const categories = [
    { id: "all", name: "All Events", color: "#0077ff" },
    { id: "tech", name: "Technology", color: "#00c6ff" },
    { id: "cultural", name: "Cultural", color: "#ff0099" },
    { id: "academic", name: "Academic", color: "#7c3aed" },
    { id: "sports", name: "Sports", color: "#10b981" },
    { id: "workshop", name: "Workshops", color: "#f59e0b" }
  ];

  // ... your existing fetchEvents and other functions ...

  return (
    <div className={styles.container}>
      <Toaster position="top-center" />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.gradientText}>Discover</span> Amazing Events
          </h1>
          <p className={styles.heroSubtitle}>
            Join exciting events, workshops, and meetups in our community
          </p>

          {/* Search Section */}
          <div className={styles.searchSection}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <button className={styles.searchButton}>
                <Filter size={18} />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Event Stats */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <Calendar size={24} />
            <h3>{events.length}</h3>
            <p>Upcoming Events</p>
          </div>
          <div className={styles.statCard}>
            <Users size={24} />
            <h3>500+</h3>
            <p>Active Members</p>
          </div>
          <div className={styles.statCard}>
            <Star size={24} />
            <h3>4.8</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.categoriesSection}>
        <div className={styles.categoryTabs}>
          {categories.map(category => (
            <button
              key={category.id}
              className={`${styles.categoryTab} ${selectedCategory === category.id ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                '--category-color': category.color,
                '--hover-color': `${category.color}33`
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* Create Event Button */}
      <button
        onClick={() => setShowForm(true)}
        className={styles.createEventButton}
      >
        <Plus size={20} />
        Create Event
      </button>

      {/* Events Grid */}
      <section className={styles.eventsGrid}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading amazing events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={48} />
            <h3>No Events Yet</h3>
            <p>Be the first to create an exciting event!</p>
            <button
              onClick={() => setShowForm(true)}
              className={styles.createFirstButton}
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          events.map(event => (
            <div key={event._id} className={styles.eventCard}>
              <div className={styles.eventImageWrapper}>
                <img
                  src={event.image || 'https://source.unsplash.com/random/400x200/?event'}
                  alt={event.title}
                  className={styles.eventImage}
                />
                <div className={styles.eventBadge} style={{ backgroundColor: categories.find(c => c.id === event.category)?.color }}>
                  {event.type}
                </div>
              </div>

              <div className={styles.eventContent}>
                <div className={styles.eventMeta}>
                  <span className={styles.eventDate}>
                    <Calendar size={16} />
                    {new Date(event.datetime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className={styles.eventTime}>
                    <Clock size={16} />
                    {new Date(event.datetime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <h3 className={styles.eventTitle}>{event.title}</h3>

                <div className={styles.eventLocation}>
                  <MapPin size={16} />
                  {event.location || 'TBA'}
                </div>

                <p className={styles.eventDescription}>
                  {event.description.slice(0, 120)}...
                </p>

                <div className={styles.eventTags}>
                  {event.tags?.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className={styles.eventFooter}>
                  <div className={styles.organizerInfo}>
                    <UserCircle size={20} />
                    <span>{event.organizer || 'Anonymous'}</span>
                  </div>

                  <div className={styles.eventActions}>
                    {event.userId === "sr4jan" && (
                      <button
                        onClick={() => handleDelete(event._id)}
                        className={styles.deleteButton}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button className={styles.shareButton}>
                      <Share2 size={16} />
                    </button>
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.registerButton}
                    >
                      Register
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Create Event Modal */}
      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            {/* Your existing form code here, styled with new classes */}
          </div>
        </div>
      )}
    </div>
  );
}