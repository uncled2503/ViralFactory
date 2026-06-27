/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUIStore } from '../../../store/uiStore';
import { SidebarTab } from '../../../types';
import { 
  Layout, 
  Square, 
  Type, 
  Image, 
  Database, 
  Settings2 
} from 'lucide-react';

interface TabItem {
  id: SidebarTab;
  label: string;
  icon: React.ComponentType<any>;
}

const TAB_ITEMS: TabItem[] = [
  { id: 'templates', label: 'Modelos', icon: Layout },
  { id: 'elements', label: 'Elementos', icon: Square },
  { id: 'text', label: 'Texto', icon: Type },
  { id: 'assets', label: 'Arquivos', icon: Image },
  { id: 'bulk', label: 'Em Massa', icon: Database },
  { id: 'settings', label: 'Config', icon: Settings2 },
];

export default function Sidebar() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <div className="w-20 bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-4 justify-between h-full select-none" id="editor-sidebar-rail">
      {/* Brand / Logo */}
      <div className="flex flex-col items-center gap-1 mb-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-lg shadow-indigo-500/20">
          VF
        </div>
        <span className="text-[9px] text-zinc-500 font-medium tracking-wider">FACTORY</span>
      </div>

      {/* Tabs */}
      <div className="flex-1 w-full flex flex-col gap-2 px-2">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              id={`sidebar-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full py-3 px-1 rounded-xl flex flex-col items-center gap-1.5 transition-all group ${
                isActive 
                  ? 'bg-zinc-800 text-indigo-400 font-semibold' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                isActive ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-200'
              }`} />
              <span className="text-[10px] tracking-wide text-center truncate w-full">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* App Version Info */}
      <div className="text-[10px] text-zinc-600 font-mono">
        v1.0.0
      </div>
    </div>
  );
}
