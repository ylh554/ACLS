import { HsAndTsItem, RhythmType } from './types';

export const HS_AND_TS_DATA: HsAndTsItem[] = [
  { en: 'Hypovolemia', cn: '低血容量' },
  { en: 'Hypoxia', cn: '缺氧' },
  { en: 'Hydrogen Ion (Acidosis)', cn: '酸中毒' },
  { en: 'Hypo/Hyperkalemia', cn: '低/高钾血症' },
  { en: 'Hypothermia', cn: '低体温' },
  { en: 'Tension Pneumothorax', cn: '张力性气胸' },
  { en: 'Tamponade, Cardiac', cn: '心包填塞' },
  { en: 'Toxins', cn: '中毒' },
  { en: 'Thrombosis, Pulmonary', cn: '肺栓塞' },
  { en: 'Thrombosis, Coronary', cn: '冠状动脉栓塞' },
];

export const RHYTHM_OPTIONS = [
  { type: RhythmType.VF, label: 'VF', sub: '室颤', color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
  { type: RhythmType.PVT, label: 'pVT', sub: '无脉室速', color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
  { type: RhythmType.PEA, label: 'PEA', sub: '无脉电', color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100' },
  { type: RhythmType.ASYSTOLE, label: 'Asystole', sub: '停搏', color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100' },
  { type: RhythmType.ROSC, label: 'ROSC', sub: 'ROSC', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
];