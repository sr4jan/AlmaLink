'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Link as LinkIcon,
  Image as ImageIcon,
  Tag,
  UserCircle,
  ArrowLeft,
  ArrowRight,
  Laptop,
  Info
} from 'lucide-react';
import styles from '@/styles/EventCreate.module.css';

export default function CreateEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    type: "In-Person",
    category: "tech",
    capacity: "",
    registrationLink: "",
    image: "",
    tags: "",
    organizer: "",
    userId: "sr4jan",
    createdAt: "2025-04-28 19:29:42"
  });

  const categories = [
    { id: "tech", name: "Technology", color: "#00c6ff" },
    { id: "cultural", name: "Cultural", color: "#ff0099" },
    { id: "academic", name: "Academic", color: "#7c3aed" },
    { id: "sports", name: "Sports", color: "#10b981" },
    { id: "workshop", name: "Workshops", color: "#f59e0b" },
    { id: "other", name: "Other", color: "#6b7280" }
  ];

  const eventTypes = ["In-Person", "Virtual", "Hybrid"];

  const validateEvent = () => {
    if (!eventData.title.trim()) {
      toast.error("Please enter an event title");
      return false;
    }
    if (!eventData.date) {
      toast.error("Please select an event date and time");
      return false;
    }
    if (!eventData.description.trim()) {
      toast.error("Please enter an event description");
      return false;
    }
    if (!eventData.registrationLink.trim()) {
      toast.error("Please enter a registration link");
      return false;
    }
    if (!eventData.organizer.trim()) {
      toast.error("Please enter an organizer name");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEvent()) {
      return;
    }

    setSubmitting(true);
    try {
      // Convert tags string to array
      const formattedData = {
        ...eventData,
        tags: eventData.tags ? eventData.tags.split(',').map(tag => tag.trim()) : [],
        capacity: eventData.capacity ? parseInt(eventData.capacity) : null
      };

      const response = await axios.post("/api/events", formattedData);

      if (response.data.success) {
        toast.success("Event created successfully!");
        router.push("/events");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-center" />

      <header className={styles.header}>
        <button 
          onClick={() => router.push('/events')} 
          className={styles.backButton}
        >
          <ArrowLeft size={20} />
          Back to Events
        </button>
        <h1 className={styles.title}>Create New Event</h1>
        <p className={styles.subtitle}>
          Schedule an event and share it with the community
        </p>
      </header>

      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.eventForm}>
          <div className={styles.formGrid}>
            {/* Basic Information */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Event Title<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <Info size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="e.g. Tech Meetup 2025"
                  value={eventData.title}
                  onChange={(e) => setEventData({...eventData, title: e.target.value})}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Date & Time<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <Clock size={18} className={styles.inputIcon} />
                <input
                  type="datetime-local"
                  value={eventData.date}
                  onChange={(e) => setEventData({...eventData, date: e.target.value})}
                  className={styles.input}
                  min={formatDateTime(new Date())}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Event Type</label>
              <div className={styles.inputWrapper}>
                <Laptop size={18} className={styles.inputIcon} />
                <select
                  value={eventData.type}
                  onChange={(e) => setEventData({...eventData, type: e.target.value})}
                  className={styles.select}
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Category</label>
              <div className={styles.inputWrapper}>
                <Tag size={18} className={styles.inputIcon} />
                <select
                  value={eventData.category}
                  onChange={(e) => setEventData({...eventData, category: e.target.value})}
                  className={styles.select}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Location</label>
              <div className={styles.inputWrapper}>
                <MapPin size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="e.g. Conference Center or Virtual Link"
                  value={eventData.location}
                  onChange={(e) => setEventData({...eventData, location: e.target.value})}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Capacity</label>
              <div className={styles.inputWrapper}>
                <Users size={18} className={styles.inputIcon} />
                <input
                  type="number"
                  placeholder="e.g. 100 (optional)"
                  value={eventData.capacity}
                  onChange={(e) => setEventData({...eventData, capacity: e.target.value})}
                  className={styles.input}
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Event Description<span className={styles.required}>*</span>
            </label>
            <textarea
              placeholder="Describe the event, including agenda, requirements, and what attendees can expect..."
              value={eventData.description}
              onChange={(e) => setEventData({...eventData, description: e.target.value})}
              className={styles.textarea}
              rows={5}
              required
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Registration Link<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <LinkIcon size={18} className={styles.inputIcon} />
                <input
                  type="url"
                  placeholder="e.g. https://forms.google.com/..."
                  value={eventData.registrationLink}
                  onChange={(e) => setEventData({...eventData, registrationLink: e.target.value})}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Image URL</label>
              <div className={styles.inputWrapper}>
                <ImageIcon size={18} className={styles.inputIcon} />
                <input
                  type="url"
                  placeholder="e.g. https://example.com/image.jpg"
                  value={eventData.image}
                  onChange={(e) => setEventData({...eventData, image: e.target.value})}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Tags</label>
              <div className={styles.inputWrapper}>
                <Tag size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="e.g. networking, javascript, career (comma-separated)"
                  value={eventData.tags}
                  onChange={(e) => setEventData({...eventData, tags: e.target.value})}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Organizer Name<span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <UserCircle size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={eventData.organizer}
                  onChange={(e) => setEventData({...eventData, organizer: e.target.value})}
                  className={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => router.push('/events')}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={styles.submitButton}
            >
              {submitting ? (
                <div className={styles.spinner} />
              ) : (
                <>
                  Create Event
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}