const sharp = require('sharp');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const { model } = require('../config/geminiConfig');

// Function to extract text from PDF
async function extractTextFromPDF(pdfBuffer) {
  try {
    console.log('Starting PDF text extraction...');
    const data = await pdfParse(pdfBuffer);
    console.log('PDF text extracted successfully');
    return data.text;
  } catch (error) {
    console.error('Error in extractTextFromPDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

// Function to process image for Gemini AI
async function processImageForAI(imageBuffer) {
  try {
    console.log('Starting image processing...');
    
    // Process image with sharp
    const processedImage = await sharp(imageBuffer)
      .resize(1024, 1024, { fit: 'inside' })
      .toFormat('jpeg') // Convert to JPEG for better compatibility
      .toBuffer();
    
    // Convert to base64
    const base64Image = processedImage.toString('base64');
    
    // Create parts array for Gemini Vision API
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg'
      }
    };

    console.log('Image processed successfully');
    return imagePart;
  } catch (error) {
    console.error('Error in processImageForAI:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

// Function to ensure response is valid JSON
async function getValidJSONResponse(prompt, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to get valid JSON response...`);
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      console.log('Raw response:', response);
      
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        return JSON.parse(jsonStr);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
    }
  }
}

// Function to analyze certificate content
async function analyzeCertificate(fileBuffer, fileType, userInput) {
  try {
    console.log(`Starting certificate analysis for file type: ${fileType}`);
    console.log('User input:', userInput);

    if (!fileBuffer) {
      throw new Error('No file buffer provided');
    }

    if (!fileType) {
      throw new Error('File type not specified');
    }

    if (!['pdf', 'image'].includes(fileType)) {
      throw new Error(`Invalid file type: ${fileType}`);
    }

    const prompt = `You are a certificate analyzer AI. Your task is to analyze the provided certificate and return ONLY a JSON object with the specified structure. Do not include any additional text or explanations.

IMPORTANT: Your response must be a valid JSON object with exactly this structure:
{
  "extracted_info": {
    "title": "exact certificate title",
    "issuer": "issuing organization name",
    "issue_date": "YYYY-MM-DD",
    "credential_id": "ID if present, or null"
  },
  "validation": {
    "matches": ["exact matches with user input"],
    "discrepancies": ["any differences found"]
  },
  "suggested_skills": ["skill1", "skill2", "skill3"],
  "category": "most appropriate category"
}

Remember:
- Return ONLY the JSON object
- Include ALL required fields
- Use null for missing values
- Format dates as YYYY-MM-DD
- Ensure arrays are never null (use empty array if none)

User provided information for comparison:
${JSON.stringify(userInput, null, 2)}
`;

    let result;

    if (fileType === 'pdf') {
      console.log('Processing PDF file...');
      try {
        const content = await extractTextFromPDF(fileBuffer);
        console.log('PDF content extracted, length:', content.length);
        
        const pdfPrompt = prompt + `\n\nAnalyze this certificate text:\n${content}`;
        result = await getValidJSONResponse(pdfPrompt);
      } catch (pdfError) {
        console.error('PDF processing error:', pdfError);
        throw new Error(`PDF processing failed: ${pdfError.message}`);
      }
    } else {
      console.log('Processing image file...');
      try {
        const imagePart = await processImageForAI(fileBuffer);
        console.log('Sending image to Gemini AI Vision model...');
        
        // Create the complete prompt array for vision model
        const visionPrompt = [{
          text: prompt
        }, imagePart];
        
        result = await getValidJSONResponse(visionPrompt);
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        throw new Error(`Image processing failed: ${imageError.message}`);
      }
    }

    // Validate the result structure
    if (!result || !result.extracted_info || !result.validation || !result.suggested_skills) {
      console.error('Invalid result structure:', result);
      throw new Error('AI returned invalid response structure');
    }

    return result;
  } catch (error) {
    console.error('Error in analyzeCertificate:', error);
    console.error('Stack trace:', error.stack);
    throw new Error(`Failed to analyze certificate: ${error.message}`);
  }
}

// Function to validate certificate authenticity
async function validateCertificateAuthenticity(analysis) {
  try {
    console.log('Starting certificate authenticity validation...');
    
    // Calculate base score
    let score = 0.6; // Start with a base score of 0.6 instead of requiring high validation

    // Add points for having basic information
    if (analysis.extracted_info.title) score += 0.1;
    if (analysis.extracted_info.issuer) score += 0.1;
    if (analysis.extracted_info.issue_date) score += 0.1;
    if (analysis.extracted_info.credential_id) score += 0.1;

    const result = {
      authenticity_score: Math.min(score, 1),
      confidence_level: score > 0.8 ? "high" : score > 0.5 ? "medium" : "low",
      flags: [],
      recommendations: []
    };

    // Add flags for missing information
    if (!analysis.extracted_info.title) result.flags.push("missing_title");
    if (!analysis.extracted_info.issuer) result.flags.push("missing_issuer");
    if (!analysis.extracted_info.credential_id) result.flags.push("missing_credential_id");

    // Add recommendations
    if (result.authenticity_score < 0.8) {
      result.recommendations.push("Consider adding more certificate details to improve authenticity score");
    }

    return result;
  } catch (error) {
    console.error('Error in validateCertificateAuthenticity:', error);
    console.error('Stack trace:', error.stack);
    throw new Error(`Failed to validate certificate authenticity: ${error.message}`);
  }
}

module.exports = {
  analyzeCertificate,
  validateCertificateAuthenticity
}; 