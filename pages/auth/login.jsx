'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signIn } from "next-auth/react";
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Users, BookOpen } from 'lucide-react';
import styles from './login.module.css';


export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // In your Login component:

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      // Initiate Google sign in - this will redirect to Google
      await signIn('google', { 
        callbackUrl: '/dashboard',
      });
      
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Failed to initialize Google sign in');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const shouldShowModal = localStorage.getItem('showRoleModal');
    if (shouldShowModal) {
      setShowRoleModal(true);
    }
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
  
    if (!email || !password) {
      toast.error('Please fill all fields.');
      return;
    }
  
    try {
      setLoading(true);
  
      // Debug log the login attempt
      console.log('Attempting login with email:', email);
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
  
      // Debug log the signin result
      console.log('SignIn result:', { ...result, error: result?.error });
  
      if (result.error) {
        toast.error(result.error || 'Login failed.');
        return;
      }
  
      // Fetch the session to ensure we have all user data
      const session = await fetch('/api/auth/session');
      const sessionData = await session.json();
  
      // Debug log the session data
      console.log('Session data after login:', sessionData);
  
      if (!sessionData?.user) {
        toast.error('Failed to load user data');
        return;
      }
  
      toast.success('Login successful!');
  
      // Add a small delay to ensure session is properly set
      await new Promise(resolve => setTimeout(resolve, 100));
  
      if (sessionData.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const features = [
    {
      icon: <Shield size={20} color="white" />,
      text: "Enhanced security with end-to-end encryption"
    },
    {
      icon: <Users size={20} color="white" />,
      text: "Connect with your alumni network"
    },
    {
      icon: <BookOpen size={20} color="white" />,
      text: "Access exclusive learning resources"
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Brand Panel */}
        <div className={styles.brandPanel}>
          <div>
            <h1 className={styles.brandTitle}>Welcome back!</h1>
            <p className={styles.brandSubtitle}>
              Sign in to continue your journey and explore our platform's features.
            </p>

            <div className={styles.featureContainer}>
              {features.map((feature, index) => (
                <div key={index} className={styles.feature}>
                  <div className={styles.featureIcon}>
                    {feature.icon}
                  </div>
                  <span className={styles.featureText}>{feature.text}</span>
                </div>
              ))}
            </div>

            <div className={styles.decorativePattern}>
              <div className={styles.pattern}></div>
            </div>
          </div>
        </div>

        {/* Login Panel */}
        <div className={styles.loginPanel}>
          <h2 className={styles.loginTitle}>Sign in</h2>
          <p className={styles.loginSubtitle}>Please enter your credentials to continue</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputContainer}>
              <label className={styles.label}>Email</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className={styles.inputContainer}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className={styles.forgotPassword}>
                <Link href="/auth/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className={`${styles.loginButton} ${loading ? styles.loading : ''}`}
              disabled={loading}
            >
              {loading ? (
                <div className={styles.spinner}></div>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>Or continue with</span>
            <div className={styles.dividerLine}></div>
          </div>

          <div className={styles.socialButtons}>
          <button 
  type="button" 
  className={styles.socialButton}
  onClick={handleGoogleSignIn}
  disabled={loading}
>
  {loading ? (
    <div className={styles.spinner} />
  ) : (
    <>
      <img src="/google-icon.svg" alt="Google" width="18" height="18" />
      Sign in with Google
    </>
  )}
</button>
</div>
          <p className={styles.footer}>
            Don't have an account?{' '}
            <Link href="/auth/signup" className={styles.signupLink}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}