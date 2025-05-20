// pages/auth/error.jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './error.module.css';

export default function ErrorPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const { error: errorType } = router.query;
    
    const errorMessages = {
      Configuration: "There is a problem with the server configuration.",
      AccessDenied: "Account not found. Please sign up first.",
      OAuthSignin: "Error in OAuth sign-in process.",
      OAuthCallback: "Error in OAuth callback process.",
      Callback: "Authentication callback failed.",
      Default: "An error occurred during authentication."
    };

    // Log the error type for debugging
    console.log('Auth Error Type:', errorType);

    if (errorType === 'AccessDenied') {
      // Redirect to signup for AccessDenied
      router.push('/auth/signup');
      return;
    }

    setError(errorMessages[errorType] || errorMessages.Default);
  }, [router.query]);

  // Add loading state
  if (router.query.error === 'AccessDenied') {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Authentication Error</h1>
        <p className={styles.message}>{error}</p>
        <div className={styles.actions}>
          <Link href="/auth/signup" className={styles.button}>
            Sign Up
          </Link>
          <Link href="/auth/login" className={styles.buttonSecondary}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}