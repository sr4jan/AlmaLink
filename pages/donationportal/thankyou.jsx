'use client';
import { Heart, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ThankYou() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      background: '#0f0f23',
      color: 'white',
      fontFamily: '"SF Pro", system-ui, -apple-system, sans-serif',
      textAlign: 'center'
    },
    content: {
      maxWidth: '600px',
      width: '100%',
      animation: mounted ? 'fadeIn 0.5s ease-out' : 'none'
    },
    iconWrapper: {
      width: '80px',
      height: '80px',
      margin: '0 auto 2rem',
      padding: '1rem',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'pulse 2s infinite'
    },
    title: {
      fontSize: '3rem',
      fontWeight: '800',
      marginBottom: '1rem',
      background: 'linear-gradient(90deg, #00c6ff, #0072ff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    card: {
      padding: '2rem',
      borderRadius: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginBottom: '2rem',
      animation: mounted ? 'slideUp 0.5s ease-out' : 'none'
    },
    message: {
      fontSize: '1.2rem',
      color: 'rgba(255, 255, 255, 0.8)',
      lineHeight: '1.6',
      marginBottom: '2rem'
    },
    buttons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginTop: '2rem',
      '@media (max-width: 480px)': {
        flexDirection: 'column'
      }
    },
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '1rem 2rem',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    primaryButton: {
      background: 'linear-gradient(90deg, #00c6ff, #0072ff)',
      color: 'white',
      border: 'none',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 198, 255, 0.3)'
      }
    },
    secondaryButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.15)',
        transform: 'translateY(-2px)'
      }
    },
    footer: {
      marginTop: '3rem',
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.9rem'
    }
  };

  const keyframes = `
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(0, 198, 255, 0.4);
        transform: scale(1);
      }
      70% {
        box-shadow: 0 0 0 20px rgba(0, 198, 255, 0);
        transform: scale(1.05);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(0, 198, 255, 0);
        transform: scale(1);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'I just donated to AlmaLink!',
          text: 'Join me in supporting our community and making a difference.',
          url: window.location.origin + '/donationportal'
        });
      } else {
        // Fallback copy to clipboard
        await navigator.clipboard.writeText(
          window.location.origin + '/donationportal'
        );
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.iconWrapper}>
            <Heart size={40} color="white" fill="white" />
          </div>

          <div style={styles.card}>
            <h1 style={styles.title}>Thank You!</h1>
            <p style={styles.message}>
              Your generous contribution will help us make a meaningful impact
              in our community. Together, we can create better opportunities
              and build a stronger network for everyone.
            </p>

            <div style={styles.buttons}>
              <Link
                href="/donationportal"
                style={{
                  ...styles.button,
                  ...styles.secondaryButton
                }}
              >
                <ArrowLeft size={18} />
                Back to Donations
              </Link>

              <button
                onClick={handleShare}
                style={{
                  ...styles.button,
                  ...styles.primaryButton
                }}
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>

          <p style={styles.footer}>
            A confirmation email will be sent to your registered email address.
          </p>
        </div>
      </div>
    </>
  );
}