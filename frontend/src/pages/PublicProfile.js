import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  School as SchoolIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';

const PublicProfile = () => {
  const { profileUrl } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewCertificate, setViewCertificate] = useState(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const res = await axios.get(`/api/users/public/${profileUrl}`);
        setUser(res.data);
      } catch (err) {
        setError('Profile not found or not public');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [profileUrl]);

  const handleViewCertificate = (cert) => {
    setViewCertificate(cert);
  };

  const handleCloseViewCertificate = () => {
    setViewCertificate(null);
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

  if (error || !user) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  src={user.profileImage}
                  sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto 20px',
                  }}
                />
                <Typography variant="h5" gutterBottom>
                  {user.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {user.bio || 'No bio added yet'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SchoolIcon sx={{ mr: 1 }} />
                  Certifications
                </Typography>
                {user.certifications?.length > 0 ? (
                  user.certifications.map((cert) => (
                    <Box key={cert._id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                      <Typography variant="subtitle1">{cert.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cert.issuer} • {new Date(cert.issueDate).toLocaleDateString()}
                      </Typography>
                      {cert.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {cert.description}
                        </Typography>
                      )}
                      {cert.certificateFile && (
                        <Button
                          startIcon={<VisibilityIcon />}
                          variant="outlined"
                          size="small"
                          sx={{ mt: 1 }}
                          onClick={() => handleViewCertificate(cert)}
                        >
                          View Certificate
                        </Button>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No certifications added yet
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CodeIcon sx={{ mr: 1 }} />
                  Skills
                </Typography>
                {user.skills?.length > 0 ? (
                  user.skills.map((skill) => (
                    <Box key={skill._id} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">{skill.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {skill.category} • {skill.level}
                      </Typography>
                      {skill.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {skill.description}
                        </Typography>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No skills added yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Certificate Viewer Dialog */}
      <Dialog 
        open={viewCertificate !== null} 
        onClose={handleCloseViewCertificate}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ position: 'relative', p: 0, height: '70vh' }}>
          <IconButton
            onClick={handleCloseViewCertificate}
            sx={{ position: 'absolute', right: 8, top: 8, bgcolor: 'rgba(255,255,255,0.7)', zIndex: 1 }}
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
        <DialogActions>
          <Button onClick={handleCloseViewCertificate}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PublicProfile; 