const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize model with gemini-1.5-flash
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Test function to verify Gemini AI connection
async function testGeminiConnection() {
  try {
    console.log('Testing Gemini AI connection...');
    const result = await model.generateContent('Return "OK" if you can read this message.');
    const response = await result.response.text();
    console.log('Gemini AI test response:', response);
    return response.includes('OK');
  } catch (error) {
    console.error('Gemini AI test failed:', error);
    return false;
  }
}

module.exports = {
  model,
  testGeminiConnection
}; 