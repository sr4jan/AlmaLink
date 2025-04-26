'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  Calendar, 
  Users, 
  MessageSquare, 
  Gift,
  Video,
  Bell,
  Award,
  Target,
  TrendingUp
} from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';

export default function AlumniDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const stats = [
    {
      icon: <Briefcase size={24} />,
      number: "12",
      label: "Jobs Posted"
    },
    {
      icon: <Video size={24} />,
      number: "05",
      label: "Sessions Hosted"
    },
    {
      icon: <Users size={24} />,
      number: "234",
      label: "Students Mentored"
    },
    {
      icon: <Award size={24} />,
      number: "08",
      label: "Events Created"
    }
  ];

  const actions = [
    {
      icon: <Briefcase size={24} />,
      title: "Post a Job",
      description: "Create new job opportunities for students",
      href: "/jobportal/post"
    },
    {
      icon: <Video size={24} />,
      title: "Host Session",
      description: "Share your knowledge through live sessions",
      href: "/livesessions/host"
    },
    {
      icon: <Target size={24} />,
      title: "Mentorship",
      description: "Guide students in their career journey",
      href: "/mentorship"
    },
    {
      icon: <Gift size={24} />,
      title: "Make Donation",
      description: "Support educational initiatives",
      href: "/donations"
    },
    {
      icon: <Calendar size={24} />,
      title: "Create Event",
      description: "Organize events and meetups",
      href: "/events/create"
    },
    {
      icon: <TrendingUp size={24} />,
      title: "View Analytics",
      description: "Track your impact and engagement",
      href: "/analytics"
    }
  ];

  const notifications = [
    {
      text: "New mentorship request from John Doe",
      time: "2 hours ago"
    },
    {
      text: "Your job post received 5 new applications",
      time: "5 hours ago"
    },
    {
      text: "Upcoming session reminder: Career in Tech",
      time: "1 day ago"
    }
  ];

  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.welcomeText}>
            Welcome back, {session?.user?.name}
          </h1>
          <p className={styles.subText}>
            Your dashboard shows your impact on the community
          </p>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statNumber}>{stat.number}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.actionsGrid}>
          {actions.map((action, index) => (
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

        <div className={styles.notificationsPanel}>
          <h2 className={styles.notificationTitle}>Recent Updates</h2>
          <div className={styles.notificationList}>
            {notifications.map((notification, index) => (
              <div key={index} className={styles.notificationItem}>
                <div className={styles.notificationDot} />
                <div className={styles.notificationContent}>
                  <p className={styles.notificationText}>{notification.text}</p>
                  <span className={styles.notificationTime}>{notification.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}