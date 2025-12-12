const mongoose = require('mongoose');
const LearningPhase = require('./models/LearningPhase');
require('dotenv').config();

const connectDB = require('./config/db');

const defaultPhases = [
  {
    phaseId: 'beginner',
    title: 'Phase 1: Beginner',
    subtitle: 'Foundation course for new traders',
    price: 999,
    originalPrice: 1999,
    currency: '₹',
    order: 1,
    content: [
      {
        id: 'basics',
        title: 'Basic\'s',
        description: 'Learn the fundamental concepts of trading and market basics.',
        duration: '15:30',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 1
      },
      {
        id: 'technical-analysis',
        title: 'Technical Analysis',
        description: 'Master technical analysis techniques and chart patterns.',
        duration: '22:15',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 2
      },
      {
        id: 'dow-theory',
        title: 'Dow Theory',
        description: 'Understanding Dow Theory principles and market trends.',
        duration: '18:45',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 3
      },
      {
        id: 'smc-crt',
        title: 'SMC + CRT',
        description: 'Smart Money Concepts and Critical Resistance Theory.',
        duration: '25:10',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 4
      },
      {
        id: 'market-structure',
        title: 'Market Structure',
        description: 'Learn about market structure and price action.',
        duration: '20:30',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 5
      },
      {
        id: 'summary',
        title: 'Summary',
        description: 'Complete summary of Phase 1 concepts and takeaways.',
        duration: '12:20',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 6
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
    order: 2,
    content: [
      {
        id: 'demo-trading',
        title: 'Demo Trading',
        description: 'Practice trading with demo accounts and paper trading.',
        duration: '18:20',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 1
      },
      {
        id: 'grow-capital',
        title: 'How to Grow 50k Capital',
        description: 'Strategies to grow your trading capital from 50k.',
        duration: '30:15',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 2
      },
      {
        id: 'trading-journal',
        title: 'Trading Journal',
        description: 'How to maintain an effective trading journal.',
        duration: '15:45',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 3
      },
      {
        id: 'risk-management',
        title: 'Risk Management',
        description: 'Essential risk management techniques for traders.',
        duration: '22:30',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 4
      },
      {
        id: 'trading-psychology',
        title: 'Trading Psychology',
        description: 'Master the psychology of trading and emotional control.',
        duration: '28:10',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 5
      },
      {
        id: 'summary-2',
        title: 'Summary',
        description: 'Complete summary of Phase 2 concepts and strategies.',
        duration: '14:25',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 6
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
    order: 3,
    content: [
      {
        id: 'entry-exit-setup',
        title: 'Entry Exit Setup',
        description: 'Advanced entry and exit strategies for professional traders.',
        duration: '35:20',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 1
      },
      {
        id: 'sniper-entry',
        title: 'Sniper Entry Setup',
        description: 'Precision entry techniques for maximum profit potential.',
        duration: '42:15',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 2
      },
      {
        id: 'trap-trading',
        title: 'Trap Trading Setup',
        description: 'Identifying and avoiding trading traps and false signals.',
        duration: '38:30',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 3
      },
      {
        id: 'double-capital',
        title: 'How to Double Capital',
        description: 'Strategies to double your trading capital effectively.',
        duration: '45:10',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 4
      },
      {
        id: 'psychology-awareness',
        title: 'Trading Psychology Self Awareness',
        description: 'Developing self-awareness and mental discipline in trading.',
        duration: '33:45',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 5
      },
      {
        id: 'summary-3',
        title: 'Summary',
        description: 'Complete summary of Phase 3 advanced concepts.',
        duration: '18:50',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 6
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
    order: 4,
    content: [
      {
        id: 'deposit-20k',
        title: 'Deposit 20k',
        description: 'How to start with 20k and build your trading foundation.',
        duration: '25:30',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 1
      },
      {
        id: 'best-setups',
        title: 'Trade with Best Setups',
        description: 'Identifying and executing the highest probability setups.',
        duration: '50:20',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 2
      },
      {
        id: 'grow-20k-to-1l',
        title: 'Grow 20k to 1L',
        description: 'Complete strategy to grow from 20k to 1 lakh rupees.',
        duration: '60:15',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 3
      },
      {
        id: 'summary-4',
        title: 'Summary',
        description: 'Master trader summary and final insights.',
        duration: '22:40',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        order: 4
      }
    ]
  }
];

const populateLearningPhases = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Clear existing phases
    await LearningPhase.deleteMany({});
    console.log('Cleared existing phases');

    // Insert default phases
    const phases = await LearningPhase.insertMany(defaultPhases);
    console.log(`✅ Successfully populated ${phases.length} learning phases with pricing data`);

    // Log the phases for verification
    phases.forEach(phase => {
      console.log(`Phase: ${phase.title} - Price: ${phase.currency}${phase.price} (Original: ${phase.currency}${phase.originalPrice})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating learning phases:', error);
    process.exit(1);
  }
};

populateLearningPhases(); 