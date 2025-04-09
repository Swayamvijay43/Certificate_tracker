import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddCertification = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: null,
    credentialId: '',
    credentialUrl: '',
    description: '',
    file: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      issueDate: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { title, issuer, issueDate } = formData;
    if (!title || !issuer || !issueDate) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('issuer', formData.issuer);
      formDataToSend.append('issueDate', formData.issueDate.toISOString());
      
      if (formData.credentialId) {
        formDataToSend.append('credentialId', formData.credentialId);
      }
      
      if (formData.credentialUrl) {
        formDataToSend.append('credentialUrl', formData.credentialUrl);
      }
      
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }

      if (formData.file) {
        formDataToSend.append('certificate', formData.file);
        console.log('File appended to FormData:', formData.file.name, 'size:', formData.file.size);
      }

      const token = localStorage.getItem('token');
      console.log('Sending request to API with FormData');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/certifications`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      console.log('Certification added:', response.data);
      
      if (response.data.success) {
        console.log('Certification added successfully, navigating to profile');
        navigate('/profile', { replace: true });
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        throw new Error(response.data.message || 'Failed to add certification');
      }
    } catch (error) {
      console.error('Error adding certification:', error);
      setError(error.response?.data?.message || 'Error adding certification');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPG, PNG and PDF files are allowed');
        return;
      }
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      console.log('File selected:', file.name, 'size:', file.size, 'type:', file.type);
      setError('');
    }
  };

  // Test upload function
  const testUpload = async () => {
    if (!formData.file) {
      setError('Please select a file first');
      return;
    }
    
    setLoading(true);
    const testFormData = new FormData();
    testFormData.append('certificate', formData.file);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/api/certifications/test-upload',
        testFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          }
        }
      );
      
      console.log('Test upload response:', response.data);
      setError('');
      alert('Test upload successful! Check console for details.');
    } catch (error) {
      console.error('Test upload error:', error);
      setError(error.response?.data?.message || 'Error in test upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Certification
        </Typography>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            name="title"
            autoFocus
            margin="normal"
            label="Certification Title"
            type="text"
            fullWidth
            required
            value={formData.title}
            onChange={handleChange}
          />
          <TextField
            name="issuer"
            margin="normal"
            label="Issuing Organization"
            type="text"
            fullWidth
            required
            value={formData.issuer}
            onChange={handleChange}
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <DatePicker
              label="Issue Date *"
              value={formData.issueDate}
              onChange={handleDateChange}
              textField={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  margin="normal"
                />
              )}
            />
          </Box>
          <TextField
            name="credentialId"
            margin="normal"
            label="Credential ID (Optional)"
            type="text"
            fullWidth
            value={formData.credentialId}
            onChange={handleChange}
          />
          <TextField
            name="credentialUrl"
            margin="normal"
            label="Credential URL (Optional)"
            type="text"
            fullWidth
            value={formData.credentialUrl}
            onChange={handleChange}
          />
          <TextField
            name="description"
            margin="normal"
            label="Description (Optional)"
            multiline
            rows={4}
            fullWidth
            value={formData.description}
            onChange={handleChange}
          />
          <Box sx={{ mt: 2 }}>
            <input
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              style={{ display: 'none' }}
              id="certificate-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="certificate-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Upload Certificate
              </Button>
            </label>
            {formData.file && (
              <>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {formData.file.name}
                </Typography>
                <Button 
                  onClick={testUpload} 
                  size="small" 
                  sx={{ mt: 1 }}
                  variant="outlined"
                  color="secondary"
                  disabled={loading}
                >
                  Test Upload Only
                </Button>
              </>
            )}
          </Box>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
            >
              Add Certification
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddCertification; 