// backend/src/controllers/recordController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Record = require('../models/Record');
const User = require('../models/User');
const { encryptFile, decryptFile } = require('../utils/encryption');
const { uploadToIPFS, getIPFSUrl, downloadFromIPFS } = require('../utils/ipfs');
const { storeHashOnBlockchain, getRecordsFromBlockchain } = require('../utils/blockchain');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = './uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /pdf|jpeg|jpg|png|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and documents allowed.'));
    }
  }
}).single('file'); // 'file' is the field name in form data

/**
 * Upload medical record
 * POST /api/records/upload
 */
exports.uploadRecord = async (req, res) => {
  // Handle file upload first
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let encryptedFilePath = null;

    try {
      const { patientEmail, recordType, description } = req.body;

      // Validate required fields
      if (!patientEmail || !recordType) {
        await fs.unlink(req.file.path); // Clean up uploaded file
        return res.status(400).json({ 
          error: 'Patient email and record type are required' 
        });
      }

      // Find patient by email
      const patient = await User.findOne({ email: patientEmail.toLowerCase(), role: 'patient' });
      if (!patient) {
        await fs.unlink(req.file.path);
        return res.status(404).json({ 
          error: 'Patient not found with this email' 
        });
      }

      // Check if patient has wallet address
      if (!patient.walletAddress) {
        await fs.unlink(req.file.path);
        return res.status(400).json({ 
          error: 'Patient must connect wallet before records can be uploaded' 
        });
      }

      console.log('');
      console.log('🏥 ===== STARTING MEDICAL RECORD UPLOAD =====');
      console.log(`📄 File: ${req.file.originalname}`);
      console.log(`👤 Patient: ${patient.name} (${patient.email})`);
      console.log(`🏥 Hospital ID: ${req.userId}`);
      console.log('');

      // STEP 1: Encrypt the file
      console.log('🔒 STEP 1: Encrypting file...');
      const encryptedData = await encryptFile(req.file.path);
      encryptedFilePath = encryptedData.encryptedFilePath;
      console.log('✅ Encryption complete');
      console.log('');
      
      // STEP 2: Upload encrypted file to IPFS
      console.log('☁️ STEP 2: Uploading to IPFS...');
      const ipfsHash = await uploadToIPFS(encryptedFilePath, {
        fileName: req.file.originalname,
        recordType,
        patientEmail
      });
      console.log('✅ IPFS upload complete');
      console.log('');
      
      // STEP 3: Store hash on BlockDAG blockchain
      // console.log('⛓️ STEP 3: Storing on blockchain...');
      // const txHash = await storeHashOnBlockchain(
      //   patient.walletAddress,
      //   ipfsHash,
      //   req.userId
      // );
      // console.log('✅ Blockchain storage complete');
      // STEP 3: Store hash on BlockDAG blockchain (TEMPORARILY DISABLED)
      console.log('⛓️ STEP 3: Storing on blockchain... (SKIPPED FOR NOW)');
      const txHash = 'TEMP_TX_HASH_WAITING_FOR_CONTRACT_DEPLOYMENT';
      console.log('⚠️ Using temporary transaction hash');
      console.log('⚠️ Ask blockchain developer to deploy contract');
      
      console.log('');

      // STEP 4: Save metadata to MongoDB
      console.log('💾 STEP 4: Saving metadata to database...');
      const record = new Record({
        patientId: patient._id,
        hospitalId: req.userId,
        recordType,
        description: description || '',
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        ipfsHash,
        blockchainTxHash: txHash,
        encryptionKey: encryptedData.encryptionKey,
        uploadedAt: new Date(),
        status: 'uploaded'
      });

      await record.save();
      console.log('✅ Metadata saved to database');
      console.log('');

      // STEP 5: Clean up temporary files
      console.log('🧹 STEP 5: Cleaning up temporary files...');
      await fs.unlink(req.file.path); // Delete original file
      await fs.unlink(encryptedFilePath); // Delete encrypted file
      console.log('✅ Cleanup complete');
      console.log('');

      console.log('🎉 ===== UPLOAD SUCCESSFUL =====');
      console.log(`📌 Record ID: ${record._id}`);
      console.log(`📌 IPFS Hash: ${ipfsHash}`);
      console.log(`📌 Blockchain TX: ${txHash}`);
      console.log('');

      // Send success response
      res.status(201).json({
        success: true,
        message: 'Medical record uploaded successfully',
        record: {
          id: record._id,
          fileName: record.fileName,
          recordType: record.recordType,
          fileSize: record.fileSize,
          ipfsHash: record.ipfsHash,
          ipfsUrl: getIPFSUrl(record.ipfsHash),
          blockchainTxHash: record.blockchainTxHash,
          uploadedAt: record.uploadedAt,
          patient: {
            name: patient.name,
            email: patient.email
          }
        }
      });

    } catch (error) {
      console.error('');
      console.error('❌ ===== UPLOAD FAILED =====');
      console.error('Error:', error.message);
      console.error('');

      // Clean up files if error occurs
      try {
        if (req.file && req.file.path) {
          await fs.unlink(req.file.path);
        }
        if (encryptedFilePath) {
          await fs.unlink(encryptedFilePath);
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError.message);
      }

      res.status(500).json({ 
        error: 'Failed to upload medical record',
        details: error.message
      });
    }
  });
};

/**
 * Get all records for a patient
 * GET /api/records/patient/:patientId
 */
exports.getPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Get records from MongoDB
    const records = await Record.find({ patientId })
      .populate('hospitalId', 'name email')
      .sort({ uploadedAt: -1 }); // Newest first

    console.log(`📋 Found ${records.length} records for patient ${patientId}`);

    res.json({
      success: true,
      count: records.length,
      records: records.map(record => ({
        id: record._id,
        fileName: record.fileName,
        recordType: record.recordType,
        description: record.description,
        fileSize: record.fileSize,
        hospital: record.hospitalId ? {
          name: record.hospitalId.name,
          email: record.hospitalId.email
        } : null,
        uploadedAt: record.uploadedAt,
        ipfsHash: record.ipfsHash,
        ipfsUrl: getIPFSUrl(record.ipfsHash),
        blockchainTxHash: record.blockchainTxHash,
        status: record.status
      }))
    });

  } catch (error) {
    console.error('❌ Get records error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve records',
      details: error.message
    });
  }
};

/**
 * Get single record details
 * GET /api/records/:recordId
 */
exports.getRecordById = async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await Record.findById(recordId)
      .populate('hospitalId', 'name email')
      .populate('patientId', 'name email walletAddress');

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({
      success: true,
      record: {
        id: record._id,
        fileName: record.fileName,
        recordType: record.recordType,
        description: record.description,
        fileSize: record.fileSize,
        mimeType: record.mimeType,
        uploadedAt: record.uploadedAt,
        ipfsHash: record.ipfsHash,
        ipfsUrl: getIPFSUrl(record.ipfsHash),
        blockchainTxHash: record.blockchainTxHash,
        status: record.status,
        patient: {
          name: record.patientId.name,
          email: record.patientId.email,
          walletAddress: record.patientId.walletAddress
        },
        hospital: {
          name: record.hospitalId.name,
          email: record.hospitalId.email
        }
      }
    });

  } catch (error) {
    console.error('❌ Get record error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve record',
      details: error.message
    });
  }
};

/**
 * Download and decrypt record
 * GET /api/records/:recordId/download
 */
exports.downloadRecord = async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await Record.findById(recordId);

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    console.log(`📥 Downloading record: ${record.fileName}`);

    // Download encrypted file from IPFS
    const encryptedData = await downloadFromIPFS(record.ipfsHash);

    // Save temporarily
    const tempPath = `./uploads/temp-${Date.now()}.encrypted`;
    await fs.writeFile(tempPath, encryptedData);

    // Decrypt file
    const decryptedData = await decryptFile(tempPath, record.encryptionKey);

    // Clean up temp file
    await fs.unlink(tempPath);

    // Send decrypted file
    res.set({
      'Content-Type': record.mimeType,
      'Content-Disposition': `attachment; filename="${record.fileName}"`,
      'Content-Length': decryptedData.length
    });

    res.send(decryptedData);

    console.log(`✅ File downloaded and decrypted: ${record.fileName}`);

  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ 
      error: 'Failed to download record',
      details: error.message
    });
  }
};