import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { 
  Users, School, Search, Filter, Trash2, Edit,
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import styles from '@/styles/AdminDashboard.module.css';

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/login');
    },
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [session, status, searchTerm, filterRole, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        role: filterRole,
        search: searchTerm,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch users');
      }

      setUsers(data.users);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.message);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>Error: {error}</p>
        <button 
          className={styles.retryButton}
          onClick={fetchUsers}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>

<div className={styles.collegeInfo}>
  <School size={24} />
  <div>
    <h1 className={styles.collegeName}>
      {session?.user?.collegeName || 'College Admin Dashboard'}
    </h1>
    <p className={styles.adminInfo}>
      Welcome, {session?.user?.name} ({session?.user?.role})
    </p>
  </div>
</div>
      </div>

      {/* Search and Filters */}
      <div className={styles.controls}>
        <div className={styles.search}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filter}>
          <Filter size={20} />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Users</option>
            <option value="student">Students</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className={styles.content}>
        {users.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={48} />
            <h3>No Users Found</h3>
            <p>No users match your current filters.</p>
          </div>
        ) : (
          <>
            <div className={styles.usersGrid}>
              {users.map((user) => (
                <div key={user._id} className={styles.userCard}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {user.profile?.avatar ? (
                        <img src={user.profile.avatar} alt={user.username} />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className={styles.userDetails}>
                      <h3>{user.username}</h3>
                      <p>{user.email}</p>
                      <span className={`${styles.userRole} ${styles[user.role]}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className={styles.userActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => router.push(`/dashboard/admin/users/${user._id}`)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              <span className={styles.paginationInfo}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className={styles.paginationButton}
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}