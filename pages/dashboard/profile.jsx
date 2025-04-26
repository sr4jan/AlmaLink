import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import {
  User, MapPin, Briefcase, Link as LinkIcon,
  Save, X, Plus, Trash2
} from 'lucide-react';
import styles from '@/styles/Profile.module.css';

export default function ProfilePage() {
    
  const router = useRouter();
  const { data: session, status, update } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/login');
    },
  });

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const AVATAR_OPTIONS = [
    // Avataaars style
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey&backgroundColor=c0aede',
    
    // Bottts style (Robot avatars)
    'https://api.dicebear.com/7.x/bottts/svg?seed=Dusty&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Mittens&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Chester&backgroundColor=b6e3f4',
    
    // Pixel Art style
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Milo&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Lucy&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Tiger&backgroundColor=c0aede',
    
    // Lorelei style (Minimalistic)
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Sophie&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Max&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/lorelei/svg?seed=Luna&backgroundColor=b6e3f4',
    
    // Micah style (Abstract)
    'https://api.dicebear.com/7.x/micah/svg?seed=Oliver&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/micah/svg?seed=Charlie&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/micah/svg?seed=Ruby&backgroundColor=ffdfbf',
    
    // Personas style (Realistic)
    'https://api.dicebear.com/7.x/personas/svg?seed=Lily&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/personas/svg?seed=Leo&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/personas/svg?seed=Jasper&backgroundColor=d1d4f9'
  ];

  // Fetch profile data
  useEffect(() => {
    if (profile?.profile?.avatar !== session?.user?.avatar) {
      update({
        ...session,
        user: {
          ...session?.user,
          avatar: profile?.profile?.avatar
        }
      });
    }
  }, [profile?.profile?.avatar]);
  useEffect(() => {
    if (status === "loading") return;

    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profile');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      setProfile(data.user);
    } catch (error) {
      console.error('Fetch profile error:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setProfile(data.user);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };
  const handleAvatarSelect = async (avatarUrl) => {
    try {
      const loadingToast = toast.loading('Updating avatar...');
  
      // Update profile in the database
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            ...profile,
            profile: {
              ...profile.profile,
              avatar: avatarUrl
            }
          }
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }
  
      const data = await response.json();
  
      // Update local state
      setProfile(data.user);
  
      // Update the session
      await update({
        ...session,
        user: {
          ...session.user,
          avatar: avatarUrl
        }
      });
  
      // Force a session refresh
      const event = new Event('visibilitychange');
      document.dispatchEvent(event);
  
      setShowAvatarModal(false);
      toast.success('Avatar updated successfully', {
        id: loadingToast
      });
    } catch (error) {
      console.error('Avatar update error:', error);
      toast.error('Failed to update avatar');
    }
  };
  const getFilteredAvatars = () => {
    if (selectedCategory === 'all') return AVATAR_OPTIONS;
    
    const categoryMappings = {
      'human': ['avataaars'],
      'robots': ['bottts'],
      'pixel': ['pixel-art'],
      'minimalist': ['lorelei'],
      'abstract': ['micah'],
      'realistic': ['personas']
    };
    
    return AVATAR_OPTIONS.filter(url => {
      const style = categoryMappings[selectedCategory]?.[0];
      return style && url.includes(style);
    });
  };

  // Add experience (for alumni)
  const addExperience = () => {
    if (!profile.profile.experience) {
      profile.profile.experience = [];
    }

    setProfile({
      ...profile,
      profile: {
        ...profile.profile,
        experience: [
          {
            title: '',
            company: '',
            startDate: '',
            endDate: '',
            description: '',
            current: false
          },
          ...profile.profile.experience
        ]
      }
    });
  };

  // Remove experience
  const removeExperience = (index) => {
    const newExperience = [...profile.profile.experience];
    newExperience.splice(index, 1);
    setProfile({
      ...profile,
      profile: {
        ...profile.profile,
        experience: newExperience
      }
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading profile...</p>
      </div>
    );
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Check file type
        if (!file.type.startsWith('image/')) {
          toast.error('Please upload an image file');
          return;
        }
  
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('File size must be less than 5MB');
          return;
        }
  
        // Create form data
        const formData = new FormData();
        formData.append('image', file);
  
        // Show loading toast
        const loadingToast = toast.loading('Uploading avatar...');
  
        // Upload image
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (!uploadRes.ok) {
          throw new Error('Failed to upload image');
        }
  
        const { url } = await uploadRes.json();
  
        // Update profile with new avatar
        const updateRes = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile: {
              ...profile,
              profile: {
                ...profile.profile,
                avatar: url
              }
            }
          }),
        });
  
        if (!updateRes.ok) {
          throw new Error('Failed to update profile');
        }
  
        // Update local state
        setProfile({
          ...profile,
          profile: {
            ...profile.profile,
            avatar: url
          }
        });
  
        // Update session to reflect changes
        await update({
          ...session,
          user: {
            ...session?.user,
            avatar: url
          }
        });
  
        // Show success message
        toast.success('Avatar updated successfully', {
          id: loadingToast
        });
      } catch (error) {
        console.error('Avatar update error:', error);
        toast.error('Failed to update avatar');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
      <div className={styles.profileHeader}>
      <div className={styles.avatar}>
  {profile.profile?.avatar ? (
    <img 
      src={profile.profile.avatar} 
      alt={`${profile.profile?.firstName || profile.username}'s avatar`} 
    />
  ) : (
    <div className={styles.avatarPlaceholder}>
      {(profile.profile?.firstName?.[0] || profile.username[0]).toUpperCase()}
    </div>
  )}
  {editing && (
    <>
      <button 
        className={styles.changeAvatarButton}
        onClick={() => setShowAvatarModal(true)}
      >
        Change Avatar
      </button>
      
      {showAvatarModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.avatarModal}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>Choose an Avatar</h3>
        <button 
          className={styles.closeButton}
          onClick={() => setShowAvatarModal(false)}
        >
          <X size={20} />
        </button>
      </div>
      
      <div className={styles.avatarCategories}>
  {[
    { id: 'all', label: 'All Styles' },
    { id: 'human', label: 'Human' },
    { id: 'robots', label: 'Robots' },
    { id: 'pixel', label: 'Pixel Art' },
    { id: 'minimalist', label: 'Minimalist' },
    { id: 'abstract', label: 'Abstract' },
    { id: 'realistic', label: 'Realistic' }
  ].map(category => (
    <button
      key={category.id}
      className={`${styles.categoryButton} ${
        selectedCategory === category.id ? styles.active : ''
      }`}
      onClick={() => setSelectedCategory(category.id)}
    >
      {category.label}
    </button>
  ))}
</div>

<div className={styles.avatarGrid}>
  {getFilteredAvatars().map((avatarUrl, index) => (
    <div 
      key={index}
      className={`${styles.avatarOption} ${
        profile.profile?.avatar === avatarUrl ? styles.selected : ''
      }`}
      onClick={() => handleAvatarSelect(avatarUrl)}
    >
      <img 
        src={avatarUrl} 
        alt={`Avatar option ${index + 1}`}
        loading="lazy"
      />
    </div>
  ))}
</div>
    </div>
  </div>
)}
    </>
  )}
</div>
  <div className={styles.headerInfo}>
    <h1>
      {profile.profile?.firstName && profile.profile?.lastName ? (
        `${profile.profile.firstName} ${profile.profile.lastName}`
      ) : (
        profile.username
      )}
    </h1>
    <p className={styles.role}>{profile.role}</p>
    {profile.collegeId && (
      <p className={styles.college}>{profile.collegeId.name}</p>
    )}
  </div>
</div>

        <div className={styles.actions}>
          {editing ? (
            <>
              <button
                className={styles.saveButton}
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                <X size={20} />
                Cancel
              </button>
            </>
          ) : (
            <button
              className={styles.editButton}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {/* Basic Information */}
        <section className={styles.section}>
          <h2>Basic Information</h2>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label>First Name</label>
              {editing ? (
                <input
                  type="text"
                  value={profile.profile?.firstName || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    profile: { ...profile.profile, firstName: e.target.value }
                  })}
                />
              ) : (
                <p>{profile.profile?.firstName || 'Not set'}</p>
              )}
            </div>

            <div className={styles.field}>
              <label>Last Name</label>
              {editing ? (
                <input
                  type="text"
                  value={profile.profile?.lastName || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    profile: { ...profile.profile, lastName: e.target.value }
                  })}
                />
              ) : (
                <p>{profile.profile?.lastName || 'Not set'}</p>
              )}
            </div>

            <div className={styles.field}>
              <label>Location</label>
              {editing ? (
                <input
                  type="text"
                  value={profile.profile?.location || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    profile: { ...profile.profile, location: e.target.value }
                  })}
                />
              ) : (
                <p>{profile.profile?.location || 'Not set'}</p>
              )}
            </div>
          </div>
        </section>

        {/* Education Information (For Students and Alumni) */}
{['student', 'alumni'].includes(profile.role) && (
  <section className={styles.section}>
    <h2>Education</h2>
    <div className={styles.fieldGrid}>
      <div className={styles.field}>
        <label>Degree</label>
        {editing ? (
          <input
            type="text"
            value={profile.profile?.college?.degree || ''}
            onChange={(e) => setProfile({
              ...profile,
              profile: {
                ...profile.profile,
                college: {
                  ...profile.profile.college,
                  degree: e.target.value
                }
              }
            })}
          />
        ) : (
          <p>{profile.profile?.college?.degree || 'Not set'}</p>
        )}
      </div>

      <div className={styles.field}>
        <label>Major</label>
        {editing ? (
          <input
            type="text"
            value={profile.profile?.college?.major || ''}
            onChange={(e) => setProfile({
              ...profile,
              profile: {
                ...profile.profile,
                college: {
                  ...profile.profile.college,
                  major: e.target.value
                }
              }
            })}
          />
        ) : (
          <p>{profile.profile?.college?.major || 'Not set'}</p>
        )}
      </div>

      <div className={styles.field}>
        <label>Graduation Year</label>
        {editing ? (
          <input
            type="number"
            min="2000"
            max="2030"
            value={profile.profile?.college?.graduationYear || ''}
            onChange={(e) => setProfile({
              ...profile,
              profile: {
                ...profile.profile,
                college: {
                  ...profile.profile.college,
                  graduationYear: parseInt(e.target.value)
                }
              }
            })}
          />
        ) : (
          <p>{profile.profile?.college?.graduationYear || 'Not set'}</p>
        )}
      </div>
    </div>
  </section>
)}

        {/* Bio */}
        <section className={styles.section}>
          <h2>Bio</h2>
          {editing ? (
            <textarea
              value={profile.profile?.bio || ''}
              onChange={(e) => setProfile({
                ...profile,
                profile: { ...profile.profile, bio: e.target.value }
              })}
              rows={4}
            />
          ) : (
            <p className={styles.bio}>{profile.profile?.bio || 'No bio added yet'}</p>
          )}
        </section>

        {/* Skills */}
        <section className={styles.section}>
          <h2>Skills</h2>
          {editing ? (
            <div className={styles.skillsEdit}>
              <input
                type="text"
                placeholder="Add skills (comma-separated)"
                value={profile.profile?.skills?.join(', ') || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  profile: {
                    ...profile.profile,
                    skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }
                })}
              />
            </div>
          ) : (
            <div className={styles.skills}>
              {profile.profile?.skills?.map((skill, index) => (
                <span key={index} className={styles.skill}>
                  {skill}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Social Links */}
        <section className={styles.section}>
          <h2>Social Links</h2>
          <div className={styles.socialLinks}>
            {editing ? (
              <>
                <div className={styles.socialField}>
                  <label>LinkedIn</label>
                  <input
                    type="url"
                    value={profile.profile?.socialLinks?.linkedin || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      profile: {
                        ...profile.profile,
                        socialLinks: {
                          ...profile.profile?.socialLinks,
                          linkedin: e.target.value
                        }
                      }
                    })}
                  />
                </div>
                <div className={styles.socialField}>
                  <label>GitHub</label>
                  <input
                    type="url"
                    value={profile.profile?.socialLinks?.github || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      profile: {
                        ...profile.profile,
                        socialLinks: {
                          ...profile.profile?.socialLinks,
                          github: e.target.value
                        }
                      }
                    })}
                  />
                </div>
                <div className={styles.socialField}>
                  <label>Portfolio</label>
                  <input
                    type="url"
                    value={profile.profile?.socialLinks?.portfolio || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      profile: {
                        ...profile.profile,
                        socialLinks: {
                          ...profile.profile?.socialLinks,
                          portfolio: e.target.value
                        }
                      }
                    })}
                  />
                </div>
              </>
            ) : (
              <div className={styles.socialLinksGrid}>
                {Object.entries(profile.profile?.socialLinks || {}).map(([platform, url]) => (
                  url && (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                    >
                      <LinkIcon size={16} />
                      {platform}
                    </a>
                  )
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Experience (Alumni Only) */}
        {profile.role === 'alumni' && (
          <section className={styles.section}>
            <h2>Experience</h2>
            {editing && (
              <button
                className={styles.addButton}
                onClick={addExperience}
              >
                <Plus size={20} />
                Add Experience
              </button>
            )}
            <div className={styles.experienceList}>
              {profile.profile?.experience?.map((exp, index) => (
                <div key={index} className={styles.experience}>
                  {editing ? (
                    <>
                      <div className={styles.experienceEdit}>
                        <input
                          type="text"
                          placeholder="Title"
                          value={exp.title}
                          onChange={(e) => {
                            const newExp = [...profile.profile.experience];
                            newExp[index] = { ...exp, title: e.target.value };
                            setProfile({
                              ...profile,
                              profile: { ...profile.profile, experience: newExp }
                            });
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...profile.profile.experience];
                            newExp[index] = { ...exp, company: e.target.value };
                            setProfile({
                              ...profile,
                              profile: { ...profile.profile, experience: newExp }
                            });
                          }}
                        />
                        <div className={styles.dateInputs}>
                          <input
                            type="date"
                            value={exp.startDate?.split('T')[0] || ''}
                            onChange={(e) => {
                              const newExp = [...profile.profile.experience];
                              newExp[index] = { ...exp, startDate: e.target.value };
                              setProfile({
                                ...profile,
                                profile: { ...profile.profile, experience: newExp }
                              });
                            }}
                          />
                          {!exp.current && (
                            <input
                              type="date"
                              value={exp.endDate?.split('T')[0] || ''}
                              onChange={(e) => {
                                const newExp = [...profile.profile.experience];
                                newExp[index] = { ...exp, endDate: e.target.value };
                                setProfile({
                                  ...profile,
                                  profile: { ...profile.profile, experience: newExp }
                                });
                              }}
                            />
                          )}
                        </div>
                        <div className={styles.currentPosition}>
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => {
                              const newExp = [...profile.profile.experience];
                              newExp[index] = { 
                                ...exp, 
                                current: e.target.checked,
                                endDate: e.target.checked ? null : exp.endDate 
                              };
                              setProfile({
                                ...profile,
                                profile: { ...profile.profile, experience: newExp }
                              });
                            }}
                          />
                          <label>Current Position</label>
                        </div>
                        <textarea
                          placeholder="Description"
                          value={exp.description}
                          onChange={(e) => {
                            const newExp = [...profile.profile.experience];
                            newExp[index] = { ...exp, description: e.target.value };
                            setProfile({
                              ...profile,
                              profile: { ...profile.profile, experience: newExp }
                            });
                          }}
                        />
                        <button
                          className={styles.removeButton}
                          onClick={() => removeExperience(index)}
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className={styles.experienceView}>
                      <h3>{exp.title}</h3>
                      <h4>{exp.company}</h4>
                      <p className={styles.dates}>
                        {new Date(exp.startDate).toLocaleDateString()} -
                        {exp.current ? ' Present' : 
                          exp.endDate ? ` ${new Date(exp.endDate).toLocaleDateString()}` : ''
                        }
                      </p>
                      <p className={styles.description}>{exp.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}