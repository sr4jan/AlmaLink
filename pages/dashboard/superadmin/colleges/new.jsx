import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import styles from '@/styles/SuperAdminDashboard.module.css';

export default function NewCollege() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    domain: '',
    location: {
      city: '',
      state: '',
      country: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/dashboard/superadmin/colleges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error creating college');
      }

      router.push('/dashboard/superadmin');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== "superadmin") {
    router.push("/dashboard");
    return null;
  }

  return (
    <>
      <Head>
        <title>Add New College - AlmaLink</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Add New College</h1>
        </div>

        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="name">College Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="code">College Code</label>
              <input
                id="code"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="domain">Domain</label>
              <input
                id="domain"
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({...formData, domain: e.target.value})}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                value={formData.location.city}
                onChange={(e) => setFormData({
                  ...formData, 
                  location: {...formData.location, city: e.target.value}
                })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="state">State</label>
              <input
                id="state"
                type="text"
                value={formData.location.state}
                onChange={(e) => setFormData({
                  ...formData, 
                  location: {...formData.location, state: e.target.value}
                })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="country">Country</label>
              <input
                id="country"
                type="text"
                value={formData.location.country}
                onChange={(e) => setFormData({
                  ...formData, 
                  location: {...formData.location, country: e.target.value}
                })}
                required
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={`${styles.button} ${styles.secondaryButton}`}
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.button} ${styles.primaryButton}`}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create College'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}