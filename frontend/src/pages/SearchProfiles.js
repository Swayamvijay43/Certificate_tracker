import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import api from '../utils/axiosConfig';

const SearchProfiles = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/profiles/search?query=${searchQuery}`);
      setProfiles(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = (profile) => {
    if (selectedProfiles.length < 2) {
      setSelectedProfiles([...selectedProfiles, profile]);
    }
  };

  const handleCompare = async () => {
    if (selectedProfiles.length !== 2) return;

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/profiles/compare', {
        userId1: selectedProfiles[0]._id,
        userId2: selectedProfiles[1]._id
      });
      setComparisonResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error comparing profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProfile = (index) => {
    setSelectedProfiles(selectedProfiles.filter((_, i) => i !== index));
    setComparisonResult(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Search and Compare Profiles
        </Typography>

        {/* Search Form */}
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search Profiles"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, skills, or certifications"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Selected Profiles */}
        {selectedProfiles.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Selected Profiles
            </Typography>
            <Grid container spacing={2}>
              {selectedProfiles.map((profile, index) => (
                <Grid item xs={12} md={6} key={profile._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{profile.name}</Typography>
                      <Typography color="textSecondary">
                        {profile.email}
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Skills"
                            secondary={profile.skills
                              .map((skill) => skill.name)
                              .join(', ')}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Certifications"
                            secondary={profile.certifications
                              .map((cert) => cert.title)
                              .join(', ')}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                    <CardActions>
                      <Button
                        color="error"
                        onClick={() => handleRemoveProfile(index)}
                      >
                        Remove
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {selectedProfiles.length === 2 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleCompare}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Compare Profiles'}
              </Button>
            )}
          </Box>
        )}

        {/* Search Results */}
        {profiles.length > 0 && !comparisonResult && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Search Results
            </Typography>
            <Grid container spacing={2}>
              {profiles.map((profile) => (
                <Grid item xs={12} md={6} key={profile._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{profile.name}</Typography>
                      <Typography color="textSecondary">
                        {profile.email}
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Skills"
                            secondary={profile.skills
                              .map((skill) => skill.name)
                              .join(', ')}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Certifications"
                            secondary={profile.certifications
                              .map((cert) => cert.title)
                              .join(', ')}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="contained"
                        onClick={() => handleProfileSelect(profile)}
                        disabled={selectedProfiles.length >= 2}
                      >
                        Select for Comparison
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Comparison Results */}
        {comparisonResult && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Comparison Results
            </Typography>

            {/* Common Skills */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Common Skills
              </Typography>
              <Grid container spacing={2}>
                {comparisonResult.analysis.commonSkills.map((skill, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">{skill.name}</Typography>
                        <Typography color="textSecondary">
                          Proficiency: {skill.proficiency}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Unique Skills */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Unique Skills
              </Typography>
              {comparisonResult.analysis.uniqueSkills.map((userSkills, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">
                    {userSkills.user === 'user1'
                      ? selectedProfiles[0].name
                      : selectedProfiles[1].name}
                  </Typography>
                  <Grid container spacing={2}>
                    {userSkills.skills.map((skill, skillIndex) => (
                      <Grid item xs={12} sm={6} md={4} key={skillIndex}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle1">
                              {skill.name}
                            </Typography>
                            <Typography color="textSecondary">
                              Proficiency: {skill.proficiency}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>

            {/* Recommendations */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              {comparisonResult.analysis.recommendations.skillGaps.map(
                (userGaps, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">
                      {userGaps.user === 'user1'
                        ? selectedProfiles[0].name
                        : selectedProfiles[1].name}
                    </Typography>
                    <List>
                      {userGaps.skills.map((gap, gapIndex) => (
                        <ListItem key={gapIndex}>
                          <ListItemText
                            primary={gap.skill}
                            secondary={`Suggested Certifications: ${gap.suggestedCertifications.join(
                              ', '
                            )}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )
              )}
            </Box>

            {/* Career Paths */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Suggested Career Paths
              </Typography>
              <Grid container spacing={2}>
                {comparisonResult.analysis.recommendations.careerPaths.map(
                  (path, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{path.path}</Typography>
                          <List>
                            <ListItem>
                              <ListItemText
                                primary="Required Skills"
                                secondary={path.requiredSkills.join(', ')}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Suggested Certifications"
                                secondary={path.suggestedCertifications.join(
                                  ', '
                                )}
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                )}
              </Grid>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default SearchProfiles; 