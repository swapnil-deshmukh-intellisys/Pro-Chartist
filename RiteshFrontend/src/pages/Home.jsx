import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import TickerTape from '../charts/TickerTape';
import TradingViewWidget from '../charts/TradingViewWidget';
import TradingViewWidget2 from '../charts/TradingViewWidget2';
import TradingViewWidget3 from '../charts/TradingViewWidget3';
import TradingViewWidget4 from '../charts/TradingViewWidget4';

// Import assets
import vbg1 from '../assets/vbg1.png';
import vbg2 from '../assets/vbg2.png';
import vbg3 from '../assets/vbg3.png';
import vbg4 from '../assets/vbg4.png';
import r1 from '../assets/r1.jpg';
import r2 from '../assets/r2.jpg';
import r3 from '../assets/r3.jpg';
import r4 from '../assets/r4.jpg';
import r5 from '../assets/r5.jpg';
import r6 from '../assets/r6.jpg';
import image1 from '../assets/image1.jpg';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/image3.jpg';
import image4 from '../assets/image4.jpg';
import ss1 from '../assets/Screenshot11.png';
import ss2 from '../assets/Screenshot12.png';
import ss3 from '../assets/Screenshot14.png';

// Helper to get the full backend URL
const getBackendUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://localhost:5002${url}`;
};

function Home() {
  const [selectedBot, setSelectedBot] = useState('price-line');
  const [openFaqId, setOpenFaqId] = useState(null);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [showOverlayDialog, setShowOverlayDialog] = useState(false);
  const [pendingBotUrl, setPendingBotUrl] = useState(null);

  // Bot URLs for redirection
  const botUrls = {
    'price-line': 'https://www.tradingview.com/script/d5EIJrAY-Sniper-Entry-Setup/',
    'stock-swing': 'https://www.tradingview.com/script/i3YZzMnQ-Smart-Money-Concepts/',
    'smc': 'https://www.tradingview.com/script/i3YZzMnQ-Smart-Money-Concepts/',
    'liquidity': 'https://www.tradingview.com/script/i3YZzMnQ-Smart-Money-Concepts/'
  };

  useEffect(() => {
    // Load saved videos from backend API
    const fetchVideos = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/videos`);
        const data = await res.json();
  
        if (data && data.length > 0) {
          setVideos(data);
        }
        // If no videos from backend, keep the default videos with thumbnails
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        // Keep default videos if API fails
      }
    };
  
    fetchVideos();
  }, []);

  const [videos, setVideos] = useState([
    {
      id: 1,
      title: 'Smart Money Concept Strategy',
      description: 'How to trade bot Bitcoin, Bank Nifty trade using Price line bot',
      thumbnail: vbg1,
      videoUrl: ''
    },
    {
      id: 2,
      title: "Stock's Swing Bot Strategy",
      description: 'Stock swing bot: Use this bot to trade swing & stocks',
      thumbnail: vbg2,
      videoUrl: ''
    },
    {
      id: 3,
      title: 'Price Line Bot Strategy',
      description: 'This bot presents and makes all kinds of levels of SMC',
      thumbnail: vbg3,
      videoUrl: ''
    },
    {
      id: 4,
      title: 'Liquidity Bot Strategy',
      description: 'Learn how to identify and trade liquidity zones with this bot',
      thumbnail: vbg4,
      videoUrl: ''
    }
  ]);

  const bots = [
    { 
      id: 'price-line', 
      name: 'Price Line Bot',
      image: ss1
    },
    { 
      id: 'stock-swing', 
      name: 'Stock Swing Bot',
      image: ss2
    },
    { 
      id: 'smc', 
      name: 'SMC Bot',
      image: ss3
    },
    { 
      id: 'liquidity', 
      name: 'Liquidity Bot',
      image: ss3
    }
  ];

  const reviews = [
    {
      id: 1,
      name: "Aniket",
      role: "Option Trader",
      rating: 5,
      comment: "Price line bot is best for quick trade it gives best buy sell signal for momentum trading",
      avatar: r1,
      image: image1
    },
    {
      id: 2,
      name: "Siddharth",
      role: "Swing Trader",
      rating: 5,
      comment: "I use stock swing bot for swing trading and it gives me best results.Also it helps me to make intraday view",
      avatar: r2,
      image: image2
    },
    {
      id: 3,
      name: "Mansi",
      role: "Crypto Trader",
      rating: 4,
      comment: "I used to trade bitcoin and price line bot works best for momentum trading. My all friends use this bot for trading in all crypto",
      avatar: r4,
      image: image3
    },
    {
      id: 4,
      name: "Akash",
      role: "Intraday Trader",
      rating: 5,
      comment: "I am a full time trader I use to trade stock, option, bitcoin and forex. This stock swing bot help me to do intraday analysis and price line bot for quick scalping",
      avatar: r3,
      image: image4
    }
  ];

  const faqs = [
    {
      id: 1,
      question: " What is Pro Chartist and how does it work?",
      answer: "Pro Chartist is an advanced trading analysis platform that combines AI-powered tools with traditional technical analysis. It works by analyzing market data in real-time and providing actionable insights through our specialized trading bots."
    },
    {
      id: 2,
      question: "How accurate are the trading signals?",
      answer: "Our trading signals have a proven accuracy rate of over 70%. However, we always recommend using them in conjunction with your own analysis and risk management strategy."
    },
    {
      id: 3,
      question: "What markets can I trade with Pro Chartist?",
      answer: "Pro Chartist supports multiple markets including stocks, forex, cryptocurrencies, commodities, and indices. Each bot is optimized for specific market conditions and trading styles."
    },
    {
      id: 4,
      question: "Do I need trading experience to use Pro Chartist?",
      answer: "While trading experience is beneficial, Pro Chartist is designed for both beginners and experienced traders. We provide comprehensive educational resources and step-by-step guides to help you get started."
    },
    {
      id: 5,
      question: "What are the subscription plans and pricing?",
      answer: "We offer flexible subscription plans starting from basic to premium packages. Each plan is tailored to different trading needs and volumes. Contact our sales team for detailed pricing information."
    },
    {
      id: 6,
      question: "Can I use Pro Chartist on mobile devices?",
      answer: "Yes, Pro Chartist is fully responsive and works on all devices including smartphones and tablets. We also offer dedicated mobile apps for iOS and Android platforms."
    },
    {
      id: 7,
      question: "How do I get started with Pro Chartist?",
      answer: "Getting started is easy! Simply sign up for an account, choose your preferred subscription plan, and complete the onboarding process. Our support team is available 24/7 to help you with the setup."
    },
    {
      id: 8,
      question: "What kind of support do you offer?",
      answer: "We provide 24/7 customer support through live chat, email, and phone. Additionally, we offer weekly webinars, trading tutorials, and a comprehensive knowledge base."
    },
    {
      id: 9,
      question: "Is my trading data secure?",
      answer: "Yes, we take security seriously. All data is encrypted using industry-standard protocols, and we never share your personal or trading information with third parties."
    },
    {
      id: 10,
      question: "Can I integrate Pro Chartist with my existing trading platform?",
      answer: "Yes, Pro Chartist offers API integration with major trading platforms and brokers. Our technical team can assist you with custom integration requirements."
    }
  ];

  const duplicatedReviews = [...reviews, ...reviews, ...reviews, ...reviews];

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] dark:from-[#0a0f14] dark:to-[#121926] pt-8">
      {/* Bot Selection */}
      <section className="flex justify-center gap-4 mb-8 px-4 flex-wrap">
        {bots.map(bot => (
          <motion.button
            key={bot.id}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 relative overflow-hidden border-2 ${
              selectedBot === bot.id 
                ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white border-white shadow-lg shadow-blue-500/30' 
                : 'border-[#0284c7] text-[#0f172a] dark:text-[#eaeaea] hover:bg-[#0284c7]/10 dark:hover:bg-[#0284c7]/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedBot(bot.id)}
          >
            {selectedBot === bot.id && (
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
            {bot.name}
          </motion.button>
        ))}
      </section>

      {/* Bot Image Container */}
      <div className="w-4/5 mx-auto mb-8 relative">
        <div className="h-96 relative rounded-lg overflow-hidden border-8 border-[#bfdbfe] dark:border-[#1f2a37] bg-black">
          {/* Overlay Division */}
          <div
            className="absolute inset-0 bg-black/5 z-10 cursor-pointer hover:bg-black/10 transition-colors duration-300"
            onClick={() => {
              setPendingBotUrl(botUrls[selectedBot]);
              setShowOverlayDialog(true);
            }}
          ></div>
          
          {/* Chart Widget */}
          <div className="w-full h-full relative z-0">
            {selectedBot === 'price-line' && <TradingViewWidget />}
            {selectedBot === 'stock-swing' && <TradingViewWidget2 />}
            {selectedBot === 'smc' && <TradingViewWidget3 />}
            {selectedBot === 'liquidity' && <TradingViewWidget4 />}
          </div>
        </div>
        
        {/* Popup Dialog */}
        {showOverlayDialog && (
          <motion.div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowOverlayDialog(false)}
          >
            <motion.div
              className="bg-white dark:bg-[#1e293b] rounded-xl p-8 min-w-[300px] shadow-xl text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-6 text-[#0f172a] dark:text-[#eaeaea]">Open Bot chart</h2>
              <div className="flex justify-center gap-6">
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-[#2563eb] to-[#60a5fa] text-white rounded-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    window.open(pendingBotUrl, '_blank');
                    setShowOverlayDialog(false);
                  }}
                >
                  Agree
                </motion.button>
                <motion.button
                  className="px-6 py-3 bg-[#e5e7eb] dark:bg-[#4b5563] text-[#111827] dark:text-[#eaeaea] rounded-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowOverlayDialog(false)}
                >
                  Back
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Stock Ticker */}
      <TickerTape/>

      {/* Videos Section */}
      <section className="py-16 bg-white/50 dark:bg-[#1e293b]/50 backdrop-blur-sm border-y border-[#bfdbfe] dark:border-[#1f2a37]">
        <div className="flex flex-col items-center justify-center gap-2 mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0284c7] to-[#38bdf8] bg-clip-text text-transparent">📹 Tutorial Videos</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              className="bg-white dark:bg-[#1e293b] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-[#bfdbfe] dark:border-[#1f2a37] hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative pb-[56.25%] h-0 overflow-hidden">
                {playingVideoId === video.id ? (
                  <video
                    src={getBackendUrl(video.videoUrl)}
                    controls
                    autoPlay
                    className="absolute inset-0 w-full h-full"
                    onEnded={() => setPlayingVideoId(null)}
                  />
                ) : (
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => video.videoUrl && setPlayingVideoId(video.id)}
                  >
                    <img
                      src={getBackendUrl(video.thumbnail)}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    {video.videoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white text-[#0284c7] rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-[#0f172a] dark:text-[#eaeaea]">{video.title}</h3>
                <p className="text-[#475569] dark:text-[#9ca3af]">{video.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { value: "#No.1", label: "AI Charting Platform" },
            { value: "4K", label: "Active Traders" },
            { value: "20+", label: "Markets Covered" },
            { value: "15K", label: "Downloads" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-[#bfdbfe] dark:border-[#1f2a37] hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <h3 className="text-4xl font-bold bg-gradient-to-r from-[#0284c7] to-[#38bdf8] bg-clip-text text-transparent mb-2">{stat.value}</h3>
              <p className="text-[#475569] dark:text-[#9ca3af]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-white/50 dark:bg-[#1e293b]/50 backdrop-blur-sm border-y border-[#bfdbfe] dark:border-[#1f2a37] overflow-hidden">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] bg-clip-text text-transparent">Community Analysis</h2>
        
        <div className="relative overflow-hidden">
          <motion.div 
            className="flex gap-8 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {duplicatedReviews.map((review, index) => (
              <motion.div 
                key={`${review.id}-${index}`}
                className="w-80 flex-shrink-0 bg-white dark:bg-[#1e293b] rounded-xl overflow-hidden shadow-lg border border-[#bfdbfe] dark:border-[#1f2a37]"
                whileHover={{ scale: 1.02 }}
              >
                <img 
                  src={review.image} 
                  alt={`${review.name}'s Trading Setup`}
                  className="w-full h-40 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="font-semibold text-[#0f172a] dark:text-[#eaeaea]">{review.name}</h3>
                      <p className="text-sm text-[#475569] dark:text-[#9ca3af]">{review.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <p className="text-[#475569] dark:text-[#9ca3af]">{review.comment}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Gradient overlays for smooth edges */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white/50 dark:from-[#1e293b]/50 to-transparent pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white/50 dark:from-[#1e293b]/50 to-transparent pointer-events-none"></div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white/50 dark:bg-[#1e293b]/50 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] bg-clip-text text-transparent">Frequently Asked Questions</h2>
        
        <div className="max-w-4xl mx-auto px-4 flex flex-col gap-4">
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              className="bg-white dark:bg-[#1e293b] rounded-xl overflow-hidden border border-[#bfdbfe] dark:border-[#1f2a37] transition-all duration-300 hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: faq.id * 0.1 }}
            >
              <button
                className="w-full p-6 text-left flex justify-between items-center text-[#0f172a] dark:text-[#eaeaea] font-medium hover:text-[#0284c7] dark:hover:text-[#38bdf8] transition-colors"
                onClick={() => toggleFaq(faq.id)}
              >
                {faq.question}
                <FiChevronDown className={`transition-transform duration-300 ${openFaqId === faq.id ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${openFaqId === faq.id ? 'max-h-96' : 'max-h-0'}`}>
                <div className="px-6 pb-6 text-[#475569] dark:text-[#9ca3af]">
                  {faq.answer}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;