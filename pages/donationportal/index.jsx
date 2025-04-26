'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { User, DollarSign, Clock, Heart, ChevronDown, ArrowRight } from 'lucide-react';
import { formatDate, formatCurrency, getCurrentUTCDateTime } from '@/utils/format';

export default function DonationPortal() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalDonors: 0,
    monthlyDonors: 0
  });
  const [newDonation, setNewDonation] = useState({
    name: "",
    amount: "",
    recurring: false,
    userId: "sr4jan",
    createdAt: getCurrentUTCDateTime()
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDonations();
    const interval = setInterval(fetchDonations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await axios.get("/api/donation", {
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.data.success) {
        setDonations(response.data.donations);
        setStats(response.data.stats || {
          totalAmount: response.data.donations.reduce((sum, d) => sum + (d.amount || 0), 0),
          totalDonors: response.data.donations.length,
          monthlyDonors: response.data.donations.filter(d => d.recurring).length
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      toast.error("Failed to load recent donations");
    } finally {
      setLoading(false);
    }
  };

  const validateDonation = () => {
    if (!newDonation.name.trim()) {
      toast.error("Please enter your name");
      return false;
    }

    const amount = Number(newDonation.amount);
    if (!amount || amount < 100) {
      toast.error("Minimum donation amount is ₹100");
      return false;
    }

    if (amount > 100000) {
      toast.error("Maximum donation amount is ₹100,000");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateDonation()) {
      return;
    }

    setSubmitting(true);
    try {
      const donationData = {
        name: newDonation.name.trim(),
        amount: parseInt(newDonation.amount, 10),
        recurring: Boolean(newDonation.recurring),
        userId: "sr4jan",
        createdAt: getCurrentUTCDateTime()
      };

      const response = await axios.post("/api/donation", donationData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success("Thank you for your donation!");
        setNewDonation({
          name: "",
          amount: "",
          recurring: false,
          userId: "sr4jan",
          createdAt: getCurrentUTCDateTime()
        });
        await fetchDonations();
        router.push("/donationportal/thankyou");
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Donation error:", error);
      toast.error(error.response?.data?.message || "Failed to process donation");
      
      if (error.response?.status === 401) {
        router.push("/auth/login");
      }
    } finally {
      setSubmitting(false);
    }
  };


  const styles = {
    container: {
      minHeight: '100vh',
      padding: '6rem 2rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: '"SF Pro", system-ui, -apple-system, sans-serif',
      background: '#0f0f23',
      color: 'white'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '800',
      background: 'linear-gradient(90deg, #00c6ff, #0072ff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: 'rgba(255, 255, 255, 0.6)',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6'
    },
    statsBar: {
      display: 'flex',
      justifyContent: 'center',
      gap: '3rem',
      marginTop: '2rem'
    },
    statItem: {
      textAlign: 'center'
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#00c6ff',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.6)'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1.5fr',
      gap: '2rem',
      alignItems: 'start',
      '@media (max-width: 768px)': {
        gridTemplateColumns: '1fr'
      }
    },
    donationForm: {
      padding: '2rem',
      borderRadius: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    formTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '2rem',
      color: 'white'
    },
    inputGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    inputWrapper: {
      position: 'relative'
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'rgba(255, 255, 255, 0.4)'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 3rem',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      color: 'white',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
      '&:focus': {
        border: '1px solid rgba(0, 198, 255, 0.5)',
        boxShadow: '0 0 0 2px rgba(0, 198, 255, 0.2)'
      }
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      color: 'rgba(255, 255, 255, 0.8)',
      cursor: 'pointer'
    },
    button: {
      width: '100%',
      padding: '1rem',
      background: 'linear-gradient(90deg, #00c6ff, #0072ff)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 198, 255, 0.3)'
      }
    },
    donationsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    donationCard: {
      padding: '1.5rem',
      borderRadius: '16px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'transform 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)'
      }
    },
    donorName: {
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: 'white'
    },
    donationDetails: {
      display: 'flex',
      gap: '1rem',
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.9rem',
      alignItems: 'center'
    },
    donationAmount: {
      color: '#00c6ff',
      fontWeight: '600'
    },
    donationBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.5rem',
      background: 'rgba(0, 198, 255, 0.1)',
      borderRadius: '6px',
      fontSize: '0.8rem'
    },
    donationTime: {
      fontSize: '0.8rem',
      color: 'rgba(255, 255, 255, 0.4)',
      marginTop: '0.5rem'
    }
  };

  const keyframes = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 16px'
            }
          }}
        />

        <header style={styles.header}>
          <h1 style={styles.title}>Support Our Community</h1>
          <p style={styles.subtitle}>
            Your contribution helps us create better opportunities for students
            and strengthen our alumni network.
          </p>

          <div style={styles.statsBar}>
    <div style={styles.statItem}>
      <div style={styles.statValue}>
        {formatCurrency(stats.totalAmount)}
      </div>
      <div style={styles.statLabel}>Total Donations</div>
    </div>
    <div style={styles.statItem}>
      <div style={styles.statValue}>{stats.totalDonors}</div>
      <div style={styles.statLabel}>Supporters</div>
    </div>
    <div style={styles.statItem}>
      <div style={styles.statValue}>{stats.monthlyDonors}</div>
      <div style={styles.statLabel}>Monthly Donors</div>
    </div>
  </div>
        </header>

        <div style={styles.grid}>
          <div style={styles.donationForm}>
            <h2 style={styles.formTitle}>Make a Donation</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Your Name</label>
                <div style={styles.inputWrapper}>
                  <User size={18} style={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={newDonation.name}
                    onChange={(e) => setNewDonation({
                      ...newDonation,
                      name: e.target.value.slice(0, 50)
                    })}
                    style={styles.input}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Donation Amount (₹)</label>
                <div style={styles.inputWrapper}>
                  <DollarSign size={18} style={styles.inputIcon} />
                  <input
                    type="number"
                    placeholder="1000"
                    value={newDonation.amount}
                    onChange={(e) => setNewDonation({
                      ...newDonation,
                      amount: Math.min(100000, Math.max(0, Number(e.target.value)))
                    })}
                    style={styles.input}
                    min="100"
                    max="100000"
                    disabled={submitting}
                    required
                  />
                </div>
                <small style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: '0.5rem',
                  display: 'block',
                  fontSize: '0.8rem'
                }}>
                  Minimum: ₹100 • Maximum: ₹100,000
                </small>
              </div>

              <label style={{
                ...styles.checkbox,
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={newDonation.recurring}
                  onChange={(e) => setNewDonation({
                    ...newDonation,
                    recurring: e.target.checked
                  })}
                  disabled={submitting}
                />
                Make this a recurring monthly donation
              </label>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.button,
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <>
                    Donate Now
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div style={styles.donationsList}>
            <h2 style={{
              ...styles.formTitle,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Recent Donations
              {loading && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
            </h2>

            {donations.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                <Heart size={48} style={{ marginBottom: '1rem', opacity: 0.6 }} />
                <p>No donations yet. Be the first to contribute!</p>
              </div>
            ) : (
              donations.map((d) => (
                <div
                  key={d._id}
                  style={{
                    ...styles.donationCard,
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  <h3 style={styles.donorName}>{d.name}</h3>
                  <div style={styles.donationDetails}>
                    <span style={styles.donationAmount}>
                      {formatCurrency(d.amount)}
                    </span>
                    {d.recurring && (
                      <span style={styles.donationBadge}>
                        <Clock size={12} />
                        Monthly Donor
                      </span>
                    )}
                  </div>
                  <p style={styles.donationTime}>
                    {formatDate(d.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}