/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Clock, 
  Timer, 
  Watch as StopwatchIcon, 
  Globe, 
  Moon, 
  Sun, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ChevronRight,
  Bell,
  Settings,
  LayoutDashboard,
  Hourglass,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Lap {
  id: number;
  time: number;
  diff: number;
}

interface WorldTime {
  city: string;
  timezone: string;
  country: string;
}

// --- Constants ---
const WORLD_CITIES: WorldTime[] = [
  { city: 'New York', timezone: 'America/New_York', country: 'USA' },
  { city: 'London', timezone: 'Europe/London', country: 'UK' },
  { city: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan' },
  { city: 'Dubai', timezone: 'Asia/Dubai', country: 'UAE' },
  { city: 'Dhaka', timezone: 'Asia/Dhaka', country: 'Bangladesh' },
];

// --- Components ---

const ParticleBackground = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 2}px`,
      duration: `${Math.random() * 10 + 10}s`,
      delay: `${Math.random() * 10}s`,
    }));
  }, []);

  return (
    <div className="particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle particle-anim"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

const Card = ({ children, className = "", title, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass dark:glass-dark rounded-3xl p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 animate-float ${className}`}
  >
    {title && (
      <div className="flex items-center gap-2 mb-6">
        {Icon && <Icon size={20} className="text-blue-500" />}
        <h3 className="text-sm font-semibold uppercase tracking-widest opacity-60">{title}</h3>
      </div>
    )}
    {children}
  </motion.div>
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);
  const [isFullScreenClock, setIsFullScreenClock] = useState(false);
  const [isFullScreenFocus, setIsFullScreenFocus] = useState(false);
  const [isFullScreenStopwatch, setIsFullScreenStopwatch] = useState(false);

  // Stopwatch State
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown State
  const [targetDate, setTargetDate] = useState<string>('');
  const [countdownRemaining, setCountdownRemaining] = useState<number>(0);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Focus Timer State
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [focusRemaining, setFocusRemaining] = useState(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const focusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Clock Update
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Stopwatch Logic
  useEffect(() => {
    if (isStopwatchRunning) {
      const startTime = Date.now() - stopwatchTime;
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime(Date.now() - startTime);
      }, 10);
    } else {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [isStopwatchRunning]);

  // Countdown Logic
  useEffect(() => {
    if (isCountdownActive && targetDate) {
      countdownIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const target = new Date(targetDate).getTime();
        const diff = target - now;
        if (diff <= 0) {
          setCountdownRemaining(0);
          setIsCountdownActive(false);
          playAlert();
          triggerConfetti();
        } else {
          setCountdownRemaining(diff);
        }
      }, 1000);
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isCountdownActive, targetDate]);

  // Focus Timer Logic
  useEffect(() => {
    if (isFocusRunning && focusRemaining > 0) {
      focusIntervalRef.current = setInterval(() => {
        setFocusRemaining(prev => {
          if (prev <= 1) {
            setIsFocusRunning(false);
            playAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (focusIntervalRef.current) clearInterval(focusIntervalRef.current);
    }
    return () => {
      if (focusIntervalRef.current) clearInterval(focusIntervalRef.current);
    };
  }, [isFocusRunning, focusRemaining]);

  const playAlert = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => console.log('Audio playback blocked'));
  };

  const triggerConfetti = () => {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'absolute w-2 h-2 bg-blue-500 rounded-full pointer-events-none';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.backgroundColor = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)];
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      container.appendChild(confetti);
      
      const animation = confetti.animate([
        { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${(Math.random() - 0.5) * 200}px, ${window.innerHeight}px) rotate(${Math.random() * 1000}deg)`, opacity: 0 }
      ], {
        duration: Math.random() * 2000 + 1000,
        easing: 'cubic-bezier(0, .9, .57, 1)'
      });
      
      animation.onfinish = () => confetti.remove();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: !is24Hour,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const formatCountdown = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const handleLap = () => {
    const lastLapTime = laps.length > 0 ? laps[0].time : 0;
    const newLap: Lap = {
      id: Date.now(),
      time: stopwatchTime,
      diff: stopwatchTime - lastLapTime
    };
    setLaps([newLap, ...laps]);
  };

  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
  };

  const startFocus = () => {
    setFocusRemaining(focusMinutes * 60 + focusSeconds);
    setIsFocusRunning(true);
  };

  const resetFocus = () => {
    setIsFocusRunning(false);
    setFocusRemaining(focusMinutes * 60 + focusSeconds);
  };

  const focusProgress = 1 - (focusRemaining / (focusMinutes * 60 + focusSeconds || 1));

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <Clock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={40} />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-2 text-glow">YUJI TIME</h1>
          <p className="text-blue-400 font-medium tracking-widest uppercase text-xs">Master Every Second</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`fixed inset-0 animate-gradient opacity-30 pointer-events-none ${isDarkMode ? 'bg-gradient-to-br from-blue-900 via-slate-950 to-purple-900' : 'bg-gradient-to-br from-blue-100 via-slate-50 to-purple-100'}`} />
      <ParticleBackground />
      <div id="confetti-container" className="fixed inset-0 pointer-events-none z-[100]" />

      {/* Header */}
      <header className="relative z-10 px-6 py-8 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Clock className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-glow">YUJI TIME</h1>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-50">Master Every Second</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 rounded-2xl glass dark:glass-dark hover:scale-110 transition-transform"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="p-3 rounded-2xl glass dark:glass-dark hover:scale-110 transition-transform">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="relative z-10 px-6 pb-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Clock Section */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Live Smart Clock */}
          <Card className="md:col-span-2" title="Live Smart Clock" icon={Clock}>
            <div className="absolute top-6 right-6 flex gap-2">
              <button 
                onClick={() => setIsFullScreenClock(true)}
                className="p-2 rounded-xl glass dark:glass-dark hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
                title="Full Screen Display"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-10">
              <motion.div 
                key={currentTime.getSeconds()}
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-7xl md:text-9xl font-black tracking-tighter mb-4 font-mono"
              >
                {formatTime(currentTime)}
              </motion.div>
              <div className="flex items-center gap-6">
                <div className="text-lg font-medium opacity-60">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <button 
                  onClick={() => setIs24Hour(!is24Hour)}
                  className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition-colors"
                >
                  {is24Hour ? '24H Format' : '12H Format'}
                </button>
              </div>
            </div>
          </Card>

          {/* Full Screen Clock Overlay */}
          <AnimatePresence>
            {isFullScreenClock && (
              <motion.div 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className={`fixed inset-0 z-[200] flex flex-col items-center justify-center p-10 transition-colors duration-700 ${isDarkMode ? 'bg-slate-950/95' : 'bg-slate-50/95'} backdrop-blur-2xl`}
              >
                <div className={`fixed inset-0 animate-gradient opacity-20 pointer-events-none ${isDarkMode ? 'bg-gradient-to-br from-blue-900 via-slate-950 to-purple-900' : 'bg-gradient-to-br from-blue-100 via-slate-50 to-purple-100'}`} />
                
                <button 
                  onClick={() => setIsFullScreenClock(false)}
                  className="absolute top-10 right-10 p-4 rounded-2xl glass dark:glass-dark hover:scale-110 transition-transform z-10"
                >
                  <Minimize2 size={32} />
                </button>

                <div className="text-center relative z-10">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40 mb-8"
                  >
                    Current Time
                  </motion.div>
                  
                  <motion.div 
                    key={currentTime.getSeconds()}
                    initial={{ opacity: 0.8, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[15vw] md:text-[20vw] leading-none font-black tracking-tighter mb-8 font-mono text-glow"
                  >
                    {formatTime(currentTime)}
                  </motion.div>

                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl md:text-4xl font-medium opacity-60"
                  >
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </motion.div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Clock size={16} className="text-white" />
                    </div>
                    <span className="font-black tracking-tighter text-xl">YUJI TIME</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stopwatch Pro */}
          <Card title="Stopwatch Pro" icon={StopwatchIcon}>
            <div className="absolute top-6 right-6 flex gap-2">
              <button 
                onClick={() => setIsFullScreenStopwatch(true)}
                className="p-2 rounded-xl glass dark:glass-dark hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
                title="Full Screen Stopwatch"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div className={`text-5xl font-black font-mono mb-8 ${isStopwatchRunning ? 'text-blue-500 animate-pulse' : ''}`}>
                {formatStopwatch(stopwatchTime)}
              </div>
              
              <div className="flex gap-4 mb-8">
                <button 
                  onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isStopwatchRunning ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'}`}
                >
                  {isStopwatchRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
                <button 
                  onClick={handleLap}
                  disabled={!isStopwatchRunning}
                  className="w-14 h-14 rounded-full glass dark:glass-dark flex items-center justify-center disabled:opacity-30"
                >
                  <Plus size={24} />
                </button>
                <button 
                  onClick={resetStopwatch}
                  className="w-14 h-14 rounded-full glass dark:glass-dark flex items-center justify-center"
                >
                  <RotateCcw size={24} />
                </button>
              </div>

              <div className="w-full h-40 overflow-y-auto pr-2 space-y-2">
                {laps.map((lap, idx) => (
                  <div key={lap.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-xs font-bold opacity-40">LAP {laps.length - idx}</span>
                    <span className="font-mono text-sm">{formatStopwatch(lap.time)}</span>
                    <span className="text-[10px] font-bold text-blue-500">+{formatStopwatch(lap.diff)}</span>
                  </div>
                ))}
                {laps.length === 0 && (
                  <div className="h-full flex items-center justify-center text-xs opacity-30 italic">No laps recorded</div>
                )}
              </div>
            </div>
          </Card>

          {/* Full Screen Stopwatch Overlay */}
          <AnimatePresence>
            {isFullScreenStopwatch && (
              <motion.div 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className={`fixed inset-0 z-[200] flex flex-col items-center justify-center p-10 transition-colors duration-700 ${isDarkMode ? 'bg-slate-950/95' : 'bg-slate-50/95'} backdrop-blur-2xl`}
              >
                <div className={`fixed inset-0 animate-gradient opacity-20 pointer-events-none ${isDarkMode ? 'bg-gradient-to-br from-blue-900 via-slate-950 to-purple-900' : 'bg-gradient-to-br from-blue-100 via-slate-50 to-purple-100'}`} />
                
                <button 
                  onClick={() => setIsFullScreenStopwatch(false)}
                  className="absolute top-10 right-10 p-4 rounded-2xl glass dark:glass-dark hover:scale-110 transition-transform z-10"
                >
                  <Minimize2 size={32} />
                </button>

                <div className="text-center relative z-10 w-full max-w-4xl">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40 mb-12"
                  >
                    Stopwatch Pro
                  </motion.div>
                  
                  <motion.div 
                    key={stopwatchTime}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className={`text-[15vh] md:text-[20vh] font-black font-mono mb-16 text-glow ${isStopwatchRunning ? 'text-blue-500' : ''}`}
                  >
                    {formatStopwatch(stopwatchTime)}
                  </motion.div>

                  <div className="flex justify-center gap-8 mb-16">
                    <button 
                      onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isStopwatchRunning ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-blue-500 text-white shadow-2xl shadow-blue-500/40'}`}
                    >
                      {isStopwatchRunning ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
                    </button>
                    <button 
                      onClick={handleLap}
                      disabled={!isStopwatchRunning}
                      className="w-24 h-24 rounded-full glass dark:glass-dark flex items-center justify-center disabled:opacity-30"
                    >
                      <Plus size={40} />
                    </button>
                    <button 
                      onClick={resetStopwatch}
                      className="w-24 h-24 rounded-full glass dark:glass-dark flex items-center justify-center"
                    >
                      <RotateCcw size={40} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[30vh] overflow-y-auto pr-4 custom-scrollbar">
                    {laps.map((lap, idx) => (
                      <div key={lap.id} className="p-6 rounded-3xl glass dark:glass-dark border border-white/5 flex flex-col items-center">
                        <span className="text-[10px] font-bold opacity-40 mb-2 uppercase tracking-widest">Lap {laps.length - idx}</span>
                        <span className="text-2xl font-black font-mono">{formatStopwatch(lap.time)}</span>
                        <span className="text-xs font-bold text-blue-500 mt-1">+{formatStopwatch(lap.diff)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Circular Focus Timer */}
          <Card title="Focus Timer" icon={Hourglass}>
            <div className="absolute top-6 right-6 flex gap-2">
              <button 
                onClick={() => setIsFullScreenFocus(true)}
                className="p-2 rounded-xl glass dark:glass-dark hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
                title="Full Screen Focus"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 mb-8">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="opacity-10"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray="552.92"
                    animate={{ strokeDashoffset: 552.92 * focusProgress }}
                    transition={{ duration: 1, ease: "linear" }}
                    className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-black font-mono">
                    {Math.floor(focusRemaining / 60).toString().padStart(2, '0')}:
                    {(focusRemaining % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Remaining</div>
                </div>
              </div>

              {!isFocusRunning && focusRemaining === (focusMinutes * 60 + focusSeconds) ? (
                <div className="flex gap-2 mb-6">
                  <input 
                    type="number" 
                    value={focusMinutes} 
                    onChange={(e) => setFocusMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 p-2 rounded-xl glass dark:glass-dark text-center font-bold"
                    placeholder="Min"
                  />
                  <span className="flex items-center font-bold">:</span>
                  <input 
                    type="number" 
                    value={focusSeconds} 
                    onChange={(e) => setFocusSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 p-2 rounded-xl glass dark:glass-dark text-center font-bold"
                    placeholder="Sec"
                  />
                </div>
              ) : null}

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsFocusRunning(!isFocusRunning)}
                  className={`px-8 py-3 rounded-2xl font-bold uppercase tracking-widest transition-all ${isFocusRunning ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'}`}
                >
                  {isFocusRunning ? 'Pause' : 'Start Focus'}
                </button>
                <button 
                  onClick={resetFocus}
                  className="p-3 rounded-2xl glass dark:glass-dark"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
            </div>
          </Card>

          {/* Full Screen Focus Overlay */}
          <AnimatePresence>
            {isFullScreenFocus && (
              <motion.div 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className={`fixed inset-0 z-[200] flex flex-col items-center justify-center p-10 transition-colors duration-700 ${isDarkMode ? 'bg-slate-950/95' : 'bg-slate-50/95'} backdrop-blur-2xl`}
              >
                <div className={`fixed inset-0 animate-gradient opacity-20 pointer-events-none ${isDarkMode ? 'bg-gradient-to-br from-blue-900 via-slate-950 to-purple-900' : 'bg-gradient-to-br from-blue-100 via-slate-50 to-purple-100'}`} />
                
                <button 
                  onClick={() => setIsFullScreenFocus(false)}
                  className="absolute top-10 right-10 p-4 rounded-2xl glass dark:glass-dark hover:scale-110 transition-transform z-10"
                >
                  <Minimize2 size={32} />
                </button>

                <div className="text-center relative z-10 w-full max-w-2xl">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40 mb-12"
                  >
                    Focus Session
                  </motion.div>
                  
                  <div className="relative w-[60vh] h-[60vh] mx-auto mb-12">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="opacity-10"
                      />
                      <motion.circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray="282.7%"
                        animate={{ strokeDashoffset: `${282.7 * focusProgress}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                        className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div 
                        key={focusRemaining}
                        initial={{ opacity: 0.8, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[15vh] font-black font-mono text-glow"
                      >
                        {Math.floor(focusRemaining / 60).toString().padStart(2, '0')}:
                        {(focusRemaining % 60).toString().padStart(2, '0')}
                      </motion.div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-8">
                    <button 
                      onClick={() => setIsFocusRunning(!isFocusRunning)}
                      className={`px-12 py-4 rounded-3xl text-xl font-black uppercase tracking-widest transition-all ${isFocusRunning ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-blue-500 text-white shadow-2xl shadow-blue-500/40'}`}
                    >
                      {isFocusRunning ? 'Pause' : 'Resume'}
                    </button>
                    <button 
                      onClick={resetFocus}
                      className="p-4 rounded-3xl glass dark:glass-dark"
                    >
                      <RotateCcw size={32} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Sections */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Smart Countdown Pro */}
          <Card title="Countdown Pro" icon={Bell}>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Target Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-3 rounded-2xl glass dark:glass-dark font-bold text-sm outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {Object.entries(formatCountdown(countdownRemaining)).map(([unit, value]) => (
                  <div key={unit} className="flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-xl font-black font-mono">{value.toString().padStart(2, '0')}</div>
                    <div className="text-[8px] font-bold uppercase opacity-40">{unit}</div>
                  </div>
                ))}
              </div>

              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  initial={{ width: '0%' }}
                  animate={{ width: isCountdownActive ? '100%' : '0%' }}
                  transition={{ duration: 2 }}
                />
              </div>

              <button 
                onClick={() => setIsCountdownActive(!isCountdownActive)}
                disabled={!targetDate}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all disabled:opacity-30 ${isCountdownActive ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-white text-slate-950 shadow-xl'}`}
              >
                {isCountdownActive ? 'Cancel Countdown' : 'Start Countdown'}
              </button>
            </div>
          </Card>

          {/* World Clock Dashboard */}
          <Card title="World Dashboard" icon={Globe}>
            <div className="space-y-4">
              {WORLD_CITIES.map((city) => (
                <div key={city.city} className="group p-4 rounded-2xl glass dark:glass-dark hover:bg-blue-500/10 transition-all border border-transparent hover:border-blue-500/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-black tracking-tight">{city.city}</span>
                    <span className="text-xs font-bold text-blue-500">
                      {new Date().toLocaleTimeString('en-US', { timeZone: city.timezone, hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center opacity-40">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{city.country}</span>
                    <span className="text-[10px] font-mono">
                      {new Date().toLocaleDateString('en-US', { timeZone: city.timezone, weekday: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 text-center border-t border-white/5 mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-white" />
            </div>
            <span className="font-black tracking-tighter text-xl">YUJI TIME</span>
          </div>
          <p className="text-xs font-medium opacity-40 mb-2">
            © 2026 Yuji Time | Master Every Second
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">
            Designed by <a href="https://www.facebook.com/zusdev" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Zusdev</a>
          </p>
        </div>
      </footer>

      {/* Floating Action Menu (Mobile Only) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center">
          <LayoutDashboard size={28} />
        </button>
      </div>
    </div>
  );
}
