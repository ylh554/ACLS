import React, { useState } from 'react';
import { CheckSquareIcon, SquareIcon } from './Icons';
import { HS_AND_TS_DATA } from '../constants';

export const HsAndTsChecklist: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setCheckedItems(newSet);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="font-bold text-gray-800 text-lg">Reversible Causes</h2>
        <div className="text-xs text-gray-500 font-medium">H's & T's / 可逆原因</div>
      </div>
      
      <div className="p-2 overflow-y-auto flex-1 space-y-2">
        {HS_AND_TS_DATA.map((item, idx) => (
          <button
            key={idx}
            onClick={() => toggleItem(idx)}
            className={`
              w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all touch-manipulation
              ${checkedItems.has(idx) 
                ? 'bg-blue-50 border-blue-400 shadow-sm' 
                : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50'
              }
            `}
          >
            {checkedItems.has(idx) 
              ? <CheckSquareIcon className="text-blue-600 shrink-0 mt-0.5" size={24} /> 
              : <SquareIcon className="text-gray-300 shrink-0 mt-0.5" size={24} />
            }
            <div>
              <div className={`font-bold text-sm leading-tight ${checkedItems.has(idx) ? 'text-blue-900' : 'text-gray-700'}`}>
                {item.en}
              </div>
              <div className={`text-xs mt-0.5 ${checkedItems.has(idx) ? 'text-blue-700' : 'text-gray-400'}`}>
                {item.cn}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};