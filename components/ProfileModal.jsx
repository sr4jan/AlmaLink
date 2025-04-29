import { X, Mail, Linkedin, Github, Globe } from 'lucide-react';
import styles from '@/styles/ProfileModal.module.css';

export default function ProfileModal({ profile, onClose, onMessage }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.profileHeader}>
          <img 
            src={profile.avatar} 
            alt={profile.name} 
            className={styles.avatar}
          />
          <div className={styles.headerInfo}>
            <h2>{profile.name}</h2>
            <p className={styles.role}>{profile.role}</p>
          </div>
        </div>

        <div className={styles.profileBody}>
          {profile.bio && (
            <section className={styles.section}>
              <h3>About</h3>
              <p>{profile.bio}</p>
            </section>
          )}

          <section className={styles.section}>
            <h3>Education</h3>
            <p>{profile.education}</p>
          </section>

          {profile.experience && profile.experience.length > 0 && (
            <section className={styles.section}>
              <h3>Experience</h3>
              {profile.experience.map((exp, index) => (
                <div key={index} className={styles.experienceItem}>
                  <h4>{exp.title}</h4>
                  <p>{exp.company}</p>
                  <p className={styles.dates}>
                    {new Date(exp.startDate).getFullYear()} - 
                    {exp.current ? 'Present' : new Date(exp.endDate).getFullYear()}
                  </p>
                  {exp.description && <p>{exp.description}</p>}
                </div>
              ))}
            </section>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <section className={styles.section}>
              <h3>Skills</h3>
              <div className={styles.skills}>
                {profile.skills.map((skill, index) => (
                  <span key={index} className={styles.skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {profile.achievements && profile.achievements.length > 0 && (
            <section className={styles.section}>
              <h3>Achievements</h3>
              <ul className={styles.achievements}>
                {profile.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className={styles.profileActions}>
          <button 
            className={styles.messageButton}
            onClick={() => onMessage(profile)}
          >
            <Mail size={20} />
            Message
          </button>
          
          <div className={styles.socialLinks}>
            {profile.socialLinks?.linkedin && (
              <a 
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <Linkedin size={20} />
              </a>
            )}
            {profile.socialLinks?.github && (
              <a 
                href={profile.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <Github size={20} />
              </a>
            )}
            {profile.socialLinks?.portfolio && (
              <a 
                href={profile.socialLinks.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <Globe size={20} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}