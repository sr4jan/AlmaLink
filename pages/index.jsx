import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// Assuming these are components you have:
import ParticlesBackground from '@/components/ParticlesBackground';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import styles from '@/styles/Home.module.css'; // Ensure path is correct
import {HeartHandshake, MessageCircle, Video, Calendar, Briefcase, MessagesSquare, Lightbulb, ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Users, Award, Zap, MessageSquare, Star } from 'lucide-react'; // Relevant icons



export default function Home() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  // NOTE: Removed 'scrolled' state as the local header is gone.
  const storiesScrollerRef = useRef(null);

  // Smooth scroll function, accounting for a global fixed header
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // --- ADJUST THIS VALUE based on your GLOBAL navbar height ---
      const globalHeaderOffset = 70; // Example: 70px offset
      // ----------------------------------------------------------
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = window.pageYOffset + elementPosition - globalHeaderOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  const [instituteInfo, setInstituteInfo] = useState({
    name: '',
    totalAlumni: 0,
    totalMentors: 0,
    stats: {
      activeMembers: 0,
      universities: 0,
      mentorships: 0,
      satisfaction: 0
    }
  });
  useEffect(() => {
    const fetchInstituteData = async () => {
      if (session?.user?.instituteId) {
        try {
          const response = await fetch(`/api/institute/${session.user.instituteId}`);
          const data = await response.json();
          setInstituteInfo(data);
        } catch (error) {
          console.error('Error fetching institute data:', error);
        }
      }
    };
  
    fetchInstituteData();
  }, [session]);
  // --- Dummy Data for Stories (Replace with actual data) ---
  // Replace the alumniStories array with this more realistic dataset
  const alumniStories = [
    {
      id: 'priya-sharma',
      name: 'Priya Sharma',
      year: 2019,
      industry: 'AI Research',
      title: 'Senior ML Engineer @ Google',
      image: '/images/alumni/priya-sharma.jpg',
      avatarFallback: 'PS', // First letters of first and last name
      placeholderColor: '#FF6B6B', // Unique color for avatar background
      description: 'Leading AI research team, published 3 papers on transformer architecture improvements.'
    },
    {
      id: 'rahul-verma',
      name: 'Rahul Verma',
      year: 2017,
      industry: 'FinTech',
      title: 'Founder & CEO @ PayEase',
      image: '/images/alumni/rahul-verma.jpg',
      avatarFallback: 'RV',
      placeholderColor: '#4ECDC4',
      description: 'Built PayEase from scratch to 1M+ users, raised $12M Series A funding.'
    },
    {
      id: 'aisha-patel',
      name: 'Aisha Patel',
      year: 2020,
      industry: 'Product Design',
      title: 'Product Designer @ Microsoft',
      image: '/images/alumni/aisha-patel.jpg',
      avatarFallback: 'AP',
      placeholderColor: '#45B7D1',
      description: 'Redesigned Teams UI leading to 40% increase in user engagement.'
    },
    {
      id: 'vikram-singh',
      name: 'Vikram Singh',
      year: 2016,
      industry: 'Cybersecurity',
      title: 'Security Lead @ Cisco',
      image: '/images/alumni/vikram-singh.jpg',
      avatarFallback: 'VS',
      placeholderColor: '#96CEB4',
      description: 'Developed zero-trust security framework implemented by Fortune 500 companies.'
    },
    {
      id: 'neha-gupta',
      name: 'Neha Gupta',
      year: 2018,
      industry: 'Clean Energy',
      title: 'CTO @ GreenGrid',
      image: '/images/alumni/neha-gupta.jpg',
      avatarFallback: 'NG',
      placeholderColor: '#9B59B6',
      description: 'Pioneering smart grid solutions reducing energy waste by 30%.'
    },
    {
      id: 'arjun-reddy',
      name: 'Arjun Reddy',
      year: 2021,
      industry: 'Health Tech',
      title: 'Co-founder @ MedAI',
      image: '/images/alumni/arjun-reddy.jpg',
      avatarFallback: 'AR',
      placeholderColor: '#5DADE2',
      description: 'Revolutionizing rural healthcare with AI-powered diagnostics.'
    }
  ];
  const features = [
    {
      icon: <Lightbulb size={24} />,
      title: "IdeaHub",
      description: "Submit innovative ideas, get alumni funding, and showcase detailed projects with tag-based filtering.",
      href: "/features/ideahub"
    },
    {
      icon: <MessagesSquare size={24} />,
      title: "Smart Q&A Forum",
      description: "AI-powered question routing with skill-based matching and intelligent answer suggestions.",
      href: "/features/questions"
    },
    {
      icon: <Briefcase size={24} />,
      title: "Job Portal",
      description: "Access exclusive job postings with AI-driven skill matching and application tracking.",
      href: "/features/jobs"
    },
    {
      icon: <Calendar size={24} />,
      title: "Events Hub",
      description: "Manage college events, alumni meets with integrated RSVP system and calendar sync.",
      href: "/features/events"
    },
    {
      icon: <Video size={24} />,
      title: "Live Sessions",
      description: "Host interactive webinars with real-time Q&A and session analytics.",
      href: "/features/live-sessions"
    },
    {
      icon: <Users size={24} />,
      title: "Smart Networking",
      description: "Auto-college linking with AI-powered mentorship matching and profile cards.",
      href: "/features/connections"
    },
    {
      icon: <MessageCircle size={24} />,
      title: "Secure Chat",
      description: "End-to-end encrypted messaging with file sharing capabilities.",
      href: "/features/chat"
    },
    {
      icon: <HeartHandshake size={24} />,
      title: "Donation Portal",
      description: "Support ideas, events, and scholarship programs with secure transaction tracking.",
      href: "/features/donations"
    }
  ];
  // Update the story card rendering to handle image fallback:
  // --- End Dummy Data ---

  return (
    <>
      {/* Backgrounds - Place them outside 'main' if they should be behind everything */}
      <ParticlesBackground />
      <AnimatedBackground />

      {/* NO LOCAL HEADER HERE */}

      {/* Main Content Area - Ensure this starts below the GLOBAL navbar */}
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection} id="home">
          <div className={styles.heroContent}>
            
            <h1 className={styles.title}>Connect. Learn. Grow.</h1>
            <p className={styles.description}>
              Unlock your potential. AlmaLink bridges the gap between ambitious students and accomplished alumni for mentorship, networking, and career acceleration.
            </p>
            <div className={styles.heroCTA}>
            {!loading && !session && (
  <>
    <button className={styles.primaryButton} onClick={() => scrollToSection('cta')}>
      Get Started Free
    </button>
    <Link href="/how-it-works" className={styles.secondaryButton}>
      How It Works
    </Link>
  </>
)}
              {!loading && session && (
                 <Link href="/dashboard/student" className={styles.primaryButton}> {/* Simplified dashboard link */}
                   Explore Dashboard
                 </Link>
              )}
              {loading && (
                <>
                  <div className={`${styles.buttonSkeleton} ${styles.primaryButton}`}></div>
                  <div className={`${styles.buttonSkeleton} ${styles.secondaryButton}`}></div>
                </>
              )}
            </div>
          </div>
          <button className={styles.scrollDown} onClick={() => scrollToSection('stats')} aria-label="Scroll to next section">
            <h3>Read More</h3>
            <ChevronDown size={48} />
          </button>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection} id="stats">
          <div className={styles.sectionContent}>
            {/* Title/Subtitle are optional here if stats are self-explanatory */}
            {<h2 className={styles.sectionTitle}>Thriving Community, Tangible Results</h2>}
            {<p className={styles.sectionSubtitle}>Join a network designed for impact.</p>}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Users size={28}/></div>
                <div className={styles.statNumber}>5,000+</div>
                <div className={styles.statTitle}>Active Members</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Award size={28}/></div>
                <div className={styles.statNumber}>200+</div>
                <div className={styles.statTitle}>Universities</div>
              </div>
              <div className={styles.statCard}>
                 <div className={styles.statIcon}><Zap size={28}/></div>
                <div className={styles.statNumber}>1,500+</div>
                <div className={styles.statTitle}>Mentorships</div>
              </div>
              <div className={styles.statCard}>
                 <div className={styles.statIcon}><Star size={28}/></div>
                <div className={styles.statNumber}>98%</div>
                <div className={styles.statTitle}>Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Alumni Success Stories */}
        <section className={styles.successStoriesSection} id="alumni">
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Inspiring Alumni Journeys</h2>
            <p className={styles.sectionSubtitle}>
              Discover the diverse paths our alumni have taken and the impact they're making across industries.
            </p>
          </div>
          <div className={styles.storiesScrollerContainer}>
             <div className={styles.storiesScroller} ref={storiesScrollerRef}>
             {alumniStories.map((story) => (
  <div className={styles.storyCard} key={story.id}>
    <Link href={`/alumni/${story.id}`} className={styles.storyLinkWrapper}>
      <div className={styles.storyImageContainer}>
        {/* Image with fallback */}
        <div className={styles.storyImageWrapper}>
          <img
            src={story.image}
            alt={`Portrait of ${story.name}`}
            className={styles.storyImage}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
            loading="lazy"
            width="350"
            height="220"
          />
          <div 
            className={styles.avatarFallback}
            style={{ 
              backgroundColor: story.placeholderColor,
              display: 'none'
            }}
          >
            {story.avatarFallback}
          </div>
        </div>
        <div className={styles.storyImageOverlay}></div>
        <div className={styles.storyMetaTags}>
          <span className={styles.storyTag}>Class of {story.year}</span>
          <span className={styles.storyTag}>{story.industry}</span>
        </div>
      </div>
      <div className={styles.storyContent}>
        <h3 className={styles.storyTitle}>{story.name}</h3>
        <div className={styles.storyRole}>{story.title}</div>
        <p className={styles.storyDescription}>{story.description}</p>
        <div className={styles.storyButton}>
          Read Full Story <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  </div>
))}
               <div className={`${styles.storyCard} ${styles.viewAllCard}`}>
                  <Link href="/alumni" className={styles.viewAllLink}>
                     <span>View All<br/>Success Stories</span>
                     <ArrowRight size={24} />
                  </Link>
                  
               </div>
               
             </div>
             
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection} id="features">
  <div className={styles.sectionContent}>
    <h2 className={styles.sectionTitle}>Features Designed for Growth</h2>
    <p className={styles.sectionSubtitle}>
      Leverage AlmaLink's AI-powered ecosystem to connect, learn, and accelerate your professional journey.
    </p>
    <div className={styles.featuresList}>
      {features.map((feature, index) => (
        <div key={index} className={styles.featureCard}>
          <div className={styles.featureIcon}>{feature.icon}</div>
          <div className={styles.featureContent}>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
            {feature.href && (
              <Link href={feature.href} className={styles.featureLink}>
                Learn More <ArrowRight size={16} className={styles.featureArrow} />
              </Link>
            )}
            
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

        {/* Call to Action */}
<section className={styles.ctaSection} id="cta">
  <div className={styles.sectionContent}>
    <h2 className={styles.ctaTitle}>Ready to Ignite Your Future?</h2>
    <p className={styles.ctaDescription}>
      Join thousands of students and alumni building a powerful, supportive network for lifelong success. Sign up free today.
    </p>
    <div className={styles.ctaButtons}>
      {!loading && !session && (
        <>
          <Link href="/auth/signup" className={styles.primaryButton}>
            Join AlmaLink Now
          </Link>
          <Link href="/learn-more" className={styles.secondaryButton}>
            Learn More
          </Link>
        </>
      )}
      {!loading && session && (
        <Link href="/learn-more" className={styles.primaryButton}>
          Learn More
        </Link>
      )}
      {loading && (
        <>
          <div className={`${styles.buttonSkeleton} ${styles.primaryButton}`}></div>
          <div className={`${styles.buttonSkeleton} ${styles.secondaryButton}`}></div>
        </>
      )}
    </div>
  </div>
</section>
      </main>

            {/* Footer */}
            <footer className={styles.footer}>
        {/* Use sectionContent for consistent padding and max-width */}
        <div className={styles.sectionContent}>
          <div className={styles.footerTop}>
            {/* Column 1: Logo, About, Social */}
            <div className={`${styles.footerColumn} ${styles.footerAboutCol}`}>
              <Link href="/" className={styles.footerLogo}>AlmaLink</Link>
              <p className={styles.footerAbout}>
                Connecting potential with experience for mentorship, learning, and growth.
              </p>
              <div className={styles.socialLinks}>
                {/* Replace # with actual links and add SVGs */}
                <Link href="#" className={styles.socialIcon} aria-label="Twitter"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg></Link>
                <Link href="#" className={styles.socialIcon} aria-label="Facebook"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"></path></svg></Link>
                <Link href="#" className={styles.socialIcon} aria-label="Instagram"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path></svg></Link>
                <Link href="#" className={styles.socialIcon} aria-label="LinkedIn"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg></Link>
              </div>
            </div>

            {/* Column 2: Platform Links */}
            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Platform</h3>
              <div className={styles.footerLinks}>
                <Link href="/features/ideahub" className={styles.footerLink}>IdeaHub</Link>
                <Link href="/features/live-sessions" className={styles.footerLink}>Live Sessions</Link>
                <Link href="/features/networking" className={styles.footerLink}>Networking</Link>
                <Link href="/features/mentorship" className={styles.footerLink}>Mentorship</Link>
              </div>
            </div>

            {/* Column 3: Company Links */}
            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Company</h3>
              <div className={styles.footerLinks}>
                <Link href="/about" className={styles.footerLink}>About Us</Link>
                <Link href="/careers" className={styles.footerLink}>Careers</Link>
                <Link href="/contact" className={styles.footerLink}>Contact</Link>
              </div>
            </div>

            {/* Column 4: Resources Links */}
            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Resources</h3>
              <div className={styles.footerLinks}>
                <Link href="/blog" className={styles.footerLink}>Blog</Link>
                <Link href="/faq" className={styles.footerLink}>Help Center</Link>
                <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
                <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
              </div>
            </div>
          </div>

          {/* Footer Bottom: Copyright & Links */}
          <div className={styles.footerBottom}>
            <p className={styles.copyright}>© {new Date().getFullYear()} AlmaLink Inc. All rights reserved.</p>
            <div className={styles.footerBottomLinks}>
              <Link href="/privacy" className={styles.footerLink}>Privacy</Link>
              <Link href="/terms" className={styles.footerLink}>Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}