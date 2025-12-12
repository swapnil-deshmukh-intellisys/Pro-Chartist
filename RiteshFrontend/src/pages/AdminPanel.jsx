const API_URL = import.meta.env.VITE_API_URL;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './AdminPanel.css';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// Confirmation Modal Component
function ConfirmModal({ open, message, onConfirm, onCancel, showRejectionReason, rejectionReason, setRejectionReason }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 min-w-[300px] max-w-md">
        <div className="mb-4 text-gray-900 dark:text-gray-100">{message}</div>
        
        {showRejectionReason && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rejection Reason (Required)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => {
                console.log('Textarea onChange:', e.target.value); // Debug textarea changes
                console.log('Setting rejectionReason to:', e.target.value); // Debug state update
                setRejectionReason(e.target.value);
              }}
              placeholder="Please provide a reason for rejecting this application..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              rows="3"
              required
            />
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          <button className="update-btn bg-gray-400 hover:bg-gray-500 text-white" onClick={onCancel}>Cancel</button>
          <button 
            className="update-btn" 
            onClick={() => {
              console.log('Confirm button clicked, current rejectionReason:', rejectionReason); // Debug confirm click
              onConfirm(rejectionReason); // Pass the current rejection reason to onConfirm
            }}
            disabled={showRejectionReason && !rejectionReason.trim()}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ leagueData, setLeagueData, applications, setApplications, isAdminAuthenticated, setIsAdminAuthenticated }) {
  const navigate = useNavigate();
  
  // Check if admin is authenticated
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const isAdmin = localStorage.getItem('isAdminAuthenticated') === 'true';
    
    if (!adminToken || !isAdmin) {
      setIsAdminAuthenticated(false);
      navigate('/admin/login');
      return;
    }
  }, [navigate, setIsAdminAuthenticated]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomedIn, setZoomedIn] = useState(false); // <-- Add zoom state
  const [acceptedApplications, setAcceptedApplications] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]);
  const [modifiedTraders, setModifiedTraders] = useState([]);
  const [topTraders, setTopTraders] = useState([]);
  const [isLoadingTopTraders, setIsLoadingTopTraders] = useState(true);
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: 'Smart Money Concept Strategy',
      description: 'How to trade bot Bitcoin, Bank Nifty trade using Price line bot',
      thumbnail: '',
      videoUrl: ''
    },
    {
      id: 2,
      title: "Stock's Swing Bot Strategy",
      description: 'Stock swing bot: Use this bot to trade swing & stocks',
      thumbnail: '',
      videoUrl: ''
    },
    {
      id: 3,
      title: 'Price Line Bot Strategy',
      description: 'This bot presents and makes all kinds of levels of SMC',
      thumbnail: '',
      videoUrl: ''
    },
    {
      id: 4,
      title: 'Liquidity Bot Strategy',
      description: 'Learn how to identify and trade liquidity zones with this bot',
      thumbnail: '',
      videoUrl: ''
    }
  ]);
  const [uploadingVideo, setUploadingVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [applicationFilter, setApplicationFilter] = useState('pending'); // NEW: filter state
  const [editingVideoId, setEditingVideoId] = useState(null); // NEW: track which video is being edited

  // Learning Phases Management State
  const [learningPhases, setLearningPhases] = useState([]);
  const [editingPhase, setEditingPhase] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [uploadingPhaseContent, setUploadingPhaseContent] = useState(null);
  const [phaseUploadProgress, setPhaseUploadProgress] = useState({});
  const [selectedPhase, setSelectedPhase] = useState('beginner'); // NEW: track selected phase

  // Confirmation modal state
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null, showRejectionReason: false });
  const [rejectionReason, setRejectionReason] = useState('');

  // Debug rejection reason state changes
  useEffect(() => {
    console.log('rejectionReason state changed to:', rejectionReason);
  }, [rejectionReason]);

  // Helper to open confirmation modal
  const askConfirm = (message, onConfirm, showRejectionReason = false) => {
    console.log('askConfirm called with showRejectionReason:', showRejectionReason); // Debug askConfirm
    setConfirm({ open: true, message, onConfirm, showRejectionReason });
    // Only reset rejection reason if we're not showing the rejection reason input
    if (!showRejectionReason) {
      console.log('Resetting rejectionReason in askConfirm'); // Debug reset
      setRejectionReason('');
    }
  };
  const closeConfirm = () => {
    console.log('closeConfirm called, resetting rejectionReason'); // Debug closeConfirm
    setConfirm({ open: false, message: '', onConfirm: null, showRejectionReason: false });
    setRejectionReason('');
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (editingVideoId) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [editingVideoId]);

  // Helper to update progress for a specific video and type
  const setProgressFor = (videoId, type, progress) => {
    setUploadProgress(prev => ({
      ...prev,
      [`${videoId}_${type}`]: progress
    }));
  };

  const clearProgressFor = (videoId, type) => {
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[`${videoId}_${type}`];
      return newProgress;
    });
  };

    useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/league`);
        const data = await res.json();

        if (data) {
          setLeagueData(data);
          // Fallback: if traders is empty or malformed, initialize with 3 blank traders
          let traders = Array.isArray(data.currentLeague.traders) && data.currentLeague.traders.length >= 3
            ? data.currentLeague.traders
            : [
                { rank: 1, name: '', trades: 0, roi: 0 },
                { rank: 2, name: '', trades: 0, roi: 0 },
                { rank: 3, name: '', trades: 0, roi: 0 }
              ];
          setModifiedTraders(traders);
          localStorage.setItem('leagueData', JSON.stringify(data));
        }
      } catch (err) {
        console.error('Failed to fetch league data:', err);
      }
    };
    fetchLeagueData();
  }, []);

  // Fetch top traders history
  useEffect(() => {
    const fetchTopTraders = async () => {
      try {
        setIsLoadingTopTraders(true);
        const res = await fetch(`${API_URL}/api/league/topTraders`);
        const data = await res.json();
        setTopTraders(data || []);
      } catch (err) {
        console.error('Failed to fetch top traders:', err);
        setTopTraders([]);
      } finally {
        setIsLoadingTopTraders(false);
      }
    };

    fetchTopTraders();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/videos`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          setVideos(data);
        } else {
          // Initialize with default videos if none exist
          const defaultVideos = [
            {
              id: 1,
              title: 'Smart Money Concept Strategy',
              description: 'How to trade bot Bitcoin, Bank Nifty trade using Price line bot',
              thumbnail: '',
              videoUrl: ''
            },
            {
              id: 2,
              title: "Stock's Swing Bot Strategy",
              description: 'Stock swing bot: Use this bot to trade swing & stocks',
              thumbnail: '',
              videoUrl: ''
            },
            {
              id: 3,
              title: 'Price Line Bot Strategy',
              description: 'This bot presents and makes all kinds of levels of SMC',
              thumbnail: '',
              videoUrl: ''
            },
            {
              id: 4,
              title: 'Liquidity Bot Strategy',
              description: 'Learn how to identify and trade liquidity zones with this bot',
              thumbnail: '',
              videoUrl: ''
            }
          ];
          setVideos(defaultVideos);
        }
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        toast.error('Failed to fetch videos');
      }
    };
    
    fetchVideos();
  }, []);

  // Fetch Learning Phases
  useEffect(() => {
    const fetchLearningPhases = async () => {
      try {
        console.log('Fetching learning phases...');
        const res = await fetch(`${API_URL}/api/learning-phases`);
        console.log('Response status:', res.status);
        const data = await res.json();
        console.log('Fetched data:', data);
        
        if (data && data.length > 0) {
          console.log('Setting phases from API:', data);
          setLearningPhases(data);
        } else {
          console.log('No phases from API, using defaults');
          // Initialize with default phases if none exist
          const defaultPhases = [
            {
              phaseId: 'beginner',
              title: 'Phase 1: Beginner',
              subtitle: 'Foundation course for new traders',
              order: 1,
              content: [
                {
                  id: 'basics',
                  title: 'Basic\'s',
                  description: 'Learn the fundamental concepts of trading and market basics.',
                  duration: '15:30',
                  videoUrl: '',
                  thumbnail: '',
                  order: 1
                },
                {
                  id: 'technical-analysis',
                  title: 'Technical Analysis',
                  description: 'Master technical analysis techniques and chart patterns.',
                  duration: '22:15',
                  videoUrl: '',
                  thumbnail: '',
                  order: 2
                },
                {
                  id: 'dow-theory',
                  title: 'Dow Theory',
                  description: 'Understanding Dow Theory principles and market trends.',
                  duration: '18:45',
                  videoUrl: '',
                  thumbnail: '',
                  order: 3
                },
                {
                  id: 'smc-crt',
                  title: 'SMC + CRT',
                  description: 'Smart Money Concepts and Critical Resistance Theory.',
                  duration: '25:10',
                  videoUrl: '',
                  thumbnail: '',
                  order: 4
                },
                {
                  id: 'market-structure',
                  title: 'Market Structure',
                  description: 'Learn about market structure and price action.',
                  duration: '20:30',
                  videoUrl: '',
                  thumbnail: '',
                  order: 5
                },
                {
                  id: 'summary',
                  title: 'Summary',
                  description: 'Complete summary of Phase 1 concepts and takeaways.',
                  duration: '12:20',
                  videoUrl: '',
                  thumbnail: '',
                  order: 6
                }
              ]
            },
            {
              phaseId: 'trader',
              title: 'Phase 2: Trader',
              subtitle: 'Intermediate trading strategies',
              order: 2,
              content: [
                {
                  id: 'demo-trading',
                  title: 'Demo Trading',
                  description: 'Practice trading with demo accounts and paper trading.',
                  duration: '18:20',
                  videoUrl: '',
                  thumbnail: '',
                  order: 1
                },
                {
                  id: 'grow-capital',
                  title: 'How to Grow 50k Capital',
                  description: 'Strategies to grow your trading capital from 50k.',
                  duration: '30:15',
                  videoUrl: '',
                  thumbnail: '',
                  order: 2
                },
                {
                  id: 'trading-journal',
                  title: 'Trading Journal',
                  description: 'How to maintain an effective trading journal.',
                  duration: '15:45',
                  videoUrl: '',
                  thumbnail: '',
                  order: 3
                },
                {
                  id: 'risk-management',
                  title: 'Risk Management',
                  description: 'Essential risk management techniques for traders.',
                  duration: '22:30',
                  videoUrl: '',
                  thumbnail: '',
                  order: 4
                },
                {
                  id: 'trading-psychology',
                  title: 'Trading Psychology',
                  description: 'Master the psychology of trading and emotional control.',
                  duration: '28:10',
                  videoUrl: '',
                  thumbnail: '',
                  order: 5
                },
                {
                  id: 'summary-2',
                  title: 'Summary',
                  description: 'Complete summary of Phase 2 concepts and strategies.',
                  duration: '14:25',
                  videoUrl: '',
                  thumbnail: '',
                  order: 6
                }
              ]
            },
            {
              phaseId: 'pro-trader',
              title: 'Phase 3: Pro Trader',
              subtitle: 'Advanced trading techniques',
              order: 3,
              content: [
                {
                  id: 'entry-exit-setup',
                  title: 'Entry Exit Setup',
                  description: 'Advanced entry and exit strategies for professional traders.',
                  duration: '35:20',
                  videoUrl: '',
                  thumbnail: '',
                  order: 1
                },
                {
                  id: 'sniper-entry',
                  title: 'Sniper Entry Setup',
                  description: 'Precision entry techniques for maximum profit potential.',
                  duration: '42:15',
                  videoUrl: '',
                  thumbnail: '',
                  order: 2
                },
                {
                  id: 'trap-trading',
                  title: 'Trap Trading Setup',
                  description: 'Identifying and avoiding trading traps and false signals.',
                  duration: '38:30',
                  videoUrl: '',
                  thumbnail: '',
                  order: 3
                },
                {
                  id: 'double-capital',
                  title: 'How to Double Capital',
                  description: 'Strategies to double your trading capital effectively.',
                  duration: '45:10',
                  videoUrl: '',
                  thumbnail: '',
                  order: 4
                },
                {
                  id: 'psychology-awareness',
                  title: 'Trading Psychology Self Awareness',
                  description: 'Developing self-awareness and mental discipline in trading.',
                  duration: '33:45',
                  videoUrl: '',
                  thumbnail: '',
                  order: 5
                },
                {
                  id: 'summary-3',
                  title: 'Summary',
                  description: 'Complete summary of Phase 3 advanced concepts.',
                  duration: '18:50',
                  videoUrl: '',
                  thumbnail: '',
                  order: 6
                }
              ]
            },
            {
              phaseId: 'master-trader',
              title: 'Phase 4: Master Trader',
              subtitle: 'Elite trading mastery',
              order: 4,
              content: [
                {
                  id: 'deposit-20k',
                  title: 'Deposit 20k',
                  description: 'How to start with 20k and build your trading foundation.',
                  duration: '25:30',
                  videoUrl: '',
                  thumbnail: '',
                  order: 1
                },
                {
                  id: 'best-setups',
                  title: 'Trade with Best Setups',
                  description: 'Identifying and executing the highest probability setups.',
                  duration: '50:20',
                  videoUrl: '',
                  thumbnail: '',
                  order: 2
                },
                {
                  id: 'grow-20k-to-1l',
                  title: 'Grow 20k to 1L',
                  description: 'Complete strategy to grow from 20k to 1 lakh rupees.',
                  duration: '60:15',
                  videoUrl: '',
                  thumbnail: '',
                  order: 3
                },
                {
                  id: 'summary-4',
                  title: 'Summary',
                  description: 'Master trader summary and final insights.',
                  duration: '22:40',
                  videoUrl: '',
                  thumbnail: '',
                  order: 4
                }
              ]
            }
          ];
          setLearningPhases(defaultPhases);
        }
      } catch (error) {
        console.error('Failed to fetch learning phases:', error);
        // Keep using default phases on error
        console.log('API failed, using default phases');
        const defaultPhases = [
          {
            phaseId: 'beginner',
            title: 'Phase 1: Beginner',
            subtitle: 'Foundation course for new traders',
            order: 1,
            content: [
              {
                id: 'basics',
                title: 'Basic\'s',
                description: 'Learn the fundamental concepts of trading and market basics.',
                duration: '15:30',
                videoUrl: '',
                thumbnail: '',
                order: 1
              },
              {
                id: 'technical-analysis',
                title: 'Technical Analysis',
                description: 'Master technical analysis techniques and chart patterns.',
                duration: '22:15',
                videoUrl: '',
                thumbnail: '',
                order: 2
              },
              {
                id: 'dow-theory',
                title: 'Dow Theory',
                description: 'Understanding Dow Theory principles and market trends.',
                duration: '18:45',
                videoUrl: '',
                thumbnail: '',
                order: 3
              },
              {
                id: 'smc-crt',
                title: 'SMC + CRT',
                description: 'Smart Money Concepts and Critical Resistance Theory.',
                duration: '25:10',
                videoUrl: '',
                thumbnail: '',
                order: 4
              },
              {
                id: 'market-structure',
                title: 'Market Structure',
                description: 'Learn about market structure and price action.',
                duration: '20:30',
                videoUrl: '',
                thumbnail: '',
                order: 5
              },
              {
                id: 'summary',
                title: 'Summary',
                description: 'Complete summary of Phase 1 concepts and takeaways.',
                duration: '12:20',
                videoUrl: '',
                thumbnail: '',
                order: 6
              }
            ]
          },
          {
            phaseId: 'trader',
            title: 'Phase 2: Trader',
            subtitle: 'Intermediate trading strategies',
            order: 2,
            content: [
              {
                id: 'demo-trading',
                title: 'Demo Trading',
                description: 'Practice trading with demo accounts and paper trading.',
                duration: '18:20',
                videoUrl: '',
                thumbnail: '',
                order: 1
              },
              {
                id: 'grow-capital',
                title: 'How to Grow 50k Capital',
                description: 'Strategies to grow your trading capital from 50k.',
                duration: '30:15',
                videoUrl: '',
                thumbnail: '',
                order: 2
              },
              {
                id: 'trading-journal',
                title: 'Trading Journal',
                description: 'How to maintain an effective trading journal.',
                duration: '15:45',
                videoUrl: '',
                thumbnail: '',
                order: 3
              },
              {
                id: 'risk-management',
                title: 'Risk Management',
                description: 'Essential risk management techniques for traders.',
                duration: '22:30',
                videoUrl: '',
                thumbnail: '',
                order: 4
              },
              {
                id: 'trading-psychology',
                title: 'Trading Psychology',
                description: 'Master the psychology of trading and emotional control.',
                duration: '28:10',
                videoUrl: '',
                thumbnail: '',
                order: 5
              },
              {
                id: 'summary-2',
                title: 'Summary',
                description: 'Complete summary of Phase 2 concepts and strategies.',
                duration: '14:25',
                videoUrl: '',
                thumbnail: '',
                order: 6
              }
            ]
          },
          {
            phaseId: 'pro-trader',
            title: 'Phase 3: Pro Trader',
            subtitle: 'Advanced trading techniques',
            order: 3,
            content: [
              {
                id: 'entry-exit-setup',
                title: 'Entry Exit Setup',
                description: 'Advanced entry and exit strategies for professional traders.',
                duration: '35:20',
                videoUrl: '',
                thumbnail: '',
                order: 1
              },
              {
                id: 'sniper-entry',
                title: 'Sniper Entry Setup',
                description: 'Precision entry techniques for maximum profit potential.',
                duration: '42:15',
                videoUrl: '',
                thumbnail: '',
                order: 2
              },
              {
                id: 'trap-trading',
                title: 'Trap Trading Setup',
                description: 'Identifying and avoiding trading traps and false signals.',
                duration: '38:30',
                videoUrl: '',
                thumbnail: '',
                order: 3
              },
              {
                id: 'double-capital',
                title: 'How to Double Capital',
                description: 'Strategies to double your trading capital effectively.',
                duration: '45:10',
                videoUrl: '',
                thumbnail: '',
                order: 4
              },
              {
                id: 'psychology-awareness',
                title: 'Trading Psychology Self Awareness',
                description: 'Developing self-awareness and mental discipline in trading.',
                duration: '33:45',
                videoUrl: '',
                thumbnail: '',
                order: 5
              },
              {
                id: 'summary-3',
                title: 'Summary',
                description: 'Complete summary of Phase 3 advanced concepts.',
                duration: '18:50',
                videoUrl: '',
                thumbnail: '',
                order: 6
              }
            ]
          },
          {
            phaseId: 'master-trader',
            title: 'Phase 4: Master Trader',
            subtitle: 'Elite trading mastery',
            order: 4,
            content: [
              {
                id: 'deposit-20k',
                title: 'Deposit 20k',
                description: 'How to start with 20k and build your trading foundation.',
                duration: '25:30',
                videoUrl: '',
                thumbnail: '',
                order: 1
              },
              {
                id: 'best-setups',
                title: 'Trade with Best Setups',
                description: 'Identifying and executing the highest probability setups.',
                duration: '50:20',
                videoUrl: '',
                thumbnail: '',
                order: 2
              },
              {
                id: 'grow-20k-to-1l',
                title: 'Grow 20k to 1L',
                description: 'Complete strategy to grow from 20k to 1 lakh rupees.',
                duration: '60:15',
                videoUrl: '',
                thumbnail: '',
                order: 3
              },
              {
                id: 'summary-4',
                title: 'Summary',
                description: 'Master trader summary and final insights.',
                duration: '22:40',
                videoUrl: '',
                thumbnail: '',
                order: 4
              }
            ]
          }
        ];
        setLearningPhases(defaultPhases);
      }
    };
    
    fetchLearningPhases();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      const selectedDate = leagueData?.currentLeague?.nextLeagueStart;
      if (!selectedDate) return;
  
      try {
        const res = await fetch(`${API_URL}/api/applicationsByDate?date=${selectedDate}`);
        const data = await res.json(); // ⬅️ DIRECTLY use the array
  
        const pending = data.filter(app => app.status === 'pending');
        const approved = data.filter(app => app.status === 'approved');
        const rejected = data.filter(app => app.status === 'rejected');
  
        setApplications(pending);
        setAcceptedApplications(approved);
        setRejectedApplications(rejected);
      } catch (err) {
        toast.error('Failed to fetch applications by date');
        console.error('fetchApplications error:', err);
      }
    };
  
    fetchApplications();
  }, [leagueData?.currentLeague?.nextLeagueStart]);

  // Backend upload logic
  const uploadFileToBackend = async (videoId, type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('videoId', videoId);
    const endpoint = `${API_URL}/api/videos/upload/${type === 'video' ? 'video' : 'image'}`;
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint, true);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setProgressFor(videoId, type, progress);
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          setProgressFor(videoId, type, 100);
          const data = JSON.parse(xhr.responseText);
          resolve(data.url);
        } else {
          setProgressFor(videoId, type, 0);
          reject(new Error('Upload failed'));
        }
      };
      xhr.onerror = () => {
        setProgressFor(videoId, type, 0);
        reject(new Error('Upload failed'));
      };
      xhr.send(formData);
    });
  };

  const MAX_VIDEO_SIZE_MB = 10;
  const handleVideoUpload = async (videoId, file, type) => {
    if (type === 'video' && file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      toast.error('File too large! Max allowed size is 10MB.');
      return;
    }
    try {
      setUploadingVideo({ id: videoId, type });
      setProgressFor(videoId, type, 0);
      const url = await uploadFileToBackend(videoId, type, file);
      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, [type === 'video' ? 'videoUrl' : 'thumbnail']: url }
          : video
      ));
      toast.success(`${type === 'video' ? 'Video' : 'Thumbnail'} uploaded successfully!`);
    } catch (error) {
      console.error('Video upload failed:', error);
      toast.error(`Failed to upload ${type}: ${error.message || ''}`);
    } finally {
      setUploadingVideo(null);
      clearProgressFor(videoId, type);
    }
  };

  const handleVideoUpdate = (videoId, field, value) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId ? { ...video, [field]: value } : video
    ));
  };

  const saveVideos = async () => {
    try {
      // Ensure all required fields are present for each video
      const videosToSave = videos.map((video, idx) => ({
        id: video.id ?? idx + 1,
        title: video.title || '',
        description: video.description || '',
        thumbnail: video.thumbnail || '',
        videoUrl: video.videoUrl || '',
      }));

      const res = await fetch(`${API_URL}/api/videos/bulk/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: videosToSave })
      });

      if (!res.ok) {
        throw new Error('Failed to save videos');
      }

      const updatedVideos = await res.json();
      setVideos(updatedVideos);
      toast.success('Videos saved successfully!');
    } catch (error) {
      console.error('Failed to save videos:', error);
      toast.error('Failed to save videos');
    }
  };

  // Learning Phases Management Functions
  const saveLearningPhases = async () => {
    try {
      const res = await fetch(`${API_URL}/api/learning-phases/bulk/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phases: learningPhases })
      });

      if (!res.ok) {
        throw new Error('Failed to save learning phases');
      }

      const updatedPhases = await res.json();
      setLearningPhases(updatedPhases);
      toast.success('Learning phases saved successfully!');
    } catch (error) {
      console.error('Failed to save learning phases:', error);
      toast.error('Failed to save learning phases');
    }
  };

  const handlePhaseUpdate = (phaseId, field, value) => {
    setLearningPhases(prev => prev.map(phase => 
      phase.phaseId === phaseId ? { ...phase, [field]: value } : phase
    ));
  };

  const handleContentUpdate = (phaseId, contentId, field, value) => {
    setLearningPhases(prev => prev.map(phase => 
      phase.phaseId === phaseId 
        ? {
            ...phase,
            content: phase.content.map(content => 
              content.id === contentId ? { ...content, [field]: value } : content
            )
          }
        : phase
    ));
  };

  const addContentToPhase = (phaseId) => {
    const newContent = {
      id: `content-${Date.now()}`,
      title: '',
      description: '',
      duration: '',
      videoUrl: '',
      thumbnail: '',
      order: 1
    };

    setLearningPhases(prev => prev.map(phase => 
      phase.phaseId === phaseId 
        ? { ...phase, content: [...phase.content, newContent] }
        : phase
    ));
  };

  const removeContentFromPhase = (phaseId, contentId) => {
    setLearningPhases(prev => prev.map(phase => 
      phase.phaseId === phaseId 
        ? { ...phase, content: phase.content.filter(content => content.id !== contentId) }
        : phase
    ));
  };

  const uploadPhaseContent = async (phaseId, contentId, file, type) => {
    try {
      setUploadingPhaseContent({ phaseId, contentId, type });
      setPhaseUploadProgress(prev => ({ ...prev, [`${phaseId}_${contentId}_${type}`]: 0 }));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('phaseId', phaseId);
      formData.append('contentId', contentId);

      const endpoint = `${API_URL}/api/learning-phases/upload/${type}`;
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint, true);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setPhaseUploadProgress(prev => ({ 
            ...prev, 
            [`${phaseId}_${contentId}_${type}`]: progress 
          }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          handleContentUpdate(phaseId, contentId, type === 'video' ? 'videoUrl' : 'thumbnail', data.url);
          toast.success(`${type === 'video' ? 'Video' : 'Thumbnail'} uploaded successfully!`);
        } else {
          toast.error(`Failed to upload ${type}`);
        }
        setUploadingPhaseContent(null);
        setPhaseUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[`${phaseId}_${contentId}_${type}`];
          return newProgress;
        });
      };

      xhr.onerror = () => {
        toast.error(`Failed to upload ${type}`);
        setUploadingPhaseContent(null);
        setPhaseUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[`${phaseId}_${contentId}_${type}`];
          return newProgress;
        });
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Failed to upload ${type}`);
      setUploadingPhaseContent(null);
    }
  };

  const handleApplicationStatus = async (application, newStatus) => {
    let actionMsg = '';
    if (newStatus === 'approved') actionMsg = 'approve this application';
    else if (newStatus === 'rejected') actionMsg = 'reject this application';
    else actionMsg = 'revert this application to pending';
    
    // For rejection, show rejection reason input
    if (newStatus === 'rejected') {
      askConfirm(`Are you sure you want to ${actionMsg}?`, async (capturedRejectionReason) => {
        console.log('onConfirm callback received rejectionReason:', capturedRejectionReason); // Debug received reason
        const finalRejectionReason = capturedRejectionReason?.trim() || 'No reason provided';
        console.log('Final rejection reason:', finalRejectionReason); // Debug final reason
        closeConfirm();
        try {
          const appId = application._id || application.id;
          const adminToken = localStorage.getItem('adminToken');
          console.log('Current rejectionReason state:', rejectionReason); // Debug rejection reason state
          const requestBody = { 
            status: newStatus,
            rejectionReason: finalRejectionReason
          };
          console.log('Admin sending rejection request:', requestBody); // Debug log
          const res = await fetch(`${API_URL}/api/applicationsByDate/${appId}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(requestBody),
          });

          if (res.status === 403) {
            // Token expired, redirect to login
            toast.error('Session expired. Please login again.');
            handleLogout();
            return;
          }

          if (!res.ok) throw new Error('Failed to update application');

          const updatedApp = await res.json();
          console.log('Admin received updated application:', updatedApp); // Debug log

          setApplications(prev => prev.filter(app => app._id !== appId));
          setAcceptedApplications(prev => prev.filter(app => app._id !== appId));
          setRejectedApplications(prev => prev.filter(app => app._id !== appId));

          setRejectedApplications(prev => [...prev, updatedApp]);

          toast.success(`Application marked as ${newStatus}`);
        } catch (err) {
          console.error('Update status failed:', err);
          toast.error('Failed to update application status');
        }
      }, true); // Show rejection reason input
    } else {
      // For approve and revert, use normal confirmation
      askConfirm(`Are you sure you want to ${actionMsg}?`, async () => {
        closeConfirm();
        try {
          const appId = application._id || application.id;
          const adminToken = localStorage.getItem('adminToken');
          const res = await fetch(`${API_URL}/api/applicationsByDate/${appId}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ status: newStatus }),
          });

          if (res.status === 403) {
            // Token expired, redirect to login
            toast.error('Session expired. Please login again.');
            handleLogout();
            return;
          }

          if (!res.ok) throw new Error('Failed to update application');

          const updatedApp = await res.json();

          setApplications(prev => prev.filter(app => app._id !== appId));
          setAcceptedApplications(prev => prev.filter(app => app._id !== appId));
          setRejectedApplications(prev => prev.filter(app => app._id !== appId));

          if (newStatus === 'approved') setAcceptedApplications(prev => [...prev, updatedApp]);
          else setApplications(prev => [...prev, updatedApp]);

          toast.success(`Application marked as ${newStatus}`);
        } catch (err) {
          console.error('Update status failed:', err);
          toast.error('Failed to update application status');
        }
      });
    }
  };

  const handleLogout = () => {
    askConfirm('Are you sure you want to logout?', () => {
      closeConfirm();
      setIsAdminAuthenticated(false);
      localStorage.removeItem('isAdminAuthenticated');
      localStorage.removeItem('adminRole');
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
    });
  };

  // Top Traders Management Functions
  const addTopTrader = () => {
    const newTrader = {
      date: '',
      name: '',
      roi: 0
    };
    setTopTraders([...topTraders, newTrader]);
  };

  const updateTopTrader = (index, field, value) => {
    const updatedTraders = [...topTraders];
    updatedTraders[index] = { ...updatedTraders[index], [field]: value };
    setTopTraders(updatedTraders);
  };

  const removeTopTrader = (index) => {
    const updatedTraders = topTraders.filter((_, i) => i !== index);
    setTopTraders(updatedTraders);
  };

  const saveTopTraders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/league/topTraders`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topTraders })
      });

      if (res.ok) {
        toast.success('Top traders updated successfully!');
      } else {
        toast.error('Failed to update top traders');
      }
    } catch (err) {
      console.error('Error saving top traders:', err);
      toast.error('Failed to update top traders');
    }
  };

  // Get today's date in yyyy-mm-dd format
  const todayStr = new Date().toISOString().split('T')[0];

  // Update the League Management form submission to validate dates
  const updateLeagueData = async (e) => {
    e.preventDefault();
    const startDate = leagueData.currentLeague.startDate;
    const nextLeagueStart = leagueData.currentLeague.nextLeagueStart;
    if (startDate < todayStr || nextLeagueStart < todayStr) {
      toast.error('Please select today or a future date for league dates.');
      return;
    }
    askConfirm('Are you sure you want to update league dates?', async () => {
      closeConfirm();
    try {
      const adminToken = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/league`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ currentLeague: leagueData.currentLeague }),
      });
      if (!res.ok) throw new Error('Failed to save league data');
      const updated = await res.json();
      setLeagueData(updated);
      setModifiedTraders(updated.currentLeague.traders);
      localStorage.setItem('leagueData', JSON.stringify(updated));
      toast.success('League data saved!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save league data');
    }
    });
  };
  

  const handleUpdateTrader = (rank, field, value) => {
    setModifiedTraders(
      modifiedTraders.map((trader) =>
        trader.rank === rank ? { ...trader, [field]: value } : trader
      )
    );
  };

  const handleSubmitTraders = async () => {
    askConfirm('Are you sure you want to update top traders?', async () => {
      closeConfirm();
    const updatedLeague = {
      ...leagueData,
      currentLeague: {
        ...leagueData.currentLeague,
        traders: modifiedTraders.slice(0, 3),
      },
    };

    try {
      const adminToken = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/league`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ currentLeague: updatedLeague.currentLeague }),
      });

      if (!res.ok) throw new Error('Failed to save trader data');

      const updated = await res.json();
      setLeagueData(updated);
      setModifiedTraders(updated.currentLeague.traders);
      localStorage.setItem("leagueData", JSON.stringify(updated));
      toast.success('Top traders updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update traders');
    }
    });
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setZoomedIn(false); // Reset zoom when opening
  };
  const closeImageModal = () => setSelectedImage(null);
  const toggleZoom = (e) => {
    e.stopPropagation();
    setZoomedIn(z => !z);
  };

  // NEW: get filtered applications
  let filteredApplications = [];
  if (applicationFilter === 'pending') filteredApplications = applications;
  else if (applicationFilter === 'accepted') filteredApplications = acceptedApplications;
  else if (applicationFilter === 'rejected') filteredApplications = rejectedApplications;



  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Admin Panel</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="admin-content">
        {/* Flex row for League Management and Update Top Traders */}
        <div className="flex-row-admin-panel">
        <div className="league-management">
          <h2 className="text-2xl font-bold mb-4">League Management</h2>
          <form onSubmit={updateLeagueData}>
            <div className="form-group">
              <label className="font-medium mb-1 block">Current League Start Date</label>
              <input
                type="date"
                min={todayStr}
                value={leagueData.currentLeague.startDate}
                onChange={(e) => setLeagueData({
                  ...leagueData,
                  currentLeague: {
                    ...leagueData.currentLeague,
                    startDate: e.target.value,
                  },
                })}
              />
            </div>
            <div className="form-group">
              <label className="font-medium mb-1 block">Next League Start Date</label>
              <input
                type="date"
                min={todayStr}
                value={leagueData.currentLeague.nextLeagueStart}
                onChange={(e) => setLeagueData({
                  ...leagueData,
                  currentLeague: {
                    ...leagueData.currentLeague,
                    nextLeagueStart: e.target.value,
                  },
                })}
              />
            </div>
            <div className="form-group">
              <label className="font-medium mb-1 block">Current Participants</label>
              <input
                type="number"
                value={leagueData.currentLeague.participants}
                onChange={(e) => setLeagueData({
                  ...leagueData,
                  currentLeague: {
                    ...leagueData.currentLeague,
                    participants: parseInt(e.target.value),
                  },
                })}
              />
            </div>
            <button type="submit" className="update-btn">Update League Dates</button>
          </form>
          </div>

          <div className="update-traders">
            <h2 className="text-xl font-bold mb-4">Update Top Traders</h2>
            <table>
              <thead>
                <tr><th>Rank</th><th>Name</th><th>Trades</th><th>ROI</th></tr>
              </thead>
              <tbody className='traders-table-modified'>
                {modifiedTraders.slice(0, 3).map((trader) => (
                  <tr key={trader.rank}>
                    <td>{trader.rank}</td>
                    <td><input type="text" value={trader.name || ''} onChange={(e) => handleUpdateTrader(trader.rank, 'name', e.target.value)} /></td>
                    <td><input type="number" value={trader.trades ?? 0} onChange={(e) => handleUpdateTrader(trader.rank, 'trades', parseInt(e.target.value))} /></td>
                    <td><input type="number" value={trader.roi ?? 0} onChange={(e) => handleUpdateTrader(trader.rank, 'roi', parseFloat(e.target.value))} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleSubmitTraders} className="update-btn">Update Top Traders</button>
          </div>

          {/* Historical Top Traders Management */}
          <div className="historical-traders">
            <h2 className="text-xl font-bold mb-4">Historical Top Traders</h2>
            {isLoadingTopTraders ? (
              <div className="loading-message">Loading top traders...</div>
            ) : (
              <>
                <div className="top-traders-list">
                  {topTraders.map((trader, index) => (
                    <div key={index} className="trader-item">
                      <div className="trader-inputs">
                        <input
                          type="text"
                          placeholder="Date (e.g., Jan 2024)"
                          value={trader.date}
                          onChange={(e) => updateTopTrader(index, 'date', e.target.value)}
                          className="trader-input"
                        />
                        <input
                          type="text"
                          placeholder="Trader Name"
                          value={trader.name}
                          onChange={(e) => updateTopTrader(index, 'name', e.target.value)}
                          className="trader-input"
                        />
                        <input
                          type="number"
                          placeholder="ROI %"
                          value={trader.roi}
                          onChange={(e) => updateTopTrader(index, 'roi', parseFloat(e.target.value) || 0)}
                          className="trader-input"
                        />
                        <button
                          onClick={() => removeTopTrader(index)}
                          className="remove-btn"
                          title="Remove trader"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="trader-actions">
                  <button onClick={addTopTrader} className="add-btn">
                    ➕ Add Historical Trader
                  </button>
                  <button onClick={saveTopTraders} className="save-btn">
                    💾 Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="video-management relative">
          <h2 className="text-2xl font-bold mb-4">Video Management</h2>
          {/* Blur overlay for entire page when editing */}
          {editingVideoId && (
            <div className="fixed inset-0 z-40 backdrop-blur-sm bg-black/10 pointer-events-none" />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {videos.map((video) => {
              const isEditing = editingVideoId === video.id;
              if (isEditing) {
                // Render the editing card as a fixed, centered modal above the blur
                return (
                  <div
                    key={video.id}
                    className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-lg w-full border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[90vh]"
                    style={{ minWidth: '320px' }}
                  >
                    <h3 className="text-lg font-semibold mb-2">Video {video.id}</h3>
                    <div className="form-group">
                      <label className="font-medium mb-1 block">Title</label>
                      <input
                        type="text"
                        value={video.title}
                        onChange={e => handleVideoUpdate(video.id, 'title', e.target.value)}
                        placeholder="Video title"
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="form-group">
                      <label className="font-medium mb-1 block">Description</label>
                      <textarea
                        value={video.description}
                        onChange={e => handleVideoUpdate(video.id, 'description', e.target.value)}
                        placeholder="Video description"
                        rows="3"
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="form-group">
                      <label className="font-medium mb-1 block">Thumbnail</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files[0]) {
                            handleVideoUpload(video.id, e.target.files[0], 'thumbnail');
                          }
                        }}
                        disabled={uploadingVideo?.id === video.id && uploadingVideo?.type === 'thumbnail'}
                        className="block w-full text-sm text-gray-400"
                      />
                      {video.thumbnail && (
                        <img
                        src={
                          video.thumbnail.startsWith('http')
                            ? video.thumbnail
                            : `${import.meta.env.VITE_API_URL}/${video.thumbnail.replace(/^\/?/, '')}`
                        }
                        alt="Thumbnail"
                        className="w-28 h-16 object-cover rounded-lg mt-2 border border-gray-300 dark:border-gray-700"
                      />
                      )}
                      {uploadingVideo?.id === video.id && uploadingVideo?.type === 'thumbnail' && (
                        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">Uploading thumbnail...</div>
                      )}
                      {uploadingVideo?.id === video.id && uploadingVideo?.type === 'thumbnail' && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-pink-500 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress[`${video.id}_thumbnail`] || 0}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="font-medium mb-1 block">Video File</label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={e => {
                          if (e.target.files[0]) {
                            handleVideoUpload(video.id, e.target.files[0], 'video');
                          }
                        }}
                        disabled={uploadingVideo?.id === video.id && uploadingVideo?.type === 'video'}
                        className="block w-full text-sm text-gray-400"
                      />
                      {video.videoUrl && (
                        <video
                          src={video.videoUrl}
                          controls
                          className="w-full max-h-40 mt-2 rounded-lg border border-gray-300 dark:border-gray-700"
                        />
                      )}
                      {uploadingVideo?.id === video.id && uploadingVideo?.type === 'video' && (
                        <div className="mt-2 text-xs text-pink-600 dark:text-pink-400">Uploading video...</div>
                      )}
                      {uploadingVideo?.id === video.id && uploadingVideo?.type === 'video' && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                          <div
                            className="bg-gradient-to-r from-pink-400 to-amber-400 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress[`${video.id}_video`] || 0}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        className="update-btn"
                        onClick={e => {
                          e.preventDefault();
                          saveVideos();
                          setEditingVideoId(null);
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="update-btn bg-gray-400 hover:bg-gray-500 text-white"
                        onClick={e => {
                          e.preventDefault();
                          setEditingVideoId(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }
              // Non-editing cards
              return (
                <div key={video.id} className="video-card-admin relative transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-2">Video {video.id}</h3>
                  <div className="mb-2"><span className="font-semibold">Title:</span> {video.title}</div>
                  <div className="mb-2"><span className="font-semibold">Description:</span> {video.description}</div>
                  <div className="mb-2">
                    <span className="font-semibold">Thumbnail:</span><br />
                    {video.thumbnail && (
                      <img
                      src={
                        video.thumbnail.startsWith('http')
                          ? video.thumbnail
                          : `${import.meta.env.VITE_API_URL}/${video.thumbnail.replace(/^\/?/, '')}`
                      }
                      alt="Thumbnail"
                      className="w-28 h-16 object-cover rounded-lg mt-2 border border-gray-300 dark:border-gray-700"
                    />
                    
                    )}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Video:</span><br />
                    {video.videoUrl && (
                      <video
                        src={video.videoUrl}
                        controls
                        className="w-full max-h-40 mt-2 rounded-lg border border-gray-300 dark:border-gray-700"
                      />
                    )}
                  </div>
                  <button
                    className="update-btn mt-2"
                    onClick={e => {
                      e.preventDefault();
                      setEditingVideoId(video.id);
                    }}
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Combined Applications Table */}
        <div className="applications">
          <div className="flex items-center gap-4 mb-4">
            <button
              className={`px-4 py-2 rounded font-semibold border ${applicationFilter === 'pending' ? 'border-amber-500' : 'border-gray-300'}`}
              onClick={() => setApplicationFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold border ${applicationFilter === 'accepted' ? 'border-green-500' : 'border-gray-300'}`}
              onClick={() => setApplicationFilter('accepted')}
            >
              Accepted
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold border ${applicationFilter === 'rejected' ? 'border-red-500' : 'border-gray-300'}`}
              onClick={() => setApplicationFilter('rejected')}
            >
              Rejected
            </button>
          </div>
          <h2 className="text-xl font-bold mb-4 h2">
            {applicationFilter.charAt(0).toUpperCase() + applicationFilter.slice(1)} Applications
            {applicationFilter === 'pending' && (
              <span className="text-xl font-bold"> of {leagueData.currentLeague.nextLeagueStart} league</span>
            )}
          </h2>
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Image</th>
                  {applicationFilter === 'pending' && <th>Status</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className={
                applicationFilter === 'pending' ? 'applications-body' :
                applicationFilter === 'accepted' ? 'accepted-applications-body' :
                'rejected-applications-body'
              }>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={applicationFilter === 'pending' ? 5 : 4} style={{ textAlign: 'center', fontStyle: 'italic', color: '#888' }}>
                      No applications
                    </td>
                  </tr>
                ) : (
                  filteredApplications.filter(app => app && app.name).map((app, index) => (
                  <tr key={app._id || index}>
                    <td>{app.name}</td>
                    <td>{app.mobile}</td>
                    <td>
                      {app.imageUrl && (
                        <img
                        src={
                          app.imageUrl.startsWith('http')
                            ? app.imageUrl
                            : `${import.meta.env.VITE_API_URL}/${app.imageUrl.replace(/^\/?/, '')}`
                        }
                        alt="Trading Screenshot"
                        onClick={() =>
                          openImageModal(
                            app.imageUrl.startsWith('http')
                              ? app.imageUrl
                              : `${import.meta.env.VITE_API_URL}/${app.imageUrl.replace(/^\/?/, '')}`
                          )
                        }
                        style={{
                          cursor: 'pointer',
                          maxWidth: '100%',
                          maxHeight: '60px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          display: 'block',
                          margin: '0 auto',
                        }}
                      />
                      
                      )}
                    </td>
                    {applicationFilter === 'pending' && <td>Pending</td>}
                    <td>
                      {applicationFilter === 'pending' && (
                        <>
                          <button onClick={() => handleApplicationStatus(app, 'approved')} className="action-btn approve">Approve</button>
                          <button onClick={() => handleApplicationStatus(app, 'rejected')} className="action-btn reject">Reject</button>
                          <button
                            onClick={() => {
                              setConfirm({
                                open: true,
                                message: `Are you sure you want to delete application for ${app.name}?`,
                                onConfirm: async () => {
                                  closeConfirm();
                                  try {
                                    const adminToken = localStorage.getItem('adminToken');
                                    console.log('Application object:', app);
                                    console.log('Deleting application with ID:', app._id || app.id);
                                    const response = await fetch(`${API_URL}/api/applicationsByDate/${app._id || app.id}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'Authorization': `Bearer ${adminToken}`
                                      }
                                    });
                                    
                                    if (!response.ok) {
                                      const errorData = await response.json();
                                      throw new Error(errorData.error || 'Delete failed');
                                    }
                                    
                                    // Remove from all state arrays
                                    setApplications(prev => prev.filter(a => (a._id || a.id) !== (app._id || app.id)));
                                    setAcceptedApplications(prev => prev.filter(a => (a._id || a.id) !== (app._id || app.id)));
                                    setRejectedApplications(prev => prev.filter(a => (a._id || a.id) !== (app._id || app.id)));
                                    toast.success('Application deleted');
                                  } catch (err) {
                                    console.error('Delete error:', err);
                                    toast.error('Failed to delete application');
                                  }
                                },
                              });
                            }}
                            className="action-btn delete"
                            style={{ background: '#ef4444', color: 'white' }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {applicationFilter === 'accepted' && (
                        <>
                          <button onClick={() => handleApplicationStatus(app, 'rejected')} className="action-btn reject">Reject</button>
                          <button onClick={() => handleApplicationStatus(app, 'pending')} className="action-btn revert">Revert to Pending</button>
                        </>
                      )}
                      {applicationFilter === 'rejected' && (
                        <>
                          <button onClick={() => handleApplicationStatus(app, 'approved')} className="action-btn approve">Approve</button>
                          <button onClick={() => handleApplicationStatus(app, 'pending')} className="action-btn revert">Revert to Pending</button>
                        </>
                      )}
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Learning Phases Management Section */}
        <div className="learning-phases-management">
          {console.log('Current learningPhases state:', learningPhases)}
          <div className="section-header">
            <h2 className="text-2xl font-bold mb-4">Learning Phases Management</h2>
            <button onClick={saveLearningPhases} className="save-btn">
              💾 Save All Phases
            </button>
          </div>

          {/* Phase Switching Buttons */}
          <div className="phase-buttons">
            {learningPhases.map((phase) => (
              <button
                key={phase.phaseId}
                onClick={() => setSelectedPhase(phase.phaseId)}
                className={`phase-btn ${selectedPhase === phase.phaseId ? 'active' : ''}`}
              >
                {phase.title}
              </button>
            ))}
            </div>

          {/* Selected Phase Content */}
          {learningPhases.length > 0 && (
            <div className="selected-phase-content">
              {(() => {
                const currentPhase = learningPhases.find(phase => phase.phaseId === selectedPhase);
                if (!currentPhase) return null;

                return (
                  <div className="phase-card">
                    <div className="phase-header">
                      <div className="phase-info">
                        <input
                          type="text"
                          value={currentPhase.title}
                          onChange={(e) => handlePhaseUpdate(currentPhase.phaseId, 'title', e.target.value)}
                          className="phase-title-input"
                          placeholder="Phase Title"
                        />
                        <input
                          type="text"
                          value={currentPhase.subtitle}
                          onChange={(e) => handlePhaseUpdate(currentPhase.phaseId, 'subtitle', e.target.value)}
                          className="phase-subtitle-input"
                          placeholder="Phase Subtitle"
                        />
                      </div>
                      <div className="phase-order">
                        <label>Order:</label>
                        <input
                          type="number"
                          value={currentPhase.order}
                          onChange={(e) => handlePhaseUpdate(currentPhase.phaseId, 'order', parseInt(e.target.value))}
                          min="1"
                          max="4"
                          className="order-input"
                        />
                      </div>
                    </div>

                    <div className="content-section">
                      <div className="content-header">
                        <h3>Content Items</h3>
                        <button 
                          onClick={() => addContentToPhase(currentPhase.phaseId)}
                          className="add-content-btn"
                        >
                          ➕ Add Content
                        </button>
</div>

                      <div className="content-list">
                        {currentPhase.content.map((content, index) => (
                          <div key={content.id} className="content-item">
                            <div className="content-main">
                              <div className="content-fields">
                                <input
                                  type="text"
                                  value={content.title}
                                  onChange={(e) => handleContentUpdate(currentPhase.phaseId, content.id, 'title', e.target.value)}
                                  className="content-title-input"
                                  placeholder="Content Title"
                                />
                                <textarea
                                  value={content.description}
                                  onChange={(e) => handleContentUpdate(currentPhase.phaseId, content.id, 'description', e.target.value)}
                                  className="content-description-input"
                                  placeholder="Content Description"
                                  rows="2"
                                />
                                <div className="content-meta">
                                  <input
                                    type="text"
                                    value={content.duration}
                                    onChange={(e) => handleContentUpdate(currentPhase.phaseId, content.id, 'duration', e.target.value)}
                                    className="duration-input"
                                    placeholder="Duration (e.g., 15:30)"
                                  />
                                  <input
                                    type="number"
                                    value={content.order}
                                    onChange={(e) => handleContentUpdate(currentPhase.phaseId, content.id, 'order', parseInt(e.target.value))}
                                    className="order-input"
                                    placeholder="Order"
                                    min="1"
                                  />
                  </div>
                  </div>

                              <div className="content-media">
                                <div className="media-upload">
                                  <label>Video URL:</label>
                                  <input
                                    type="text"
                                    value={content.videoUrl}
                                    onChange={(e) => handleContentUpdate(currentPhase.phaseId, content.id, 'videoUrl', e.target.value)}
                                    className="video-url-input"
                                    placeholder="Video URL"
                                  />
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => {
                                      if (e.target.files[0]) {
                                        uploadPhaseContent(currentPhase.phaseId, content.id, e.target.files[0], 'video');
                                      }
                                    }}
                                    className="file-input"
                                    id={`video-${currentPhase.phaseId}-${content.id}`}
                                  />
                                  <label htmlFor={`video-${currentPhase.phaseId}-${content.id}`} className="upload-btn">
                                    {uploadingPhaseContent?.phaseId === currentPhase.phaseId && 
                                     uploadingPhaseContent?.contentId === content.id && 
                                     uploadingPhaseContent?.type === 'video' 
                                      ? '⏳ Uploading...' 
                                      : '📹 Upload Video'}
                                  </label>
                                </div>

                                <div className="media-upload">
                                  <label>Thumbnail:</label>
                                  <input
                                    type="text"
                                    value={content.thumbnail}
                                    onChange={(e) => handleContentUpdate(currentPhase.phaseId, content.id, 'thumbnail', e.target.value)}
                                    className="thumbnail-url-input"
                                    placeholder="Thumbnail URL"
                                  />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files[0]) {
                                        uploadPhaseContent(currentPhase.phaseId, content.id, e.target.files[0], 'thumbnail');
                                      }
                                    }}
                                    className="file-input"
                                    id={`thumbnail-${currentPhase.phaseId}-${content.id}`}
                                  />
                                  <label htmlFor={`thumbnail-${currentPhase.phaseId}-${content.id}`} className="upload-btn">
                                    {uploadingPhaseContent?.phaseId === currentPhase.phaseId && 
                                     uploadingPhaseContent?.contentId === content.id && 
                                     uploadingPhaseContent?.type === 'thumbnail' 
                                      ? '⏳ Uploading...' 
                                      : '🖼️ Upload Thumbnail'}
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="content-actions">
                              <button
                                onClick={() => removeContentFromPhase(currentPhase.phaseId, content.id)}
                                className="remove-content-btn"
                              >
                                🗑️ Remove
                              </button>
                </div>
              </div>
            ))}
          </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
</div>

      </div>

      {selectedImage && (
        <div
          className="image-modal"
          onClick={closeImageModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            className="modal-content"
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              width: '90vw',
              height: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={5}
              wheel={{ step: 0.1 }}
              doubleClick={{ disabled: false }}
              pinch={{ step: 0.1 }}
              panning={{ velocityDisabled: true }}
            >
              {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <>
                  <TransformComponent>
                    <img
                      src={selectedImage}
                      alt="Enlarged Trading Screenshot"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    />
                  </TransformComponent>
                  <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 8 }}>
                    <button onClick={zoomIn} style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 16, cursor: 'pointer' }}>+</button>
                    <button onClick={zoomOut} style={{ background: '#222', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 16, cursor: 'pointer' }}>-</button>
                    <button onClick={resetTransform} style={{ background: '#666', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 16, cursor: 'pointer' }}>Reset</button>
                  </div>
                </>
              )}
            </TransformWrapper>
            <button
              className="close-modal-btn"
              onClick={closeImageModal}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(30,30,30,0.85)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 44,
                height: 44,
                fontSize: 28,
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                transition: 'background 0.2s'
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,0,0,1)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(30,30,30,0.85)')}
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirm.open}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
        showRejectionReason={confirm.showRejectionReason}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
      />
    </div>
  );
}

export default AdminPanel;