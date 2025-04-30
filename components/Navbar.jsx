'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useSession } from "next-auth/react";
import { useTheme } from '@/contexts/ThemeContext';
import styles from './Navbar.module.css';
import ProfileSidebar from './ProfileSidebar';
import AiChatBubble from './AiChatBubble';
import { 
  Home,
  LayoutDashboard,
  Lightbulb,
  MessagesSquare,
  Briefcase,
  CalendarDays,
  Users,
  Radio,
  Heart,
  Sun,
  Moon,
  Settings,
  School,
  GraduationCap,
  BookOpen,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bot
} from 'lucide-react';

const NAV_LINKS = {
  superadmin: [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard/superadmin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/superadmin/colleges', label: 'Colleges', icon: School },
    { href: '/dashboard/superadmin/admins', label: 'Admins', icon: Users },
    { href: '/dashboard/superadmin/settings', label: 'Settings', icon: Settings },
  ],
  student: [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/ideahub', label: 'IdeaHub', icon: Lightbulb },
    { href: '/questions', label: 'Questions', icon: BookOpen },
    { href: '/jobportal', label: 'Jobs', icon: Briefcase },
    { href: '/events', label: 'Events', icon: CalendarDays },
    { href: '/livesessions', label: 'Live', icon: Radio },
    { href: '/connections', label: 'Network', icon: Users },
    { href: '/chat', label: 'Chat', icon: MessagesSquare },
  ],
  alumni: [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard/alumni', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/ideahub', label: 'IdeaHub', icon: Lightbulb },
    { href: '/questions', label: 'Questions', icon: BookOpen },
    { href: '/jobportal/post', label: 'Post Jobs', icon: Briefcase },
    { href: '/events/create', label: 'Events', icon: CalendarDays },
    { href: '/livesessions/host', label: 'Live', icon: Radio },
    { href: '/donationportal', label: 'Give', icon: Heart },
    { href: '/connections', label: 'Network', icon: Users },
    { href: '/chat', label: 'Chat', icon: MessagesSquare },
  ],
  admin: [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/content', label: 'Content', icon: BookOpen },
    { href: '/admin/reports', label: 'Reports', icon: GraduationCap },
  ]
};

export default function Navbar() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleChatToggle = () => {
    setIsChatOpen(prev => !prev);
  };

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };
  
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    // Initial checks
    handleResize();
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getNavLinks = () => {
    if (!session?.user?.role) return [];
    return NAV_LINKS[session.user.role] || [];
  };

  return (
    <>
      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.navContent}>
          {/* Logo Section */}
          <div className={styles.logo}>
            <Link href="/">AlmaLink</Link>
          </div>

          {/* Desktop Navigation */}
          {status === "authenticated" && !isMobile && (
            <div className={styles.navigationWrapper}>
              <div className={styles.navigationContainer}>
                {getNavLinks().map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      className={styles.navItem}
                    >
                      <Icon size={20} className={styles.icon} />
                      <span className={styles.label}>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Section */}
          <div className={styles.rightSection}>
          <button 
          onClick={handleChatToggle}
          className={`${styles.aiChatBtn} ${isChatOpen ? styles.active : ''}`}
          aria-label="Toggle AI Chat"
  >
    <Bot size={30} className={styles.aiIcon} />
  </button>
            <button 
              onClick={toggleTheme} 
              className={styles.themeToggleBtn}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {status === "authenticated" ? (
              <button 
                className={styles.profileButton}
                onClick={() => setIsSidebarOpen(true)}
              >
                {session?.user?.avatar ? (
                  <img 
                    src={session.user.avatar}
                    alt="Profile"
                    className={styles.profileAvatar}
                  />
                ) : (
                  <div className={styles.profileAvatarPlaceholder}>
                    {session?.user?.name?.[0] || 'U'}
                  </div>
                )}
              </button>
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
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
{status === "authenticated" && isMobile && (
  <div className={styles.mobileNav}>
    <div 
      className={styles.mobileNavContainer}
      ref={scrollContainerRef}
      onScroll={checkScrollButtons}
    >
      {canScrollLeft && (
        <button
          className={`${styles.scrollArrow} ${styles.scrollLeft}`}
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>
      )}
      
      {getNavLinks().map((link) => {
        const Icon = link.icon;
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={styles.mobileNavItem}
          >
            <Icon size={20} className={styles.mobileIcon} />
            <span className={styles.mobileLabel}>{link.label}</span>
          </Link>
        );
      })}

      {canScrollRight && (
        <button
          className={`${styles.scrollArrow} ${styles.scrollRight}`}
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  </div>
)}
      
      {/* AI Chat Component */}
      <AiChatBubble 
        isVisible={isChatOpen}
        setIsVisible={setIsChatOpen}
      />
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
