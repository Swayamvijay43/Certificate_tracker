import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  Box,
  Chip,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const SkillReviewDialog = ({
  open,
  onClose,
  extractedSkills,
  onConfirm,
  suggestedSkills,
  authenticity,
}) => {
  useEffect(() => {
    setSkills(extractedSkills.map(skill => ({
      ...skill,
      isEditing: false
    })));
  }, [extractedSkills]);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 'beginner',
    category: '',
  });

  const handleSkillEdit = (index, field, value) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value
    };
    setSkills(updatedSkills);
  };

  const handleSkillDelete = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
  };

  const handleAddNewSkill = () => {
    if (newSkill.name && newSkill.category) {
      setSkills([...skills, { ...newSkill, confidence: 1.0 }]);
      setNewSkill({
        name: '',
        level: 'beginner',
        category: '',
      });
    }
  };

  const handleConfirm = () => {
    onConfirm(skills);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Review Extracted Skills</DialogTitle>
      <DialogContent>
        {authenticity && (
          <Box sx={{ mb: 2 }}>
            <Alert 
              severity={authenticity.authenticity_score > 0.05 ? "success" : "warning"}
              sx={{ mb: 1 }}
            >
              Certificate Authenticity Score: {(authenticity.authenticity_score * 100).toFixed(1)}%
            </Alert>
            {authenticity.flags?.length > 0 && (
              <Alert severity="info">
                Flags: {authenticity.flags.join(', ')}
              </Alert>
            )}
          </Box>
        )}

        <Typography variant="subtitle1" gutterBottom>
          The following skills were extracted from your certificate. You can edit, delete, or add new skills before confirming.
        </Typography>

        <List>
          {skills.map((skill, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <>
                  <IconButton edge="end" onClick={() => handleSkillDelete(index)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      value={skill.name}
                      onChange={(e) => handleSkillEdit(index, 'name', e.target.value)}
                      variant="standard"
                      sx={{ flexGrow: 1 }}
                    />
                    <FormControl variant="standard" sx={{ minWidth: 120 }}>
                      <Select
                        value={skill.level}
                        onChange={(e) => handleSkillEdit(index, 'level', e.target.value)}
                      >
                        <MenuItem value="beginner">Beginner</MenuItem>
                        <MenuItem value="intermediate">Intermediate</MenuItem>
                        <MenuItem value="advanced">Advanced</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      value={skill.category}
                      onChange={(e) => handleSkillEdit(index, 'category', e.target.value)}
                      variant="standard"
                      placeholder="Category"
                      sx={{ width: 120 }}
                    />
                    <Chip
                      label={`${(skill.confidence * 100).toFixed(0)}% confidence`}
                      size="small"
                      color={skill.confidence > 0.8 ? "success" : "warning"}
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Add New Skill
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              label="Skill Name"
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Level</InputLabel>
              <Select
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                label="Level"
                size="small"
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
            <TextField
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              label="Category"
              size="small"
              sx={{ width: 120 }}
            />
            <IconButton onClick={handleAddNewSkill} color="primary">
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        {suggestedSkills && suggestedSkills.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Suggested Additional Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {suggestedSkills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onClick={() => setNewSkill({
                    name: skill,
                    level: 'beginner',
                    category: '',
                  })}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Confirm Skills
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SkillReviewDialog; 