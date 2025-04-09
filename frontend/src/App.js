import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import PublicProfile from './pages/PublicProfile';
import AddCertification from './pages/AddCertification';
import AddSkill from './pages/AddSkill';
import SearchProfiles from './pages/SearchProfiles';
import ProfileComparison from './pages/ProfileComparison';
import ResumeGenerator from './pages/ResumeGenerator';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/:profileUrl" element={<PublicProfile />} />
            <Route path="/add-certification" element={<AddCertification />} />
            <Route path="/add-skill" element={<AddSkill />} />
            <Route path="/search-profiles" element={<SearchProfiles />} />
            <Route path="/compare-profiles/:profileIds" element={<ProfileComparison />} />
            <Route path="/resume-generator" element={<ResumeGenerator />} />
          </Routes>
        </Container>
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;
