import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, Square, Scissors, RotateCcw, Trophy, History, Hash, Zap } from 'lucide-react';

const CHOICES = [
  { id: 'rock', name: 'Rock', icon: <Square size={32} />, color: 'var(--primary)', shadow: 'var(--glow-primary)' },
  { id: 'paper', name: 'Paper', icon: <Circle size={32} />, color: 'var(--accent)', shadow: '0 0 20px rgba(112, 0, 255, 0.4)' },
  { id: 'scissors', name: 'Scissors', icon: <Scissors size={32} />, color: 'var(--secondary)', shadow: 'var(--glow-secondary)' },
];

const WIN_MAP = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper',
};

const App = () => {
  // Game State
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null); // 'win', 'lose', 'draw'
  const [isRevealing, setIsRevealing] = useState(false);

  // Persistence Stats
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('rps-stats');
    return saved ? JSON.parse(saved) : { rounds: 0, streak: 0, history: [] };
  });

  useEffect(() => {
    localStorage.setItem('rps-stats', JSON.stringify(stats));
  }, [stats]);

  const determineWinner = (player, computer) => {
    if (player === computer) return 'draw';
    if (WIN_MAP[player] === computer) return 'win';
    return 'lose';
  };

  const handleChoice = (choice) => {
    if (isRevealing) return;

    setIsRevealing(true);
    setPlayerChoice(CHOICES.find(c => c.id === choice));
    
    // Artificial delay for "Computer is thinking" feel
    setTimeout(() => {
      const cpuMove = CHOICES[Math.floor(Math.random() * CHOICES.length)];
      const gameResult = determineWinner(choice, cpuMove.id);

      setComputerChoice(cpuMove);
      setResult(gameResult);
      setIsRevealing(false);

      // Update Statistics
      setStats(prev => ({
        rounds: prev.rounds + 1,
        streak: gameResult === 'win' ? prev.streak + 1 : 0,
        history: [
          {
            id: Date.now(),
            round: prev.rounds + 1,
            playerMove: choice,
            computerMove: cpuMove.id,
            result: gameResult
          },
          ...prev.history
        ].slice(0, 50) // Keep last 50
      }));
    }, 800);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setStats({ rounds: 0, streak: 0, history: [] });
  };

  return (
    <div className="app-container">
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="header"
      >
        <h1 className="title">NEON <span className="text-secondary">RPS</span></h1>
        <p className="subtitle">CLASH OF THE SYNTHS</p>
      </motion.header>

      {/* Stats Board */}
      <div className="stats-container">
        <StatCard icon={<Hash size={20} />} label="Rounds" value={stats.rounds} />
        <StatCard icon={<Zap size={20} />} label="Streak" value={stats.streak} color="var(--primary)" />
      </div>

      <main className="game-main">
        {/* Arena */}
        <section className="arena glass-card">
          <div className="arena-side">
            <span className="label">YOU</span>
            <div className="move-placeholder">
              {playerChoice ? (
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="move-icon"
                  style={{ color: playerChoice.color }}
                >
                  {playerChoice.icon}
                </motion.div>
              ) : <div className="dot" />}
            </div>
          </div>

          <div className="arena-center">
            <AnimatePresence mode='wait'>
              {result && !isRevealing ? (
                <motion.div
                  key={result}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={`result-banner ${result}-text`}
                >
                  {result === 'win' ? 'VICTORY' : result === 'lose' ? 'DEFEAT' : 'STALEMATE'}
                </motion.div>
              ) : isRevealing ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <RotateCcw className="text-muted" size={40} />
                </motion.div>
              ) : <span className="vs">VS</span>}
            </AnimatePresence>
          </div>

          <div className="arena-side">
            <span className="label">CPU</span>
            <div className="move-placeholder">
              {computerChoice && !isRevealing ? (
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="move-icon"
                  style={{ color: computerChoice.color }}
                >
                  {computerChoice.icon}
                </motion.div>
              ) : <div className="dot pulse" />}
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="controls">
          {CHOICES.map((choice) => (
            <button
              key={choice.id}
              disabled={isRevealing}
              onClick={() => handleChoice(choice.id)}
              className="choice-btn glass-card"
              style={{ '--accent-color': choice.color, '--shadow-color': choice.shadow }}
            >
              <div className="icon-wrapper">{choice.icon}</div>
              <span>{choice.name}</span>
            </button>
          ))}
        </section>

        <button className="reset-btn" onClick={resetGame}>
          <RotateCcw size={18} /> Reset Data
        </button>

        {/* History */}
        {stats.history.length > 0 && (
          <section className="history-section glass-card">
            <div className="history-header">
              <History size={20} />
              <h3>LOGS</h3>
            </div>
            <div className="history-list">
              {stats.history.map((item) => (
                <div key={item.id} className="history-item">
                  <span className="round-num">#{item.round}</span>
                  <div className="moves">
                    <span style={{ color: CHOICES.find(c => c.id === item.playerMove).color }}>{item.playerMove}</span>
                    <span className="vs-small">vs</span>
                    <span style={{ color: CHOICES.find(c => c.id === item.computerMove).color }}>{item.computerMove}</span>
                  </div>
                  <span className={`result-small ${item.result}-text`}>
                    {item.result === 'win' ? '+1' : item.result === 'draw' ? '0' : '-'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <style jsx>{`
        .header { text-align: center; margin-bottom: 2rem; }
        .title { font-size: 3rem; margin-bottom: 0.5rem; }
        .subtitle { color: var(--text-muted); font-size: 0.9rem; letter-spacing: 4px; }
        .text-secondary { color: var(--secondary); text-shadow: var(--glow-secondary); }
        
        .stats-container { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .stat-card { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1.5rem; }
        .stat-value { font-family: 'Orbitron'; font-size: 1.2rem; }

        .game-main { width: 100%; max-width: 800px; display: flex; flex-direction: column; gap: 2rem; }

        .arena { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; text-align: center; height: 180px; }
        .arena-side { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .move-placeholder { width: 80px; height: 80px; background: rgba(0,0,0,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--glass-border); }
        .dot { width: 8px; height: 8px; background: var(--text-muted); border-radius: 50%; }
        .dot.pulse { animation: pulse 1.5s infinite; }
        .arena-center { width: 150px; }
        .vs { font-size: 1.5rem; color: var(--text-muted); opacity: 0.5; }
        .result-banner { font-size: 1.8rem; font-family: 'Orbitron'; font-weight: bold; }

        .controls { display: flex; justify-content: center; gap: 1.5rem; }
        .choice-btn { 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 0.5rem; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: 1px solid var(--glass-border);
        }
        .choice-btn:hover { 
          transform: translateY(-8px); 
          color: var(--accent-color); 
          border-color: var(--accent-color); 
          box-shadow: var(--shadow-color);
        }
        .choice-btn:active { transform: scale(0.95); }
        .choice-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .reset-btn { align-self: center; background: transparent; border: 1px solid var(--secondary); color: var(--secondary); padding: 0.5rem 1rem; border-radius: 50px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; transition: all 0.2s; }
        .reset-btn:hover { background: var(--secondary); color: white; }

        .history-section { max-height: 300px; overflow: hidden; display: flex; flex-direction: column; gap: 1rem; }
        .history-header { display: flex; align-items: center; gap: 0.5rem; opacity: 0.7; }
        .history-list { overflow-y: auto; display: flex; flex-direction: column; gap: 0.8rem; }
        .history-item { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: rgba(255,255,255,0.03); border-radius: 12px; font-size: 0.9rem; }
        .round-num { opacity: 0.4; width: 40px; }
        .moves { flex: 1; display: flex; gap: 1rem; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; }
        .vs-small { opacity: 0.3; }
        .result-small { width: 40px; text-align: right; font-family: 'Orbitron'; font-weight: bold; }

        @media (max-width: 600px) {
          .controls { flex-direction: column; }
          .arena { padding: 1rem 0; height: auto; min-height: 150px; }
          .title { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card glass-card">
    <div style={{ color }}>{icon}</div>
    <div className="stat-text">
      <div className="stat-label" style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase' }}>{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
    </div>
  </div>
);

export default App;
