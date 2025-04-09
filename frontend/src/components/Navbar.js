import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  AddCircle,
  ExitToApp,
  Search,
  CompareArrows,
} from '@mui/icons-material';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const token = localStorage.getItem('token');

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    handleClose();
  };

  const handleSearchOpen = () => {
    setSearchOpen(true);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedProfiles([]);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/users/search?q=${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = (profile) => {
    if (selectedProfiles.find(p => p._id === profile._id)) {
      setSelectedProfiles(selectedProfiles.filter(p => p._id !== profile._id));
    } else {
      if (selectedProfiles.length < 2) {
        setSelectedProfiles([...selectedProfiles, profile]);
      }
    }
  };

  const handleCompare = () => {
    if (selectedProfiles.length === 2) {
      const profileIds = selectedProfiles.map(p => p._id).join(',');
      navigate(`/compare-profiles/${profileIds}`);
      handleSearchClose();
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          Skill Tracker
        </Typography>

        {token ? (
          <Box>
            <Button
              color="inherit"
              component={RouterLink}
              to="/dashboard"
              startIcon={<Dashboard />}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/add-certification"
              startIcon={<AddCircle />}
            >
              Add Certification
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/add-skill"
              startIcon={<AddCircle />}
            >
              Add Skill
            </Button>
            <Button
              color="inherit"
              onClick={handleSearchOpen}
              startIcon={<Search />}
            >
              Search Profiles
            </Button>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                Profile
              </MenuItem>
              <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                Dashboard
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
            >
              Login
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/register"
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onClose={handleSearchClose} maxWidth="md" fullWidth>
        <DialogTitle>Search Profiles</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search by name or email"
            type="text"
            fullWidth
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch}>
                    <Search />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {loading ? (
            <Typography sx={{ mt: 2 }}>Searching...</Typography>
          ) : (
            <>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                {searchResults.length > 0 
                  ? `Found ${searchResults.length} profiles` 
                  : 'No profiles found'}
              </Typography>
              
              <List>
                {searchResults.map((profile) => (
                  <React.Fragment key={profile._id}>
                    <ListItem 
                      button 
                      onClick={() => handleProfileSelect(profile)}
                      selected={selectedProfiles.some(p => p._id === profile._id)}
                    >
                      <ListItemAvatar>
                        <Avatar>{profile.name.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={profile.name} 
                        secondary={profile.email} 
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSearchClose}>Cancel</Button>
          <Button 
            onClick={handleCompare} 
            disabled={selectedProfiles.length !== 2}
            startIcon={<CompareArrows />}
            color="primary"
          >
            Compare Profiles
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar; 