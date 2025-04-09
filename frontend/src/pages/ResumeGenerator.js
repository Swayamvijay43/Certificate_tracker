import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack,
} from '@mui/material';
import { motion } from 'framer-motion';
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import axios from 'axios';

const ResumeGenerator = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const [resumeTemplate, setResumeTemplate] = useState('professional');
  const [resumeData, setResumeData] = useState({
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    includeEducation: true,
    includeWorkExperience: true,
    workExperience: [{ 
      title: '', 
      company: '', 
      startDate: '', 
      endDate: '', 
      description: '' 
    }],
    education: [{ 
      degree: '', 
      institution: '', 
      graduationDate: '', 
      description: '' 
    }]
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [resumeHtml, setResumeHtml] = useState('');

  // Helper function to detect test/placeholder data
  const isPlaceholderText = (text) => {
    if (!text || typeof text !== 'string') return true;
    
    // Patterns that indicate test data - enhanced to catch the specific test entries
    const testPatterns = [
      /^test\d*$/i,                // exactly "test" or "test123" etc.
      /placeholder/i,              // contains "placeholder"
      /^[a-z]{1,3}$/i,             // just 1-3 random letters
      /^x[a-z]{3,6}[fh]{2,4}$/i,   // specific pattern for test data
      /^gf+h+$/i,                  // pattern like "gffhhh"
      /^[^a-zA-Z0-9\s]{2,}$/,      // mostly special characters
      /^xhdhfhd/i,                 // specific test pattern seen in your data
      /^dsdcs/i,                   // specific test pattern seen in your data
      /^gfth/i,                    // specific test pattern seen in your data
      /\([a-z]{4,5}\)$/i           // ends with pattern like "(hqgfn)"
    ];
    
    return testPatterns.some(pattern => pattern.test(text));
  };

  // Updated useEffect to also fetch profile data if no skills or certifications are found
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // User profile to pre-fill basic info
        const profileResponse = await axios.get('http://localhost:3001/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Pre-fill form with user data
        if (profileResponse.data) {
          setResumeData(prev => ({
            ...prev,
            fullName: profileResponse.data.name || '',
            email: profileResponse.data.email || '',
            phone: profileResponse.data.phone || '',
            location: profileResponse.data.location || '',
            title: profileResponse.data.title || '',
          }));
        }

        // Get the user's skills
        const skillsResponse = await axios.get('http://localhost:3001/api/skills', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Get the user's certifications
        const certificationsResponse = await axios.get('http://localhost:3001/api/certifications', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Specific filter for test data seen in your screenshots
        const specificExclusions = ['xhdhfhd', 'dsdcs', 'gfth'];
        
        // Basic validation for skills (less aggressive filtering)
        const filteredSkills = skillsResponse.data
          .filter(skill => skill && skill.name && skill.level)
          .filter(skill => skill.name.length > 1 && !isPlaceholderText(skill.name))
          .filter(skill => !specificExclusions.some(term => 
            skill.name.toLowerCase().includes(term.toLowerCase())));
        
        // Basic validation for certifications (less aggressive filtering)
        const filteredCertifications = certificationsResponse.data
          .filter(cert => cert && cert.title && cert.issuer)
          .filter(cert => cert.title.length > 3 && !isPlaceholderText(cert.title))
          .filter(cert => !specificExclusions.some(term => 
            (cert.title && cert.title.toLowerCase().includes(term.toLowerCase())) || 
            (cert.issuer && cert.issuer.toLowerCase().includes(term.toLowerCase()))));

        console.log("Filtered skills:", filteredSkills);
        console.log("Filtered certifications:", filteredCertifications);

        setSkills(filteredSkills);
        setCertifications(filteredCertifications);
        
        // If no skills or certs are found, try to get from profile
        if (filteredSkills.length === 0 || filteredCertifications.length === 0) {
          console.log("Getting skills/certs from profile...");
          if (profileResponse.data.skills && profileResponse.data.skills.length > 0) {
            setSkills(prevSkills => 
              prevSkills.length > 0 ? prevSkills : profileResponse.data.skills
                .filter(skill => !specificExclusions.some(term => 
                  skill.name.toLowerCase().includes(term.toLowerCase())))
            );
          }
          
          if (profileResponse.data.certifications && profileResponse.data.certifications.length > 0) {
            setCertifications(prevCerts => 
              prevCerts.length > 0 ? prevCerts : profileResponse.data.certifications
                .filter(cert => !specificExclusions.some(term => 
                  (cert.title && cert.title.toLowerCase().includes(term.toLowerCase())) || 
                  (cert.issuer && cert.issuer.toLowerCase().includes(term.toLowerCase()))))
            );
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your skills and certifications. Please try again.');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResumeData({ ...resumeData, [name]: value });
  };

  const handleSkillToggle = (skillId) => {
    setSelectedSkills(prevSelected => 
      prevSelected.includes(skillId)
        ? prevSelected.filter(id => id !== skillId)
        : [...prevSelected, skillId]
    );
  };

  const handleCertificationToggle = (certId) => {
    setSelectedCertifications(prevSelected => 
      prevSelected.includes(certId)
        ? prevSelected.filter(id => id !== certId)
        : [...prevSelected, certId]
    );
  };

  const handleAddWorkExperience = () => {
    setResumeData({
      ...resumeData,
      workExperience: [
        ...resumeData.workExperience,
        { title: '', company: '', startDate: '', endDate: '', description: '' }
      ]
    });
  };

  const handleRemoveWorkExperience = (index) => {
    const updatedWorkExperience = [...resumeData.workExperience];
    updatedWorkExperience.splice(index, 1);
    setResumeData({
      ...resumeData,
      workExperience: updatedWorkExperience
    });
  };

  const handleWorkExperienceChange = (index, field, value) => {
    const updatedWorkExperience = [...resumeData.workExperience];
    updatedWorkExperience[index][field] = value;
    setResumeData({
      ...resumeData,
      workExperience: updatedWorkExperience
    });
  };

  const handleAddEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        { degree: '', institution: '', graduationDate: '', description: '' }
      ]
    });
  };

  const handleRemoveEducation = (index) => {
    const updatedEducation = [...resumeData.education];
    updatedEducation.splice(index, 1);
    setResumeData({
      ...resumeData,
      education: updatedEducation
    });
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...resumeData.education];
    updatedEducation[index][field] = value;
    setResumeData({
      ...resumeData,
      education: updatedEducation
    });
  };

  const generateResume = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (selectedSkills.length === 0 && selectedCertifications.length === 0) {
        setError('Please select at least one skill or certification to include in your resume.');
        setLoading(false);
        return;
      }

      // Prepare data for resume generation
      const resumeRequestData = {
        ...resumeData,
        skills: selectedSkills.map(id => {
          const skill = skills.find(skill => skill._id === id);
          console.log("Selected skill:", skill);
          return skill;
        }).filter(Boolean),
        certifications: selectedCertifications.map(id => {
          const cert = certifications.find(cert => cert._id === id);
          console.log("Selected certification:", cert);
          return cert;
        }).filter(Boolean),
        template: resumeTemplate
      };

      console.log("Sending resume data to backend:", JSON.stringify(resumeRequestData, null, 2));

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/api/resume/generate',
        resumeRequestData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Resume generation response:", response.data);

      if (response.data && response.data.resumeHtml) {
        setResumeHtml(response.data.resumeHtml);
        setPreviewMode(true);
        setSuccess('Resume generated successfully!');
      } else {
        throw new Error('No resume HTML returned from server');
      }
    } catch (err) {
      console.error('Error generating resume:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = () => {
    const blob = new Blob([resumeHtml], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const previewVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Resume Generator
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Create a professional resume highlighting your skills and certifications
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {!previewMode ? (
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Box component="form">
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={resumeData.fullName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Professional Title"
                    name="title"
                    value={resumeData.title}
                    onChange={handleChange}
                    placeholder="e.g., Software Engineer, Data Scientist"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={resumeData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={resumeData.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={resumeData.location}
                    onChange={handleChange}
                    placeholder="City, State, Country"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Professional Summary"
                    name="summary"
                    value={resumeData.summary}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Brief summary of your professional background and key strengths"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Skills
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select the skills you want to include in your resume
                </Typography>
                <Grid container spacing={1}>
                  {skills.length > 0 ? (
                    skills
                      .filter(skill => skill && skill.name && skill.level)
                      .filter((skill, index, self) => 
                        index === self.findIndex(s => s.name === skill.name)
                      )
                      .map((skill) => (
                        <Grid item key={skill._id}>
                          <Chip
                            label={`${skill.name} (${skill.level})`}
                            onClick={() => handleSkillToggle(skill._id)}
                            color={selectedSkills.includes(skill._id) ? "primary" : "default"}
                            variant={selectedSkills.includes(skill._id) ? "filled" : "outlined"}
                          />
                        </Grid>
                      ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        No skills found. Add skills from your dashboard first.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Certifications
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select the certifications you want to include in your resume
                </Typography>
                <Grid container spacing={1}>
                  {certifications.length > 0 ? (
                    certifications
                      .filter(cert => cert && cert.title && cert.issuer)
                      .filter(cert => !isPlaceholderText(cert.title) && !isPlaceholderText(cert.issuer))
                      .filter(cert => !['xhdhfhd', 'dsdcs', 'gfth'].some(term => 
                        (cert.title && cert.title.toLowerCase().includes(term.toLowerCase())) || 
                        (cert.issuer && cert.issuer.toLowerCase().includes(term.toLowerCase()))))
                      .filter((cert, index, self) => 
                        index === self.findIndex(c => c.title === cert.title && c.issuer === cert.issuer)
                      )
                      .map((cert) => (
                        <Grid item xs={12} key={cert._id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedCertifications.includes(cert._id)}
                                onChange={() => handleCertificationToggle(cert._id)}
                              />
                            }
                            label={`${cert.title} (${cert.issuer})`}
                          />
                        </Grid>
                      ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        No certifications found. Add certifications from your dashboard first.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Work Experience
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={resumeData.includeWorkExperience}
                      onChange={(e) => setResumeData({...resumeData, includeWorkExperience: e.target.checked})}
                    />
                  }
                  label="Include work experience in resume"
                />
                
                {resumeData.includeWorkExperience && (
                  <>
                    {resumeData.workExperience.map((job, index) => (
                      <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle1">
                              Position {index + 1}
                              {index > 0 && (
                                <Button 
                                  color="error" 
                                  size="small" 
                                  onClick={() => handleRemoveWorkExperience(index)}
                                  sx={{ ml: 2 }}
                                >
                                  Remove
                                </Button>
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Job Title"
                              value={job.title}
                              onChange={(e) => handleWorkExperienceChange(index, 'title', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Company"
                              value={job.company}
                              onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Start Date"
                              value={job.startDate}
                              onChange={(e) => handleWorkExperienceChange(index, 'startDate', e.target.value)}
                              placeholder="MM/YYYY"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="End Date"
                              value={job.endDate}
                              onChange={(e) => handleWorkExperienceChange(index, 'endDate', e.target.value)}
                              placeholder="MM/YYYY or Present"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Description"
                              value={job.description}
                              onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                              multiline
                              rows={3}
                              placeholder="Describe your responsibilities and achievements"
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                    <Button 
                      variant="outlined" 
                      startIcon={<WorkIcon />}
                      onClick={handleAddWorkExperience}
                      sx={{ mt: 1 }}
                    >
                      Add Work Experience
                    </Button>
                  </>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Education
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={resumeData.includeEducation}
                      onChange={(e) => setResumeData({...resumeData, includeEducation: e.target.checked})}
                    />
                  }
                  label="Include education in resume"
                />
                
                {resumeData.includeEducation && (
                  <>
                    {resumeData.education.map((edu, index) => (
                      <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle1">
                              Education {index + 1}
                              {index > 0 && (
                                <Button 
                                  color="error" 
                                  size="small" 
                                  onClick={() => handleRemoveEducation(index)}
                                  sx={{ ml: 2 }}
                                >
                                  Remove
                                </Button>
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Degree/Program"
                              value={edu.degree}
                              onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Institution"
                              value={edu.institution}
                              onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Graduation Date"
                              value={edu.graduationDate}
                              onChange={(e) => handleEducationChange(index, 'graduationDate', e.target.value)}
                              placeholder="MM/YYYY"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Description"
                              value={edu.description}
                              onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                              multiline
                              rows={2}
                              placeholder="Add relevant details about your education"
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                    <Button 
                      variant="outlined" 
                      startIcon={<SchoolIcon />}
                      onClick={handleAddEducation}
                      sx={{ mt: 1 }}
                    >
                      Add Education
                    </Button>
                  </>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Resume Template
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Template Style</InputLabel>
                  <Select
                    value={resumeTemplate}
                    onChange={(e) => setResumeTemplate(e.target.value)}
                    label="Template Style"
                  >
                    <MenuItem value="professional">Professional</MenuItem>
                    <MenuItem value="modern">Modern</MenuItem>
                    <MenuItem value="creative">Creative</MenuItem>
                    <MenuItem value="minimalist">Minimalist</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<DescriptionIcon />}
                  onClick={generateResume}
                  disabled={loading}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Generate Resume'}
                </Button>
              </Box>
            </Box>
          </Paper>
        ) : (
          <motion.div
            variants={previewVariants}
            initial="hidden"
            animate="visible"
          >
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => setPreviewMode(false)}
              >
                Edit Resume
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={downloadResume}
                startIcon={<DescriptionIcon />}
              >
                Download Resume
              </Button>
            </Box>
            
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Resume Preview
              </Typography>
              <Box 
                component="iframe"
                srcDoc={resumeHtml}
                sx={{ 
                  width: '100%', 
                  height: '800px', 
                  border: '1px solid #eee',
                  bgcolor: 'white'
                }}
                title="Resume Preview"
              />
            </Paper>
          </motion.div>
        )}
      </motion.div>
    </Container>
  );
};

export default ResumeGenerator; 