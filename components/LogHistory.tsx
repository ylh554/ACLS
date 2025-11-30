import React from 'react';
import { HistoryIcon, DownloadIcon } from './Icons';
import { LogEntry } from '../types';

interface LogHistoryProps {
  logs: LogEntry[];
  onDownload: () => void;
}

const formatTimeSeconds = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const formatAbsoluteTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('en-GB', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit' 
  });
};

export const LogHistory: React.FC<LogHistoryProps> = ({ logs, onDownload }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden h-full">
      <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-gray-700 font-bold flex items-center gap-2">
          <HistoryIcon size={18} />
          <span>Log / 记录</span>
        </h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-200 active:bg-blue-200 touch-manipulation"
            title="Download Report"
          >
            <DownloadIcon size={14} />
            <span>SAVE</span>
          </button>
          <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600 font-mono">{logs.length}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-0">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2 min-h-[150px]">
            <HistoryIcon size={40} />
            <div className="text-sm italic text-center">No events recorded.<br/>暂无记录</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log.id} className={`flex gap-3 text-sm p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 ${log.action.includes('Deceased') ? 'bg-slate-900 text-white hover:bg-slate-800' : ''}`}>
                <div className={`flex flex-col items-end min-w-[70px] border-r pr-3 border-gray-100 ${log.action.includes('Deceased') ? 'border-gray-700' : ''}`}>
                  <div className={`font-mono font-bold ${log.action.includes('Deceased') ? 'text-white' : 'text-gray-900'}`}>
                    {formatTimeSeconds(log.timeOffset)}
                  </div>
                  <div className={`font-mono text-[10px] ${log.action.includes('Deceased') ? 'text-gray-400' : 'text-gray-400'}`}>
                    {formatAbsoluteTime(log.timestamp)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className={`font-bold ${log.action.includes('Deceased') ? 'text-white' : 'text-gray-800'}`}>{log.action}</div>
                  <div className={`text-xs ${log.action.includes('Deceased') ? 'text-gray-400' : 'text-gray-500'}`}>{log.actionCn}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};