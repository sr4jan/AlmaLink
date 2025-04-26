'use client';
import { useEffect } from 'react';
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import styles from '@/styles/LearnMore.module.css';

export default function LearnMore() {
  useEffect(() => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Learn More About AlmaLink</h1>
        <p className={styles.subtitle}>
          Bridging the gap between students and alumni through meaningful connections
        </p>
      </div>

      <nav className={styles.tableOfContents}>
        <a href="#what-is-almalink">What is AlmaLink?</a>
        <a href="#features">Features</a>
        <a href="#tech-stack">Tech Stack</a>
        <a href="#developer">Developer</a>
        <a href="#vision">Vision</a>
      </nav>

      <main className={styles.content}>
        <section id="what-is-almalink" className={styles.section}>
          <h2>🌟 What is AlmaLink?</h2>
          <p>
            AlmaLink is an innovative one-to-one platform designed to connect students and alumni 
            in a practical, purposeful way. The primary aim is to empower students with mentorship, 
            financial backing, and career guidance — while giving alumni a direct channel to give 
            back and stay engaged with their alma mater.
          </p>
          <p>
            This isn't another social media site. AlmaLink is impact-driven, focusing on actual 
            help rather than likes and shares.
          </p>
        </section>

        <section id="features" className={styles.section}>
          <h2>🚀 Key Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h3>🧠 IdeaHub</h3>
              <p>A space where students can pitch their project/startup ideas and receive funding or feedback from interested alumni.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>❓ Questions Page</h3>
              <p>Students can post doubts, queries, or academic concerns for alumni to respond with insights from the real world.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>💬 Chatbox</h3>
              <p>Secure one-to-one messaging feature allowing deeper conversations between alumni and students.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>🎥 Live Sessions</h3>
              <p>Alumni can conduct live workshops, talks, or webinars for students, sharing knowledge, industry insights, and career advice.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>💼 Job/Internship Portal</h3>
              <p>A place where alumni can post opportunities, and students can apply directly for internships or full-time roles.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>💰 Donation Portal</h3>
              <p>Allows alumni to make monetary contributions to fund ideas, sponsor events, or donate to the institution itself.</p>
            </div>
          </div>
        </section>

        <section id="tech-stack" className={styles.section}>
          <h2>🛠️ Tech Stack</h2>
          <div className={styles.techStack}>
            <div className={styles.techItem}>
              <img src="/nextjs-icon.svg" alt="Next.js" />
              <span>Next.js</span>
            </div>
            <div className={styles.techItem}>
              <img src="/tailwind-icon.svg" alt="Tailwind CSS" />
              <span>Tailwind CSS</span>
            </div>
            <div className={styles.techItem}>
              <img src="/mongodb-icon.svg" alt="MongoDB" />
              <span>MongoDB</span>
            </div>
            <div className={styles.techItem}>
              <img src="/nodejs-icon.svg" alt="Node.js" />
              <span>Node.js</span>
            </div>
          </div>
        </section>

        <section id="developer" className={styles.section}>
          <h2>👨‍💻 Meet the Developer</h2>
          <div className={styles.developerProfile}>
            <img 
              src="/srajan-profile.jpg" 
              alt="Srajan Soni" 
              className={styles.profileImage}
            />
            <div className={styles.developerInfo}>
              <h3>Srajan Soni</h3>
              <p className={styles.developerTitle}>
                Full Stack Developer | CS Student at LNCT Main, Bhopal
              </p>
              <p className={styles.developerBio}>
                A 3rd-year Computer Science student passionate about building tech with social impact. 
                Built AlmaLink with a vision to make student-alumni interaction meaningful and direct.
              </p>
              <div className={styles.skills}>
                <span>Java</span>
                <span>React</span>
                <span>DSA</span>
                <span>Next.js</span>
                <span>Machine Learning</span>
              </div>
              <div className={styles.socialLinks}>
                <a href="https://github.com/sr4jan" target="_blank" rel="noopener noreferrer">
                  <Github size={20} />
                </a>
                <a href="https://linkedin.com/in/sr4jan" target="_blank" rel="noopener noreferrer">
                  <Linkedin size={20} />
                </a>
                <a href="https://twitter.com/sr4jan" target="_blank" rel="noopener noreferrer">
                  <Twitter size={20} />
                </a>
                <a href="mailto:contact@sr4jan.dev">
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="vision" className={styles.section}>
          <h2>📈 The Vision Ahead</h2>
          <div className={styles.visionGrid}>
            <div className={styles.visionCard}>
              <h3>AI-Powered Matching</h3>
              <p>Smart mentor matching based on interests and skills</p>
            </div>
            <div className={styles.visionCard}>
              <h3>Calendar Integration</h3>
              <p>Seamless scheduling for meetings and live sessions</p>
            </div>
            <div className={styles.visionCard}>
              <h3>Analytics Dashboard</h3>
              <p>Detailed insights for admins and alumni</p>
            </div>
            <div className={styles.visionCard}>
              <h3>Mobile Apps</h3>
              <p>Native applications for easier access</p>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <h2>🙌 Join the AlmaLink Community</h2>
          <p>
            Your support fuels the mission. Whether you're a student trying to build your dream 
            project or an alum wanting to give back — AlmaLink is the bridge between dreams and direction.
          </p>
          <div className={styles.ctaButtons}>
            <a href="/auth/signup" className={styles.primaryButton}>Get Started</a>
            <a href="/contact" className={styles.secondaryButton}>Contact Us</a>
          </div>
        </section>
      </main>
    </div>
  );
}