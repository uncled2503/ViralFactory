/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';

export interface VideoUpload {
  id: string;
  name: string;
  type: string;             // e.g. "video/mp4"
  extension: string;        // e.g. "mp4", "mov"
  url: string;              // local Blob URL or mock URL
  size: number;             // bytes
  sizeString: string;       // formatted size (e.g., "15.4 MB")
  resolution: string;       // "1920x1080", etc.
  duration: number;         // seconds
  fps: number;              // frame rate (e.g. 30, 60, 24)
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;         // 0 to 100
  thumbnailUrl: string;     // base64 thumbnail or placeholder
  createdAt: string;        // ISO string
}

interface UploadState {
  uploads: VideoUpload[];
  selectedUploadIds: string[];
  isDraggingGlobal: boolean;
  
  setDraggingGlobal: (dragging: boolean) => void;
  addUpload: (upload: VideoUpload) => void;
  updateUpload: (id: string, updates: Partial<VideoUpload>) => void;
  deleteUploads: (ids: string[]) => void;
  setSelectedUploadIds: (ids: string[]) => void;
  toggleSelectUpload: (id: string) => void;
  clearSelection: () => void;
  
  // Simulation for API/processing
  simulateUploadProcess: (id: string) => void;
}

// Preset initial items that represent already uploaded assets (to populate the Premiere-like dashboard)
const INITIAL_MOCK_UPLOADS: VideoUpload[] = [
  {
    id: 'mock-up-1',
    name: 'neon_city_street_timelapse.mp4',
    type: 'video/mp4',
    extension: 'mp4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-timelapse-of-street-traffic-at-night-34283-large.mp4',
    size: 42104520,
    sizeString: '40.2 MB',
    resolution: '1920x1080',
    duration: 18.5,
    fps: 30,
    status: 'completed',
    progress: 100,
    thumbnailUrl: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?q=80&w=300',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'mock-up-2',
    name: 'cyberpunk_hacker_matrix.mp4',
    type: 'video/mp4',
    extension: 'mp4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-matrix-style-green-computer-code-41865-large.mp4',
    size: 28310000,
    sizeString: '27.0 MB',
    resolution: '1080x1920',
    duration: 12.0,
    fps: 60,
    status: 'completed',
    progress: 100,
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=300',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'mock-up-3',
    name: 'lofi_room_cozy_vibes.mov',
    type: 'video/quicktime',
    extension: 'mov',
    url: '',
    size: 108920300,
    sizeString: '103.9 MB',
    resolution: '3840x2160',
    duration: 45.3,
    fps: 24,
    status: 'processing',
    progress: 45,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=300',
    createdAt: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
  },
  {
    id: 'mock-up-4',
    name: 'promotional_video_draft_02.mp4',
    type: 'video/mp4',
    extension: 'mp4',
    url: '',
    size: 15728640,
    sizeString: '15.0 MB',
    resolution: '1280x720',
    duration: 5.0,
    fps: 30,
    status: 'error',
    progress: 15,
    thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=300',
    createdAt: new Date(Date.now() - 120000).toISOString(), // 2 mins ago
  }
];

export const useUploadStore = create<UploadState>((set, get) => ({
  uploads: INITIAL_MOCK_UPLOADS,
  selectedUploadIds: [],
  isDraggingGlobal: false,

  setDraggingGlobal: (dragging) => set({ isDraggingGlobal: dragging }),

  addUpload: (upload) => set((state) => ({
    uploads: [upload, ...state.uploads]
  })),

  updateUpload: (id, updates) => set((state) => ({
    uploads: state.uploads.map((u) => u.id === id ? { ...u, ...updates } : u)
  })),

  deleteUploads: (ids) => set((state) => ({
    uploads: state.uploads.filter((u) => !ids.includes(u.id)),
    selectedUploadIds: state.selectedUploadIds.filter((id) => !ids.includes(id))
  })),

  setSelectedUploadIds: (ids) => set({ selectedUploadIds: ids }),

  toggleSelectUpload: (id) => set((state) => {
    const isSelected = state.selectedUploadIds.includes(id);
    const selectedUploadIds = isSelected
      ? state.selectedUploadIds.filter((selectedId) => selectedId !== id)
      : [...state.selectedUploadIds, id];
    return { selectedUploadIds };
  }),

  clearSelection: () => set({ selectedUploadIds: [] }),

  simulateUploadProcess: (id) => {
    const upload = get().uploads.find(u => u.id === id);
    if (!upload) return;

    // Simulate standard chunk uploading
    let currentProgress = upload.progress || 0;
    
    const interval = setInterval(() => {
      const state = get();
      const currentUpload = state.uploads.find(u => u.id === id);
      
      if (!currentUpload || currentUpload.status === 'error') {
        clearInterval(interval);
        return;
      }

      if (currentUpload.status === 'uploading') {
        currentProgress += Math.floor(Math.random() * 15) + 5;
        if (currentProgress >= 100) {
          currentProgress = 100;
          
          // Switch to processing stage
          state.updateUpload(id, {
            status: 'processing',
            progress: 0
          });
          
          currentProgress = 0;
        } else {
          state.updateUpload(id, {
            progress: currentProgress
          });
        }
      } else if (currentUpload.status === 'processing') {
        currentProgress += Math.floor(Math.random() * 20) + 10;
        if (currentProgress >= 100) {
          currentProgress = 100;
          
          state.updateUpload(id, {
            status: 'completed',
            progress: 100
          });
          
          clearInterval(interval);
        } else {
          state.updateUpload(id, {
            progress: currentProgress
          });
        }
      } else {
        // completed or already errored
        clearInterval(interval);
      }
    }, 1000);
  }
}));
