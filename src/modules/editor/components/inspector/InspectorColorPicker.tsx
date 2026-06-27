/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface InspectorColorPickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const PALETTE = [
  '#ffffff', '#000000', '#f43f5e', '#3b82f6', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#6b7280'
];

export default function InspectorColorPicker({
  id,
  label,
  value,
  onChange,
}: InspectorColorPickerProps) {
  return (
    <div className="space-y-2" id={`inspector-color-${id}`}>
      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">{label}</span>
      <div className="flex gap-2">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-800 shrink-0 bg-zinc-900 flex items-center justify-center">
          <input
            id={`${id}-picker`}
            type="color"
            value={value.startsWith('#') && value.length === 7 ? value : '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full scale-150 cursor-pointer"
          />
        </div>
        <input
          id={`${id}-hex`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500 h-8 uppercase"
        />
      </div>
      
      {/* Quick Color Chips */}
      <div className="grid grid-cols-6 gap-1">
        {PALETTE.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className="w-full h-4 rounded transition border border-zinc-950 hover:border-zinc-500 cursor-pointer"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
