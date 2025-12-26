// backend/test-pinata.js
require('dotenv').config();
const { testPinataAuth } = require('./src/utils/ipfs');

async function test() {
  console.log('Testing Pinata connection...');
  console.log('API Key:', process.env.PINATA_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('Secret Key:', process.env.PINATA_SECRET_KEY ? '✅ Set' : '❌ Not set');
  console.log('');
  
  try {
    await testPinataAuth();
    console.log('');
    console.log('🎉 Pinata connection successful!');
  } catch (error) {
    console.log('');
    console.log('❌ Pinata connection failed!');
    console.log('Error:', error.message);
    console.log('');
    console.log('Make sure you:');
    console.log('1. Created a Pinata account at https://pinata.cloud');
    console.log('2. Generated API keys');
    console.log('3. Added them to your .env file');
  }
}

test();