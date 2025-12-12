import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { UserProvider, useUser } from './contexts/UserContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProTraders from './pages/ProTraders';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import ResetPassword from './pages/ResetPassword';
import AdminResetPassword from './pages/AdminResetPassword';
import SmartMoneyConcept from './pages/SmartMoneyConcept';
import StockSwingBotStrategy from './pages/StockSwingBotStrategy';
import NineTwentyStrategy from './pages/NineTwentyStrategy';
import PriceLineBotStrategy from './pages/PriceLineBotStrategy';
import './App.css';
import ScrollToTop from './components/ScrollToTop';


function App() {
  const [theme, setTheme] = useState('light');
  const [applications, setApplications] = useState([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => localStorage.getItem('isAdminAuthenticated') === 'true');
  const [isVideoPage, setIsVideoPage] = useState(false);

  // State for league data
  const [leagueData, setLeagueData] = useState({
    currentLeague: {
      traders: [],
      startDate: '',
      nextLeagueStart: '',
      participants: 0,
    },
    previousLeague: {
      traders: [],
      startDate: '',
      endDate: '',
      participants: 0,
    },
  });

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <UserProvider>
      <Router>
        <ScrollToTop />
        <div className={`app ${theme}`}>
          <AppContent 
            theme={theme} 
            toggleTheme={toggleTheme}
            isAdminAuthenticated={isAdminAuthenticated}
            setIsAdminAuthenticated={setIsAdminAuthenticated}
            isVideoPage={isVideoPage}
            setIsVideoPage={setIsVideoPage}
            applications={applications}
            setApplications={setApplications}
            leagueData={leagueData}
            setLeagueData={setLeagueData}
          />
          <Toaster position="top-right" />
        </div>
      </Router>
    </UserProvider>
  );
}

// Component that uses user context
function AppContent({ 
  theme, 
  toggleTheme, 
  isAdminAuthenticated, 
  setIsAdminAuthenticated, 
  isVideoPage, 
  setIsVideoPage,
  applications,
  setApplications,
  leagueData,
  setLeagueData
}) {
  const { isAuthenticated } = useUser();

  return (
    <>
      {!isVideoPage && (
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          isUserAuthenticated={isAuthenticated}
          isAdminAuthenticated={isAdminAuthenticated}
          setIsAdminAuthenticated={setIsAdminAuthenticated}
        />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learning" element={<Courses setIsVideoPage={setIsVideoPage} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route
          path="/pro-traders"
          element={
            <ProTraders
              leagueData={leagueData}
              setLeagueData={setLeagueData}
              applications={applications}
              setApplications={setApplications}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <AdminPanel
              leagueData={leagueData}
              setLeagueData={setLeagueData}
              applications={applications}
              setApplications={setApplications}
              isAdminAuthenticated={isAdminAuthenticated}
              setIsAdminAuthenticated={setIsAdminAuthenticated}
            />
          }
        />
        <Route 
          path="/admin/login" 
          element={<AdminLogin setIsAdminAuthenticated={setIsAdminAuthenticated} />} 
        />
        <Route path="/smart-money-concept" element={<SmartMoneyConcept />} />
        <Route path="/stock-swing-bot-strategy" element={<StockSwingBotStrategy />} />
        <Route path="/nine-twenty-strategy" element={<NineTwentyStrategy />} />
        <Route path="/price-line-bot-strategy" element={<PriceLineBotStrategy />} />
      </Routes>
      {!isVideoPage && <Footer />}
    </>
  );
}

export default App;