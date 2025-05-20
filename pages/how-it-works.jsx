import { useSession } from "next-auth/react";
import styles from '@/styles/HowItWorks.module.css';
import { Upload, Users, Zap, BookOpen, Briefcase, Calendar, MessageSquare, Heart } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
  const { data: session, loading } = useSession();

  const steps = [
    {
      icon: <Upload />,
      title: "1. Sign Up with Resume",
      description: "Create your account and upload your resume. Our AI will automatically extract your information to create a rich profile.",
      forRole: "both"
    },
    {
      icon: <Users />,
      title: "2. Get Your Role",
      description: "Based on your profile, you'll be assigned as either a Student or Alumni, each with specific features tailored to your needs.",
      forRole: "both"
    },
    {
      icon: <Zap />,
      title: "3. Explore IdeaHub",
      studentGuide: "Share your innovative ideas and get funding from interested alumni.",
      alumniGuide: "Discover and fund promising student projects that interest you.",
      forRole: "split"
    },
    {
      icon: <BookOpen />,
      title: "4. Use Q&A Forum",
      studentGuide: "Ask questions about your field of interest and get matched with experienced alumni.",
      alumniGuide: "Share your expertise by answering questions in your domain.",
      forRole: "split"
    },
    {
      icon: <Briefcase />,
      title: "5. Access Job Portal",
      studentGuide: "Apply to exclusive opportunities posted by alumni using your AI-enhanced profile.",
      alumniGuide: "Post job opportunities and find talented students from your college.",
      forRole: "split"
    },
    {
      icon: <Calendar />,
      title: "6. Join Events",
      description: "Participate in college events, alumni meets, and interactive webinars to grow your network.",
      forRole: "both"
    },
    {
      icon: <MessageSquare />,
      title: "7. Connect Directly",
      description: "Build meaningful connections through our auto-college linking system and upcoming chat features.",
      forRole: "both"
    },
    {
      icon: <Heart />,
      title: "8. Give Back",
      description: "Support the community through idea funding, event sponsorship, and scholarship programs.",
      forRole: "alumni"
    }
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>How to Use AlmaLink</h1>
        <p>Your Step-by-Step Guide to Campus Connectivity</p>
      </section>

      {/* Steps Grid */}
      <section className={styles.features}>
        <div className={styles.grid}>
          {steps.map((step, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.iconWrapper}>
                {step.icon}
              </div>
              <h3>{step.title}</h3>
              {step.forRole === "both" && (
                <p>{step.description}</p>
              )}
              {step.forRole === "split" && (
                <div className={styles.roleGuides}>
                  <div className={styles.roleGuide}>
                    <h4>For Students:</h4>
                    <p>{step.studentGuide}</p>
                  </div>
                  <div className={styles.roleGuide}>
                    <h4>For Alumni:</h4>
                    <p>{step.alumniGuide}</p>
                  </div>
                </div>
              )}
              {step.forRole === "alumni" && (
                <div className={styles.alumniOnly}>
                  <span className={styles.badge}>Alumni Only</span>
                  <p>{step.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h2>Ready to Begin Your Journey?</h2>
        <p>Follow these simple steps to connect, grow, and give back to your college community.</p>
        <div className={styles.ctaButtons}>
          {!loading && !session && (
            <>
              <Link href="/auth/signup" className={styles.primaryButton}>
                Start Your Journey
              </Link>
              <Link href="/learn-more" className={styles.secondaryButton}>
                Learn More
              </Link>
            </>
          )}
          {!loading && session && (
            <Link href="/dashboard" className={styles.primaryButton}>
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}