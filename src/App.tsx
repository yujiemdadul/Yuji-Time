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
    className={`brutal-card rounded-none p-6 relative overflow-hidden group ${className}`}
  >
    {title && (
      <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-4">
        {Icon && <Icon size={20} className="text-black" />}
        <h3 className="text-sm font-black uppercase tracking-tighter">{title}</h3>
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
  const [isFullScreenCountdown, setIsFullScreenCountdown] = useState(false);

  // Stopwatch State
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown State
  const [targetDate, setTargetDate] = useState<string>('');
  const [countdownRemaining, setCountdownRemaining] = useState<number>(0);
  const [totalCountdownDuration, setTotalCountdownDuration] = useState<number>(0);
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

  const startCountdown = () => {
    const now = Date.now();
    const target = new Date(targetDate).getTime();
    const diff = target - now;
    if (diff > 0) {
      setTotalCountdownDuration(diff);
      setCountdownRemaining(diff);
      setIsCountdownActive(true);
    }
  };

  const countdownProgress = totalCountdownDuration > 0 
    ? Math.max(0, Math.min(1, 1 - (countdownRemaining / totalCountdownDuration)))
    : 0;

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
      <div className="fixed inset-0 bg-[#FFFF33] flex flex-col items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <div className="relative mb-8 flex justify-center">
            <div className="w-24 h-24 border-8 border-black border-t-transparent rounded-full animate-spin" />
            <Clock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black" size={40} />
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-black mb-2 font-display">YUJI TIME</h1>
          <p className="text-black font-black tracking-widest uppercase text-sm">Master Every Second</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFF33] text-black font-sans selection:bg-black selection:text-[#FFFF33]">
      <div id="confetti-container" className="fixed inset-0 pointer-events-none z-[100]" />

      {/* Header */}
      <header className="relative z-10 px-6 py-8 flex items-center justify-between max-w-7xl mx-auto border-b-4 border-black mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black text-[#FFFF33] border-2 border-black">
            <Clock size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter font-display">YUJI TIME</h1>
            <p className="text-xs font-black tracking-widest uppercase">Master Every Second</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
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
                className="p-2 bg-black text-[#FFFF33] border-2 border-black hover:scale-110 transition-transform lg:opacity-0 lg:group-hover:opacity-100 opacity-100"
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
                className="text-7xl md:text-9xl font-black tracking-tighter mb-4 font-mono leading-none"
              >
                {formatTime(currentTime)}
              </motion.div>
              <div className="flex items-center gap-6">
                <div className="text-xl font-black uppercase tracking-tighter opacity-60">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <button 
                  onClick={() => setIs24Hour(!is24Hour)}
                  className="px-4 py-1 bg-black text-[#FFFF33] text-[10px] font-black uppercase tracking-widest border-2 border-black hover:bg-zinc-800 transition-colors"
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex flex-col bg-[#FFFF33] text-black font-sans overflow-hidden"
              >
                <button 
                  onClick={() => setIsFullScreenClock(false)}
                  className="absolute top-10 right-10 p-4 bg-black text-[#FFFF33] border-4 border-black hover:scale-110 transition-transform z-10"
                >
                  <Minimize2 size={32} />
                </button>

                <div className="flex-1 flex flex-col items-center justify-center p-10">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-black tracking-[0.4em] uppercase mb-8"
                  >
                    CURRENT TIME
                  </motion.div>
                  
                  <motion.div 
                    key={currentTime.getSeconds()}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="text-[25vw] md:text-[30vh] leading-none font-black tracking-tighter mb-8 font-mono"
                  >
                    {formatTime(currentTime)}
                  </motion.div>

                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl md:text-6xl font-black uppercase tracking-tighter"
                  >
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </motion.div>
                </div>

                <div className="h-[10vh] bg-black text-[#FFFF33] flex items-center justify-center">
                  <div className="flex items-center gap-4">
                    <Clock size={32} />
                    <span className="font-black tracking-tighter text-4xl font-display">YUJI TIME</span>
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
                className="p-2 bg-black text-[#FFFF33] border-2 border-black hover:scale-110 transition-transform lg:opacity-0 lg:group-hover:opacity-100 opacity-100"
                title="Full Screen Stopwatch"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div className={`text-6xl font-black font-mono mb-8 tabular-nums ${isStopwatchRunning ? 'text-black' : ''}`}>
                {formatStopwatch(stopwatchTime)}
              </div>
              
              <div className="flex gap-4 mb-8">
                <button 
                  onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                  className={`w-14 h-14 bg-black text-[#FFFF33] border-2 border-black flex items-center justify-center transition-all ${isStopwatchRunning ? 'bg-red-600 text-white' : ''}`}
                >
                  {isStopwatchRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
                <button 
                  onClick={handleLap}
                  disabled={!isStopwatchRunning}
                  className="w-14 h-14 bg-white border-2 border-black flex items-center justify-center disabled:opacity-30"
                >
                  <Plus size={24} />
                </button>
                <button 
                  onClick={resetStopwatch}
                  className="w-14 h-14 bg-white border-2 border-black flex items-center justify-center"
                >
                  <RotateCcw size={24} />
                </button>
              </div>

              <div className="w-full h-40 overflow-y-auto border-t-2 border-black pt-4">
                {laps.map((lap, idx) => (
                  <div key={lap.id} className="flex justify-between items-center py-2 border-b border-black/10 last:border-0">
                    <span className="text-xs font-black opacity-40 uppercase">LAP {laps.length - idx}</span>
                    <span className="font-mono font-black">{formatStopwatch(lap.time)}</span>
                    <span className="text-xs font-mono opacity-40">+{formatStopwatch(lap.diff)}</span>
                  </div>
                ))}
                {laps.length === 0 && (
                  <div className="h-full flex items-center justify-center text-xs font-black opacity-30 uppercase">No laps recorded</div>
                )}
              </div>
            </div>
          </Card>

          {/* Full Screen Stopwatch Overlay */}
          <AnimatePresence>
            {isFullScreenStopwatch && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex flex-col bg-[#FFFF33] text-black font-sans overflow-hidden"
              >
                <button 
                  onClick={() => setIsFullScreenStopwatch(false)}
                  className="absolute top-10 right-10 p-4 bg-black text-[#FFFF33] border-4 border-black hover:scale-110 transition-transform z-10"
                >
                  <Minimize2 size={32} />
                </button>

                <div className="flex-1 flex flex-col items-center justify-center p-10">
                  <div className="text-[20vw] md:text-[25vh] leading-none font-black tracking-tighter mb-12 font-mono tabular-nums">
                    {formatStopwatch(stopwatchTime)}
                  </div>
                  
                  <div className="flex gap-8">
                    <button 
                      onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                      className={`px-16 py-6 bg-black text-[#FFFF33] border-4 border-black text-3xl font-black uppercase tracking-tighter transition-all ${isStopwatchRunning ? 'bg-red-600 text-white' : ''}`}
                    >
                      {isStopwatchRunning ? 'Pause' : 'Start'}
                    </button>
                    <button 
                      onClick={handleLap}
                      disabled={!isStopwatchRunning}
                      className="px-16 py-6 bg-white border-4 border-black text-3xl font-black uppercase tracking-tighter disabled:opacity-30"
                    >
                      Lap
                    </button>
                    <button 
                      onClick={resetStopwatch}
                      className="p-6 bg-white border-4 border-black"
                    >
                      <RotateCcw size={40} />
                    </button>
                  </div>
                </div>

                <div className="h-[25vh] bg-black text-white p-6 overflow-y-auto">
                  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    {laps.map((lap, index) => (
                      <div key={lap.id} className="flex justify-between items-center p-4 border-2 border-white/20">
                        <span className="text-xl font-black opacity-40 uppercase">LAP {laps.length - index}</span>
                        <span className="text-3xl font-mono font-black">{formatStopwatch(lap.time)}</span>
                        <span className="text-xl font-mono opacity-40">+{formatStopwatch(lap.diff)}</span>
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
                className="p-2 bg-black text-[#FFFF33] border-2 border-black hover:scale-110 transition-transform lg:opacity-0 lg:group-hover:opacity-100 opacity-100"
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
                    stroke="black"
                    strokeWidth="12"
                    className="opacity-10"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="black"
                    strokeWidth="12"
                    strokeDasharray="552.92"
                    animate={{ strokeDashoffset: 552.92 * focusProgress }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-black font-mono tabular-nums">
                    {Math.floor(focusRemaining / 60).toString().padStart(2, '0')}:
                    {(focusRemaining % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Remaining</div>
                </div>
              </div>

              {!isFocusRunning && focusRemaining === (focusMinutes * 60 + focusSeconds) ? (
                <div className="flex gap-2 mb-6">
                  <input 
                    type="number" 
                    value={focusMinutes} 
                    onChange={(e) => setFocusMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 p-2 bg-white border-2 border-black text-center font-black"
                    placeholder="Min"
                  />
                  <span className="flex items-center font-black">:</span>
                  <input 
                    type="number" 
                    value={focusSeconds} 
                    onChange={(e) => setFocusSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 p-2 bg-white border-2 border-black text-center font-black"
                    placeholder="Sec"
                  />
                </div>
              ) : null}

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsFocusRunning(!isFocusRunning)}
                  className={`px-8 py-3 bg-black text-[#FFFF33] border-2 border-black font-black uppercase tracking-tighter transition-all ${isFocusRunning ? 'bg-red-600 text-white' : ''}`}
                >
                  {isFocusRunning ? 'Pause' : 'Start Focus'}
                </button>
                <button 
                  onClick={resetFocus}
                  className="p-3 bg-white border-2 border-black"
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex flex-col bg-[#FFFF33] text-black font-sans overflow-hidden"
              >
                {/* Top Bar */}
                <div className="h-[15vh] bg-[#FFFF99] flex items-center justify-between px-6 md:px-12 relative">
                  <button 
                    onClick={resetFocus}
                    className="w-12 h-12 md:w-16 md:h-16 bg-black/80 text-[#FFFF33] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <RotateCcw size={24} className="md:w-8 md:h-8" />
                  </button>
                  
                  <div className="text-4xl md:text-7xl font-black tracking-tighter uppercase">
                    {isFocusRunning ? 'FOCUS' : 'PREPARE'}
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsFocusRunning(!isFocusRunning)}
                      className="w-12 h-12 md:w-16 md:h-16 bg-black/80 text-[#FFFF33] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      {isFocusRunning ? <Pause size={24} className="md:w-8 md:h-8" /> : <Play size={24} className="md:w-8 md:h-8 ml-1" />}
                    </button>
                    
                    <button 
                      onClick={() => setIsFullScreenFocus(false)}
                      className="w-12 h-12 md:w-16 md:h-16 bg-black/20 text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Minimize2 size={24} className="md:w-8 md:h-8" />
                    </button>
                  </div>
                </div>

                {/* Main Timer Area */}
                <div className="flex-1 flex items-center justify-center">
                  <motion.div 
                    key={focusRemaining}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="text-[35vw] md:text-[40vh] leading-none font-black tracking-tighter font-mono"
                  >
                    {Math.floor(focusRemaining / 60).toString().padStart(2, '0')}:
                    {(focusRemaining % 60).toString().padStart(2, '0')}
                  </motion.div>
                </div>

                {/* Bottom Bar */}
                <div className="h-[15vh] flex">
                  <div className="flex-1 bg-black text-white flex items-center justify-center px-4">
                    <div className="text-2xl md:text-5xl font-black tracking-tighter uppercase">
                      UP NEXT
                    </div>
                  </div>
                  <div className="flex-[1.5] bg-[#66FF66] text-black flex items-center justify-center px-4">
                    <div className="text-2xl md:text-5xl font-black tracking-tighter uppercase">
                      TIME LAP:{(focusMinutes * 60 + focusSeconds - focusRemaining).toString().padStart(2, '0')}:00
                    </div>
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
            <div className="absolute top-6 right-6 flex gap-2">
              <button 
                onClick={() => setIsFullScreenCountdown(true)}
                className="p-2 bg-black text-[#FFFF33] border-2 border-black hover:scale-110 transition-transform lg:opacity-0 lg:group-hover:opacity-100 opacity-100"
                title="Full Screen Countdown"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Target Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-3 bg-white border-2 border-black font-black text-sm outline-none focus:bg-[#FFFF99] transition-colors"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {Object.entries(formatCountdown(countdownRemaining)).map(([unit, value]) => (
                  <div key={unit} className="flex flex-col items-center p-2 bg-black text-[#FFFF33] border-2 border-black">
                    <div className="text-xl font-black font-mono">{value.toString().padStart(2, '0')}</div>
                    <div className="text-[8px] font-black uppercase opacity-60">{unit}</div>
                  </div>
                ))}
              </div>

              <div className="relative h-4 bg-black/10 border-2 border-black overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-[#66FF66]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${countdownProgress * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <button 
                onClick={() => isCountdownActive ? setIsCountdownActive(false) : startCountdown()}
                disabled={!targetDate}
                className={`w-full py-4 bg-black text-[#FFFF33] border-2 border-black font-black uppercase tracking-widest transition-all disabled:opacity-30 ${isCountdownActive ? 'bg-red-600 text-white' : ''}`}
              >
                {isCountdownActive ? 'Cancel Countdown' : 'Start Countdown'}
              </button>
            </div>
          </Card>

          {/* Full Screen Countdown Overlay */}
          <AnimatePresence>
            {isFullScreenCountdown && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex flex-col bg-[#FFFF33] text-black font-sans overflow-hidden"
              >
                <button 
                  onClick={() => setIsFullScreenCountdown(false)}
                  className="absolute top-10 right-10 p-4 bg-black text-[#FFFF33] border-4 border-black hover:scale-110 transition-transform z-10"
                >
                  <Minimize2 size={32} />
                </button>

                <div className="flex-1 flex flex-col items-center justify-center p-10">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-black tracking-[0.4em] uppercase mb-12"
                  >
                    COUNTDOWN TO TARGET
                  </motion.div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12 w-full max-w-6xl">
                    {Object.entries(formatCountdown(countdownRemaining)).map(([unit, value], idx) => (
                      <motion.div 
                        key={unit}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex flex-col items-center p-8 md:p-12 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <div className="text-6xl md:text-9xl font-black font-mono mb-2">{value.toString().padStart(2, '0')}</div>
                        <div className="text-sm md:text-xl font-black uppercase tracking-[0.2em] opacity-40">{unit}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="relative h-8 bg-black/10 border-4 border-black w-full max-w-4xl mb-12 overflow-hidden">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-[#66FF66]"
                      initial={{ width: '0%' }}
                      animate={{ width: `${countdownProgress * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <button 
                    onClick={() => isCountdownActive ? setIsCountdownActive(false) : startCountdown()}
                    disabled={!targetDate}
                    className={`px-16 py-6 bg-black text-[#FFFF33] border-4 border-black text-3xl font-black uppercase tracking-widest transition-all disabled:opacity-30 ${isCountdownActive ? 'bg-red-600 text-white' : ''}`}
                  >
                    {isCountdownActive ? 'Cancel' : 'Start Countdown'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* World Clock Dashboard */}
          <Card title="World Dashboard" icon={Globe}>
            <div className="space-y-4">
              {WORLD_CITIES.map((city) => (
                <div key={city.city} className="group p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-lg font-black tracking-tight uppercase">{city.city}</span>
                    <span className="text-xl font-black">
                      {new Date().toLocaleTimeString('en-US', { timeZone: city.timezone, hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center opacity-60">
                    <span className="text-[10px] font-black uppercase tracking-widest">{city.country}</span>
                    <span className="text-[10px] font-mono font-black">
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
      <footer className="relative z-10 py-12 px-6 text-center border-t-4 border-black mt-20 bg-black text-[#FFFF33]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-[#FFFF33] text-black border-2 border-black">
              <Clock size={24} />
            </div>
            <span className="font-black tracking-tighter text-4xl font-display uppercase">YUJI TIME</span>
          </div>
          <p className="text-sm font-black uppercase tracking-widest mb-2">
            © 2026 Yuji Time | Master Every Second
          </p>
          <p className="text-xs font-black uppercase tracking-widest opacity-60">
            Designed by <a href="https://www.facebook.com/zusdev" target="_blank" rel="noreferrer" className="text-[#66FF66] hover:underline">Zusdev</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
