'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation"; // Changed from next/router
import { 
  User, 
  DollarSign, 
  Clock, 
  Heart, 
  ArrowRight,
  Loader // Added for loading spinner
} from 'lucide-react';
import styles from '@/styles/Donation.module.css';

// Simple formatting utilities
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const LoadingSpinner = ({ size = "default" }) => (
  <div className={styles.loadingSpinner}>
    <Loader 
      size={size === "small" ? 16 : 24} 
      className={styles.spinnerIcon} 
    />
  </div>
);

export default function DonationPortal() {
  const router = useRouter();
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
    createdAt: "2025-04-27 22:11:03"
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDonations();
    const interval = setInterval(fetchDonations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await axios.get("/api/donation");
      if (response.data.success) {
        setDonations(response.data.donations);
        setStats(response.data.stats || {
          totalAmount: response.data.donations.reduce((sum, d) => sum + (d.amount || 0), 0),
          totalDonors: response.data.donations.length,
          monthlyDonors: response.data.donations.filter(d => d.recurring).length
        });
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
      const response = await axios.post("/api/donation", {
        name: newDonation.name.trim(),
        amount: parseInt(newDonation.amount, 10),
        recurring: Boolean(newDonation.recurring),
        userId: "sr4jan",
        createdAt: "2025-04-27 22:11:03"
      });

      if (response.data.success) {
        toast.success("Thank you for your donation!");
        setNewDonation({
          name: "",
          amount: "",
          recurring: false,
          userId: "sr4jan",
          createdAt: "2025-04-27 22:11:03"
        });
        await fetchDonations();
        router.push("/donationportal/thankyou");
      }
    } catch (error) {
      console.error("Donation error:", error);
      toast.error("Failed to process donation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toaster />

      <header className={styles.header}>
        <h1 className={styles.title}>Support Our Community</h1>
        <p className={styles.subtitle}>
          Your contribution helps us create better opportunities for students
          and strengthen our alumni network.
        </p>

        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              {formatCurrency(stats.totalAmount)}
            </div>
            <div className={styles.statLabel}>Total Donations</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.totalDonors}</div>
            <div className={styles.statLabel}>Supporters</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.monthlyDonors}</div>
            <div className={styles.statLabel}>Monthly Donors</div>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.donationForm}>
          <h2 className={styles.formTitle}>Make a Donation</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Your Name</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newDonation.name}
                  onChange={(e) => setNewDonation({
                    ...newDonation,
                    name: e.target.value.slice(0, 50)
                  })}
                  className={styles.input}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Donation Amount (₹)</label>
              <div className={styles.inputWrapper}>
                <DollarSign size={18} className={styles.inputIcon} />
                <input
                  type="number"
                  placeholder="1000"
                  value={newDonation.amount}
                  onChange={(e) => setNewDonation({
                    ...newDonation,
                    amount: Math.min(100000, Math.max(0, Number(e.target.value)))
                  })}
                  className={styles.input}
                  min="100"
                  max="100000"
                  disabled={submitting}
                  required
                />
              </div>
              <small className={styles.helperText}>
                Minimum: ₹100 • Maximum: ₹100,000
              </small>
            </div>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={newDonation.recurring}
                onChange={(e) => setNewDonation({
                  ...newDonation,
                  recurring: e.target.checked
                })}
                disabled={submitting}
              />
              Make this a monthly donation
            </label>

            <button
              type="submit"
              disabled={submitting}
              className={styles.button}
            >
              {submitting ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  Donate Now
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className={styles.donationsList}>
          {donations.length === 0 ? (
            <div className={styles.emptyState}>
              <Heart size={48} />
              <p>Be the first to contribute!</p>
            </div>
          ) : (
            donations.map((d) => (
              <div key={d._id} className={styles.donationCard}>
                <h3 className={styles.donorName}>{d.name}</h3>
                <div className={styles.donationDetails}>
                  <span className={styles.donationAmount}>
                    {formatCurrency(d.amount)}
                  </span>
                  {d.recurring && (
                    <span className={styles.donationBadge}>
                      <Clock size={12} />
                      Monthly Donor
                    </span>
                  )}
                </div>
                <p className={styles.donationTime}>
                  {formatDate(d.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}