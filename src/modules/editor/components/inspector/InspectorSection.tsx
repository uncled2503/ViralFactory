/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface InspectorSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function InspectorSection({
  id,
  title,
  children,
  defaultOpen = true,
}: InspectorSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-900" id={`inspector-sec-${id}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40 transition select-none cursor-pointer"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3.5 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}
