const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const UserPurchase = require('../models/UserPurchase');

// Verify JWT token
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ valid: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ valid: false, message: 'User not found' });
    }

    res.json({ 
      valid: true, 
      userId: user._id, 
      email: user.email 
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
};

// Get user progress
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id; // Use authenticated user's ID
    
    let userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      // Create default progress for new user
      userProgress = new UserProgress({
        userId,
        completedContent: {},
        videoProgress: {},
        unlockedPhases: ['beginner'],
        currentPhase: 'beginner'
      });
      await userProgress.save();
    }

    console.log('📊 Backend: Returning user progress:', {
      userId: userId.toString(),
      completedContent: Object.fromEntries(userProgress.completedContent || new Map()),
      videoProgress: Object.fromEntries(userProgress.videoProgress || new Map()),
      unlockedPhases: userProgress.unlockedPhases
    });

    res.json(userProgress);
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ message: 'Failed to get user progress' });
  }
};

// Update user progress
exports.updateUserProgress = async (req, res) => {
  try {
    const userId = req.user._id; // Use authenticated user's ID
    const progressData = req.body;
    
    console.log('🔄 Backend: Updating user progress:', {
      userId: userId.toString(),
      progressData,
      completedContent: progressData.completedContent
    });
    
    let userProgress = await UserProgress.findOne({ userId });
    
    if (!userProgress) {
      userProgress = new UserProgress({ userId });
    }
    
    // Update progress data with proper merging
    if (progressData.videoProgress) {
      userProgress.videoProgress = new Map([
        ...userProgress.videoProgress,
        ...Object.entries(progressData.videoProgress)
      ]);
    }
    
    if (progressData.completedContent) {
      userProgress.completedContent = new Map([
        ...userProgress.completedContent,
        ...Object.entries(progressData.completedContent)
      ]);
    }
    
    if (progressData.unlockedPhases) {
      userProgress.unlockedPhases = progressData.unlockedPhases;
    }
    
    if (progressData.currentPhase) {
      userProgress.currentPhase = progressData.currentPhase;
    }
    
    await userProgress.save();
    
    console.log('✅ Backend: Progress saved successfully:', {
      completedContent: Object.fromEntries(userProgress.completedContent),
      videoProgress: Object.fromEntries(userProgress.videoProgress)
    });
    
    res.json({ message: 'Progress updated successfully', userProgress });
  } catch (error) {
    console.error('Update user progress error:', error);
    res.status(500).json({ message: 'Failed to update user progress' });
  }
};

// Check if user has purchased a phase
exports.checkPhasePurchase = async (req, res) => {
  try {
    const userId = req.user._id; // Use authenticated user's ID
    const { phaseId } = req.params;
    
    const purchase = await UserPurchase.findOne({
      userId,
      phaseId,
      status: 'completed'
    });
    
    res.json({ hasPurchased: !!purchase });
  } catch (error) {
    console.error('Check phase purchase error:', error);
    res.status(500).json({ message: 'Failed to check purchase status' });
  }
};

// Get user purchases
exports.getUserPurchases = async (req, res) => {
  try {
    const userId = req.user._id; // Use authenticated user's ID
    
    const purchases = await UserPurchase.find({
      userId,
      status: 'completed'
    }).select('phaseId purchasedAt amount');
    
    res.json(purchases);
  } catch (error) {
    console.error('Get user purchases error:', error);
    res.status(500).json({ message: 'Failed to get user purchases' });
  }
}; 