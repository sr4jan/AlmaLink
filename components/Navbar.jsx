'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, Sun, Moon, Search, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession, signOut } from "next-auth/react";
import { useTheme } from '@/contexts/ThemeContext';
import styles from './Navbar.module.css';
import ProfileSidebar from './ProfileSidebar';
import { useRouter } from 'next/router';

const NAV_LINKS = {
  superadmin: [
    { href: '/dashboard/superadmin', label: 'Dashboard' },
    { href: '/dashboard/superadmin/colleges', label: 'Colleges' },
    { href: '/dashboard/superadmin/admins', label: 'Admins' },
    { href: '/dashboard/superadmin/settings', label: 'Settings' },
  ],
  student: [
    { href: '/ideahub', label: 'IdeaHub' },
    { href: '/questions', label: 'Questions' },
    { href: '/jobportal', label: 'Jobs' },
    { href: '/events', label: 'Events' },
    { href: '/livesessions', label: 'Live Sessions' },
    { href: '/connections', label: 'Connections' },
    { href: '/chat', label: 'Chat' },
  ],
  alumni: [
    { href: '/ideahub', label: 'IdeaHub' },
    { href: '/jobportal/post', label: 'Post Jobs' },
    { href: '/events/create', label: 'Create Event' },
    { href: '/livesessions/host', label: 'Host Session' },
    { href: '/donationportal', label: 'Donations' },
    { href: '/connections', label: 'Connections' },
    { href: '/chat', label: 'Chat' },
  ],
  admin: [
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/content', label: 'Content' },
    { href: '/admin/reports', label: 'Reports' },
  ]
};

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState('');

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().slice(0, 19).replace('T', ' '));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get home URL based on user role
  const getHomeUrl = () => {
    if (!session?.user?.role) return '/';
    switch (session.user.role) {
      case 'superadmin':
        return '/dashboard/admin';
      case 'admin':
        return '/dashboard/admin';
      case 'alumni':
        return '/dashboard/alumni';
      case 'student':
        return '/dashboard';
      default:
        return '/';
    }
  };

  // Scroll to section handler
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = document.querySelector(`.${styles.navbar}`).offsetHeight;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight - 20;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Theme and scroll handlers
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      checkScrollButtons();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [theme]);

  // Check scroll buttons visibility
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  // Scroll handler for nav links
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      setTimeout(checkScrollButtons, 300);
    }
  };

  // Get navigation links based on user role
  const getNavLinks = () => {
    if (!session?.user?.role) return [];
    return NAV_LINKS[session.user.role] || [];
  };
  useEffect(() => {
    if (session?.user) {
      console.log('Navbar session updated:', session.user.avatar);
    }
  }, [session]);
  return (
    <>
      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.navContent}>
          {/* Logo */}
          <div className={styles.logo}>
            <Link href={getHomeUrl()}>
              AlmaLink
            </Link>
          </div>

          {/* Navigation Links */}
          <div className={styles.scrollableNav}>
            {status === "authenticated" ? (
              <div 
                className={styles.linksContainer} 
                ref={scrollContainerRef}
                onScroll={checkScrollButtons}
              >
                {getNavLinks().map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className={styles.navLink}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : (
              <nav className={styles.nav}>
                {['features', 'alumni', 'stats', 'about'].map((section) => (
                  <button
                    key={section}
                    className={styles.navLink}
                    onClick={() => scrollToSection(section)}
                  >
                    {section === 'stats' ? 'Our Impact' : section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </nav>
            )}

            {/* Scroll Buttons */}
            {status === "authenticated" && (
              <>
                {canScrollLeft && (
                  <button
                    className={`${styles.scrollButton} ${styles.scrollLeft}`}
                    onClick={() => scroll('left')}
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                {canScrollRight && (
                  <button
                    className={`${styles.scrollButton} ${styles.scrollRight}`}
                    onClick={() => scroll('right')}
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Right Section */}
          <div className={styles.rightSection}>
            {status === "authenticated" ? (
              <>
                {/* Current Time */}
                {/* <div className={styles.timeDisplay}>
                  {currentTime} UTC
                </div> */}

                {/* Search */}
                <div className={styles.searchContainer}>
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className={styles.searchInput} 
                  />
                  <Search size={18} className={styles.searchIcon} />
                </div>

                {/* User Controls */}
                <div className={styles.userControls}>
          <button 
            className={styles.profileButton}
            onClick={() => setIsSidebarOpen(true)}
          >
            {session?.user?.avatar ? (
              <img 
                src={session.user.avatar}
                alt={session.user.name || 'User avatar'}
                className={styles.profileAvatar}
              />
            ) : (
              <div className={styles.profileAvatarPlaceholder}>
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </button>
        </div>
              </>
            ) : (
              <div className={styles.authButtons}>
                <Link href="/auth/login" className={styles.loginBtn}>
                  Login
                </Link>
                <Link href="/auth/signup" className={styles.signupBtn}>
                  Sign up
                </Link>
              </div>
            )}

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className={styles.themeToggleBtn}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon size={18} className={styles.themeIcon} />
              ) : (
                <Sun size={18} className={styles.themeIcon} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Sidebar */}
      <ProfileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
        session={session}
      />
    </>
  );
}