// backend/src/routes/recordRoutes.js
const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Upload medical record (hospitals only)
router.post('/upload', recordController.uploadRecord);

// Get all records for a patient
router.get('/patient/:patientId', recordController.getPatientRecords);

// Get single record details
router.get('/:recordId', recordController.getRecordById);

// Download and decrypt record
router.get('/:recordId/download', recordController.downloadRecord);

module.exports = router;