import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  alpha,
  CircularProgress,
  Tooltip,
  Avatar,
  Chip,
  Divider,
  Alert,
  Input,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import axios from 'axios';
import CertificateViewer from '../components/CertificateViewer';
import AddCertification from '../components/AddCertification';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

const Profile = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [certToView, setCertToView] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [selectedCertification, setSelectedCertification] = useState(null);
  const [certificateViewerOpen, setCertificateViewerOpen] = useState(false);
  const [addCertDialogOpen, setAddCertDialogOpen] = useState(false);
  const [certifications, setCertifications] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Please log in to view your profile');
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };

        const res = await axios.get('http://localhost:3001/api/users/me', config);
        if (res.data) {
          setUser(res.data);
          setCertifications(res.data.certifications || []);
        } else {
          throw new Error('No data received');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        const errorMessage = err.response?.data?.message || 'Failed to fetch user data. Please try again.';
        setError(errorMessage);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleDeleteCertification = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!certToDelete || !certToDelete._id) {
        setError('Invalid certification selected for deletion');
        return;
      }

      await axios.delete(`http://localhost:3001/api/certifications/${certToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Update the user state to remove the deleted certification
      setUser(prevUser => ({
        ...prevUser,
        certifications: prevUser.certifications.filter(cert => cert._id !== certToDelete._id)
      }));
      
      setCertifications(prev => prev.filter(cert => cert._id !== certToDelete._id));
      
      setDeleteSuccess('Certification deleted successfully');
      setTimeout(() => setDeleteSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting certification');
      setTimeout(() => setError(''), 3000);
    }
    setDeleteDialogOpen(false);
    setCertToDelete(null);
  };

  const openDeleteDialog = (cert) => {
    setCertToDelete(cert);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (certification) => {
    setCertToView(certification);
    setViewDialogOpen(true);
  };

  const closeViewDialog = () => {
    setViewDialogOpen(false);
    setCertToView(null);
  };

  const handleFileUpload = async (event, certId) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('certificate', file);

    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const token = localStorage.getItem('token');
      console.log('Uploading certificate file:', file.name, 'for certification:', certId);
      const response = await axios.post(
        `http://localhost:3001/api/certifications/${certId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Upload response:', response.data);

      // Update the certificate URL in the current view
      setCertToView(prev => ({
        ...prev,
        certificateUrl: response.data.certificateUrl
      }));

      // Update the user's certifications list
      setUser(prev => ({
        ...prev,
        certifications: prev.certifications.map(cert =>
          cert._id === certId
            ? { ...cert, certificateUrl: response.data.certificateUrl }
            : cert
        ),
      }));

      setCertifications(prev => [...prev, response.data]);

      setUploadSuccess('Certificate uploaded successfully!');
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Error uploading certificate');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleViewCertificate = (certification) => {
    setSelectedCertification(certification);
    setCertificateViewerOpen(true);
  };

  const handleCloseCertificateViewer = () => {
    setCertificateViewerOpen(false);
    setSelectedCertification(null);
  };

  const handleAddCertification = (newCertification) => {
    setCertifications(prev => [...prev, newCertification]);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Show success message if exists */}
      {deleteSuccess && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="success" onClose={() => setDeleteSuccess('')}>
            {deleteSuccess}
          </Alert>
        </Box>
      )}

      {/* Show error message if exists */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Profile Header */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          background: 'white',
          position: 'relative',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: theme.palette.primary.main,
                fontSize: '3rem',
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" component="h1" gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => {/* handle edit */}}
                sx={{ mr: 2 }}
              >
                Edit Profile
              </Button>
              <Chip
                label={user.publicProfile ? 'Public Profile' : 'Private Profile'}
                color={user.publicProfile ? 'success' : 'default'}
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Skills Section */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          background: 'white',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Skills
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {/* handle add skill */}}
          >
            Add Skill
          </Button>
        </Box>
        <Grid container spacing={2}>
          {user.skills.map((skill) => (
            <Grid item xs={12} sm={6} md={4} key={skill._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {skill.name}
                    </Typography>
                    <IconButton
                      onClick={() => {/* handle delete skill */}}
                      sx={{
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Level: {skill.level}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category: {skill.category}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Certifications Section */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 2,
          background: 'white',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Certifications
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddCertDialogOpen(true)}
          >
            Add Certification
          </Button>
        </Box>
        <Grid container spacing={2}>
          {certifications.map((cert) => (
            <Grid item xs={12} sm={6} md={4} key={cert._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {cert.title}
                    </Typography>
                    <Box>
                      <Tooltip title="View Certificate">
                        <IconButton
                          onClick={() => handleViewCertificate(cert)}
                          sx={{
                            color: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Certification">
                        <IconButton
                          onClick={() => openDeleteDialog(cert)}
                          sx={{
                            color: theme.palette.error.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Issuer: {cert.issuer}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Issue Date: {new Date(cert.issueDate).toLocaleDateString()}
                  </Typography>
                  {cert.expirationDate && (
                    <Typography variant="body2" color="text.secondary">
                      Expiration Date: {new Date(cert.expirationDate).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <AddCertification
        open={addCertDialogOpen}
        onClose={() => setAddCertDialogOpen(false)}
        onSuccess={handleAddCertification}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCertToDelete(null);
        }}
        onConfirm={handleDeleteCertification}
        title="Delete Certification"
        content="Are you sure you want to delete this certification? This action cannot be undone."
      />

      {/* View Certificate Dialog */}
      <CertificateViewer
        open={certificateViewerOpen}
        onClose={handleCloseCertificateViewer}
        certification={selectedCertification}
      />

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} Skill & Certification Tracker. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default Profile; 