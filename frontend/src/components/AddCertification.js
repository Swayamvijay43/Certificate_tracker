import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddCertification = ({ open, onClose, onSuccess }) => {
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
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'issueDate') {
            formDataToSend.append(key, formData[key].toISOString());
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      if (formData.file) {
        formDataToSend.append('certificate', formData.file);
      }

      const token = localStorage.getItem('token');
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
        onSuccess(response.data.data);
        navigate('/profile');
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

  const handleClose = () => {
    setFormData({
      title: '',
      issuer: '',
      issueDate: null,
      credentialId: '',
      credentialUrl: '',
      description: '',
      file: null,
    });
    onClose();
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
      setError('');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add New Certification
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            name="title"
            autoFocus
            margin="dense"
            label="Certification Title"
            type="text"
            fullWidth
            required
            value={formData.title}
            onChange={handleChange}
          />
          <TextField
            name="issuer"
            margin="dense"
            label="Issuing Organization"
            type="text"
            fullWidth
            required
            value={formData.issuer}
            onChange={handleChange}
          />
          <DatePicker
            label="Issue Date"
            value={formData.issueDate}
            onChange={handleDateChange}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                fullWidth
                required
              />
            )}
          />
          <TextField
            name="credentialId"
            margin="dense"
            label="Credential ID (Optional)"
            type="text"
            fullWidth
            value={formData.credentialId}
            onChange={handleChange}
          />
          <TextField
            name="credentialUrl"
            margin="dense"
            label="Credential URL (Optional)"
            type="text"
            fullWidth
            value={formData.credentialUrl}
            onChange={handleChange}
          />
          <TextField
            name="description"
            margin="dense"
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
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {formData.file.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Certification'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddCertification; 