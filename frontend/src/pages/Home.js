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
} from '@mui/material';
import {
  School as SchoolIcon,
  Code as CodeIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

const Home = () => {
  return (
    <Container>
      <Box
        sx={{
          mt: 8,
          mb: 8,
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Skill & Certification Tracker
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Track, showcase, and share your skills and certifications in one place
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            sx={{ mr: 2 }}
          >
            Get Started
          </Button>
          <Button
            component={RouterLink}
            to="/login"
            variant="outlined"
            size="large"
          >
            Sign In
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Track Certifications
              </Typography>
              <Typography color="text.secondary">
                Keep all your certifications organized in one place. Add details,
                upload certificates, and track expiration dates.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CodeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Showcase Skills
              </Typography>
              <Typography color="text.secondary">
                Document your skills with levels and categories. Visualize your
                progress with interactive charts.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ShareIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Share Profile
              </Typography>
              <Typography color="text.secondary">
                Create a public profile to share with recruiters, faculty, or
                potential employers.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 