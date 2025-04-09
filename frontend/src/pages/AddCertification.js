import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import SkillReviewDialog from '../components/SkillReviewDialog';

const AddCertification = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    credentialId: '',
    credentialUrl: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSkillReview, setShowSkillReview] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [authenticity, setAuthenticity] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setError('File must be an image or PDF and less than 5MB');
        return;
      }
      setFile(acceptedFiles[0]);
      setError('');
    },
  });

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSkillConfirm = async (confirmedSkills) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add file if exists
      if (file) {
        formDataToSend.append('certificateFile', file);
      }

      // Add confirmed skills
      formDataToSend.append('confirmedSkills', JSON.stringify(confirmedSkills));

      const response = await axios.post(
        'http://localhost:3001/api/certifications',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Certification and skills added successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error adding certification:', err);
      setError(err.response?.data?.message || 'Error adding certification and skills');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to add a certification');
        return;
      }

      // Validate file
      if (!file) {
        setError('Please upload a certificate file');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.type}. Please upload a PDF or image file (JPEG, PNG)`);
        return;
      }

      // Validate file size
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum limit of 5MB`);
        return;
      }

      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add file
      formDataToSend.append('certificateFile', file);

      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // First, get the analysis and extracted skills
      console.log('Sending analysis request...');
      const analysisResponse = await axios.post(
        'http://localhost:3001/api/certifications/analyze',
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        }
      );

      console.log('Analysis response:', analysisResponse.data);

      if (!analysisResponse.data) {
        throw new Error('No response data received from server');
      }

      const { analysis, extractedSkills: skills, authenticity } = analysisResponse.data;
      
      if (!analysis || !skills || !authenticity) {
        console.error('Invalid analysis response:', analysisResponse.data);
        throw new Error('Server returned incomplete analysis data');
      }

      setExtractedSkills(skills || []);
      setSuggestedSkills(analysis?.suggested_skills || []);
      setAuthenticity(authenticity);
      setShowSkillReview(true);
    } catch (err) {
      console.error('Error analyzing certificate:', err);
      
      // Log detailed error information
      const errorDetails = {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack
      };
      console.error('Error details:', errorDetails);
      
      // Handle different error scenarios
      if (!navigator.onLine) {
        setError('Network connection lost. Please check your internet connection and try again.');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 413) {
        setError('File size too large. Please upload a smaller file (max 5MB).');
      } else if (err.response?.data?.error) {
        setError(`Error analyzing certificate: ${err.response.data.error}`);
      } else if (err.message.includes('Network Error')) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError(`Error analyzing certificate: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add New Certification
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Certification Title"
                name="title"
                value={formData.title}
                onChange={onChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Issuing Organization"
                name="issuer"
                value={formData.issuer}
                onChange={onChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Issue Date"
                name="issueDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.issueDate}
                onChange={onChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Credential ID"
                name="credentialId"
                value={formData.credentialId}
                onChange={onChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Credential URL"
                name="credentialUrl"
                value={formData.credentialUrl}
                onChange={onChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={onChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <input {...getInputProps()} disabled={loading} />
                {file ? (
                  <Typography>
                    Selected file: {file.name}
                  </Typography>
                ) : (
                  <Typography>
                    Drag and drop a file here, or click to select a file
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Add Certification'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <SkillReviewDialog
        open={showSkillReview}
        onClose={() => setShowSkillReview(false)}
        extractedSkills={extractedSkills}
        suggestedSkills={suggestedSkills}
        authenticity={authenticity}
        onConfirm={handleSkillConfirm}
      />
    </Container>
  );
};

export default AddCertification; 