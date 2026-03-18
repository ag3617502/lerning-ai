const dotenv = require('dotenv');
const path = require('path');
const { Groq } = require('groq-sdk');

const envPath = path.join(__dirname, '../.env');
console.log('Env Path:', envPath);
dotenv.config({ path: envPath });

console.log('GROQ_API_KEYS:', process.env.GROQ_API_KEYS ? 'Defined' : 'Undefined');

try {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEYS,
  });
  console.log('Groq instance created successfully');
} catch (error) {
  console.error('Error creating Groq instance:', error.message);
}
