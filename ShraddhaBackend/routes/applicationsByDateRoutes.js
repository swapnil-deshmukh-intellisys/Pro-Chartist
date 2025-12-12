const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const { imageStorage } = require('../config/cloudinary');
const { authenticateAdmin } = require('../middleware/auth');
const ApplicationByDate = require('../models/ApplicationByDate');
const router = express.Router();

// Multer config for image upload
const upload = multer({ storage: imageStorage });

// POST - submit application
router.post('/', upload.single('image'), async (req, res) => {
  const { name, mobile, leagueDate, email, userId } = req.body;
  
  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim() === '' || 
      !mobile || typeof mobile !== 'string' || mobile.trim() === '' ||
      !email || typeof email !== 'string' || email.trim() === '' ||
      !userId || typeof userId !== 'string' || userId.trim() === '') {
    return res.status(400).json({ error: 'Name, Mobile, Email, and User ID are required and cannot be empty' });
  }
  
  const imageUrl = req.file ? req.file.path : null;
  // Use leagueDate if provided and valid, else fallback to today
  let date = leagueDate && /^\d{4}-\d{2}-\d{2}$/.test(leagueDate) ? leagueDate : new Date().toISOString().split("T")[0];

  try {
    let record = await ApplicationByDate.findOne({ date });

    // Check if user has already applied for this league (but allow re-application if rejected)
    if (record) {
      const existingApplication = record.applications.find(app => app.email === email);
      if (existingApplication && existingApplication.status !== 'rejected') {
        return res.status(400).json({ error: 'You have already applied for this league' });
      }
      
      // If user has a rejected application, remove it to allow re-application
      if (existingApplication && existingApplication.status === 'rejected') {
        record.applications = record.applications.filter(app => app.email !== email);
      }
    }

    if (!record) {
      record = new ApplicationByDate({
        date,
        applications: [{ name, mobile, imageUrl, email, userId }]
      });
    } else {
      record.applications.push({ name, mobile, imageUrl, email, userId });
    }

    await record.save();
    
    // Return the specific application that was just created
    const newApplication = record.applications[record.applications.length - 1];
    res.status(201).json({ application: newApplication, record });
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - fetch applications by date
router.get('/', async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  try {
    const record = await ApplicationByDate.findOne({ date });

    if (!record) {
      return res.json(record ? record.applications : []);
    }

    console.log('GET applications for date:', date, 'Applications:', record.applications);
    console.log('Applications with rejection reasons:', record.applications.map(app => ({
      name: app.name,
      status: app.status,
      rejectionReason: app.rejectionReason
    })));
    console.log('Full applications data being sent:', JSON.stringify(record.applications, null, 2));
    res.json(record.applications);
  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/:appId', authenticateAdmin, async (req, res) => {
  const { appId } = req.params;
  const { status, rejectionReason } = req.body;

  console.log('PUT request - appId:', appId, 'status:', status, 'rejectionReason:', rejectionReason);
  console.log('Full request body:', req.body);

  try {
    // Find the document first
    const doc = await ApplicationByDate.findOne({ "applications._id": appId });
    
    if (!doc) return res.status(404).json({ error: 'Application not found' });

    // Find the specific application and update it
    const applicationIndex = doc.applications.findIndex(app => app._id.toString() === appId);
    
    if (applicationIndex === -1) return res.status(404).json({ error: 'Application not found' });

    // Update the application
    doc.applications[applicationIndex].status = status;
    
    if (status === 'rejected' && rejectionReason) {
      doc.applications[applicationIndex].rejectionReason = rejectionReason;
      console.log('Adding rejection reason to application:', rejectionReason);
      console.log('Application after adding rejection reason:', doc.applications[applicationIndex]);
    } else if (status !== 'rejected') {
      // Use delete operator to actually remove the field
      delete doc.applications[applicationIndex].rejectionReason;
      console.log('Removing rejection reason from application');
    }

    console.log('Updated application:', doc.applications[applicationIndex]);

    // Save the document
    console.log('Saving document to database...');
    await doc.save();
    console.log('Document saved successfully');

    console.log('Database update result:', doc);

    const updatedApp = doc.applications[applicationIndex];
    console.log('Returning updated application:', updatedApp);
    res.json(updatedApp);
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// DELETE - remove a specific application by ID and date
router.delete('/:appId', authenticateAdmin, async (req, res) => {
  const { appId } = req.params;
  console.log('DELETE request for appId:', appId);
  
  try {
    // Validate appId
    if (!appId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(appId)) {
      console.log('Invalid ObjectId format:', appId);
      return res.status(400).json({ error: 'Invalid application ID format' });
    }

    // Use findOneAndUpdate with $pull to remove the application without triggering validation on other applications
    const result = await ApplicationByDate.findOneAndUpdate(
      { 'applications._id': appId },
      { $pull: { applications: { _id: appId } } },
      { new: true, runValidators: false } // Disable validators to avoid issues with old data
    );

    if (!result) {
      console.log('No document found with application ID:', appId);
      return res.status(404).json({ error: 'Application not found' });
    }
    
    console.log('Application deleted successfully. Remaining applications:', result.applications.length);
    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    console.error('Delete application error:', err);
    res.status(500).json({ error: 'Failed to delete application: ' + err.message });
  }
});

module.exports = router;
