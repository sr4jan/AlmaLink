'use client';
import { useState, useCallback } from 'react';
import { Upload, FileText, Loader, AlertCircle } from 'lucide-react';
import styles from './ResumeUploader.module.css';
import { transformResumeData } from '@/utils/resumeParser';

export default function ResumeUploader({ onResumeData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const updateProgress = useCallback((message) => {
    setProgress(message);
    console.log('Progress:', message);
  }, []);

  const extractTextFromFile = async (file) => {
    updateProgress('Preparing file upload...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      updateProgress('Uploading file...');
      const response = await fetch('/api/resume/extract', {
        method: 'POST',
        body: formData,
      });

      updateProgress('Processing response...');
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('Server returned invalid response');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract text from resume');
      }

      if (!data.text) {
        throw new Error('No text was extracted from the file');
      }

      updateProgress('Text extraction complete');
      return data.text;
    } catch (err) {
      console.error('Text extraction error:', err);
      throw new Error(err.message || 'Failed to process file');
    }
  };

  const parseResumeData = async (text) => {
    updateProgress('Parsing resume data...');
    try {
      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
  
      const data = await response.json();
      console.log('Parse response:', data);
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse resume');
      }
  
      updateProgress('Resume parsing complete');
      return data;
    } catch (err) {
      console.error('Resume parsing error:', err);
      // If we have data despite the error, return it
      if (err.response?.data) {
        return err.response.data;
      }
      throw new Error('Failed to parse resume data');
    }
  };
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
  
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }
  
    setLoading(true);
    setError('');
    updateProgress('Starting file processing...');
  
    try {
      const text = await extractTextFromFile(file);
      console.log('Extracted text:', text.substring(0, 200));
      
      const response = await parseResumeData(text);
      console.log('Resume parsing response:', response);
      
      // Even if we get an error response, don't throw if we have usable data
      if (response && response.data) {
        onResumeData(response.data);
        updateProgress('');
      } else {
        console.error('Invalid response format:', response);
        setError('Unable to process resume data');
      }
    } catch (err) {
      console.error('Resume processing error:', err);
      // Don't show the error if the form was filled successfully
      if (!formData.email) {
        setError(err.message || 'Failed to process resume. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.uploaderContainer}>
      <label className={styles.uploadLabel}>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          className={styles.fileInput}
          disabled={loading}
        />
        <div className={`${styles.uploadBox} ${loading ? styles.loading : ''}`}>
          {loading ? (
            <>
              <Loader className={styles.loadingIcon} />
              <span className={styles.progressText}>{progress || 'Processing resume...'}</span>
            </>
          ) : (
            <>
              <Upload className={styles.uploadIcon} />
              <FileText className={styles.fileIcon} />
              <span>Upload your resume (PDF or Word)</span>
              <span className={styles.supportedFormats}>
                Supported formats: PDF, DOC, DOCX
              </span>
            </>
          )}
        </div>
      </label>
      {error && (
        <div className={styles.error}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}