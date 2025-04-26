'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { 
  Briefcase, 
  Building2, 
  FileText, 
  Search, 
  MapPin, 
  Clock, 
  Trash2,
  Edit3,
  Filter,
  ChevronDown,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import styles from '/styles/JobPortal.module.css';

export default function JobPortalPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    description: "",
    requirements: "",
    salary: "",
    userId: "sr4jan",
    createdAt: new Date().toISOString()
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/jobs");
      // Remove the error check since we'll handle the jobs array directly
      setJobs(response.data.jobs || []); // Use empty array as fallback
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
      setJobs([]); // Reset jobs on error
    } finally {
      setLoading(false);
    }
  };

  const validateJob = () => {
    if (!newJob.title.trim()) {
      toast.error("Please enter a job title");
      return false;
    }
    if (!newJob.company.trim()) {
      toast.error("Please enter a company name");
      return false;
    }
    if (!newJob.description.trim()) {
      toast.error("Please enter a job description");
      return false;
    }
    return true;
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    
    if (!validateJob()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post("/api/jobs", {
        ...newJob,
        createdAt: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success("Job posted successfully!");
        setNewJob({
          title: "",
          company: "",
          location: "",
          type: "Full-time",
          description: "",
          requirements: "",
          salary: "",
          userId: "sr4jan",
          createdAt: new Date().toISOString()
        });
        setShowForm(false);
        await fetchJobs();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error(error.response?.data?.message || "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (id) => {
    try {
      const response = await axios.delete(`/api/jobs/${id}`, {
        data: { userId: "sr4jan" }
      });

      if (response.data.success) {
        toast.success("Job deleted successfully!");
        await fetchJobs();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  return (
    <div className={styles.container}>
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

      <header className={styles.header}>
        <h1 className={styles.title}>Job Portal</h1>
        <p className={styles.subtitle}>
          Find your next opportunity or post a job to find great talent
        </p>

        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search jobs by title, company, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.filterButton}>
            <Filter size={20} />
            Filters
            <ChevronDown size={16} />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.actionBar}>
          <h2 className={styles.sectionTitle}>
            {searchTerm ? `Search Results (${filteredJobs.length})` : 'Latest Jobs'}
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className={styles.postButton}
          >
            Post a Job
            <ArrowRight size={18} />
          </button>
        </div>

        {showForm && (
          <form onSubmit={handlePostJob} className={styles.jobForm}>
            <h3 className={styles.formTitle}>Post a New Job</h3>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Job Title</label>
                <div className={styles.inputWrapper}>
                  <Briefcase size={18} className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    value={newJob.title}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Company</label>
                <div className={styles.inputWrapper}>
                  <Building2 size={18} className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="e.g. Tech Corp Inc."
                    value={newJob.company}
                    onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Location</label>
                <div className={styles.inputWrapper}>
                  <MapPin size={18} className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="e.g. New York, NY (Remote)"
                    value={newJob.location}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Job Type</label>
                <div className={styles.inputWrapper}>
                  <Clock size={18} className={styles.inputIcon} />
                  <select
                    value={newJob.type}
                    onChange={(e) => setNewJob({...newJob, type: e.target.value})}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Salary Range</label>
                <div className={styles.inputWrapper}>
                  <DollarSign size={18} className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="e.g. ₹15L - ₹25L per year"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Job Description</label>
              <textarea
                placeholder="Describe the role, responsibilities, and ideal candidate..."
                value={newJob.description}
                onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                rows={5}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Requirements</label>
              <textarea
                placeholder="List the required skills, experience, and qualifications..."
                value={newJob.requirements}
                onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                rows={3}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
                  <>Post Job</>
                )}
              </button>
            </div>
          </form>
        )}

        <div className={styles.jobsList}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className={styles.empty}>
              <Briefcase size={48} />
              <p>No jobs found. Be the first to post a job!</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job._id} className={styles.jobCard}>
                <div className={styles.jobHeader}>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  {job.userId === "sr4jan" && (
                    <div className={styles.jobActions}>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className={styles.deleteButton}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.jobMeta}>
                  <span className={styles.company}>
                    <Building2 size={16} />
                    {job.company}
                  </span>
                  {job.location && (
                    <span className={styles.location}>
                      <MapPin size={16} />
                      {job.location}
                    </span>
                  )}
                  {job.type && (
                    <span className={styles.jobType}>
                      <Clock size={16} />
                      {job.type}
                    </span>
                  )}
                </div>

                {job.salary && (
                  <div className={styles.salary}>
                    <DollarSign size={16} />
                    {job.salary}
                  </div>
                )}

                <p className={styles.jobDescription}>{job.description}</p>

                {job.requirements && (
                  <div className={styles.requirements}>
                    <h4>Requirements:</h4>
                    <p>{job.requirements}</p>
                  </div>
                )}

                <div className={styles.jobFooter}>
                  <button className={styles.applyButton}>
                    Apply Now
                    <ArrowRight size={18} />
                  </button>
                  <span className={styles.postedDate}>
                    Posted {formatDate(job.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}