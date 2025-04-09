const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Skill = require('../models/skillModel');
const Certification = require('../models/certificationModel');
const { model } = require('../config/geminiConfig');

// @desc    Generate a resume
// @route   POST /api/resume/generate
// @access  Private
const generateResume = asyncHandler(async (req, res) => {
  try {
    // Get resume data from request
    const resumeData = req.body;
    const userId = req.user.id;

    // Get skills and certifications if not provided
    if (!resumeData.skills || resumeData.skills.length === 0) {
      const skills = await Skill.find({ users: userId });
      resumeData.skills = skills;
    }

    if (!resumeData.certifications || resumeData.certifications.length === 0) {
      const certifications = await Certification.find({ user: userId });
      resumeData.certifications = certifications;
    }

    // Generate resume HTML based on template
    const resumeHtml = await generateResumeHTML(resumeData);

    res.json({
      success: true,
      resumeHtml,
      message: 'Resume generated successfully'
    });
  } catch (error) {
    console.error('Error generating resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating resume',
      error: error.message
    });
  }
});

// Helper function to detect test/placeholder data
const isPlaceholderOrTestData = (text) => {
  if (!text || typeof text !== 'string') return true;
  
  // Patterns that indicate test data - made less aggressive
  const testPatterns = [
    /^test\d*$/i,                // exactly "test" or "test123" etc.
    /placeholder/i,              // contains "placeholder"
    /^[a-z]{1,3}$/i,             // just 1-3 random letters
    /^x[a-z]{3,6}[fh]{2,4}$/i,   // specific pattern for test data
    /^gf+h+$/i,                  // pattern like "gffhhh"
    /^[^a-zA-Z0-9\s]{2,}$/       // mostly special characters
  ];
  
  return testPatterns.some(pattern => pattern.test(text));
};

// Helper function to generate resume HTML
const generateResumeHTML = async (resumeData) => {
  try {
    // Filter out any potential test/invalid data with more permissive rules
    const validSkills = resumeData.skills.filter(skill => 
      skill && 
      skill.name && 
      typeof skill.name === 'string' &&
      skill.name.length > 1 && // Allow names with at least 2 characters
      skill.level && 
      typeof skill.level === 'string'
    );
    
    const validCertifications = resumeData.certifications.filter(cert => 
      cert && 
      cert.title && 
      typeof cert.title === 'string' &&
      cert.title.length > 3 && // Allow titles with at least 4 characters
      cert.issuer && 
      typeof cert.issuer === 'string'
    );
    
    console.log("Valid skills for resume:", validSkills);
    console.log("Valid certifications for resume:", validCertifications);
    
    // Convert skills and certifications to formatted strings for the prompt
    const skillsFormatted = validSkills.map(skill => 
      `• ${skill.name} (${skill.level})`
    ).join('\\n');
    
    const certificationsFormatted = validCertifications.map(cert => 
      `• ${cert.title} from ${cert.issuer}, issued on ${new Date(cert.issueDate).toLocaleDateString()}`
    ).join('\\n');
    
    // Format work experience
    const workExperienceFormatted = resumeData.includeWorkExperience && resumeData.workExperience ? 
      resumeData.workExperience.map(job => 
        `• ${job.title} at ${job.company} (${job.startDate} - ${job.endDate})\\n  ${job.description}`
      ).join('\\n\\n') : '';
    
    // Format education
    const educationFormatted = resumeData.includeEducation && resumeData.education ? 
      resumeData.education.map(edu => 
        `• ${edu.degree} at ${edu.institution} (${edu.graduationDate})\\n  ${edu.description}`
      ).join('\\n\\n') : '';

    // Use different templates based on selection
    let cssStyle = '';
    switch (resumeData.template) {
      case 'modern':
        cssStyle = `
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          h1 { color: #2c3e50; margin-bottom: 5px; }
          h2 { color: #3498db; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
          .contact-info { color: #7f8c8d; }
          .section { margin-bottom: 25px; }
          .job, .education, .certification, .skill-item { margin-bottom: 15px; }
          .job-title, .degree { font-weight: bold; color: #2c3e50; }
          .company, .institution { font-style: italic; color: #34495e; }
          .date { color: #7f8c8d; float: right; }
          .skills-container { display: flex; flex-wrap: wrap; }
          .skill-item { background-color: #e8f4fc; border-radius: 15px; padding: 5px 10px; margin: 5px; display: inline-block; }
          .certification-title { font-weight: bold; }
          .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
        `;
        break;
      case 'creative':
        cssStyle = `
          body { font-family: 'Roboto', Arial, sans-serif; line-height: 1.6; color: #444; max-width: 800px; margin: 0 auto; background-color: #fafafa; padding: 30px; }
          .header { background: linear-gradient(to right, #ff7e5f, #feb47b); padding: 30px; color: white; border-radius: 10px 10px 0 0; }
          h1 { margin-bottom: 5px; }
          h2 { color: #ff7e5f; position: relative; padding-left: 20px; }
          h2:before { content: ""; position: absolute; left: 0; top: 50%; width: 10px; height: 10px; background: #ff7e5f; transform: translateY(-50%); border-radius: 50%; }
          .contact-info { margin-top: 10px; }
          .section { background-color: white; padding: 20px; margin-bottom: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          .job-title, .degree { font-weight: bold; color: #444; }
          .company, .institution { color: #ff7e5f; }
          .date { font-style: italic; color: #999; }
          .skills-container { display: flex; flex-wrap: wrap; }
          .skill-item { background: linear-gradient(to right, #ff7e5f, #feb47b); color: white; border-radius: 20px; padding: 5px 15px; margin: 5px; display: inline-block; }
          .certification-title { font-weight: bold; color: #444; }
          .summary { border-left: 5px solid #ff7e5f; padding-left: 15px; }
        `;
        break;
      case 'minimalist':
        cssStyle = `
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { margin-bottom: 40px; }
          h1 { font-size: 28px; margin-bottom: 5px; font-weight: normal; }
          h2 { font-size: 20px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; font-weight: normal; }
          .contact-info { color: #666; margin-top: 10px; }
          .section { margin-bottom: 30px; }
          .job-title, .degree { font-weight: bold; }
          .company, .institution, .date { color: #666; }
          .skills-container { display: flex; flex-wrap: wrap; margin-top: 15px; }
          .skill-item { border: 1px solid #ddd; border-radius: 3px; padding: 3px 8px; margin: 3px; display: inline-block; }
          .certification-title { font-weight: bold; }
          .summary { color: #555; }
        `;
        break;
      case 'professional':
      default:
        cssStyle = `
          body { font-family: 'Times New Roman', Times, serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2a4d69; padding-bottom: 20px; }
          h1 { margin-bottom: 5px; color: #2a4d69; }
          h2 { color: #2a4d69; border-bottom: 1px solid #4b86b4; padding-bottom: 5px; }
          .contact-info { color: #555; }
          .section { margin-bottom: 20px; }
          .job-title, .degree { font-weight: bold; }
          .company, .institution { font-style: italic; }
          .date { float: right; }
          .skills-container { display: flex; flex-wrap: wrap; }
          .skill-item { margin-right: 20px; margin-bottom: 5px; }
          .certification-title { font-weight: bold; }
          .summary { background-color: #f5f5f5; padding: 10px; border-left: 3px solid #2a4d69; }
        `;
    }

    // Prepare the prompt for AI to generate HTML
    const prompt = `
      Create a professional HTML resume for ${resumeData.fullName}. 
      
      Here is the information to include:
      
      Personal Information:
      - Name: ${resumeData.fullName}
      - Professional Title: ${resumeData.title || 'Professional'}
      - Email: ${resumeData.email}
      - Phone: ${resumeData.phone || 'Not provided'}
      - Location: ${resumeData.location || 'Not provided'}
      - Professional Summary: ${resumeData.summary || 'Not provided'}
      
      Skills:
      ${skillsFormatted || 'No skills provided'}
      
      Certifications:
      ${certificationsFormatted || 'No certifications provided'}
      
      ${resumeData.includeWorkExperience ? `Work Experience:
      ${workExperienceFormatted || 'No work experience provided'}` : ''}
      
      ${resumeData.includeEducation ? `Education:
      ${educationFormatted || 'No education provided'}` : ''}
      
      Use the following CSS style:
      \`\`\`css
      ${cssStyle}
      \`\`\`
      
      The HTML should be well-structured with appropriate sections for each category of information.
      Use div tags with appropriate class names for styling, and make sure the resume looks professional.
      Only return the complete HTML document with no additional text.
    `;

    // Generate resume HTML using the GenAI model
    const result = await model.generateContent(prompt);
    const rawHtml = await result.response.text();

    // Extract HTML if the AI didn't return pure HTML
    let htmlContent = rawHtml;
    if (rawHtml.includes('```html')) {
      htmlContent = rawHtml.split('```html')[1].split('```')[0].trim();
    } else if (rawHtml.includes('<!DOCTYPE html>')) {
      const startIndex = rawHtml.indexOf('<!DOCTYPE html>');
      htmlContent = rawHtml.substring(startIndex);
    }

    // Ensure there's a proper DOCTYPE and CSS styling
    if (!htmlContent.includes('<!DOCTYPE html>')) {
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resumeData.fullName} - Resume</title>
  <style>
    ${cssStyle}
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
    }

    return htmlContent;
  } catch (error) {
    console.error('Error generating resume HTML:', error);
    throw new Error('Failed to generate resume HTML');
  }
};

module.exports = {
  generateResume
}; 