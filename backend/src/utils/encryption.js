// backend/src/utils/encryption.js
const crypto = require('crypto');
const fs = require('fs').promises;

// Encryption settings
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // Initialization vector length

/**
 * Encrypt a file using AES-256-CBC
 * @param {string} filePath - Path to the file to encrypt
 * @returns {Promise<Object>} - Encrypted file info
 */
async function encryptFile(filePath) {
  try {
    console.log('🔒 Starting file encryption...');

    // Generate random encryption key (32 bytes = 256 bits)
    const encryptionKey = crypto.randomBytes(32);
    
    // Generate random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Read original file
    const fileData = await fs.readFile(filePath);
    console.log(`📄 Read file: ${fileData.length} bytes`);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

    // Encrypt the data
    const encryptedData = Buffer.concat([
      cipher.update(fileData),
      cipher.final()
    ]);

    // Combine IV + encrypted data (we need IV to decrypt later)
    const finalData = Buffer.concat([iv, encryptedData]);

    // Save encrypted file
    const encryptedFilePath = `${filePath}.encrypted`;
    await fs.writeFile(encryptedFilePath, finalData);

    console.log('✅ File encrypted successfully');
    console.log(`📦 Encrypted file size: ${finalData.length} bytes`);

    return {
      encryptedFilePath,
      encryptionKey: encryptionKey.toString('hex'), // Convert to hex string for storage
      originalPath: filePath,
      encryptedSize: finalData.length
    };

  } catch (error) {
    console.error('❌ Encryption error:', error);
    throw new Error(`Failed to encrypt file: ${error.message}`);
  }
}

/**
 * Decrypt a file using AES-256-CBC
 * @param {string} encryptedFilePath - Path to encrypted file
 * @param {string} encryptionKeyHex - Hex string of encryption key
 * @returns {Promise<Buffer>} - Decrypted file data
 */
async function decryptFile(encryptedFilePath, encryptionKeyHex) {
  try {
    console.log('🔓 Starting file decryption...');

    // Read encrypted file
    const encryptedData = await fs.readFile(encryptedFilePath);

    // Extract IV (first 16 bytes)
    const iv = encryptedData.slice(0, IV_LENGTH);
    
    // Extract encrypted content (rest of the data)
    const encrypted = encryptedData.slice(IV_LENGTH);

    // Convert encryption key from hex string back to Buffer
    const encryptionKey = Buffer.from(encryptionKeyHex, 'hex');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);

    // Decrypt the data
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    console.log('✅ File decrypted successfully');
    console.log(`📦 Decrypted file size: ${decrypted.length} bytes`);

    return decrypted;

  } catch (error) {
    console.error('❌ Decryption error:', error);
    throw new Error(`Failed to decrypt file: ${error.message}`);
  }
}

/**
 * Generate SHA256 hash of a file
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} - SHA256 hash
 */
async function generateFileHash(filePath) {
  try {
    const fileData = await fs.readFile(filePath);
    const hash = crypto.createHash('sha256').update(fileData).digest('hex');
    console.log(`🔑 File hash generated: ${hash.substring(0, 16)}...`);
    return hash;
  } catch (error) {
    console.error('❌ Hash generation error:', error);
    throw new Error('Failed to generate file hash');
  }
}

module.exports = {
  encryptFile,
  decryptFile,
  generateFileHash
};