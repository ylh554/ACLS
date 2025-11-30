export enum RhythmType {
  VF = 'VF',
  PVT = 'pVT',
  ASYSTOLE = 'Asystole',
  PEA = 'PEA',
  ROSC = 'ROSC'
}

export interface ResusState {
  isActive: boolean;
  startTime: number | null;
  elapsedTime: number;
  cycleTime: number;
  lastEpiTime: number | null;
  lastAmioTime: number | null;
  shockCount: number;
  currentRhythm: RhythmType | null;
}

export type LogType = 'info' | 'procedure' | 'drug' | 'shock' | 'rhythm';

export interface LogEntry {
  id: string;
  timestamp: number;
  timeOffset: number;
  action: string;
  actionCn: string;
  type: LogType;
}

export interface HsAndTsItem {
  en: string;
  cn: string;
}