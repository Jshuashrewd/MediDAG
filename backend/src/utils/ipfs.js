// backend/src/utils/ipfs.js
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');

// Initialize Pinata with your API keys
const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

/**
 * Test Pinata authentication
 * @returns {Promise<boolean>}
 */
async function testPinataAuth() {
  try {
    const result = await pinata.testAuthentication();
    console.log('✅ Pinata authentication successful');
    return true;
  } catch (error) {
    console.error('❌ Pinata authentication failed:', error.message);
    throw new Error('Pinata authentication failed. Check your API keys in .env');
  }
}

/**
 * Upload encrypted file to IPFS via Pinata
 * @param {string} filePath - Path to encrypted file
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<string>} - IPFS hash (CID)
 */
async function uploadToIPFS(filePath, metadata = {}) {
  try {
    console.log('☁️ Uploading to IPFS via Pinata...');
    
    // Test authentication first
    await testPinataAuth();

    // Create readable stream from file
    const readableStream = fs.createReadStream(filePath);

    // Prepare metadata
    const options = {
      pinataMetadata: {
        name: metadata.fileName || `medical-record-${Date.now()}`,
        keyvalues: {
          type: 'encrypted-medical-record',
          uploadedAt: new Date().toISOString(),
          recordType: metadata.recordType || 'unknown',
          ...metadata
        }
      },
      pinataOptions: {
        cidVersion: 0 // Use CIDv0 for compatibility
      }
    };

    // Upload to IPFS
    const result = await pinata.pinFileToIPFS(readableStream, options);

    console.log('✅ File uploaded to IPFS successfully');
    console.log(`📌 IPFS Hash: ${result.IpfsHash}`);
    console.log(`🔗 Gateway URL: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);

    return result.IpfsHash;

  } catch (error) {
    console.error('❌ IPFS upload error:', error);
    
    // Provide helpful error messages
    if (error.message.includes('authentication')) {
      throw new Error('Pinata authentication failed. Check PINATA_API_KEY and PINATA_SECRET_KEY in .env');
    }
    
    if (error.message.includes('rate limit')) {
      throw new Error('Pinata rate limit exceeded. Wait a few minutes and try again.');
    }
    
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
}

/**
 * Get IPFS gateway URL
 * @param {string} ipfsHash - IPFS hash (CID)
 * @returns {string} - Public gateway URL
 */
function getIPFSUrl(ipfsHash) {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
}

/**
 * Download file from IPFS
 * @param {string} ipfsHash - IPFS hash (CID)
 * @returns {Promise<Buffer>} - File data
 */
async function downloadFromIPFS(ipfsHash) {
  try {
    console.log(`📥 Downloading from IPFS: ${ipfsHash}`);
    
    const url = getIPFSUrl(ipfsHash);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`✅ Downloaded ${buffer.length} bytes from IPFS`);
    
    return buffer;

  } catch (error) {
    console.error('❌ IPFS download error:', error);
    throw new Error(`Failed to download from IPFS: ${error.message}`);
  }
}

/**
 * Unpin (delete) file from Pinata
 * @param {string} ipfsHash - IPFS hash to unpin
 */
async function unpinFromIPFS(ipfsHash) {
  try {
    await pinata.unpin(ipfsHash);
    console.log(`✅ File unpinned from IPFS: ${ipfsHash}`);
  } catch (error) {
    console.error('❌ Unpin error:', error);
    // Don't throw error - unpinning is not critical
    console.warn('Failed to unpin file, but continuing...');
  }
}

/**
 * Get pinned files list
 * @returns {Promise<Array>} - List of pinned files
 */
async function listPinnedFiles() {
  try {
    const result = await pinata.pinList({ status: 'pinned' });
    console.log(`📋 Total pinned files: ${result.count}`);
    return result.rows;
  } catch (error) {
    console.error('❌ List pinned files error:', error);
    throw new Error('Failed to list pinned files');
  }
}

module.exports = {
  uploadToIPFS,
  getIPFSUrl,
  downloadFromIPFS,
  unpinFromIPFS,
  listPinnedFiles,
  testPinataAuth
};