import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { leagueApplicationSchema } from '../validation/schemas';
import toast from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import './ProTraders.css';

function ProTraders({ leagueData, setLeagueData, applications, setApplications }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    image: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userApplication, setUserApplication] = useState(null);
  const [isLoadingApplication, setIsLoadingApplication] = useState(true);
  const [topTraders, setTopTraders] = useState([]);
  const [isLoadingTopTraders, setIsLoadingTopTraders] = useState(true);
  const MAX_IMAGE_SIZE_MB = 2;
  const [imagePreview, setImagePreview] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const { isAuthenticated, currentUser } = useUser();

  // Helper to get the full backend URL for images (Cloudinary or local)
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}/${url.replace(/^\/?/, '')}`;
  };

  // ✅ Fetch updated league data on mount
  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/league`);
        const data = await res.json();
        setLeagueData(data);
      } catch (err) {
        console.error('Failed to fetch league data:', err);
      }
    };

    fetchLeagueData();
  }, []);

  // ✅ Fetch top traders history
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

  // ✅ Check if user has already applied for the current league
  useEffect(() => {
    const checkUserApplication = async () => {
      if (!isAuthenticated || !currentUser || !leagueData?.currentLeague?.nextLeagueStart) {
        setIsLoadingApplication(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/applicationsByDate?date=${leagueData.currentLeague.nextLeagueStart}`);
        const applications = await res.json();

        // Find user's application by email
        const userApp = applications.find(app => app.email === currentUser.email);
        console.log('User application data:', userApp); // Debug log
        console.log('Rejection reason:', userApp?.rejectionReason); // Debug rejection reason specifically
        console.log('Application status:', userApp?.status); // Debug status
        console.log('Full applications array:', applications); // Debug all applications
        console.log('Raw applications data from API:', JSON.stringify(applications, null, 2)); // Debug raw data
        setUserApplication(userApp || null);
      } catch (err) {
        console.error('Failed to check user application:', err);
      } finally {
        setIsLoadingApplication(false);
      }
    };

    // Only run if we have all required data
    if (isAuthenticated && currentUser && leagueData?.currentLeague?.nextLeagueStart) {
      checkUserApplication();

      // Set up polling to check for status updates every 30 seconds
      const intervalId = setInterval(checkUserApplication, 30000);

      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, currentUser, leagueData]);

  // Login requirement check - moved after all hooks
  if (!isAuthenticated) {
    return (
      <div className="pro-traders-page">
        <div className="login-required-message">
          <div className="login-message-content">
            <h2>🔒 Please Log In to Access Pro Traders</h2>
            <p>Create an account or sign in to join the trading league and compete with other traders.</p>

            <div className="login-actions">
              <button
                className="login-btn"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="signup-btn"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Only image files are allowed.' }));
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
      return;
    }
    // Validate file size
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: `Image must be less than ${MAX_IMAGE_SIZE_MB}MB.` }));
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
      return;
    }
    setFormData((prev) => ({ ...prev, image: file }));
    setErrors((prev) => ({ ...prev, image: undefined }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user has already applied and it's not rejected
    if (userApplication && userApplication.status !== 'rejected') {
      toast.error('You have already applied for this league!');
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);
    setErrors({});

    // Defensive: check for leagueData and user
    if (!leagueData?.currentLeague?.nextLeagueStart) {
      toast.error('League data not loaded. Please try again later.');
      setIsSubmitting(false);
      return;
    }

    if (!currentUser) {
      toast.error('User data not available. Please log in again.');
      setIsSubmitting(false);
      return;
    }

    try {
      await leagueApplicationSchema.validate(formData, { abortEarly: false });

      const form = new FormData();
      form.append('leagueDate', leagueData.currentLeague.nextLeagueStart);
      form.append('name', formData.name);
      form.append('mobile', formData.mobile);
      form.append('image', formData.image);
      form.append('email', currentUser.email); // Add user email
      form.append('userId', currentUser.id); // Add user ID

      const res = await fetch(`${API_URL}/api/applicationsByDate`, {
        method: 'POST',
        body: form,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Submission failed');

      // Update user application state
      setUserApplication(result.application);
      setApplications((prev) => [...prev, result.application]);
      toast.success('Application submitted successfully!');
      setFormData({ name: '', mobile: '', image: null });
      setImagePreview(null);
    } catch (error) {
      if (error.name === 'ValidationError') {
        const newErrors = {};
        error.inner.forEach((err) => (newErrors[err.path] = err.message));
        setErrors(newErrors);
      } else {
        console.error('Application submission error:', error);
        toast.error(error.message || 'Failed to submit application');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelSubmit = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="pro-traders-page">
      <motion.h1
        className="page-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Top Traders
      </motion.h1>
      <motion.h1 className="page-heading">
        Next league will start from {leagueData?.currentLeague?.nextLeagueStart || '...'}
      </motion.h1>

      <div className="traders-content">
        <div className="leagues-section">
          {/* ✅ Current League */}
          <div className="league-block">
            <h2 className="league-date">
              Previous League Winners <br />({leagueData?.currentLeague?.startDate || '...'})
            </h2>
            <div className="league-table">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Trader</th>
                    <th>Trades</th>
                    <th>ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {leagueData?.currentLeague?.traders?.slice(0, 3).map((trader) => (
                    <motion.tr
                      key={trader.rank}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: trader.rank * 0.1 }}
                      className={trader.rank === 1 ? 'top-trader' : ''}
                    >
                      <td>{trader.rank}</td>
                      <td>{trader.name}</td>
                      <td>{trader.trades}</td>
                      <td><span className="roi">{trader.roi}%</span></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>



          {/* Historical Top Traders (Dynamic) */}
          <div className="league-block">
            <h2 className="league-date">Top Traders</h2>
            {isLoadingTopTraders ? (
              <div className="loading-top-traders">
                <p>Loading top traders history...</p>
              </div>
            ) : topTraders.length > 0 ? (
              <div className="previous-winners">
                {topTraders.map((trader, index) => (
                  <motion.div
                    key={index}
                    className="winner-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <span className="winner-date">{trader.date}</span>
                    <span className="winner-name">{trader.name}</span>
                    <span className="winner-roi">ROI: {trader.roi}%</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="no-top-traders">
                <p>No historical top traders data available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Next League Form or Application Status */}
        <div className="league-info">
          <div className="next-league">
            <h2>Apply Next League</h2>
            <div className="dates">
              <p>Current League Start: {leagueData?.currentLeague?.startDate}</p>
              <p>Current Participants: {leagueData?.currentLeague?.participants}</p>
              <p>Next League Start: {leagueData?.currentLeague?.nextLeagueStart}</p>
            </div>

            {isLoadingApplication ? (
              <div className="loading-application">
                <p>Loading application status...</p>
              </div>
            ) : userApplication && userApplication.status !== 'rejected' ? (
              // Show application status for pending/approved applications
              <div className="application-status">
                <div className={`status-card ${userApplication.status}`}>
                  <h3>Your Application Status</h3>
                  <div className="status-info">
                    <p><strong>Name:</strong> {userApplication.name}</p>
                    <p><strong>Mobile:</strong> {userApplication.mobile}</p>
                    <p><strong>Status:</strong>
                      <span className={`status-badge ${userApplication.status}`}>
                        {userApplication.status === 'pending' && '⏳ Pending Review'}
                        {userApplication.status === 'approved' && '✅ Approved'}
                        {userApplication.status === 'rejected' && '❌ Rejected'}
                      </span>
                    </p>
                    <p><strong>Applied on:</strong> {new Date(userApplication.createdAt).toLocaleDateString()}</p>
                  </div>
                  {userApplication.status === 'pending' && (
                    <div>
                      <p className="status-note">Your application is under review. You will be notified once the admin makes a decision.</p>
                      <button
                        className="refresh-btn"
                        onClick={() => {
                          setIsLoadingApplication(true);
                          const checkUserApplication = async () => {
                            try {
                              const res = await fetch(`${API_URL}/api/applicationsByDate?date=${leagueData.currentLeague.nextLeagueStart}`);
                              const applications = await res.json();
                              const userApp = applications.find(app => app.email === currentUser.email);
                              setUserApplication(userApp || null);
                            } catch (err) {
                              console.error('Failed to check user application:', err);
                            } finally {
                              setIsLoadingApplication(false);
                            }
                          };
                          checkUserApplication();
                        }}
                      >
                        🔄 Refresh Status
                      </button>
                    </div>
                  )}
                  {userApplication.status === 'approved' && (
                    <p className="status-note">🎉 Congratulations! Your application has been approved. You have now participated in the upcoming league.</p>
                  )}
                  {userApplication.status === 'rejected' && (
                    <div>
                      <p className="status-note">Your application was not approved. You can apply again for the next league cycle.</p>
                      {console.log('Rendering rejection reason:', userApplication.rejectionReason)} {/* Debug log */}
                      {userApplication.rejectionReason ? (
                        <p className="status-note" style={{ marginTop: '10px', color: '#dc2626', fontWeight: '500' }}>
                          <strong>Rejection Reason:</strong> {userApplication.rejectionReason}
                        </p>
                      ) : (
                        <p className="status-note" style={{ marginTop: '10px', color: '#dc2626', fontWeight: '500' }}>
                          <strong>Rejection Reason:</strong> No specific reason provided
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Show application form for new applications or rejected applications
              <div>
                {userApplication && userApplication.status === 'rejected' && (
                  <div className="application-status">
                    <div className={`status-card ${userApplication.status}`}>
                      <h3>Previous Application Status</h3>
                      <div className="status-info">
                        <p><strong>Name:</strong> {userApplication.name}</p>
                        <p><strong>Mobile:</strong> {userApplication.mobile}</p>
                        <p><strong>Status:</strong>
                          <span className={`status-badge ${userApplication.status}`}>
                            ❌ Rejected
                          </span>
                        </p>
                        <p><strong>Applied on:</strong> {new Date(userApplication.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="status-note">Your previous application was not approved. You can apply again with updated information.</p>
                      {console.log('Rendering previous application rejection reason:', userApplication.rejectionReason)} {/* Debug log */}
                      {userApplication.rejectionReason ? (
                        <p className="status-note" style={{ marginTop: '10px', color: '#dc2626', fontWeight: '500' }}>
                          <strong>Rejection Reason:</strong> {userApplication.rejectionReason}
                        </p>
                      ) : (
                        <p className="status-note" style={{ marginTop: '10px', color: '#dc2626', fontWeight: '500' }}>
                          <strong>Rejection Reason:</strong> No specific reason provided
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="application-form">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="mobile">Mobile Number</label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className={errors.mobile ? 'error' : ''}
                    />
                    {errors.mobile && <span className="error-message">{errors.mobile}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="image">Upload Trading Screenshot</label>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={errors.image ? 'error' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.image && <span className="error-message">{errors.image}</span>}
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 150, marginTop: 8 }} />
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="join-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : userApplication && userApplication.status === 'rejected' ? 'Re-apply for League' : 'Join Next League'}
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="rules">
            <h2>Rules</h2>
            <ul>
              <li>Register using your platform credentials</li>
              <li>Trading data will be reset before new league begins</li>
              <li>Rankings are based on trading performance and ROI</li>
              <li>Minimum 50 trades required per week</li>
              <li>Maximum leverage allowed: 20x</li>
              <li>Weekly performance updates every Sunday</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Application Submission</h3>
            <p>Are you sure you want to submit your application for the next league?</p>
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Mobile:</strong> {formData.mobile}</p>
            <p><strong>League Start:</strong> {leagueData?.currentLeague?.nextLeagueStart}</p>
            <div className="confirmation-actions">
              <button
                className="confirm-btn"
                onClick={confirmSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Submit Application'}
              </button>
              <button
                className="cancel-btn"
                onClick={cancelSubmit}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProTraders;