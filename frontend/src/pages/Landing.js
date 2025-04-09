import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Paper,
  Avatar,
  Fade,
  Zoom,
} from '@mui/material';
import {
  School as SchoolIcon,
  Code as CodeIcon,
  Share as ShareIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Define animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      title: 'Track Certifications',
      description: 'Keep all your certifications organized in one place. Add details, upload certificates, and track expiration dates.',
      color: theme.palette.primary.main,
      bgGradient: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
    },
    {
      icon: <CodeIcon sx={{ fontSize: 40 }} />,
      title: 'Showcase Skills',
      description: 'Document your skills with levels and categories. Visualize your progress with interactive charts.',
      color: theme.palette.secondary.main,
      bgGradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF000D 100%)',
    },
    {
      icon: <ShareIcon sx={{ fontSize: 40 }} />,
      title: 'Share Profile',
      description: 'Create a public profile to share with recruiters, faculty, or potential employers.',
      color: theme.palette.success.main,
      bgGradient: 'linear-gradient(135deg, #6BFF6B 0%, #00FF0D 100%)',
    },
    {
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      title: 'Track Progress',
      description: 'Monitor your skill development over time with detailed analytics and progress tracking.',
      color: theme.palette.info.main,
      bgGradient: 'linear-gradient(135deg, #6BFFFF 0%, #00FFFF 100%)',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure Storage',
      description: 'Your certificates and skills are securely stored and backed up in the cloud.',
      color: theme.palette.warning.main,
      bgGradient: 'linear-gradient(135deg, #FFD76B 0%, #FFB100 100%)',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: 'Smart Analytics',
      description: 'Get insights into your skill development and certification progress with AI-powered analytics.',
      color: theme.palette.error.main,
      bgGradient: 'linear-gradient(135deg, #FF6BE9 0%, #FF00D4 100%)',
    },
  ];

  const benefits = [
    'Organize all your certifications in one place',
    'Track skill development over time',
    'Create a professional portfolio',
    'Share your achievements with others',
    'Get insights into your progress',
    'Secure cloud storage for your documents',
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorations */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          width: '20rem',
          height: '20rem',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`,
          animation: `${float} 6s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '15rem',
          height: '15rem',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0)} 70%)`,
          animation: `${float} 8s ease-in-out infinite`,
        }}
      />

      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            pt: { xs: 8, md: 12 },
            pb: { xs: 6, md: 8 },
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '4rem' },
              letterSpacing: '-0.02em',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
              animation: `${fadeIn} 1s ease-out`,
            }}
          >
            Skill & Certification Tracker
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 6,
              maxWidth: '800px',
              mx: 'auto',
              color: alpha(theme.palette.text.primary, 0.7),
              lineHeight: 1.6,
              animation: `${fadeIn} 1s ease-out 0.2s both`,
            }}
          >
            Track, showcase, and share your skills and certifications in one place.
            Build your professional portfolio and stand out from the crowd.
          </Typography>
          <Box 
            sx={{ 
              '& > :not(style)': { m: 1 },
              animation: `${fadeIn} 1s ease-out 0.4s both`,
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                borderRadius: 3,
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                transition: 'all 0.3s ease',
              }}
              endIcon={<ArrowForwardIcon />}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                borderRadius: 3,
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>

        {/* Benefits Section */}
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Typography
            variant="h3"
            textAlign="center"
            sx={{
              mb: 6,
              fontWeight: 700,
              color: theme.palette.text.primary,
              animation: `${fadeIn} 1s ease-out`,
            }}
          >
            Why Choose Us?
          </Typography>
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in timeout={1000} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(8px)',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <CheckCircleIcon
                      sx={{
                        color: theme.palette.primary.main,
                        mr: 2,
                        animation: `${pulse} 2s infinite`,
                      }}
                    />
                    <Typography variant="body1">{benefit}</Typography>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: { xs: 6, md: 10 } }}>
          <Typography
            variant="h3"
            textAlign="center"
            sx={{
              mb: 8,
              fontWeight: 700,
              color: theme.palette.text.primary,
              animation: `${fadeIn} 1s ease-out`,
            }}
          >
            Features
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Zoom in timeout={1000} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Paper
                    elevation={0}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.3s ease-in-out',
                      background: 'white',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: theme.shadows[8],
                        '& .feature-icon': {
                          transform: 'scale(1.1)',
                        },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: 6,
                        background: feature.bgGradient,
                      }}
                    />
                    <CardContent sx={{ p: 4 }}>
                      <Avatar
                        className="feature-icon"
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: alpha(feature.color, 0.1),
                          color: feature.color,
                          mb: 3,
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography
                        variant="h5"
                        component="h3"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ lineHeight: 1.7 }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Paper>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            py: 4,
            textAlign: 'center',
            borderTop: 1,
            borderColor: 'divider',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Skill & Certification Tracker. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Landing; 