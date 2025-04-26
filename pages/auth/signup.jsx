'use client';
import { getRecommendedSkills } from "@/data/degreeSkills";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { skillsData } from "@/data/skills";
import { 
  User, 
  Mail, 
  Lock, 
  UserPlus, 
  Briefcase, 
  ArrowRight, 
  Eye, 
  EyeOff,
  GraduationCap,
  Calendar,
  BookOpen,
  Code,
  Building,
  MapPin,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './signup.module.css';
import { colleges } from '@/data/colleges';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    profile: {
      college: {
        id: "",
        name: "",
        graduationYear: new Date().getFullYear(),
        degree: "",
        major: ""
      },
      company: {
        name: "",
        position: "",
        startDate: new Date().toISOString().split('T')[0],
        current: true
      },
      location: "",
      bio: "",
      skills: []
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [recommendedSkills, setRecommendedSkills] = useState({
    primary: [],
    suggested: []
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Predefined lists
  const degrees = [
    "B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "M.Sc", 
    "BBA", "MBA", "B.Com", "M.Com", "Other"
  ];

  const majors = {
    engineering: [
      "Computer Science", "Information Technology", "Electronics", 
      "Mechanical", "Civil", "Electrical", "Chemical", 
      "Other Engineering" // Changed from "Other"
    ],
    science: [
      "Physics", "Chemistry", "Mathematics", "Biology", 
      "Environmental Science", 
      "Other Science" // Changed from "Other"
    ],
    commerce: [
      "Accounting", "Finance", "Marketing", "Economics", 
      "Business Administration", 
      "Other Commerce" // Changed from "Other"
    ]
  };

  const allSkills = Object.values(skillsData)
    .reduce((acc, category) => [...acc, ...category.skills], []);

  const allMajors = Object.entries(majors).reduce((acc, [category, majors]) => {
      return [...acc, ...majors];
    }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: subChild 
            ? { ...prev[parent][child], [subChild]: value }
            : value
        }
      }));

      // Update college name when ID is selected
      if (name === 'profile.college.id') {
        const selectedCollege = colleges.find(c => c.code === value);
        if (selectedCollege) {
          setFormData(prev => ({
            ...prev,
            profile: {
              ...prev.profile,
              college: {
                ...prev.profile.college,
                id: value,
                name: selectedCollege.name
              }
            }
          }));
        }
      }

      // Update recommended skills when degree or major changes
      if (name === 'profile.college.degree' || name === 'profile.college.major') {
        const degree = name === 'profile.college.degree' 
          ? value 
          : formData.profile.college.degree;
        const major = name === 'profile.college.major' 
          ? value 
          : formData.profile.college.major;

        if (degree && major) {
          const recommendations = getRecommendedSkills(degree, major);
          setRecommendedSkills(recommendations);
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSkillsChange = (skill) => {
    const maxSkills = 15; // Maximum skills allowed
  
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        const newSkills = prev.filter(s => s !== skill);
        setFormData(prevData => ({
          ...prevData,
          profile: {
            ...prevData.profile,
            skills: newSkills
          }
        }));
        return newSkills;
      } else if (prev.length < maxSkills) {
        const newSkills = [...prev, skill];
        setFormData(prevData => ({
          ...prevData,
          profile: {
            ...prevData.profile,
            skills: newSkills
          }
        }));
        return newSkills;
      }
      toast.error(`You can only select up to ${maxSkills} skills`);
      return prev;
    });
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        if (!formData.username || !formData.email || !formData.password || !formData.role) {
          setError("Please fill in all required fields");
          return false;
        }
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters long");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError("Please enter a valid email address");
          return false;
        }
        return true;
      case 2:
        if (formData.role === 'student') {
          return formData.profile.college.id && 
                 formData.profile.college.graduationYear && 
                 formData.profile.college.degree && 
                 formData.profile.college.major;
        } else if (formData.role === 'alumni') {
          return formData.profile.college.id && 
                 formData.profile.college.graduationYear && 
                 formData.profile.college.degree && 
                 formData.profile.college.major &&
                 formData.profile.company.name &&
                 formData.profile.company.position;
        }
        return false;
      case 3:
        return selectedSkills.length > 0;
      default:
        return true;
    }
  };

  const handleStepChange = (nextStep) => {
    if (validateStep(step)) {
      setStep(nextStep);
      setError("");
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/signup", {
        ...formData,
        profile: {
          ...formData.profile,
          skills: selectedSkills
        }
      });
      
      localStorage.setItem("token", response.data.token);
      toast.success('Account created successfully!');
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = (skills) => {
    return skills.filter(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderSkillsSection = () => (
    <div className={styles.skillsSection}>
      <label className={styles.label}>Select your skills</label>
      
      <div className={styles.searchWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.skillsCount}>
        Selected: {selectedSkills.length}/15 skills
      </div>
      
      {/* Recommended Skills */}
      {recommendedSkills.primary.length > 0 && (
        <div className={styles.skillCategory}>
          <h3 className={styles.skillCategoryTitle}>
            Recommended Skills for {formData.profile.college.degree}
          </h3>
          <div className={styles.skillsGrid}>
            {filteredSkills(recommendedSkills.primary).map((skill) => (
              <div
                key={skill}
                className={`${styles.skillChip} ${
                  selectedSkills.includes(skill) ? styles.selectedSkill : ''
                } ${styles.recommendedSkill}`}
                onClick={() => handleSkillsChange(skill)}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Skills */}
      {recommendedSkills.suggested.length > 0 && (
        <div className={styles.skillCategory}>
          <h3 className={styles.skillCategoryTitle}>Suggested Skills</h3>
          <div className={styles.skillsGrid}>
            {filteredSkills(recommendedSkills.suggested).map((skill) => (
              <div
                key={skill}
                className={`${styles.skillChip} ${
                  selectedSkills.includes(skill) ? styles.selectedSkill : ''
                } ${styles.suggestedSkill}`}
                onClick={() => handleSkillsChange(skill)}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Other Skills */}
      {Object.entries(skillsData).map(([key, category]) => {
        const categorySkills = category.skills.filter(
          skill => !recommendedSkills.primary.includes(skill) && 
                  !recommendedSkills.suggested.includes(skill)
        );

        const filteredCategorySkills = filteredSkills(categorySkills);

        if (filteredCategorySkills.length === 0) return null;

        return (
          <div key={key} className={styles.skillCategory}>
            <h3 className={styles.skillCategoryTitle}>{category.title}</h3>
            <div className={styles.skillsGrid}>
              {filteredCategorySkills.map((skill) => (
                <div
                  key={skill}
                  className={`${styles.skillChip} ${
                    selectedSkills.includes(skill) ? styles.selectedSkill : ''
                  }`}
                  onClick={() => handleSkillsChange(skill)}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderBrandPanel = () => (
    <div className={styles.brandPanelContent}>
      <div className={styles.brandInfo}>
        <h1 className={styles.brandTitle}>Join AlmaLink</h1>
        <p className={styles.brandSubtitle}>
          Connect with fellow alumni and students. Build your network and discover opportunities.
        </p>
      </div>

      <div className={styles.featureContainer}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <GraduationCap size={20} />
          </div>
          <span className={styles.featureText}>Connect with your college network</span>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <Briefcase size={20} />
          </div>
          <span className={styles.featureText}>Access exclusive job opportunities</span>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>
            <UserPlus size={20} />
          </div>
          <span className={styles.featureText}>Join community events</span>
        </div>
      </div>

      <div className={styles.stepIndicator}>
        <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
          <span>Account</span>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
          <span>Education</span>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
          <span>Skills</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.brandPanel}>
          {renderBrandPanel()}
        </div>

        <div className={styles.signupPanel}>
          <div className={styles.formContent}>
            <h2 className={styles.signupTitle}>
              {step === 1 ? 'Create Account' : 
               step === 2 ? 'Educational Background' :
               'Professional Details'}
            </h2>
            <p className={styles.signupSubtitle}>
              {step === 1 ? 'Join our community of students and alumni' : 
               step === 2 ? 'Tell us about your academic journey' :
               'Share your professional experience'}
            </p>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formFields}>
                {/* Step 1: Account Details */}
                {step === 1 && (
                  <>
                    <div className={styles.inputContainer}>
                      <label className={styles.label}>Username</label>
                      <div className={styles.inputWrapper}>
                        <User size={18} className={styles.inputIcon} />
                        <input
                          name="username"
                          type="text"
                          value={formData.username}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="johndoe"
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.inputContainer}>
                      <label className={styles.label}>Email</label>
                      <div className={styles.inputWrapper}>
                        <Mail size={18} className={styles.inputIcon} />
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.inputContainer}>
                      <label className={styles.label}>Password</label>
                      <div className={styles.inputWrapper}>
                        <Lock size={18} className={styles.inputIcon} />
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className={styles.inputContainer}>
                      <label className={styles.label}>Role</label>
                      <div className={styles.inputWrapper}>
                        <Briefcase size={18} className={styles.inputIcon} />
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className={styles.select}
                          required
                        >
                          <option value="">Select your role</option>
                          <option value="student">Student</option>
                          <option value="alumni">Alumni</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Educational Background */}
                {step === 2 && (
                  <>
                    <div className={styles.inputContainer}>
                      <label className={styles.label}>College</label>
                      <div className={styles.inputWrapper}>
                        <GraduationCap size={18} className={styles.inputIcon} />
                        <select
                          name="profile.college.id"
                          value={formData.profile.college.id}
                          onChange={handleChange}
                          className={styles.select}
                          required
                        >
                          <option value="">Select your college</option>
                          {colleges.map((college) => (
                            <option key={college.code} value={college.code}>
                              {college.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={styles.inputContainer}>
                      <label className={styles.label}>Graduation Year</label>
                      <div className={styles.inputWrapper}>
                        <Calendar size={18} className={styles.inputIcon} />
                        <select
                          name="profile.college.graduationYear"
                          value={formData.profile.college.graduationYear}
                          onChange={handleChange}
                          className={styles.select}
                          required
                        >
                          <option value="">Select year</option>
                          {Array.from(
                            { length: 20 }, 
                            (_, i) => currentYear + 5 - i
                          ).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={styles.inputContainer}>
                      <label className={styles.label}>Degree</label>
                      <div className={styles.inputWrapper}>
                        <BookOpen size={18} className={styles.inputIcon} />
                        <select
                          name="profile.college.degree"
                          value={formData.profile.college.degree}
                          onChange={handleChange}
                          className={styles.select}
                          required
                        >
                          <option value="">Select degree</option>
                          {degrees.map(degree => (
                            <option key={degree} value={degree}>{degree}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={styles.inputContainer}>
                      <label className={styles.label}>Major</label>
                      <div className={styles.inputWrapper}>
                        <BookOpen size={18} className={styles.inputIcon} />
                        <select
  name="profile.college.major"
  value={formData.profile.college.major}
  onChange={handleChange}
  className={styles.select}
  required
>
  <option value="">Select major</option>
  {allMajors.map(major => (
    <option key={major} value={major}>{major}</option>
  ))}
</select>
                      </div>
                    </div>

                    {formData.role === 'alumni' && (
                      <>
                        <div className={styles.inputContainer}>
                          <label className={styles.label}>Company Name</label>
                          <div className={styles.inputWrapper}>
                            <Building size={18} className={styles.inputIcon} />
                            <input
                              name="profile.company.name"
                              type="text"
                              value={formData.profile.company.name}
                              onChange={handleChange}
                              className={styles.input}
                              placeholder="Current company"
                              required
                            />
                          </div>
                        </div>

                        <div className={styles.inputContainer}>
                          <label className={styles.label}>Position</label>
                          <div className={styles.inputWrapper}>
                            <Briefcase size={18} className={styles.inputIcon} />
                            <input
                              name="profile.company.position"
                              type="text"
                              value={formData.profile.company.position}
                              onChange={handleChange}
                              className={styles.input}
                              placeholder="Current position"
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Step 3: Skills */}
                {step === 3 && renderSkillsSection()}
              </div>

              <div className={styles.buttonGroup}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className={styles.backButton}
                  >
                    Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => handleStepChange(step + 1)}
                    className={styles.nextButton}
                  >
                    Next
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={styles.signupButton}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className={styles.spinner}></div>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            <p className={styles.footer}>
              Already have an account?{' '}
              <Link href="/auth/login" className={styles.loginLink}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}