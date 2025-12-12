import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      if (token && userId) {
        try {
          // Verify token with backend
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.data.valid) {
            setCurrentUser({ id: userId, email: response.data.email });
            setIsAuthenticated(true);
            // Load user progress
            await loadUserProgress(userId);
          } else {
            // Token is invalid, clear storage
            logout();
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          logout();
        }
      } else {
        // No authentication - initialize empty progress
        setUserProgress({
          completedContent: {},
          videoProgress: {},
          unlockedPhases: ['beginner'],
          currentPhase: 'beginner'
        });
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Load user progress from server
  const loadUserProgress = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}/progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUserProgress(response.data);
    } catch (error) {
      console.error('Failed to load user progress:', error);
      // Initialize with empty progress if server fails
      setUserProgress({
        completedContent: {},
        videoProgress: {},
        unlockedPhases: ['beginner'],
        currentPhase: 'beginner'
      });
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password
      });

      const { token, userId, email: userEmail } = response.data;
      
      // Store authentication data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('isUserAuthenticated', 'true');
      
      // Update state
      setCurrentUser({ id: userId, email: userEmail });
      setIsAuthenticated(true);
      
      // Load user progress
      await loadUserProgress(userId);
      
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('isUserAuthenticated');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUserProgress({});
    toast.success('Logged out successfully!');
  };

  // Update user progress
  const updateUserProgress = async (progressData) => {
    if (!isAuthenticated || !currentUser) {
      // If not authenticated, show login prompt
      console.log('🔒 Progress update requires authentication');
      toast.error('Please log in to save your progress');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/users/${currentUser.id}/progress`, progressData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update local state with proper deep merging
      setUserProgress(prev => ({
        ...prev,
        ...progressData,
        // Properly merge nested objects
        videoProgress: {
          ...(prev.videoProgress || {}),
          ...(progressData.videoProgress || {})
        },
        completedContent: {
          ...(prev.completedContent || {}),
          ...(progressData.completedContent || {})
        },
        unlockedPhases: progressData.unlockedPhases || prev.unlockedPhases
      }));
      
      console.log('✅ Progress saved to backend successfully');
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to save progress. Please try again.');
    }
  };

  // Check if user has purchased a phase
  const hasPurchasedPhase = async (phaseId) => {
    if (!isAuthenticated || !currentUser) return false;

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${currentUser.id}/purchases/${phaseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data.hasPurchased;
    } catch (error) {
      console.error('Failed to check purchase status:', error);
      return false;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    userProgress,
    login,
    logout,
    updateUserProgress,
    hasPurchasedPhase,
    loadUserProgress
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 