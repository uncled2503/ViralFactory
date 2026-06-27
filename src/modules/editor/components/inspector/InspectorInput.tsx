/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface InspectorInputProps {
  id: string;
  label: string;
  value: string | number;
  type?: 'text' | 'number';
  prefixText?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (val: any) => void;
}

export default function InspectorInput({
  id,
  label,
  value,
  type = 'number',
  prefixText,
  unit,
  min,
  max,
  step,
  disabled = false,
  onChange,
}: InspectorInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val: any = e.target.value;
    if (type === 'number') {
      val = val === '' ? '' : parseFloat(val);
      if (isNaN(val)) return;
      if (min !== undefined && val < min) val = min;
      if (max !== undefined && val > max) val = max;
    }
    onChange(val);
  };

  return (
    <div className="space-y-1" id={`inspector-input-container-${id}`}>
      <span className="text-[9px] text-zinc-500 uppercase tracking-wide block">{label}</span>
      <div className={`flex items-center bg-zinc-900 border border-zinc-800/80 rounded-lg px-2 h-8 focus-within:border-indigo-500 transition ${disabled ? 'opacity-50' : ''}`}>
        {prefixText && (
          <span className="text-[10px] font-mono text-zinc-600 font-bold mr-1.5 select-none">{prefixText}</span>
        )}
        <input
          id={id}
          type={type === 'number' ? 'text' : 'text'} // use text to allow custom formatting / clean typing
          value={value}
          disabled={disabled}
          onChange={handleInputChange}
          className="w-full bg-transparent text-xs text-zinc-200 focus:outline-none font-mono"
        />
        {unit && (
          <span className="text-[9px] font-mono text-zinc-500 select-none ml-1">{unit}</span>
        )}
      </div>
    </div>
  );
}
