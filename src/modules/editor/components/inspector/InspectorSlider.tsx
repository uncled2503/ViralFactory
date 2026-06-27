/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface InspectorSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  onChange: (val: number) => void;
}

export default function InspectorSlider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  disabled = false,
  onChange,
}: InspectorSliderProps) {
  return (
    <div className="space-y-1.5" id={`inspector-slider-container-${id}`}>
      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
        <span className="uppercase tracking-wider">{label}</span>
        <span className="font-bold text-zinc-300">{value}{unit}</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-40"
        />
      </div>
    </div>
  );
}
