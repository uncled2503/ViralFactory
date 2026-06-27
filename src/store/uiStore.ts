/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { SidebarTab } from '../types';

interface UIState {
  activeTab: SidebarTab;
  sidebarWidth: number;
  timelineHeight: number;
  isPlaying: boolean;
  currentTime: number;
  notification: {
    message: string;
    type: 'success' | 'error' | 'info';
  } | null;
  activeView: 'library' | 'editor' | 'uploads';
  hiddenTracks: string[];
  toggleTrackHidden: (track: string) => void;
  lockedTracks: string[];
  toggleTrackLocked: (track: string) => void;
  setActiveTab: (tab: SidebarTab) => void;
  setSidebarWidth: (width: number) => void;
  setTimelineHeight: (height: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
  setActiveView: (view: 'library' | 'editor' | 'uploads') => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'templates',
  sidebarWidth: 320,
  timelineHeight: 200,
  isPlaying: false,
  currentTime: 0,
  notification: null,
  activeView: 'library',
  hiddenTracks: [],
  toggleTrackHidden: (track) => set((state) => ({
    hiddenTracks: state.hiddenTracks.includes(track)
      ? state.hiddenTracks.filter((t) => t !== track)
      : [...state.hiddenTracks, track]
  })),
  lockedTracks: [],
  toggleTrackLocked: (track) => set((state) => ({
    lockedTracks: state.lockedTracks.includes(track)
      ? state.lockedTracks.filter((t) => t !== track)
      : [...state.lockedTracks, track]
  })),

  setActiveTab: (activeTab) => set({ activeTab }),
  setSidebarWidth: (sidebarWidth) => set({ sidebarWidth: Math.max(260, Math.min(sidebarWidth, 480)) }),
  setTimelineHeight: (timelineHeight) => set({ timelineHeight: Math.max(140, Math.min(timelineHeight, 350)) }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  showNotification: (message, type = 'success') => {
    set({ notification: { message, type } });
    setTimeout(() => {
      set((state) => (state.notification?.message === message ? { notification: null } : {}));
    }, 4000);
  },
  clearNotification: () => set({ notification: null }),
  setActiveView: (activeView) => set({ activeView }),
}));
