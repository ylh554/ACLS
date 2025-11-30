import React, { useMemo } from 'react';
import { AlertTriangleIcon, ActivityIcon, ZapIcon, SyringeIcon } from './Icons';
import { ResusState, RhythmType } from '../types';

interface DecisionEngineProps {
  state: ResusState;
}

export const DecisionEngine: React.FC<DecisionEngineProps> = ({ state }) => {
  const suggestions = useMemo(() => {
    const alerts = [];

    // Cycle Checks (2 mins)
    if (state.cycleTime >= 120) {
      alerts.push({
        icon: <ActivityIcon className="w-6 h-6" />,
        textEn: "CHECK RHYTHM & PULSE",
        textCn: "检查心律和脉搏",
        urgent: true
      });
      alerts.push({
        icon: <ActivityIcon className="w-6 h-6" />,
        textEn: "SWITCH COMPRESSOR",
        textCn: "交换按压人员",
        urgent: true
      });
    }

    // Shockable Rhythms Logic
    if (state.currentRhythm === RhythmType.VF || state.currentRhythm === RhythmType.PVT) {
      if (state.shockCount === 0) {
        alerts.push({
          icon: <ZapIcon className="w-6 h-6" />,
          textEn: "SHOCK 1 - 120-200J Biphasic",
          textCn: "第一次除颤 - 120-200J 双相波",
          urgent: true
        });
      } else if (state.cycleTime < 10) {
        // Immediate CPR reminder after rhythm check
        alerts.push({
          icon: <ActivityIcon className="w-6 h-6" />,
          textEn: "RESUME CPR IMMEDIATELY",
          textCn: "立即继续按压",
          urgent: false
        });
      }
      
      // Amiodarone Logic (usually after 3 shocks)
      if (state.shockCount >= 3) {
        const timeSinceAmio = state.lastAmioTime ? state.elapsedTime - state.lastAmioTime : Infinity;
        if (timeSinceAmio > 300) { 
          if (!state.lastAmioTime) {
              alerts.push({
                icon: <SyringeIcon className="w-6 h-6" />,
                textEn: "CONSIDER AMIODARONE 300mg",
                textCn: "考虑胺碘酮 300mg",
                urgent: false
              });
          }
        }
      }

    } else if (state.currentRhythm === RhythmType.ASYSTOLE || state.currentRhythm === RhythmType.PEA) {
        alerts.push({
          icon: <ZapIcon className="w-6 h-6 text-gray-400" />,
          textEn: "NO SHOCK - CPR ONLY",
          textCn: "不可除颤 - 持续按压",
          urgent: false
        });
    }

    // Epinephrine Logic
    if (state.currentRhythm && state.currentRhythm !== RhythmType.ROSC) {
      const timeSinceEpi = state.lastEpiTime ? state.elapsedTime - state.lastEpiTime : Infinity;
      
      if (state.lastEpiTime === null) {
        alerts.push({
          icon: <SyringeIcon className="w-6 h-6" />,
          textEn: "ADMINISTER EPINEPHRINE 1mg",
          textCn: "给予肾上腺素 1mg",
          urgent: true
        });
      } else if (timeSinceEpi >= 180) { // 3 minutes
        alerts.push({
          icon: <SyringeIcon className="w-6 h-6" />,
          textEn: "GIVE EPINEPHRINE NOW (q3-5m)",
          textCn: "立即给予肾上腺素 (每3-5分钟)",
          urgent: true
        });
      }
    }

    return alerts;
  }, [state]);

  if (!state.isActive && state.elapsedTime === 0) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r shadow-sm">
        <h3 className="text-blue-800 font-bold flex items-center gap-2">
          <AlertTriangleIcon size={20} />
          <span>Ready / 准备就绪</span>
        </h3>
        <p className="text-blue-700 text-sm mt-1">Select rhythm and start timer to begin algorithm.<br/>选择心律并启动计时器以开始流程。</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((alert, idx) => (
        <div 
          key={idx} 
          className={`
            p-4 rounded-lg shadow-sm border-l-8 flex items-start gap-3 transition-all
            ${alert.urgent ? 'bg-red-100 border-red-600 animate-pulse-fast' : 'bg-amber-50 border-amber-500'}
          `}
        >
          <div className={`p-2 rounded-full shrink-0 ${alert.urgent ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
            {alert.icon}
          </div>
          <div>
            <div className={`font-black text-lg ${alert.urgent ? 'text-red-900' : 'text-gray-900'}`}>{alert.textEn}</div>
            <div className={`font-medium ${alert.urgent ? 'text-red-800' : 'text-gray-700'}`}>{alert.textCn}</div>
          </div>
        </div>
      ))}
      
      {suggestions.length === 0 && state.isActive && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-sm">
          <div className="font-bold text-green-900">CONTINUE HIGH-QUALITY CPR</div>
          <div className="text-green-700">持续高质量心肺复苏</div>
          <ul className="list-disc list-inside text-xs text-green-800 mt-2 space-y-1">
            <li>Push hard & fast (100-120/min)</li>
            <li>Allow recoil / Minimize interruptions</li>
          </ul>
        </div>
      )}
    </div>
  );
};