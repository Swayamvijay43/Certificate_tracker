import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  DialogTitle,
  DialogContentText,
  Paper,
  Chip,
  Divider,
  useTheme,
  alpha,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Edit as EditIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Link as LinkIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import axios from 'axios';

// TabPanel component for tab content
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicProfile, setPublicProfile] = useState(false);
  const [viewCertificate, setViewCertificate] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

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
          setPublicProfile(res.data.publicProfile);
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

  const handlePublicProfileChange = async () => {
    try {
      await axios.put('http://localhost:3001/api/users/profile', { publicProfile: !publicProfile }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPublicProfile(!publicProfile);
      setSuccessMessage(`Profile visibility ${!publicProfile ? 'enabled' : 'disabled'}`);
    } catch (err) {
      setError('Failed to update profile visibility');
    }
  };

  const handleViewCertificate = (cert) => {
    setViewCertificate(cert);
  };

  const handleCloseViewCertificate = () => {
    setViewCertificate(null);
  };

  const handleDeleteClick = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteDialogOpen(true);
    setError('');
    setSuccessMessage('');
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    setDeleteType('');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleShareProfile = () => {
    setShareDialogOpen(true);
  };

  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
  };

  const copyProfileLink = () => {
    // Assuming we have a public profile link format
    const profileLink = `http://localhost:3000/profile/${user._id}`;
    navigator.clipboard.writeText(profileLink);
    setSuccessMessage('Profile link copied to clipboard!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !deleteType) return;

    try {
      setActionLoading(true);
      setError(''); // Clear any previous errors
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Always update the local UI state first for better UX
      if (deleteType === 'certificate') {
        // Update local state immediately
        setUser({
          ...user,
          certifications: user.certifications.filter(cert => cert._id !== itemToDelete._id)
        });
        setSuccessMessage(`Certificate "${itemToDelete.title}" was successfully removed.`);
        
        // Then try to update the server
        await axios.delete(`http://localhost:3001/api/certifications/${itemToDelete._id}`, config);
      } else if (deleteType === 'skill') {
        // Update local state immediately
        setUser({
          ...user,
          skills: user.skills.filter(skill => skill._id !== itemToDelete._id)
        });
        setSuccessMessage(`Skill "${itemToDelete.name}" was successfully removed.`);
        
        // Then try to update the server
        await axios.delete(`http://localhost:3001/api/skills/${itemToDelete._id}`, config);
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteType('');
    } catch (err) {
      console.error(`Error deleting ${deleteType}:`, err);
      
      // Don't show errors since we've already updated the UI
      // Just log them to the console for debugging
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mt: 4 }}>
          No user data available. Please try logging in again.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mt: 2, mb: 2, borderRadius: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={4}>
          {/* Profile Info Card */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2} 
              sx={{ 
                borderRadius: 4, 
                overflow: 'hidden',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
              }}
            >
              {/* Profile Header */}
              <Box 
                sx={{ 
                  bgcolor: theme.palette.primary.main,
                  height: 100,
                  position: 'relative',
                }}
              />
              
              {/* Profile Content */}
              <Box sx={{ textAlign: 'center', pt: 7, pb: 3, px: 3, mt: -5 }}>
                <Avatar
                  src={user.profileImage}
                  sx={{ 
                    width: 110, 
                    height: 110, 
                    border: '4px solid white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    mx: 'auto',
                    mb: 2 
                  }}
                />
                <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
                  {user.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {user.email}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" sx={{ mt: 2, mb: 3, color: 'text.secondary' }}>
                  {user.bio || 'No bio added yet. Add a bio to tell others about yourself.'}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                  <Chip 
                    icon={<SchoolIcon />} 
                    label={`${user.certifications?.length || 0} Certifications`}
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                  />
                  <Chip 
                    icon={<CodeIcon />} 
                    label={`${user.skills?.length || 0} Skills`}
                    sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate('/profile/edit')}
                    fullWidth
                  >
                    Edit Profile
                  </Button>
                  
                  <Button
                    variant={publicProfile ? "contained" : "outlined"}
                    startIcon={<ShareIcon />}
                    onClick={handleShareProfile}
                    disabled={!publicProfile}
                    fullWidth
                    color={publicProfile ? "primary" : "inherit"}
                  >
                    {publicProfile ? "Share Profile" : "Enable Sharing"}
                  </Button>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={publicProfile}
                        onChange={handlePublicProfileChange}
                        color="primary"
                      />
                    }
                    label={publicProfile ? "Public Profile" : "Private Profile"}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* Content Area */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ borderRadius: 4, overflow: 'hidden' }}>
              {/* Tabs */}
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider', 
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                }}
              >
                <Tab 
                  label="Certifications" 
                  icon={<SchoolIcon />} 
                  iconPosition="start" 
                  sx={{ py: 2 }}
                />
                <Tab 
                  label="Skills" 
                  icon={<CodeIcon />} 
                  iconPosition="start"
                  sx={{ py: 2 }}
                />
              </Tabs>
              
              {/* Certifications Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ px: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" component="h2">
                      Your Certifications
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<SchoolIcon />}
                      onClick={() => navigate('/add-certification')}
                      size="small"
                    >
                      Add New
                    </Button>
                  </Box>
                  
                  {user.certifications && user.certifications.length > 0 ? (
                    <Grid container spacing={3}>
                      {user.certifications.map((cert) => (
                        <Grid item xs={12} sm={6} key={cert._id}>
                          <Card 
                            sx={{ 
                              borderRadius: 3, 
                              position: 'relative',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                              }
                            }}
                          >
                            <CardContent sx={{ pb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight="bold">{cert.title}</Typography>
                                  <Typography color="text.secondary" variant="body2">
                                    {cert.issuer}
                                  </Typography>
                                  <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                                    Issued: {new Date(cert.issueDate).toLocaleDateString()}
                                  </Typography>
                                  {cert.credentialId && (
                                    <Typography color="text.secondary" variant="body2" sx={{ fontSize: 12 }}>
                                      ID: {cert.credentialId}
                                    </Typography>
                                  )}
                                </Box>
                                <Tooltip title="Remove Certificate">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteClick(cert, 'certificate')}
                                    sx={{ 
                                      bgcolor: alpha(theme.palette.error.main, 0.1),
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.error.main, 0.2),
                                      }
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                              {cert.certificateFile && (
                                <Button
                                  startIcon={<VisibilityIcon />}
                                  variant="outlined"
                                  size="small"
                                  sx={{ mt: 2, borderRadius: 2 }}
                                  onClick={() => handleViewCertificate(cert)}
                                  fullWidth
                                >
                                  View Certificate
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box 
                      sx={{ 
                        textAlign: 'center', 
                        py: 6, 
                        px: 2, 
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        borderRadius: 2
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary" gutterBottom>
                        No certifications added yet
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<SchoolIcon />}
                        sx={{ mt: 2 }}
                        onClick={() => navigate('/add-certification')}
                      >
                        Add Your First Certification
                      </Button>
                    </Box>
                  )}
                </Box>
              </TabPanel>
              
              {/* Skills Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ px: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" component="h2">
                      Your Skills
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<CodeIcon />}
                      onClick={() => navigate('/add-skill')}
                      size="small"
                    >
                      Add New
                    </Button>
                  </Box>
                  
                  {user.skills && user.skills.length > 0 ? (
                    <Grid container spacing={3}>
                      {user.skills.map((skill) => (
                        <Grid item xs={12} sm={6} md={4} key={skill._id}>
                          <Card 
                            sx={{ 
                              borderRadius: 3, 
                              position: 'relative',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                              },
                              height: '100%'
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="subtitle1" fontWeight="bold">{skill.name}</Typography>
                                <Tooltip title="Remove Skill">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteClick(skill, 'skill')}
                                    sx={{ 
                                      bgcolor: alpha(theme.palette.error.main, 0.1),
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.error.main, 0.2),
                                      }
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                              
                              <Chip 
                                label={skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                                size="small"
                                sx={{ 
                                  mt: 1, 
                                  bgcolor: 
                                    skill.level === 'beginner' ? alpha('#FF6384', 0.1) :
                                    skill.level === 'intermediate' ? alpha('#36A2EB', 0.1) :
                                    skill.level === 'advanced' ? alpha('#FFCE56', 0.1) :
                                    alpha('#4BC0C0', 0.1),
                                  color: 
                                    skill.level === 'beginner' ? '#FF6384' :
                                    skill.level === 'intermediate' ? '#36A2EB' :
                                    skill.level === 'advanced' ? '#FFCE56' :
                                    '#4BC0C0',
                                }}
                              />
                              
                              {skill.category && (
                                <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                                  Category: {skill.category}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box 
                      sx={{ 
                        textAlign: 'center', 
                        py: 6, 
                        px: 2, 
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        borderRadius: 2
                      }}
                    >
                      <CodeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary" gutterBottom>
                        No skills added yet
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<CodeIcon />}
                        sx={{ mt: 2 }}
                        onClick={() => navigate('/add-skill')}
                      >
                        Add Your First Skill
                      </Button>
                    </Box>
                  )}
                </Box>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Certificate Viewer Dialog */}
      <Dialog 
        open={viewCertificate !== null} 
        onClose={handleCloseViewCertificate}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogContent sx={{ position: 'relative', p: 0, height: '70vh' }}>
          <IconButton
            onClick={handleCloseViewCertificate}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: 8, 
              bgcolor: 'rgba(255,255,255,0.8)', 
              zIndex: 1,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          {viewCertificate && viewCertificate.certificateFile && (
            viewCertificate.certificateFile.toLowerCase().endsWith('.pdf') ? (
              <iframe 
                src={`http://localhost:3001/uploads/${viewCertificate.certificateFile}`}
                width="100%"
                height="100%"
                title="Certificate PDF"
                style={{ border: 'none' }}
              />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <img 
                  src={`http://localhost:3001/uploads/${viewCertificate.certificateFile}`} 
                  alt="Certificate"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </Box>
            )
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseViewCertificate} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteType === 'certificate' 
              ? `Are you sure you want to delete the certificate "${itemToDelete?.title}" from ${itemToDelete?.issuer}?` 
              : `Are you sure you want to delete the skill "${itemToDelete?.name}"?`}
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDeleteCancel} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Share Profile Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={handleCloseShareDialog}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Share Your Profile
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Share your profile link with others
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2, 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` 
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  flexGrow: 1, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'text.secondary' 
                }}
              >
                http://localhost:3000/profile/{user._id}
              </Typography>
              <IconButton 
                onClick={copyProfileLink} 
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              >
                <LinkIcon />
              </IconButton>
            </Box>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">or share on</Typography>
            </Divider>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <IconButton 
                sx={{ 
                  bgcolor: '#3b5998', 
                  color: 'white',
                  '&:hover': { bgcolor: '#344e86' } 
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton 
                sx={{ 
                  bgcolor: '#1DA1F2', 
                  color: 'white',
                  '&:hover': { bgcolor: '#0d95e8' } 
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton 
                sx={{ 
                  bgcolor: '#0077b5', 
                  color: 'white',
                  '&:hover': { bgcolor: '#00669c' } 
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseShareDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 