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
    console.log('Starting to add skills for user:', userId);
    console.log('Skills to add:', extractedSkills);
    
    const addedSkills = [];
    const user = await User.findById(userId).populate('skills');
    
    if (!user) {
      throw new Error('User not found');
    }

    for (const skillData of extractedSkills) {
      try {
        // Normalize skill name to lowercase for consistency
        const normalizedName = skillData.name.toLowerCase().trim();
        
        // Skip if skill name is empty
        if (!normalizedName) {
          console.log('Skipping empty skill name');
          continue;
        }

        console.log('Processing skill:', normalizedName);

        // Check if skill already exists
        let skill = await Skill.findOne({ name: normalizedName });

        if (skill) {
          console.log('Existing skill found:', skill.name);
          // If skill exists but user doesn't have it
          if (!user.skills.some(s => s._id.toString() === skill._id.toString())) {
            skill.users.push(userId);
            await skill.save();
            user.skills.push(skill._id);
            console.log('Added existing skill to user:', skill.name);
          } else {
            console.log('User already has skill:', skill.name);
          }
        } else {
          // Create new skill
          console.log('Creating new skill:', normalizedName);
          skill = await Skill.create({
            name: normalizedName,
            category: skillData.category || 'General',
            level: skillData.level || 'beginner',
            users: [userId]
          });
          user.skills.push(skill._id);
          console.log('Created and added new skill:', skill.name);
        }

        addedSkills.push(skill);
      } catch (skillError) {
        console.error('Error processing individual skill:', skillError);
        // Continue with other skills even if one fails
      }
    }

    // Save user changes
    const savedUser = await user.save();
    console.log('User saved with updated skills. Total skills:', savedUser.skills.length);

    // Verify skills were saved by fetching user again
    const verifiedUser = await User.findById(userId).populate('skills');
    console.log('Verified user skills count:', verifiedUser.skills.length);
    console.log('Verified user skills:', verifiedUser.skills.map(s => s.name));

    return addedSkills;
  } catch (error) {
    console.error('Error in addExtractedSkillsToUser:', error);
    throw error;
  }
}

module.exports = {
  extractSkillsFromCertificate,
  addExtractedSkillsToUser
}; 