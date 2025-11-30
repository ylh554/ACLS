import { LogEntry, ResusState } from "../types";

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

export const downloadReport = (logs: LogEntry[], state: ResusState) => {
  if (logs.length === 0) {
    alert("No logs to download.");
    return;
  }

  const startDate = state.startTime ? new Date(state.startTime).toLocaleString() : 'N/A';
  const duration = formatTimeSeconds(state.elapsedTime);
  
  const epiCount = logs.filter(l => l.action.includes('Epi')).length;
  const amioCount = logs.filter(l => l.action.includes('Amio')).length;
  const shockCount = logs.filter(l => l.type === 'shock').length;

  let content = `ACLS RESUSCITATION RECORD\n`;
  content += `=========================\n`;
  content += `Date/Time: ${startDate}\n`;
  content += `Duration:  ${duration}\n`;
  content += `-------------------------\n`;
  content += `SUMMARY:\n`;
  content += `  - Shocks Delivered: ${shockCount}\n`;
  content += `  - Epinephrine Doses: ${epiCount}\n`;
  content += `  - Amiodarone Doses: ${amioCount}\n`;
  content += `=========================\n\n`;
  content += `EVENT LOG:\n`;
  content += `Time (Offset) | Time (Abs) | Action\n`;
  content += `------------------------------------------------\n`;

  // Clone and sort chronologically for the report (Logs are stored reverse chronological in state)
  const chronologicalLogs = [...logs].reverse();

  chronologicalLogs.forEach(log => {
    const offset = formatTimeSeconds(log.timeOffset);
    const abs = formatAbsoluteTime(log.timestamp);
    content += `[${offset}]      [${abs}]   ${log.action} (${log.actionCn})\n`;
  });

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ACLS_Report_${new Date().toISOString().slice(0,10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};