import React from 'react';
import { PlayIcon, PauseIcon, RefreshCwIcon, RotateCcwIcon } from './Icons';

interface TimerDisplayProps {
  elapsedTime: number;
  cycleTime: number;
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onResetCycle: () => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  elapsedTime, 
  cycleTime, 
  isActive, 
  onStart, 
  onPause, 
  onReset,
  onResetCycle
}) => {
  const hasData = elapsedTime > 0;

  return (
    <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center border-l-8 border-medical-blue relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <RefreshCwIcon size={100} />
      </div>

      {/* Main Total Timer */}
      <div className="flex flex-col items-center mb-4 md:mb-0 z-10 min-w-[120px]">
        <span className="text-gray-400 text-xs font-bold tracking-wider uppercase">Total Time / 总时间</span>
        <div className="text-5xl font-mono font-bold tracking-tighter tabular-nums text-white">
          {formatTime(elapsedTime)}
        </div>
      </div>

      {/* CPR Cycle Timer */}
      <div className="flex flex-col items-center mb-4 md:mb-0 z-10 flex-1 px-4 w-full">
        <div className="flex items-center gap-2">
          <span className="text-medical-yellow text-xs font-bold tracking-wider uppercase">CPR Cycle / 按压周期</span>
          <button 
            onClick={onResetCycle}
            className="bg-gray-800 hover:bg-gray-700 p-1.5 rounded-full text-gray-400 hover:text-white transition-colors active:bg-gray-600 touch-manipulation"
            title="Reset 2 min cycle / 重置2分钟周期"
          >
            <RefreshCwIcon size={16} />
          </button>
        </div>
        
        <div className={`text-4xl font-mono font-bold tabular-nums transition-colors duration-300 ${cycleTime > 110 ? 'text-red-500 animate-pulse' : 'text-medical-yellow'}`}>
          {formatTime(cycleTime)}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full max-w-[200px] h-2 bg-gray-800 rounded-full mt-2 overflow-hidden border border-gray-700">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${cycleTime > 120 ? 'bg-red-500' : 'bg-medical-yellow'}`}
            style={{ width: `${Math.min((cycleTime / 120) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 z-10 w-full md:w-auto justify-center">
        {!isActive ? (
          <button 
            onClick={onStart}
            className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-medical-green hover:bg-green-600 px-6 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg shadow-green-900/20 active:translate-y-0.5 touch-manipulation"
          >
            <PlayIcon size={24} fill="currentColor" />
            <span>START</span>
          </button>
        ) : (
          <button 
            onClick={onPause}
            className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg shadow-yellow-900/20 active:translate-y-0.5 touch-manipulation"
          >
            <PauseIcon size={24} fill="currentColor" />
            <span>PAUSE</span>
          </button>
        )}
        
        <button 
          onClick={onReset}
          disabled={!hasData}
          className={`
            flex flex-col items-center justify-center w-20 rounded-lg transition-all border border-transparent touch-manipulation
            ${hasData 
              ? 'bg-gray-800 hover:bg-red-900/50 hover:border-red-800 text-gray-400 hover:text-red-200 cursor-pointer' 
              : 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
            }
          `}
          title="Reset All Data / 重置所有数据"
        >
          <RotateCcwIcon size={18} />
          <span className="text-[10px] font-bold mt-1">RESET</span>
        </button>
      </div>
    </div>
  );
};