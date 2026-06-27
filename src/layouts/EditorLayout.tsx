/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUIStore } from '../store/uiStore';
import Sidebar from '../modules/editor/components/Sidebar';
import SidebarPanels from '../modules/editor/components/SidebarPanels';
import Toolbar from '../modules/editor/components/Toolbar';
import CanvasEditor from '../modules/editor/components/CanvasEditor';
import Timeline from '../modules/editor/components/Timeline';
import PropertyPanel from '../modules/editor/components/PropertyPanel';
import StatusBar from '../modules/editor/components/StatusBar';
import { Sparkles, X } from 'lucide-react';

export default function EditorLayout() {
  const { sidebarWidth, setSidebarWidth, notification, clearNotification } = useUIStore();

  const handleResizeSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      // 80px is the fixed width of the Sidebar icons rail
      const calculatedWidth = moveEvent.clientX - 80;
      setSidebarWidth(calculatedWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };

    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="h-screen w-screen bg-zinc-950 flex flex-col overflow-hidden font-sans text-zinc-300 relative select-none">
      
      {/* 1. Global Floating Toast Notification banner */}
      {notification && (
        <div 
          className={`absolute top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border transition-all transform animate-in fade-in slide-in-from-top-4 duration-300 ${
            notification.type === 'success' 
              ? 'bg-zinc-900 border-emerald-500/30 text-emerald-300 shadow-emerald-900/10' 
              : notification.type === 'error'
                ? 'bg-zinc-900 border-rose-500/30 text-rose-300 shadow-rose-900/10'
                : 'bg-zinc-900 border-indigo-500/30 text-indigo-300 shadow-indigo-900/10'
          }`}
          id="global-toast-notification"
        >
          <div className="w-2 h-2 rounded-full animate-ping bg-current" />
          <span className="text-xs font-semibold leading-none">{notification.message}</span>
          <button 
            onClick={clearNotification}
            className="text-zinc-500 hover:text-zinc-200 ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Top Header action bar */}
      <Toolbar />

      {/* 3. Main Split Body workspace */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Leftmost fixed icons rail */}
        <Sidebar />

        {/* Dynamic Panels Drawer */}
        <SidebarPanels />

        {/* Resizable Divider bar handle */}
        <div 
          onMouseDown={handleResizeSidebar}
          className="w-1.5 hover:w-2 bg-zinc-900 hover:bg-indigo-500 active:bg-indigo-600 cursor-col-resize transition-all shrink-0 z-30 flex items-center justify-center relative"
          title="Arraste para redimensionar"
          id="sidebar-resize-handle"
        >
          {/* Subtle grab indicator */}
          <div className="absolute w-[2px] h-6 bg-zinc-700 hover:bg-white rounded" />
        </div>

        {/* Central Stage and Bottom Timeline wrapper */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Stage Viewport */}
          <CanvasEditor />

          {/* Timing Channel Editor */}
          <Timeline />

        </div>

        {/* Floating properties settings drawer on the right */}
        <PropertyPanel />

      </div>

      {/* 4. Bottom Metrics details footer bar */}
      <StatusBar />

    </div>
  );
}
