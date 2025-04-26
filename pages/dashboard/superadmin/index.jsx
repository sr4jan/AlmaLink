import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styles from '@/styles/SuperAdminDashboard.module.css';

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [colleges, setColleges] = useState([]); // Initialize colleges state
  const [stats, setStats] = useState({
    totalColleges: 0,
    activeColleges: 0,
    totalUsers: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role !== "superadmin") {
      router.push("/dashboard/superadmin");
    }
  }, [session, router]);

  useEffect(() => {
    if (session?.user?.role === "superadmin") {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch('/api/dashboard/superadmin/stats');
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch stats');
      }
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch colleges
      const collegesResponse = await fetch('/api/dashboard/superadmin/colleges');
      if (!collegesResponse.ok) {
        throw new Error('Failed to fetch colleges');
      }
      const collegesData = await collegesResponse.json();
      setColleges(collegesData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>
          Error: {error}
          <button 
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={fetchDashboardData}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "superadmin") {
    return null;
  }
  const handleCreateCollege = () => {
    router.push('/dashboard/superadmin/colleges/new');
  };

  const handleCreateAdmin = (collegeId) => {
    setSelectedCollege(colleges.find(c => c._id === collegeId));
    setIsModalOpen(true);
  };

  const handleDeleteCollege = async (collegeId) => {
    if (!window.confirm('Are you sure you want to delete this college?')) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/superadmin/colleges/${collegeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete college');
      }

      // Refresh the colleges list
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting college:', error);
      setError(error.message);
    }
  };

  const handleSubmitAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          collegeId: selectedCollege._id,
          role: 'admin'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error creating admin');
      }

      // Reset form and close modal
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: ''
      });
      setIsModalOpen(false);

      // Refresh colleges data
      fetchDashboardData();

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteAdmin = async (adminId, collegeName) => {
    if (!window.confirm(`Are you sure you want to remove the admin from ${collegeName}?`)) {
      return;
    }
  
    try {
      const response = await fetch(`/api/admin/${adminId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete admin');
      }
  
      // Refresh the colleges list
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting admin:', error);
      setError(error.message);
    }
  };

  return (
    <>
      <Head>
        <title>SuperAdmin Dashboard - AlmaLink</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>SuperAdmin Dashboard</h1>
          <button 
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={() => router.push('/dashboard/superadmin/colleges/new')}
          >
            Add New College
          </button>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statsCard}>
            <div className={styles.statsLabel}>Total Colleges</div>
            <div className={styles.statsValue}>{stats.totalColleges}</div>
          </div>
          <div className={styles.statsCard}>
            <div className={styles.statsLabel}>Active Colleges</div>
            <div className={styles.statsValue}>{stats.activeColleges}</div>
          </div>
          <div className={styles.statsCard}>
            <div className={styles.statsLabel}>Total Users</div>
            <div className={styles.statsValue}>{stats.totalUsers}</div>
          </div>
          <div className={styles.statsCard}>
            <div className={styles.statsLabel}>Pending Approvals</div>
            <div className={styles.statsValue}>{stats.pendingApprovals}</div>
          </div>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Colleges and Admins</h2>
              <div className={styles.searchBar}>
                <input
                  type="text"
                  placeholder="Search colleges..."
                  className={styles.searchInput}
                />
                <select className={styles.filterSelect}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>College Name</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Admin</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
  {colleges.length > 0 ? (
    colleges.map((college) => (
      <tr key={college._id}>
        <td>{college.name}</td>
        <td>{college.code}</td>
        <td>
          <span className={`${styles.status} ${
            college.status === 'active' ? styles.statusActive : styles.statusInactive
          }`}>
            {college.status}
          </span>
        </td>
        <td>
          {college.admin ? (
            <div className={styles.adminInfo}>
              <span>{college.admin.email}</span>
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={() => handleDeleteAdmin(college.admin.id, college.name)}
              >
                Remove Admin
              </button>
            </div>
          ) : (
            <button
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={() => handleCreateAdmin(college._id)}
            >
              Add Admin
            </button>
          )}
        </td>
        <td className={styles.actionButtons}>
  <button 
    className={`${styles.actionButton} ${styles.editButton}`}
    onClick={() => router.push(`/dashboard/superadmin/colleges/${college._id}/edit`)}
  >
    Edit
  </button>
  <button 
    className={`${styles.actionButton} ${styles.deleteButton}`}
    onClick={() => handleDeleteCollege(college._id)}
  >
    Delete
  </button>
</td>

      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5" className={styles.noData}>
        No colleges found
      </td>
    </tr>
  )}
</tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Admin Creation Modal */}
{isModalOpen && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <div className={styles.modalHeader}>
        <h3>Create Admin for {selectedCollege?.name}</h3>
        <button 
          className={styles.closeButton}
          onClick={() => setIsModalOpen(false)}
          aria-label="Close modal"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmitAdmin} className={styles.form}>
        {error && (
          <div className={styles.error}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
            placeholder="Enter username"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            placeholder="Enter email address"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            placeholder="Enter password"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
            placeholder="Enter first name"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
            placeholder="Enter last name"
          />
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={() => setIsModalOpen(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.primaryButton}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" strokeWidth="4" />
                </svg>
                Creating...
              </>
            ) : (
              'Create Admin'
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </>
  );
}