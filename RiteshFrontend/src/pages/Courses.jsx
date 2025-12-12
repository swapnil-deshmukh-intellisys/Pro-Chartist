import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheck, 
  FaBullseye, 
  FaTimes, 
  FaLock, 
  FaChevronUp, 
  FaChevronDown, 
  FaBookOpen,
  FaUnlock,
  FaPlay,
  FaCheckCircle,
  FaStar
} from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';
import toast from 'react-hot-toast';
import vid1 from '../assets/1. basic of stock market.mp4';
import vid2 from '../assets/2. technical analysis.mp4';
import vid3 from '../assets/3. dow theory.mp4';
import vid4 from '../assets/4. SMC+CRT.mp4';
import vid5 from '../assets/5. market structure.mp4';
import vid6 from '../assets/6. summary.mp4';

// Load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });
};

function Courses({ setIsVideoPage }) {
  const navigate = useNavigate();
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Progress tracking state
  const { userProgress, updateUserProgress, isAuthenticated, currentUser } = useUser();

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPhaseForPayment, setSelectedPhaseForPayment] = useState(null);
  const [paymentStep, setPaymentStep] = useState('details'); // 'details', 'payment', 'success'
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render when progress updates

  // Debug: Monitor userProgress changes
  useEffect(() => {
    console.log('🔄 UserProgress Updated:', userProgress);
    console.log('🔐 Auth Status:', { isAuthenticated, currentUser });
    // Force re-render when progress updates
    setForceUpdate(prev => prev + 1);
  }, [userProgress]);

  // Check for newly unlocked videos and show notifications
  const checkForNewlyUnlockedVideos = (completedPhaseId, completedContentId) => {
    if (!phases.length) return;
    
    // Find the phase and content that was just completed
    const phase = phases.find(p => p.phaseId === completedPhaseId);
    if (!phase) return;
    
    const completedIndex = phase.content.findIndex(item => item.id === completedContentId);
    if (completedIndex === -1 || completedIndex === phase.content.length - 1) return; // No next video or last video
    
    const nextVideo = phase.content[completedIndex + 1];
    if (!nextVideo) return;
    
    // Check if the next video is now unlocked
    const isNextUnlocked = isVideoUnlocked(completedPhaseId, nextVideo.id, completedIndex + 1);
    
    if (isNextUnlocked) {
      toast.success(`🎉 "${nextVideo.title}" is now unlocked!`, {
        duration: 4000,
        icon: '🔓'
      });
    }
  };

  // Update video page state when selectedContent changes
  useEffect(() => {
    setIsVideoPage(selectedContent && ['beginner', 'trader', 'pro-trader', 'master-trader'].includes(selectedContent.phase.phaseId));
  }, [selectedContent, setIsVideoPage]);

  // Fetch learning phases from backend
  useEffect(() => {
    const fetchLearningPhases = async () => {
      try {
        setLoading(true);
        
        // TEMPORARY: Force default phases for testing
        // Comment out the backend fetch to always use default phases
        /*
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/learning-phases`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          setPhases(data);
        } else {
        */
        
        // Always use default phases for testing
        const defaultPhases = [
          {
            phaseId: 'beginner',
            title: 'Phase 1: Beginner',
            subtitle: 'Foundation course for new traders',
            price: 999,
            originalPrice: 1999,
            currency: '₹',
            content: [
              {
                id: 'basics',
                title: 'Basic\'s',
                duration: '15:30',
                videoUrl: vid1,
                description: 'Learn the fundamental concepts of trading and market basics.'
              },
              {
                id: 'technical-analysis',
                title: 'Technical Analysis',
                duration: '22:15',
                videoUrl: vid2,
                description: 'Master technical analysis techniques and chart patterns.'
              },
              {
                id: 'dow-theory',
                title: 'Dow Theory',
                duration: '18:45',
                videoUrl: vid3,
                description: 'Understanding Dow Theory principles and market trends.'
              },
              {
                id: 'smc-crt',
                title: 'SMC + CRT',
                duration: '25:10',
                videoUrl: vid4,
                description: 'Smart Money Concepts and Critical Resistance Theory.'
              },
              {
                id: 'market-structure',
                title: 'Market Structure',
                duration: '20:30',
                videoUrl: vid5,
                description: 'Learn about market structure and price action.'
              },
              {
                id: 'summary',
                title: 'Summary',
                duration: '12:20',
                videoUrl: vid6,
                description: 'Complete summary of Phase 1 concepts and takeaways.'
              }
            ]
          },
          {
            phaseId: 'trader',
            title: 'Phase 2: Trader',
            subtitle: 'Intermediate trading strategies',
            price: 1499,
            originalPrice: 2999,
            currency: '₹',
            content: [
              {
                id: 'demo-trading',
                title: 'Demo Trading',
                duration: '18:20',
                videoUrl: vid1, // Use local video for testing
                description: 'Practice trading with demo accounts and paper trading.'
              },
              {
                id: 'grow-capital',
                title: 'How to Grow 50k Capital',
                duration: '30:15',
                videoUrl: vid2, // Use local video for testing
                description: 'Strategies to grow your trading capital from 50k.'
              },
              {
                id: 'trading-journal',
                title: 'Trading Journal',
                duration: '15:45',
                videoUrl: vid3, // Use local video for testing
                description: 'How to maintain an effective trading journal.'
              },
              {
                id: 'risk-management',
                title: 'Risk Management',
                duration: '22:30',
                videoUrl: vid4, // Use local video for testing
                description: 'Essential risk management techniques for traders.'
              },
              {
                id: 'trading-psychology',
                title: 'Trading Psychology',
                duration: '28:10',
                videoUrl: vid5, // Use local video for testing
                description: 'Master the psychology of trading and emotional control.'
              },
              {
                id: 'summary-2',
                title: 'Summary',
                duration: '14:25',
                videoUrl: vid6, // Use local video for testing
                description: 'Complete summary of Phase 2 concepts and strategies.'
              }
            ]
          },
          {
            phaseId: 'pro-trader',
            title: 'Phase 3: Pro Trader',
            subtitle: 'Advanced trading techniques',
            price: 2499,
            originalPrice: 4999,
            currency: '₹',
            content: [
              {
                id: 'entry-exit-setup',
                title: 'Entry Exit Setup',
                duration: '35:20',
                videoUrl: vid1, // Use local video for testing
                description: 'Advanced entry and exit strategies for professional traders.'
              },
              {
                id: 'sniper-entry',
                title: 'Sniper Entry Setup',
                duration: '42:15',
                videoUrl: vid2, // Use local video for testing
                description: 'Precision entry techniques for maximum profit potential.'
              },
              {
                id: 'trap-trading',
                title: 'Trap Trading Setup',
                duration: '38:30',
                videoUrl: vid3, // Use local video for testing
                description: 'Identifying and avoiding trading traps and false signals.'
              },
              {
                id: 'double-capital',
                title: 'How to Double Capital',
                duration: '45:10',
                videoUrl: vid4, // Use local video for testing
                description: 'Strategies to double your trading capital effectively.'
              },
              {
                id: 'psychology-awareness',
                title: 'Trading Psychology Self Awareness',
                duration: '33:45',
                videoUrl: vid5, // Use local video for testing
                description: 'Developing self-awareness and mental discipline in trading.'
              },
              {
                id: 'summary-3',
                title: 'Summary',
                duration: '18:50',
                videoUrl: vid6, // Use local video for testing
                description: 'Complete summary of Phase 3 advanced concepts.'
              }
            ]
          },
          {
            phaseId: 'master-trader',
            title: 'Phase 4: Master Trader',
            subtitle: 'Elite trading mastery',
            price: 3999,
            originalPrice: 7999,
            currency: '₹',
            content: [
              {
                id: 'deposit-20k',
                title: 'Deposit 20k',
                duration: '25:30',
                videoUrl: vid1, // Use local video for testing
                description: 'How to start with 20k and build your trading foundation.'
              },
              {
                id: 'best-setups',
                title: 'Trade with Best Setups',
                duration: '50:20',
                videoUrl: vid2, // Use local video for testing
                description: 'Identifying and executing the highest probability setups.'
              },
              {
                id: 'grow-20k-to-1l',
                title: 'Grow 20k to 1L',
                duration: '60:15',
                videoUrl: vid3, // Use local video for testing
                description: 'Complete strategy to grow from 20k to 1 lakh rupees.'
              },
              {
                id: 'summary-4',
                title: 'Summary',
                duration: '22:40',
                videoUrl: vid4, // Use local video for testing
                description: 'Master trader summary and final insights.'
              }
            ]
          }
        ];
        setPhases(defaultPhases);
        /*
        }
        */
      } catch (error) {
        console.error('Failed to fetch learning phases:', error);
        // Keep using default phases on error
      } finally {
        setLoading(false);
      }
    };

    fetchLearningPhases();
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    // The userProgress state is now managed by UserContext, so we don't need to save here.
    // The updateUserProgress function in UserContext handles saving.
  }, [userProgress]);

  const togglePhase = (phaseId) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const goBackToCourses = () => {
    setSelectedContent(null);
    setIsPopupOpen(false);
  };

  // Progression System Functions
  const isPhaseUnlocked = (phaseId) => {
    // Add null check and default value
    if (!userProgress || !userProgress.unlockedPhases) {
      // Default: only beginner phase is unlocked for new users
      return phaseId === 'beginner';
    }
    return userProgress.unlockedPhases.includes(phaseId);
  };

  const isContentCompleted = (phaseId, contentId) => {
    // Add null check and default value
    if (!userProgress || !userProgress.completedContent) {
      return false;
    }
    const isCompleted = userProgress.completedContent[`${phaseId}-${contentId}`] === true;
    
    // Debug logging for completion status
    console.log(`🔍 Content Completion Check:`, {
      phaseId,
      contentId,
      key: `${phaseId}-${contentId}`,
      completedContent: userProgress.completedContent,
      isCompleted
    });
    
    return isCompleted;
  };

  // Check if video is unlocked based on previous video completion
  const isVideoUnlocked = (phaseId, contentId, contentIndex) => {
    // First video in phase is always unlocked
    if (contentIndex === 0) {
      return true;
    }
    
    // Check if previous video is completed (not just progress percentage)
    const currentPhase = phases.find(phase => phase.phaseId === phaseId);
    if (!currentPhase) return false;
    
    const previousContent = currentPhase.content[contentIndex - 1];
    if (!previousContent) return true;
    
    // Check if previous video is marked as completed
    const isPreviousCompleted = isContentCompleted(phaseId, previousContent.id);
    
    // Debug logging
    console.log(`🔓 Video Unlock Check:`, {
      phaseId,
      contentId,
      contentIndex,
      previousContentId: previousContent.id,
      isPreviousCompleted,
      isUnlocked: isPreviousCompleted
    });
    
    return isPreviousCompleted;
  };

  // Get video progress percentage
  const getVideoProgress = (phaseId, contentId) => {
    if (!userProgress?.videoProgress) return 0;
    return userProgress.videoProgress[`${phaseId}-${contentId}`] || 0;
  };

  // Update video progress
  const updateVideoProgress = (phaseId, contentId, progress) => {
    console.log('🎬 updateVideoProgress called:', { phaseId, contentId, progress, isAuthenticated, currentUser });
    
    // Check authentication first
    if (!isAuthenticated || !currentUser) {
      console.log('🔒 Progress update requires authentication - skipping');
      return;
    }
    
    const roundedProgress = Math.min(100, Math.max(0, Math.round(progress * 10) / 10));
    
    // Only update if progress has changed significantly (every 1%)
    const currentProgress = userProgress?.videoProgress?.[`${phaseId}-${contentId}`] || 0;
    if (Math.abs(roundedProgress - currentProgress) < 1) {
      console.log('⏭️ Skipping update - progress change too small');
      return;
    }
    
    // Check if content should be marked as completed (90% or more)
    const isCurrentlyCompleted = isContentCompleted(phaseId, contentId);
    const shouldMarkCompleted = roundedProgress >= 90 && !isCurrentlyCompleted;
    
    const newProgress = {
      ...userProgress,
      videoProgress: {
        ...(userProgress?.videoProgress || {}),
        [`${phaseId}-${contentId}`]: roundedProgress
      }
    };
    
    // Automatically mark as completed if 90% or more
    if (shouldMarkCompleted) {
      newProgress.completedContent = {
        ...(newProgress.completedContent || {}),
        [`${phaseId}-${contentId}`]: true
      };
      console.log(`✅ Auto-marking content as completed: ${phaseId}-${contentId}`);
      
      // Force a re-render to update UI immediately
      setForceUpdate(prev => prev + 1);
      
      // Check for newly unlocked videos after a short delay to ensure state is updated
      setTimeout(() => {
        checkForNewlyUnlockedVideos(phaseId, contentId);
      }, 100);
    }
    
    // Debug logging
    console.log(`📊 Video Progress Update:`, {
      phaseId,
      contentId,
      progress: roundedProgress,
      key: `${phaseId}-${contentId}`,
      previousProgress: currentProgress,
      isAuthenticated,
      currentUser,
      shouldMarkCompleted
    });
    
    // Save progress to backend (requires authentication)
    updateUserProgress(newProgress);
  };

  const markContentAsCompleted = (phaseId, contentId) => {
    // Check authentication first
    if (!isAuthenticated || !currentUser) {
      console.log('🔒 Content completion requires authentication - skipping');
      return;
    }
    
    const newProgress = {
      ...userProgress,
      completedContent: {
        ...(userProgress?.completedContent || {}),
        [`${phaseId}-${contentId}`]: true
      }
    };
    updateUserProgress(newProgress);
    
    // Check for newly unlocked videos after a short delay to ensure state is updated
    setTimeout(() => {
      checkForNewlyUnlockedVideos(phaseId, contentId);
    }, 100);
  };

  const handleContentClick = (phase, content) => {
    // Check if phase is unlocked
    if (!isPhaseUnlocked(phase.phaseId)) {
      alert('This phase is locked. Complete the previous phase to unlock it.');
      return;
    }
    
    // Check if this specific video is unlocked
    const contentIndex = phase.content.findIndex(item => item.id === content.id);
    if (!isVideoUnlocked(phase.phaseId, content.id, contentIndex)) {
      const previousContent = phase.content[contentIndex - 1];
      alert(`Please complete "${previousContent.title}" before accessing this video.`);
      return;
    }
    
    setSelectedContent({ ...content, phase });
    setIsPopupOpen(true);
  };

  const handleVideoComplete = (phaseId, contentId) => {
    markContentAsCompleted(phaseId, contentId);
  };

  // Payment handling functions
  const handlePhasePurchase = (phase) => {
    setSelectedPhaseForPayment(phase);
    setShowPaymentModal(true);
    setPaymentStep('details');
  };

  const handlePaymentSubmit = async () => {
    try {
      setPaymentStep('payment');
      
      // Load Razorpay
      const Razorpay = await loadRazorpay();
      if (!Razorpay) {
        throw new Error('Failed to load Razorpay');
      }

      // Create order on backend
      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPhaseForPayment.price,
          currency: 'INR',
          receipt: `phase_${selectedPhaseForPayment.phaseId}_${Date.now()}`,
          notes: {
            phaseId: selectedPhaseForPayment.phaseId,
            phaseTitle: selectedPhaseForPayment.title
          },
          userId: 'user123', // Replace with actual user ID
          phaseId: selectedPhaseForPayment.phaseId
        })
      });

      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Initialize Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Add this to your .env file
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'Pro-Chartist',
        description: `Purchase ${selectedPhaseForPayment.title}`,
        order_id: orderData.data.orderId,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: 'user123', // Replace with actual user ID
                phaseId: selectedPhaseForPayment.phaseId
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              // Unlock the phase after successful payment
              const newProgress = {
                ...userProgress,
                unlockedPhases: [...userProgress.unlockedPhases, selectedPhaseForPayment.phaseId]
              };
              updateUserProgress(newProgress);
              
              setPaymentStep('success');
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
            closePaymentModal();
          }
        },
        prefill: {
          name: 'User Name', // Replace with actual user name
          email: 'user@example.com', // Replace with actual user email
          contact: '9999999999' // Replace with actual user phone
        },
        theme: {
          color: '#22c55e'
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      closePaymentModal();
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPhaseForPayment(null);
    setPaymentStep('details');
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Login requirement check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] dark:from-[#0a0f14] dark:to-[#121926] pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-lg rounded-2xl p-8 border-2 border-[#0284c7]/30 dark:border-[#00b4d8]/30 shadow-xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLock className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-[#0f172a] dark:text-[#eaeaea] mb-2">🔒 Please Log In to Access All Courses</h2>
              <p className="text-[#475569] dark:text-[#9ca3af]">Create an account or sign in to track your progress across all devices and access your purchased courses.</p>
              
              <div className="flex gap-4 justify-center mt-6">
                <motion.button 
                  className="px-6 py-3 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </motion.button>
                <motion.button 
                  className="px-6 py-3 bg-transparent border-2 border-[#0284c7] text-[#0284c7] dark:text-[#38bdf8] rounded-lg font-semibold hover:bg-[#0284c7]/10 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </motion.button>
              </div>
            </div>
            
            {/* Show phase previews */}
            <div className="mt-12">
              <h3 className="text-xl font-bold text-center mb-8 text-[#0f172a] dark:text-[#eaeaea]">Course Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {phases.map((phase, index) => (
                  <motion.div 
                    key={phase.phaseId} 
                    className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-[#bfdbfe] dark:border-[#1f2a37] shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0f172a] dark:text-[#eaeaea]">{phase.title}</h4>
                        <p className="text-sm text-[#475569] dark:text-[#9ca3af]">{phase.subtitle}</p>
                        {phase.price && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-[#0284c7] dark:text-[#38bdf8]">{phase.currency}{formatPrice(phase.price)}</span>
                            {phase.originalPrice && phase.originalPrice > phase.price && (
                              <span className="text-sm text-[#475569] dark:text-[#9ca3af] line-through">{phase.currency}{formatPrice(phase.originalPrice)}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-[#bfdbfe] dark:border-[#1f2a37]">
                      <p className="text-sm text-[#475569] dark:text-[#9ca3af]">{phase.content.length} lessons</p>
                      <motion.button 
                        className="px-4 py-2 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white text-sm rounded-lg font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          toast.error('Please log in to purchase this phase');
                        }}
                      >
                        💳 Purchase Phase
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Conditional rendering for all phases video page
  if (selectedContent && ['beginner', 'trader', 'pro-trader', 'master-trader'].includes(selectedContent.phase.phaseId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] dark:from-[#0a0f14] dark:to-[#121926]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <motion.button
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goBackToCourses}
            >
              ← Back to Courses
            </motion.button>
            <motion.button
              className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all ${isPopupOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openPopup}
            >
              <FaBookOpen /> Open Syllabus
            </motion.button>
          </div>
          
          <div className={`bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-xl ${isPopupOpen ? 'w-3/4' : 'w-full'} transition-all duration-300`}>
            <h1 className="text-2xl font-bold text-center mb-6 text-[#0f172a] dark:text-[#eaeaea]">{selectedContent.title}</h1>
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-xl overflow-hidden shadow-lg">
              <video
                src={selectedContent.videoUrl}
                title={selectedContent.title}
                controls
                className="w-full h-full"
                onTimeUpdate={e => {
                  const video = e.target;
                  const percent = (video.currentTime / video.duration) * 100;
                  updateVideoProgress(selectedContent.phase.phaseId, selectedContent.id, percent);
                }}
                onEnded={() => updateVideoProgress(selectedContent.phase.phaseId, selectedContent.id, 100)}
              />
            </div>
            
            <div className="mt-6 text-center">
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVideoComplete(selectedContent.phase.phaseId, selectedContent.id)}
              >
                <FaCheckCircle /> Mark as Complete
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {isPopupOpen && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed top-0 right-0 w-1/4 h-screen bg-white dark:bg-[#1e293b] shadow-2xl z-50"
              >
                <div className="p-6 border-b border-[#bfdbfe] dark:border-[#1f2a37]">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#0f172a] dark:text-[#eaeaea]">{selectedContent.phase.title} Syllabus</h2>
                    <button
                      className="p-2 hover:bg-[#bfdbfe] dark:hover:bg-[#1f2a37] rounded-lg transition-colors"
                      onClick={closePopup}
                    >
                      <FaTimes className="text-[#475569] dark:text-[#9ca3af]" />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
                  {selectedContent.phase.content.map((item, index) => {
                    const isUnlocked = isVideoUnlocked(selectedContent.phase.phaseId, item.id, index);
                    const progress = getVideoProgress(selectedContent.phase.phaseId, item.id);
                    const isCompleted = isContentCompleted(selectedContent.phase.phaseId, item.id);
                    
                    return (
                      <motion.div
                        key={item.id || index}
                        className={`p-4 rounded-lg mb-4 cursor-pointer transition-all ${
                          selectedContent.id === item.id
                            ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white'
                            : isUnlocked
                              ? 'bg-white dark:bg-[#1e293b] border border-[#bfdbfe] dark:border-[#1f2a37] hover:border-[#0284c7] dark:hover:border-[#38bdf8]'
                              : 'bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed'
                        }`}
                        whileHover={isUnlocked ? { x: 5 } : {}}
                        onClick={() => isUnlocked && handleContentClick(selectedContent.phase, item)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedContent.id === item.id
                              ? 'bg-white text-[#0284c7]'
                              : isCompleted
                                ? 'bg-green-500 text-white'
                                : isUnlocked
                                  ? 'bg-[#0284c7] text-white'
                                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                          }`}>
                            {isCompleted ? (
                              <FaCheck className="text-xs" />
                            ) : !isUnlocked ? (
                              <FaLock className="text-xs" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm opacity-75">{item.duration}</p>
                            {isUnlocked && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-[#0284c7] to-[#38bdf8] h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-sm mt-2 opacity-75">{item.description}</p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] dark:from-[#0a0f14] dark:to-[#121926] pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-lg rounded-2xl p-6 border-2 border-[#bfdbfe] dark:border-[#1f2a37] shadow-xl">
          <div className="phases-list space-y-6">
            {phases.map((phase, index) => {
              const isUnlocked = isPhaseUnlocked(phase.phaseId);
              const completedCount = phase.content.filter(content => 
                isContentCompleted(phase.phaseId, content.id)
              ).length;
              const totalCount = phase.content.length;
              
              return (
                <motion.div
                  key={phase.phaseId}
                  className={`bg-white dark:bg-[#1e293b] rounded-xl overflow-hidden border-2 ${
                    expandedPhase === phase.phaseId 
                      ? 'border-[#0284c7] dark:border-[#00b4d8] shadow-lg' 
                      : 'border-[#bfdbfe] dark:border-[#1f2a37]'
                  } transition-all duration-300 ${isUnlocked ? 'hover:shadow-xl hover:-translate-y-1' : 'opacity-80'}`}
                  whileHover={{ y: -3 }}
                >
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => isUnlocked && togglePhase(phase.phaseId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                          isUnlocked 
                            ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] shadow-lg' 
                            : 'bg-[#bfdbfe] dark:bg-[#1f2a37]'
                        }`}>
                          {isUnlocked ? (
                            <span className="text-white font-bold text-lg">{index + 1}</span>
                          ) : (
                            <FaLock className="text-[#475569] dark:text-[#9ca3af]" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-[#0f172a] dark:text-[#eaeaea]">
                            {phase.title}
                            {!isUnlocked && <span className="text-sm text-red-500 ml-2">(Locked)</span>}
                          </h3>
                          <p className="text-sm text-[#475569] dark:text-[#9ca3af]">{phase.subtitle}</p>
                          
                          {phase.price && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-lg font-bold text-[#0284c7] dark:text-[#38bdf8]">
                                {phase.currency}{formatPrice(phase.price)}
                              </span>
                              {phase.originalPrice && phase.originalPrice > phase.price && (
                                <span className="text-sm text-[#475569] dark:text-[#9ca3af] line-through">
                                  {phase.currency}{formatPrice(phase.originalPrice)}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {isUnlocked && (
                            <div className="mt-3">
                              <div className="flex justify-between text-sm text-[#475569] dark:text-[#9ca3af] mb-1">
                                <span>Progress</span>
                                <span>{completedCount}/{totalCount} completed</span>
                              </div>
                              <div className="w-full bg-[#bfdbfe] dark:bg-[#1f2a37] rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-[#0284c7] to-[#38bdf8] h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isUnlocked && (
                        <motion.div 
                          className="text-[#475569] dark:text-[#9ca3af]"
                          animate={{ rotate: expandedPhase === phase.phaseId ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <FaChevronDown />
                        </motion.div>
                      )}
                    </div>
                    
                    {!isUnlocked && phase.price && (
                      <motion.button 
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePhasePurchase(phase)}
                      >
                        💳 Purchase Phase
                      </motion.button>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {expandedPhase === phase.phaseId && isUnlocked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-[#bfdbfe] dark:border-[#1f2a37]"
                      >
                        <div className="p-6 space-y-4">
                          {phase.content.map((item, itemIndex) => {
                            const isVideoUnlockedState = isVideoUnlocked(phase.phaseId, item.id, itemIndex);
                            const videoProgress = getVideoProgress(phase.phaseId, item.id);
                            const isCompleted = isContentCompleted(phase.phaseId, item.id);
                            
                            return (
                              <motion.div
                                key={item.id || itemIndex}
                                className={`p-4 rounded-lg border ${
                                  isCompleted 
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                    : isVideoUnlockedState 
                                      ? 'border-[#bfdbfe] dark:border-[#1f2a37] hover:border-[#0284c7] dark:hover:border-[#38bdf8] cursor-pointer' 
                                      : 'border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed'
                                } transition-all duration-300`}
                                whileHover={isVideoUnlockedState ? { x: 5 } : {}}
                                onClick={() => isVideoUnlockedState && handleContentClick(phase, item)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      isCompleted 
                                        ? 'bg-green-500 text-white' 
                                        : isVideoUnlockedState 
                                          ? 'bg-[#0284c7] text-white' 
                                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                                    }`}>
                                      {isCompleted ? (
                                        <FaCheck className="text-xs" />
                                      ) : !isVideoUnlockedState ? (
                                        <FaLock className="text-xs" />
                                      ) : (
                                        <span className="text-sm font-medium">{itemIndex + 1}</span>
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-[#0f172a] dark:text-[#eaeaea]">{item.title}</h4>
                                      <p className="text-sm text-[#475569] dark:text-[#9ca3af]">{item.duration}</p>
                                    </div>
                                  </div>
                                  
                                  {isVideoUnlockedState && (
                                    <div className="flex items-center gap-3">
                                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                          className="bg-gradient-to-r from-[#0284c7] to-[#38bdf8] h-2 rounded-full transition-all duration-500"
                                          style={{ width: `${videoProgress}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-[#475569] dark:text-[#9ca3af] w-8 text-right">
                                        {Math.round(videoProgress)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                {!isVideoUnlockedState && itemIndex > 0 && (
                                  <p className="text-xs text-[#475569] dark:text-[#9ca3af] mt-2 italic">
                                    Complete previous video to unlock
                                  </p>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedPhaseForPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closePaymentModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1e293b] rounded-2xl overflow-hidden w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {paymentStep === 'details' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#0f172a] dark:text-[#eaeaea]">Purchase {selectedPhaseForPayment.title}</h2>
                    <button
                      className="p-2 hover:bg-[#bfdbfe] dark:hover:bg-[#1f2a37] rounded-lg transition-colors"
                      onClick={closePaymentModal}
                    >
                      <FaTimes className="text-[#475569] dark:text-[#9ca3af]" />
                    </button>
                  </div>
                  <div className="bg-[#eff6ff] dark:bg-[#121926] rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-[#0f172a] dark:text-[#eaeaea] mb-2">{selectedPhaseForPayment.title}</h3>
                    <p className="text-[#475569] dark:text-[#9ca3af] mb-4">{selectedPhaseForPayment.subtitle}</p>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-2xl font-bold text-[#0284c7] dark:text-[#38bdf8]">
                        {selectedPhaseForPayment.currency}{formatPrice(selectedPhaseForPayment.price)}
                      </span>
                      {selectedPhaseForPayment.originalPrice && selectedPhaseForPayment.originalPrice > selectedPhaseForPayment.price && (
                        <span className="text-lg text-[#475569] dark:text-[#9ca3af] line-through">
                          {selectedPhaseForPayment.currency}{formatPrice(selectedPhaseForPayment.originalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-[#0f172a] dark:text-[#eaeaea] flex items-center gap-2">
                        <FaStar className="text-yellow-500" /> What you'll get:
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[#475569] dark:text-[#9ca3af]">
                          <FaPlay className="text-[#0284c7] dark:text-[#38bdf8]" /> Complete video course
                        </div>
                        <div className="flex items-center gap-2 text-[#475569] dark:text-[#9ca3af]">
                          <FaCheckCircle className="text-[#0284c7] dark:text-[#38bdf8]" /> Progress tracking
                        </div>
                        <div className="flex items-center gap-2 text-[#475569] dark:text-[#9ca3af]">
                          <FaCheck className="text-[#0284c7] dark:text-[#38bdf8]" /> Certificate of completion
                        </div>
                        <div className="flex items-center gap-2 text-[#475569] dark:text-[#9ca3af]">
                          <FaUnlock className="text-[#0284c7] dark:text-[#38bdf8]" /> Lifetime access
                        </div>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePaymentSubmit}
                  >
                    Proceed to Payment
                  </motion.button>
                </div>
              )}

              {paymentStep === 'payment' && (
                <div className="p-6 text-center">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#0f172a] dark:text-[#eaeaea] mb-4">Processing Payment</h2>
                  </div>
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 border-4 border-[#0284c7] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-[#475569] dark:text-[#9ca3af] mb-2">Redirecting to payment gateway...</p>
                    <p className="text-sm text-[#475569] dark:text-[#9ca3af]">Please complete the payment in the new window.</p>
                  </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="p-6 text-center">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#0f172a] dark:text-[#eaeaea] mb-4">Payment Successful!</h2>
                  </div>
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4">
                      <FaCheckCircle className="text-white text-3xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0f172a] dark:text-[#eaeaea] mb-2">Thank you for your purchase!</h3>
                    <p className="text-[#475569] dark:text-[#9ca3af] mb-6">You now have access to {selectedPhaseForPayment.title}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <FaUnlock /> Phase unlocked
                      </div>
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <FaPlay /> All content available
                      </div>
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <FaCheckCircle /> Progress tracking enabled
                      </div>
                    </div>
                  </div>
                  <motion.button
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closePaymentModal}
                  >
                    Start Learning
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Courses;