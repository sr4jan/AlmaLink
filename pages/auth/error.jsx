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
      Default: "An error occurred during authentication."
    };

    setError(errorMessages[errorType] || errorMessages.Default);
  }, [router.query]);

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