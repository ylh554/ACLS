import React, { useState, useEffect, useRef } from 'react';
import { TimerDisplay } from './components/TimerDisplay';
import { DecisionEngine } from './components/DecisionEngine';
import { HsAndTsChecklist } from './components/HsAndTsChecklist';
import { LogHistory } from './components/LogHistory';
import { ZapIcon, WindIcon, SyringeIcon, SkullIcon } from './components/Icons';
import { ResusState, LogEntry, RhythmType, LogType } from './types';
import { RHYTHM_OPTIONS } from './constants';
import { downloadReport } from './services/reportService';
import { useWakeLock } from './hooks/useWakeLock';

const formatTimeSeconds = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const App = () => {
  const [resusState, setResusState] = useState<ResusState>({
    isActive: false,
    startTime: null,
    elapsedTime: 0,
    cycleTime: 0,
    lastEpiTime: null,
    lastAmioTime: null,
    shockCount: 0,
    currentRhythm: null,
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const timerRef = useRef<number | null>(null);

  // Hook to keep screen on (mobile specific)
  useWakeLock(resusState.isActive);

  useEffect(() => {
    if (resusState.isActive) {
      timerRef.current = window.setInterval(() => {
        setResusState(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1,
          cycleTime: prev.cycleTime + 1
        }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resusState.isActive]);

  const addLog = (action: string, actionCn: string, type: LogType) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      timeOffset: resusState.elapsedTime,
      action,
      actionCn,
      type
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const startResus = () => {
    setResusState(prev => ({ 
      ...prev, 
      isActive: true, 
      startTime: prev.startTime || Date.now() 
    }));
    if (resusState.elapsedTime === 0) {
      addLog('Resuscitation Started', '开始抢救', 'info');
    } else {
      addLog('Timer Resumed', '计时恢复', 'info');
    }
  };

  const pauseResus = () => {
    setResusState(prev => ({ ...prev, isActive: false }));
    addLog('Timer Paused', '计时暂停', 'info');
  };

  const resetResus = () => {
    if (window.confirm('Reset all data? This cannot be undone.\n重置所有数据？此操作不可撤销。')) {
      setResusState({
        isActive: false,
        startTime: null,
        elapsedTime: 0,
        cycleTime: 0,
        lastEpiTime: null,
        lastAmioTime: null,
        shockCount: 0,
        currentRhythm: null,
      });
      setLogs([]);
    }
  };

  const resetCycle = () => {
    setResusState(prev => ({ ...prev, cycleTime: 0 }));
    addLog('Cycle Timer Reset', '周期计时重置', 'procedure');
  };

  const endResus = () => {
    if (window.confirm('Are you sure you want to end resuscitation? Patient Deceased.\n确定要结束抢救吗？患者死亡。')) {
      setResusState(prev => ({ ...prev, isActive: false }));
      addLog('Resuscitation Ended - Patient Deceased', '抢救结束 - 患者死亡', 'info');
    }
  };

  const recordDrug = (drugName: string, drugNameCn: string) => {
    if (drugName.includes('Epi')) {
      setResusState(prev => ({ ...prev, lastEpiTime: prev.elapsedTime }));
    } else if (drugName.includes('Amio')) {
      setResusState(prev => ({ ...prev, lastAmioTime: prev.elapsedTime }));
    }
    addLog(drugName, drugNameCn, 'drug');
  };

  const recordShock = () => {
    setResusState(prev => ({ 
      ...prev, 
      shockCount: prev.shockCount + 1,
      cycleTime: 0 
    }));
    addLog(`Shock Delivered #${resusState.shockCount + 1}`, `实施除颤 #${resusState.shockCount + 1}`, 'shock');
  };

  const selectRhythm = (rhythm: RhythmType) => {
    setResusState(prev => ({ 
      ...prev, 
      currentRhythm: rhythm,
      cycleTime: 0 
    }));
    addLog(`Rhythm Check: ${rhythm}`, `心律检查: ${rhythm}`, 'rhythm');
  };

  // Drug timing calculations
  const epiTimeSince = resusState.lastEpiTime !== null ? resusState.elapsedTime - resusState.lastEpiTime : null;
  const epiProgress = epiTimeSince === null ? 100 : Math.min((epiTimeSince / 180) * 100, 100);
  const epiReady = epiProgress >= 100;
  const epiNextTime = epiTimeSince !== null ? Math.max(0, 180 - epiTimeSince) : 0;

  return (
    <div className="min-h-[100dvh] bg-slate-100 flex flex-col">
      <div className="max-w-[1600px] w-full mx-auto p-2 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        
        {/* LEFT COLUMN (Hs and Ts) - Order 3 on mobile */}
        <div className="lg:col-span-2 flex flex-col order-3 lg:order-1 min-h-[300px]">
          <HsAndTsChecklist />
        </div>

        {/* MIDDLE COLUMN (Controls) - Order 1 on mobile */}
        <div className="lg:col-span-6 flex flex-col gap-4 order-1 lg:order-2">
          
          <TimerDisplay 
            elapsedTime={resusState.elapsedTime} 
            cycleTime={resusState.cycleTime}
            isActive={resusState.isActive}
            onStart={startResus}
            onPause={pauseResus}
            onReset={resetResus}
            onResetCycle={resetCycle}
          />

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Rhythm Check / 心律检查</h2>
            <div className="grid grid-cols-3 xs:grid-cols-5 gap-2">
              {RHYTHM_OPTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={() => selectRhythm(r.type)}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all relative overflow-hidden touch-manipulation
                    ${resusState.currentRhythm === r.type 
                      ? 'ring-2 ring-offset-2 ring-blue-500 border-transparent shadow-md bg-white z-10 scale-105' 
                      : `${r.color} border-transparent`
                    }
                  `}
                >
                  <span className="font-bold text-sm md:text-lg leading-none">{r.label}</span>
                  <span className="text-[10px] opacity-80 mt-1">{r.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[120px]">
            <DecisionEngine state={resusState} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={recordShock}
                className="col-span-1 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-2 border-red-200 p-3 rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-colors group shadow-sm active:scale-95 touch-manipulation min-h-[80px]"
            >
                <div className="bg-red-500 text-white p-2.5 rounded-full shadow-md group-hover:scale-110 transition-transform">
                  <ZapIcon size={24} fill="currentColor" />
                </div>
                <div className="text-left">
                  <div className="font-black text-red-900 text-lg">SHOCK</div>
                  <div className="text-xs text-red-700 font-medium">记录除颤</div>
                </div>
            </button>

            <button 
                onClick={() => addLog('Airway Opened', '开放气道', 'procedure')}
                className="col-span-1 bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-200 p-3 rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-colors group shadow-sm active:scale-95 touch-manipulation min-h-[80px]"
            >
                <div className="bg-cyan-500 text-white p-2 rounded-full shadow-md group-hover:scale-110 transition-transform">
                  <WindIcon size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-cyan-900 text-base md:text-lg">OPEN AIRWAY</div>
                  <div className="text-xs text-cyan-700 font-medium">开放气道</div>
                </div>
            </button>

            {/* Drugs Row */}
            <button 
                onClick={() => recordDrug('Epinephrine 1mg', '肾上腺素 1mg')}
                className={`
                  col-span-2 md:col-span-1 relative overflow-hidden border-2 p-3 rounded-xl flex items-center justify-center gap-3 transition-colors group shadow-sm active:scale-95 touch-manipulation min-h-[80px]
                  ${epiReady 
                    ? 'bg-blue-50 hover:bg-blue-100 border-blue-300' 
                    : 'bg-gray-50 border-gray-200'
                  }
                `}
            >
                <div 
                  className={`absolute bottom-0 left-0 h-full transition-all duration-1000 ease-linear opacity-20 ${epiReady ? 'bg-transparent' : 'bg-blue-400'}`} 
                  style={{ width: `${epiProgress}%` }} 
                />
                
                <div className="relative z-10 flex items-center gap-3">
                  <div className={`
                    p-2.5 rounded-full shadow-md transition-transform group-hover:scale-110
                    ${epiReady ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}
                  `}>
                    <SyringeIcon size={24} />
                  </div>
                  <div className="text-left">
                    <div className={`font-black text-lg ${epiReady ? 'text-blue-900' : 'text-gray-500'}`}>EPI 1mg</div>
                    <div className="text-xs text-blue-800 font-medium flex items-center gap-1">
                      <span>肾上腺素</span>
                      {!epiReady && (
                        <span className="bg-blue-100 text-blue-700 px-1.5 rounded font-mono font-bold">
                          {formatTimeSeconds(epiNextTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
            </button>

            <div className="col-span-2 md:col-span-1 grid grid-cols-2 gap-3">
              <button 
                  onClick={() => recordDrug('Amiodarone 300mg', '胺碘酮 300mg')}
                  className="bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors group shadow-sm active:scale-95 touch-manipulation"
              >
                  <div className="font-bold text-indigo-900 text-sm">AMIO 300mg</div>
                  <div className="text-[10px] text-indigo-700 font-medium">首剂</div>
              </button>

              <button 
                  onClick={() => recordDrug('Amiodarone 150mg', '胺碘酮 150mg')}
                  className="bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors group shadow-sm active:scale-95 touch-manipulation"
              >
                  <div className="font-bold text-indigo-900 text-sm">AMIO 150mg</div>
                  <div className="text-[10px] text-indigo-700 font-medium">次剂</div>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-2 flex justify-end">
            <button 
              onClick={endResus}
              className="bg-slate-800 hover:bg-black text-slate-200 hover:text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors border border-slate-700 shadow-lg touch-manipulation w-full md:w-auto justify-center"
            >
                <SkullIcon size={20} className="text-red-500" />
                <div className="text-left leading-tight">
                  <div className="font-bold text-sm">END RESUSCITATION</div>
                  <div className="text-xs opacity-60">宣告死亡</div>
                </div>
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN (Logs) - Order 2 on mobile */}
        <div className="lg:col-span-4 flex flex-col gap-4 order-2 lg:order-3 min-h-[300px] h-[50vh] lg:h-auto">
          <LogHistory logs={logs} onDownload={() => downloadReport(logs, resusState)} />
        </div>
      </div>
    </div>
  );
};

export default App;