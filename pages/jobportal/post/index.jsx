'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Clock, 
  DollarSign,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import styles from '@/styles/JobPost.module.css';

export default function PostJobPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [jobData, setJobData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    description: "",
    requirements: "",
    salary: "",
    userId: "sr4jan",
    createdAt: "2025-04-28 18:48:28"
  });

  const validateJob = () => {
    if (!jobData.title.trim()) {
      toast.error("Please enter a job title");
      return false;
    }
    if (!jobData.company.trim()) {
      toast.error("Please enter a company name");
      return false;
    }
    if (!jobData.description.trim()) {
      toast.error("Please enter a job description");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateJob()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post("/api/jobs", {
        ...jobData,
        createdAt: "2025-04-28 18:48:28"
      });

      if (response.data.success) {
        toast.success("Job posted successfully!");
        router.push("/jobportal");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error(error.response?.data?.message || "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-center" />

      <header className={styles.header}>
        <button 
          onClick={() => router.push('/jobportal')} 
          className={styles.backButton}
        >
          <ArrowLeft size={20} />
          Back to Job Portal
        </button>
        <h1 className={styles.title}>Post a New Job</h1>
        <p className={styles.subtitle}>
          Help fellow alumni find great talent for their organizations
        </p>
      </header>

      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.jobForm}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Job Title<span className={styles.required}>*</span></label>
              <div className={styles.inputWrapper}>
                <Briefcase size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  value={jobData.title}
                  onChange={(e) => setJobData({...jobData, title: e.target.value})}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Company Name<span className={styles.required}>*</span></label>
              <div className={styles.inputWrapper}>
                <Building2 size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="e.g. Tech Corp Inc."
                  value={jobData.company}
                  onChange={(e) => setJobData({...jobData, company: e.target.value})}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Location</label>
              <div className={styles.inputWrapper}>
                <MapPin size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="e.g. Mumbai, India (Remote)"
                  value={jobData.location}
                  onChange={(e) => setJobData({...jobData, location: e.target.value})}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Job Type</label>
              <div className={styles.inputWrapper}>
                <Clock size={18} className={styles.inputIcon} />
                <select
                  value={jobData.type}
                  onChange={(e) => setJobData({...jobData, type: e.target.value})}
                  className={styles.select}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Salary Range</label>
              <div className={styles.inputWrapper}>
                <DollarSign size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="e.g. ₹15L - ₹25L per year"
                  value={jobData.salary}
                  onChange={(e) => setJobData({...jobData, salary: e.target.value})}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Job Description<span className={styles.required}>*</span></label>
            <textarea
              placeholder="Describe the role, responsibilities, and ideal candidate..."
              value={jobData.description}
              onChange={(e) => setJobData({...jobData, description: e.target.value})}
              className={styles.textarea}
              rows={5}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Requirements & Qualifications</label>
            <textarea
              placeholder="List the required skills, experience, and qualifications..."
              value={jobData.requirements}
              onChange={(e) => setJobData({...jobData, requirements: e.target.value})}
              className={styles.textarea}
              rows={4}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => router.push('/jobportal')}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={styles.submitButton}
            >
              {submitting ? (
                <div className={styles.spinner} />
              ) : (
                <>
                  Post Job
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}