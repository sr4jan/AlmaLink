'use client';
import { useState } from 'react';
import Link from 'next/link';
import { 
  Lightbulb, 
  Users, 
  Briefcase, 
  Heart, 
  Video, 
  MessageCircle,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import styles from './Landing.module.css';

export default function LandingPage() {
  return (
    <div className={styles.landingContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Connect, Collaborate & Grow with AlmaLink</h1>
          <p>Bridge the gap between students and alumni. Share ideas, find opportunities, and build meaningful connections.</p>
          <div className={styles.heroButtons}>
            <Link href="/auth/signup" className={styles.primaryButton}>
              Get Started
              <ChevronRight size={20} />
            </Link>
            <Link href="/auth/login" className={styles.secondaryButton}>
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2>Why Choose AlmaLink?</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <Lightbulb className={styles.featureIcon} />
            <h3>IdeaHub</h3>
            <p>Share innovative ideas and get feedback from experienced alumni</p>
          </div>
          <div className={styles.featureCard}>
            <Briefcase className={styles.featureIcon} />
            <h3>Job Portal</h3>
            <p>Exclusive job opportunities posted by alumni for students</p>
          </div>
          <div className={styles.featureCard}>
            <Video className={styles.featureIcon} />
            <h3>Live Sessions</h3>
            <p>Interactive learning sessions with industry experts</p>
          </div>
          <div className={styles.featureCard}>
            <Users className={styles.featureIcon} />
            <h3>Network</h3>
            <p>Build meaningful connections with alumni and peers</p>
          </div>
        </div>
      </section>

      {/* Role Benefits Section */}
      <section className={styles.roles}>
        <h2>Choose Your Journey</h2>
        <div className={styles.roleCards}>
          <div className={styles.roleCard}>
            <h3>For Students</h3>
            <ul>
              <li><CheckCircle size={16} /> Access to alumni network</li>
              <li><CheckCircle size={16} /> Post and discuss ideas</li>
              <li><CheckCircle size={16} /> Apply to exclusive jobs</li>
              <li><CheckCircle size={16} /> Join live mentoring sessions</li>
              <li><CheckCircle size={16} /> Get expert guidance</li>
            </ul>
            <Link href="/auth/signup?role=student" className={styles.roleButton}>
              Join as Student
            </Link>
          </div>
          <div className={styles.roleCard}>
            <h3>For Alumni</h3>
            <ul>
              <li><CheckCircle size={16} /> Share your expertise</li>
              <li><CheckCircle size={16} /> Post job opportunities</li>
              <li><CheckCircle size={16} /> Mentor students</li>
              <li><CheckCircle size={16} /> Host live sessions</li>
              <li><CheckCircle size={16} /> Give back to community</li>
            </ul>
            <Link href="/auth/signup?role=alumni" className={styles.roleButton}>
              Join as Alumni
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}