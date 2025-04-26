'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  MessageSquare, 
  Laptop,
  Trophy,
  Bell,
  BookMarked,
  Target,
  BarChart2,
  Clock,
  Star
} from 'lucide-react';
import styles from '@/styles/StudentDashboard.module.css';

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      icon: <BookOpen size={24} />,
      number: "8",
      label: "Courses Enrolled"
    },
    {
      icon: <Trophy size={24} />,
      number: "12",
      label: "Certifications"
    },
    {
      icon: <Users size={24} />,
      number: "3",
      label: "Active Mentors"
    },
    {
      icon: <Star size={24} />,
      number: "92%",
      label: "Attendance"
    }
  ];

  const quickActions = [
    {
      icon: <Laptop size={24} />,
      title: "Join Live Session",
      description: "Attend ongoing lectures and workshops",
      href: "/livesessions"
    },
    {
      icon: <MessageSquare size={24} />,
      title: "Message Mentor",
      description: "Connect with your assigned mentors",
      href: "/messages"
    },
    {
      icon: <BookMarked size={24} />,
      title: "Course Material",
      description: "Access study resources and materials",
      href: "/courses"
    },
    {
      icon: <Target size={24} />,
      title: "Set Goals",
      description: "Track your academic progress",
      href: "/goals"
    },
    {
      icon: <Calendar size={24} />,
      title: "Schedule",
      description: "View upcoming classes and events",
      href: "/schedule"
    },
    {
      icon: <BarChart2 size={24} />,
      title: "Progress",
      description: "Check your performance analytics",
      href: "/progress"
    }
  ];

  const upcomingEvents = [
    {
      title: "Web Development Workshop",
      time: "Today, 2:00 PM",
      type: "workshop"
    },
    {
      title: "Mentorship Session with John Doe",
      time: "Tomorrow, 11:00 AM",
      type: "mentorship"
    },
    {
      title: "Python Programming Quiz",
      time: "Apr 23, 10:00 AM",
      type: "assessment"
    }
  ];

  if (status === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.welcomeText}>
              Welcome back, {session?.user?.name}
            </h1>
            <p className={styles.currentTime}>
              {currentTime} • {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.notificationButton}>
              <Bell size={20} />
              <span className={styles.notificationBadge}>3</span>
            </button>
          </div>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statInfo}>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.actionsSection}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div className={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className={styles.actionCard}
                  onClick={() => router.push(action.href)}
                >
                  <div className={styles.actionIcon}>{action.icon}</div>
                  <div className={styles.actionContent}>
                    <h3 className={styles.actionTitle}>{action.title}</h3>
                    <p className={styles.actionDescription}>{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.eventsSection}>
            <h2 className={styles.sectionTitle}>Upcoming Events</h2>
            <div className={styles.eventsList}>
              {upcomingEvents.map((event, index) => (
                <div key={index} className={`${styles.eventCard} ${styles[event.type]}`}>
                  <div className={styles.eventIcon}>
                    <Clock size={20} />
                  </div>
                  <div className={styles.eventContent}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <p className={styles.eventTime}>{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}