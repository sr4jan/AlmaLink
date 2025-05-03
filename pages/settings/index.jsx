'use client';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { 
  AlertTriangle, 
  Settings as SettingsIcon, 
  Shield, 
  Trash2
} from 'lucide-react';
import styles from './settings.module.css';

export default function Settings() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const theme = typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light';
  const isDarkMode = theme === 'dark';

  // Function to combine class names with theme
  const getThemeClass = (baseClass) => `${styles[baseClass]} ${isDarkMode ? styles.darkMode : ''}`;
  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success('Account deleted successfully');
      
      // Sign out and redirect to signup page
      await signOut({ redirect: false });
      router.push('/auth/signup');
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={getThemeClass('content')}>
        <h1 className={styles.title}>
          <SettingsIcon size={24} />
          Settings
        </h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Shield size={20} />
            Account Management
          </h2>
          
          <div className={getThemeClass('dangerZone')}>
            <h3 className={styles.dangerTitle}>
              <AlertTriangle size={20} />
              Danger Zone
            </h3>
            
            {!showDeleteConfirm ? (
              <div className={styles.deleteSection}>
                <p>
                  Once you delete your account, there is no going back. 
                  This will permanently delete your account and all associated data 
                  including your profile, connections, and activities.
                </p>
                <button 
                  className={styles.deleteButton}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={18} />
                  Delete Account
                </button>
              </div>
            ) : (
              <div className={styles.confirmDelete}>
                <p className={styles.warning}>
                  <strong>Warning:</strong> This action cannot be undone. This will permanently delete your 
                  {session?.user?.role === 'admin' ? ' admin ' : ' '}
                  account and remove all of your data from our servers.
                </p>
                <p>Please type <strong>DELETE</strong> to confirm:</p>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className={styles.confirmInput}
                  placeholder="Type DELETE to confirm"
                  autoComplete="off"
                />
                <div className={styles.confirmButtons}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteInput('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={`${styles.confirmDeleteButton} ${isDeleting ? styles.loading : ''}`}
                    onClick={handleDeleteAccount}
                    disabled={deleteInput !== 'DELETE' || isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : (
                      <>
                        <Trash2 size={18} />
                        Permanently delete this account
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}