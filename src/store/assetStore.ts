/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { Asset } from '../types';

interface AssetState {
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  deleteAsset: (id: string) => void;
  getAssetsByCategory: (category: Asset['category']) => Asset[];
}

const PRESET_ASSETS: Asset[] = [
  // Background Images
  {
    id: 'bg-1',
    name: 'Cosmic Gradient',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1000&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=150&auto=format&fit=crop',
    category: 'background'
  },
  {
    id: 'bg-2',
    name: 'Minimal Sand',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=150&auto=format&fit=crop',
    category: 'background'
  },
  {
    id: 'bg-3',
    name: 'Cyberpunk Neon',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1000&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=150&auto=format&fit=crop',
    category: 'background'
  },
  {
    id: 'bg-4',
    name: 'Abstract Paint Ripple',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=150&auto=format&fit=crop',
    category: 'background'
  },

  // Stickers / Shapes
  {
    id: 'st-fire',
    name: 'Fire Badge',
    type: 'image',
    url: 'https://cdn-icons-png.flaticon.com/512/785/785116.png',
    thumbnailUrl: 'https://cdn-icons-png.flaticon.com/512/785/785116.png',
    category: 'sticker'
  },
  {
    id: 'st-like',
    name: 'Thumbs Up Emoji',
    type: 'image',
    url: 'https://cdn-icons-png.flaticon.com/512/739/739231.png',
    thumbnailUrl: 'https://cdn-icons-png.flaticon.com/512/739/739231.png',
    category: 'sticker'
  },
  {
    id: 'st-subscribe',
    name: 'Subscribe Button',
    type: 'image',
    url: 'https://cdn-icons-png.flaticon.com/512/1051/1051303.png',
    thumbnailUrl: 'https://cdn-icons-png.flaticon.com/512/1051/1051303.png',
    category: 'sticker'
  },
  {
    id: 'st-bell',
    name: 'Notification Bell',
    type: 'image',
    url: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png',
    thumbnailUrl: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png',
    category: 'sticker'
  },

  // Audio Tracks
  {
    id: 'audio-1',
    name: 'Lo-Fi Chill Beats',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Simple placeholder MP3 URL
    duration: 372,
    category: 'audio_track'
  },
  {
    id: 'audio-2',
    name: 'Upbeat Tech Energy',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 423,
    category: 'audio_track'
  },

  // Mock Video clips (to layer behind or represent overlays)
  {
    id: 'vid-1',
    name: 'Matrix Digital Rain',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-matrix-style-green-computer-code-41865-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=150',
    duration: 15,
    category: 'video_clip'
  },
  {
    id: 'vid-2',
    name: 'City Traffic Timelapse',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-timelapse-of-street-traffic-at-night-34283-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?q=80&w=150',
    duration: 20,
    category: 'video_clip'
  }
];

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: PRESET_ASSETS,

  addAsset: (newAsset) => set((state) => {
    const id = `user-asset-${Date.now()}`;
    const asset: Asset = {
      ...newAsset,
      id,
    };
    return { assets: [asset, ...state.assets] };
  }),

  deleteAsset: (id) => set((state) => ({
    assets: state.assets.filter((a) => a.id !== id),
  })),

  getAssetsByCategory: (category) => {
    return get().assets.filter((a) => a.category === category);
  },
}));
