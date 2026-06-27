/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ElementType = 
  | 'text' 
  | 'rect' 
  | 'circle' 
  | 'image' 
  | 'video_placeholder' 
  | 'subtitle' 
  | 'progress_bar'
  | 'audio';

export type CanvasLayer = 'background' | 'video' | 'overlay' | 'text' | 'logo' | 'effects';

export interface VideoElement {
  id: string;
  type: ElementType;
  layer?: CanvasLayer;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  opacity: number; // 0 to 1
  fill: string; // color hex or rgba
  stroke?: string;
  strokeWidth?: number;
  
  // Text specific properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: 'normal' | 'bold' | 'italic';
  align?: 'left' | 'center' | 'right';
  
  // Image specific properties
  imageUrl?: string;
  
  // Video-specific variables
  startTime: number; // in seconds
  endTime: number; // in seconds
  
  // Locking & Variables
  isLocked?: boolean;
  isHidden?: boolean;
  dynamicVariable?: string; // name of CSV column to replace (e.g. "product_name")

  // Figma inspector properties
  fontWeight?: string;
  letterSpacing?: number;
  lineHeight?: number;
  padding?: number;
  cornerRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOpacity?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  blur?: number;
}

export interface Project {
  id: string;
  name: string;
  width: number; // e.g. 1080 (Reels/TikTok) or 1920 (YouTube)
  height: number; // e.g. 1920 (Reels/TikTok) or 1080 (YouTube)
  duration: number; // total duration in seconds
  fps: number;
  elements: VideoElement[];
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  category: 'sticker' | 'background' | 'audio_track' | 'user_upload' | 'video_clip';
}

export interface Template {
  id: string;
  name: string;
  category: 'TikTok' | 'Reels' | 'Shorts' | 'Stories' | 'Feed' | 'YouTube' | 'Personalizados';
  format: '9:16' | '16:9' | '1:1' | '4:5';
  thumbnailUrl: string;
  width: number;
  height: number;
  duration: number;
  fps?: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  favorito: boolean;
  elements: VideoElement[];
}

export interface BulkRow {
  [key: string]: string;
}

export type SidebarTab = 'templates' | 'elements' | 'text' | 'assets' | 'bulk' | 'settings';
