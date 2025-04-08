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
} from '@mui/material';
import {
  School as SchoolIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import axios from 'axios';

const PublicProfile = () => {
  const { profileUrl } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
                    <Box key={cert._id} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">{cert.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cert.issuer} • {new Date(cert.issueDate).toLocaleDateString()}
                      </Typography>
                      {cert.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {cert.description}
                        </Typography>
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
    </Container>
  );
};

export default PublicProfile; 