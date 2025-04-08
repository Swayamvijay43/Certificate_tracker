const { textModel } = require('../config/geminiConfig');
const Skill = require('../models/skillModel');
const User = require('../models/userModel');

// Function to extract skills from certificate content
async function extractSkillsFromCertificate(certificateData) {
  try {
    const prompt = `
      Analyze this certification information and extract a list of relevant skills.
      Consider both explicit skills mentioned and implicit skills that would be gained from this certification.

      Certificate Information:
      Title: ${certificateData.title}
      Issuer: ${certificateData.issuer}
      Description: ${certificateData.description || 'Not provided'}
      
      Return the response as a JSON object with the following structure:
      {
        "skills": [
          {
            "name": "skill name",
            "level": "beginner/intermediate/advanced",
            "category": "category name",
            "confidence": 0.0 to 1.0
          }
        ]
      }

      Only include skills with confidence > 0.7
    `;

    const result = await textModel.generateContent(prompt);
    const extractedData = JSON.parse(await result.response.text());
    return extractedData.skills;
  } catch (error) {
    console.error('Error extracting skills:', error);
    return [];
  }
}

// Function to add extracted skills to user
async function addExtractedSkillsToUser(userId, extractedSkills) {
  try {
    const addedSkills = [];

    for (const skillData of extractedSkills) {
      // Check if skill already exists
      let skill = await Skill.findOne({ name: skillData.name.toLowerCase() });

      if (skill) {
        // If skill exists but user doesn't have it
        if (!skill.users.includes(userId)) {
          skill.users.push(userId);
          await skill.save();
          addedSkills.push(skill);
        }
      } else {
        // Create new skill
        skill = await Skill.create({
          name: skillData.name.toLowerCase(),
          category: skillData.category,
          level: skillData.level || 'beginner',
          users: [userId]
        });
        addedSkills.push(skill);
      }

      // Add skill to user if not already present
      const user = await User.findById(userId);
      if (!user.skills.includes(skill._id)) {
        user.skills.push(skill._id);
        await user.save();
      }
    }

    return addedSkills;
  } catch (error) {
    console.error('Error adding extracted skills:', error);
    throw error;
  }
}

module.exports = {
  extractSkillsFromCertificate,
  addExtractedSkillsToUser
}; 