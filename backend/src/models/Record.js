// backend/src/models/Record.js
const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required']
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hospital ID is required']
  },
  recordType: {
    type: String,
    required: [true, 'Record type is required'],
    enum: ['lab-test', 'xray', 'mri', 'ct-scan', 'prescription', 'diagnosis', 'consultation', 'other']
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimeType: {
    type: String,
    required: true
  },
  ipfsHash: {
    type: String,
    required: [true, 'IPFS hash is required'],
    unique: true
  },
  blockchainTxHash: {
    type: String,
    required: [true, 'Blockchain transaction hash is required']
  },
  encryptionKey: {
    type: String,
    required: [true, 'Encryption key is required']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'uploaded', 'verified', 'failed'],
    default: 'uploaded'
  }
});

// Indexes for faster queries
recordSchema.index({ patientId: 1, uploadedAt: -1 });
recordSchema.index({ hospitalId: 1 });
recordSchema.index({ ipfsHash: 1 });

module.exports = mongoose.model('Record', recordSchema);