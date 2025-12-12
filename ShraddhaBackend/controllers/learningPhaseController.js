const LearningPhase = require('../models/LearningPhase');

// Get all learning phases
const getAllLearningPhases = async (req, res) => {
  try {
    const phases = await LearningPhase.find({ isActive: true }).sort({ order: 1 });
    res.json(phases);
  } catch (error) {
    console.error('Error fetching learning phases:', error);
    res.status(500).json({ error: 'Failed to fetch learning phases' });
  }
};

// Get learning phase by ID
const getLearningPhaseById = async (req, res) => {
  try {
    const phase = await LearningPhase.findOne({ phaseId: req.params.phaseId, isActive: true });
    if (!phase) {
      return res.status(404).json({ error: 'Learning phase not found' });
    }
    res.json(phase);
  } catch (error) {
    console.error('Error fetching learning phase:', error);
    res.status(500).json({ error: 'Failed to fetch learning phase' });
  }
};

// Create or update learning phase
const createOrUpdateLearningPhase = async (req, res) => {
  try {
    const { phaseId, title, subtitle, content, order, price, originalPrice, currency } = req.body;
    
    // Check if phase exists
    let phase = await LearningPhase.findOne({ phaseId });
    
    if (phase) {
      // Update existing phase
      phase.title = title;
      phase.subtitle = subtitle;
      phase.content = content;
      phase.order = order;
      if (price !== undefined) phase.price = price;
      if (originalPrice !== undefined) phase.originalPrice = originalPrice;
      if (currency !== undefined) phase.currency = currency;
    } else {
      // Create new phase
      phase = new LearningPhase({
        phaseId,
        title,
        subtitle,
        content,
        order,
        price: price || 999,
        originalPrice: originalPrice || 1999,
        currency: currency || '₹'
      });
    }
    
    await phase.save();
    res.json(phase);
  } catch (error) {
    console.error('Error saving learning phase:', error);
    res.status(500).json({ error: 'Failed to save learning phase' });
  }
};

// Update learning phase
const updateLearningPhase = async (req, res) => {
  try {
    const { phaseId } = req.params;
    const updateData = req.body;
    
    const phase = await LearningPhase.findOneAndUpdate(
      { phaseId },
      updateData,
      { new: true }
    );
    
    if (!phase) {
      return res.status(404).json({ error: 'Learning phase not found' });
    }
    
    res.json(phase);
  } catch (error) {
    console.error('Error updating learning phase:', error);
    res.status(500).json({ error: 'Failed to update learning phase' });
  }
};

// Delete learning phase (soft delete)
const deleteLearningPhase = async (req, res) => {
  try {
    const { phaseId } = req.params;
    
    const phase = await LearningPhase.findOneAndUpdate(
      { phaseId },
      { isActive: false },
      { new: true }
    );
    
    if (!phase) {
      return res.status(404).json({ error: 'Learning phase not found' });
    }
    
    res.json({ message: 'Learning phase deleted successfully' });
  } catch (error) {
    console.error('Error deleting learning phase:', error);
    res.status(500).json({ error: 'Failed to delete learning phase' });
  }
};

// Bulk update learning phases
const bulkUpdateLearningPhases = async (req, res) => {
  try {
    const { phases } = req.body;
    
    const updatePromises = phases.map(async (phaseData) => {
      const { phaseId, title, subtitle, content, order, price, originalPrice, currency } = phaseData;
      
      return LearningPhase.findOneAndUpdate(
        { phaseId },
        {
          title,
          subtitle,
          content,
          order,
          price: price || 999,
          originalPrice: originalPrice || 1999,
          currency: currency || '₹'
        },
        { upsert: true, new: true }
      );
    });
    
    const updatedPhases = await Promise.all(updatePromises);
    res.json(updatedPhases);
  } catch (error) {
    console.error('Error bulk updating learning phases:', error);
    res.status(500).json({ error: 'Failed to update learning phases' });
  }
};

// Add content to a learning phase
const addContentToPhase = async (req, res) => {
  try {
    const { phaseId } = req.params;
    const contentData = req.body;
    
    const phase = await LearningPhase.findOne({ phaseId });
    if (!phase) {
      return res.status(404).json({ error: 'Learning phase not found' });
    }
    
    // Add new content
    phase.content.push(contentData);
    await phase.save();
    
    res.json(phase);
  } catch (error) {
    console.error('Error adding content to phase:', error);
    res.status(500).json({ error: 'Failed to add content to phase' });
  }
};

// Update content in a learning phase
const updateContentInPhase = async (req, res) => {
  try {
    const { phaseId, contentId } = req.params;
    const updateData = req.body;
    
    const phase = await LearningPhase.findOne({ phaseId });
    if (!phase) {
      return res.status(404).json({ error: 'Learning phase not found' });
    }
    
    // Find and update the specific content
    const contentIndex = phase.content.findIndex(content => content.id === contentId);
    if (contentIndex === -1) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    phase.content[contentIndex] = { ...phase.content[contentIndex], ...updateData };
    await phase.save();
    
    res.json(phase);
  } catch (error) {
    console.error('Error updating content in phase:', error);
    res.status(500).json({ error: 'Failed to update content in phase' });
  }
};

// Delete content from a learning phase
const deleteContentFromPhase = async (req, res) => {
  try {
    const { phaseId, contentId } = req.params;
    
    const phase = await LearningPhase.findOne({ phaseId });
    if (!phase) {
      return res.status(404).json({ error: 'Learning phase not found' });
    }
    
    // Remove the specific content
    phase.content = phase.content.filter(content => content.id !== contentId);
    await phase.save();
    
    res.json(phase);
  } catch (error) {
    console.error('Error deleting content from phase:', error);
    res.status(500).json({ error: 'Failed to delete content from phase' });
  }
};

module.exports = {
  getAllLearningPhases,
  getLearningPhaseById,
  createOrUpdateLearningPhase,
  updateLearningPhase,
  deleteLearningPhase,
  bulkUpdateLearningPhases,
  addContentToPhase,
  updateContentInPhase,
  deleteContentFromPhase
}; 