import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  IconButton,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Please log in to view your dashboard');
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

  const skillLevels = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0,
  };

  if (user?.skills) {
    user.skills.forEach((skill) => {
      if (skill.level) {
        skillLevels[skill.level.toLowerCase()]++;
      }
    });
  }

  const chartData = {
    labels: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    datasets: [
      {
        data: [
          skillLevels.beginner,
          skillLevels.intermediate,
          skillLevels.advanced,
          skillLevels.expert,
        ],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
    },
    maintainAspectRatio: false,
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
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: alpha(theme.palette.primary.light, 0.3),
            zIndex: 0,
          }}
        />
        <Box 
          sx={{
            position: 'absolute',
            bottom: '-30%',
            left: '10%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: alpha(theme.palette.primary.light, 0.2),
            zIndex: 0,
          }}
        />
        <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome, {user.name}!
            </Typography>
            <Typography variant="subtitle1">
              Track and showcase your skills and certifications
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/profile')}
              startIcon={<PersonIcon />}
              sx={{
                bgcolor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.common.white, 0.9),
                },
                borderRadius: 2,
                px: 3,
              }}
            >
              View Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 20px rgba(0,0,0,0.12)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#FF6384', mr: 2 }}>
                    <SchoolIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Certifications
                  </Typography>
                </Box>
                <IconButton 
                  component={RouterLink} 
                  to="/add-certification" 
                  color="primary"
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              
              <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                {user.certifications?.length || 0}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Total Certifications
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Button
                component={RouterLink}
                to="/profile"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 'medium',
                  mt: 1
                }}
              >
                View All Certifications
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 20px rgba(0,0,0,0.12)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#36A2EB', mr: 2 }}>
                    <CodeIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Skills
                  </Typography>
                </Box>
                <IconButton 
                  component={RouterLink} 
                  to="/add-skill" 
                  color="primary"
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              
              <Typography variant="h3" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                {user.skills?.length || 0}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Total Skills
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Button
                component={RouterLink}
                to="/profile"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 'medium',
                  mt: 1
                }}
              >
                View All Skills
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 20px rgba(0,0,0,0.12)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#4BC0C0', mr: 2 }}>
                    <TimelineIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Progress
                  </Typography>
                </Box>
                <IconButton 
                  component={RouterLink} 
                  to="/search-profiles" 
                  color="primary"
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  <BadgeIcon />
                </IconButton>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user.publicProfile 
                  ? "Your profile is public and can be shared"
                  : "Make your profile public to share with others"}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Button
                component={RouterLink}
                to="/search-profiles"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 'medium',
                  mt: 1
                }}
              >
                Explore Other Profiles
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              mt: 2, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <Box 
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.05), 
                py: 2, 
                px: 3,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Typography variant="h6" fontWeight="medium">
                Skill Level Distribution
              </Typography>
            </Box>
            <CardContent>
              <Box 
                sx={{ 
                  height: 300, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  p: 2,
                }}
              >
                {user.skills?.length > 0 ? (
                  <Pie data={chartData} options={chartOptions} />
                ) : (
                  <Box textAlign="center" sx={{ p: 4 }}>
                    <CodeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">
                      Add skills to see your skill level distribution
                    </Typography>
                    <Button
                      variant="contained"
                      component={RouterLink}
                      to="/add-skill"
                      startIcon={<AddIcon />}
                      sx={{ mt: 2 }}
                    >
                      Add Your First Skill
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 