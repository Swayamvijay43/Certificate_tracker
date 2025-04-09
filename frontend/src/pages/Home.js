import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import {
  School as SchoolIcon,
  Code as CodeIcon,
  Timeline as TimelineIcon,
  VerifiedUser as VerifiedUserIcon,
  Share as ShareIcon,
  InsertChart as InsertChartIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionCard = motion(Card);

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #2193b0, #6dd5ed)',
      minHeight: '100vh',
      pb: 8
    }}>
      <Container maxWidth="lg">
        <MotionBox 
          component="header" 
          sx={{ 
            textAlign: 'center', 
            py: { xs: 8, md: 12 },
            color: 'white'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <MotionTypography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
              mb: 2
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Skill & Certification Tracker
          </MotionTypography>
          <MotionTypography 
            variant="h5" 
            sx={{ 
              mb: 4, 
              fontWeight: 300,
              maxWidth: '800px',
              mx: 'auto',
              textShadow: '0 1px 5px rgba(0,0,0,0.1)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Track, showcase, and share your skills and certifications in one place
          </MotionTypography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: '#2193b0',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  }
                }}
              >
                GET STARTED
              </Button>
            </MotionBox>
            <MotionBox
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                size="large"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white',
                    borderWidth: 2,
                  }
                }}
              >
                SIGN IN
              </Button>
            </MotionBox>
          </Box>
        </MotionBox>

        <MotionBox 
          component={Paper} 
          elevation={8}
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            mb: 8,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '5px',
              background: 'linear-gradient(90deg, #ff9966, #ff5e62)',
            }
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: 'white' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#2193b0', mb: 4 }}>
              Why Use Our Platform?
            </Typography>
            
            <Grid container spacing={4} component={motion.div} variants={staggerContainer} initial="initial" animate="animate">
              <Grid item xs={12} md={4}>
                <MotionCard 
                  elevation={2} 
                  sx={{ height: '100%', borderRadius: 3 }}
                  variants={fadeIn}
                  whileHover={{ y: -10, boxShadow: '0 12px 20px rgba(0,0,0,0.1)' }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <SchoolIcon sx={{ fontSize: 40, color: '#2193b0' }} />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      Certificate Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Store and organize all your certificates in one place. Upload files, add details, and never worry about losing important credentials again.
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <MotionCard 
                  elevation={2} 
                  sx={{ height: '100%', borderRadius: 3 }}
                  variants={fadeIn}
                  whileHover={{ y: -10, boxShadow: '0 12px 20px rgba(0,0,0,0.1)' }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <CodeIcon sx={{ fontSize: 40, color: '#2193b0' }} />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      Skill Tracking
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track your professional and personal skills. Categorize them, set proficiency levels, and visualize your growth over time.
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <MotionCard 
                  elevation={2} 
                  sx={{ height: '100%', borderRadius: 3 }}
                  variants={fadeIn}
                  whileHover={{ y: -10, boxShadow: '0 12px 20px rgba(0,0,0,0.1)' }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <VerifiedUserIcon sx={{ fontSize: 40, color: '#2193b0' }} />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      AI Certificate Verification
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Our platform uses AI to verify and extract information from your certificates automatically, saving you time and ensuring accuracy.
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <MotionCard 
                  elevation={2} 
                  sx={{ height: '100%', borderRadius: 3 }}
                  variants={fadeIn}
                  whileHover={{ y: -10, boxShadow: '0 12px 20px rgba(0,0,0,0.1)' }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <ShareIcon sx={{ fontSize: 40, color: '#2193b0' }} />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      Profile Sharing
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create a public profile to showcase your skills and certifications to employers, colleagues, or friends through a custom link.
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <MotionCard 
                  elevation={2} 
                  sx={{ height: '100%', borderRadius: 3 }}
                  variants={fadeIn}
                  whileHover={{ y: -10, boxShadow: '0 12px 20px rgba(0,0,0,0.1)' }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <InsertChartIcon sx={{ fontSize: 40, color: '#2193b0' }} />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      Visual Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get insights into your skill distribution and certification progress with interactive charts and visualization tools.
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <MotionCard 
                  elevation={2} 
                  sx={{ height: '100%', borderRadius: 3 }}
                  variants={fadeIn}
                  whileHover={{ y: -10, boxShadow: '0 12px 20px rgba(0,0,0,0.1)' }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <TimelineIcon sx={{ fontSize: 40, color: '#2193b0' }} />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      Career Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track your professional journey over time. See how far you've come and plan where you want to go next in your career.
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
            </Grid>
          </Box>
        </MotionBox>
        
        <MotionBox
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#2193b0' }}>
            Ready to Organize Your Professional Journey?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
            Join thousands of professionals who use our platform to track, organize, and showcase their skills and certifications.
          </Typography>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#2193b0',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              '&:hover': {
                bgcolor: '#1a7a8c',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              }
            }}
          >
            Start Your Free Account
          </Button>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Home; 