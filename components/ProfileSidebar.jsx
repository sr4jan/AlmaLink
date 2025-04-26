'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { 
  User, 
  Settings, 
  LogOut, 
  Moon, 
  Sun, 
  HelpCircle, 
  Shield, 
  BookOpen, 
  Briefcase, 
  Users, 
  X, // Add X icon for close button
  Star, 
  FileText, 
  BarChart2, 
  Code, 
  Coffee 
} from 'lucide-react';
import styles from './ProfileSidebar.module.css';

export default function ProfileSidebar({ isOpen, onClose, theme, toggleTheme, session }) {
  const sidebarRef = useRef(null);
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      const timer = setTimeout(() => {
        setVisible(false);
        document.body.style.overflow = ''; // Restore scrolling
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Your existing getMenuItems function remains the same

  const getMenuItems = () => {
    const commonItems = [
      {
        type: 'profile',
        items: [
          {
            icon: <User size={16} />,
            label: 'Your profile',
            href: '/dashboard/profile'
          },
          {
            icon: <Settings size={16} />,
            label: 'Settings',
            href: '/settings'
          }
        ]
      },
      {
        type: 'preferences',
        items: [
          {
            icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />,
            label: `${theme === 'dark' ? 'Light' : 'Dark'} mode`,
            onClick: toggleTheme
          }
        ]
      }
    ];

    const roleSpecificItems = {
      student: [
        {
          type: 'learning',
          items: [
            {
              icon: <BookOpen size={16} />,
              label: 'My Courses',
              href: '/courses'
            },
            {
              icon: <Users size={16} />,
              label: 'My Mentors',
              href: '/mentors'
            },
            {
              icon: <Star size={16} />,
              label: 'Progress',
              href: '/progress'
            }
          ]
        },
        {
          type: 'resources',
          items: [
            {
              icon: <FileText size={16} />,
              label: 'Assignments',
              href: '/assignments'
            },
            {
              icon: <Code size={16} />,
              label: 'Projects',
              href: '/projects'
            }
          ]
        }
      ],
      alumni: [
        {
          type: 'mentoring',
          items: [
            {
              icon: <Users size={16} />,
              label: 'My Mentees',
              href: '/mentees'
            },
            {
              icon: <Briefcase size={16} />,
              label: 'Job Posts',
              href: '/jobs/posted'
            },
            {
              icon: <BarChart2 size={16} />,
              label: 'Impact',
              href: '/impact'
            }
          ]
        }
      ],
      admin: [
        {
          type: 'admin',
          items: [
            {
              icon: <Shield size={16} />,
              label: 'Admin Dashboard',
              href: '/admin'
            },
            {
              icon: <Users size={16} />,
              label: 'User Management',
              href: '/admin/users'
            },
            {
              icon: <BarChart2 size={16} />,
              label: 'Analytics',
              href: '/admin/analytics'
            }
          ]
        }
      ]
    };

    const supportSection = {
      type: 'support',
      items: [
        {
          icon: <HelpCircle size={16} />,
          label: 'Help',
          href: '/help'
        },
        {
          icon: <Coffee size={16} />,
          label: 'Support us',
          href: '/support'
        }
      ]
    };

    const roleItems = roleSpecificItems[session?.user?.role] || [];
    return [...commonItems, ...roleItems, supportSection];
  };
  
  if (!visible && !isOpen) return null;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.visible : ''}`}>
      <div 
        className={`${styles.modal} ${isOpen ? styles.open : ''}`}
        ref={sidebarRef}
      >
        {/* Close button */}
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.userInfo}>
            {session?.user?.avatar ? (
              <img
                src={session.user.avatar}
                alt={session.user.name || 'User avatar'}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className={styles.userDetails}>
              <h3>{session?.user?.name}</h3>
              <p>{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={styles.modalContent}>
          {getMenuItems().map((section, index) => (
            <div key={index} className={styles.section}>
              {section.items.map((item, itemIndex) => (
                item.href ? (
                  <Link 
                    key={itemIndex}
                    href={item.href}
                    className={styles.menuItem}
                    onClick={onClose}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button
                    key={itemIndex}
                    className={styles.menuItem}
                    onClick={() => {
                      item.onClick?.();
                      onClose();
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                )
              ))}
              {index < getMenuItems().length - 1 && (
                <div className={styles.divider} />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button 
            className={styles.signOutButton}
            onClick={() => signOut()}
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}