/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Template, VideoElement, CanvasLayer } from '../types';

/**
 * Resolves the explicit or dynamic rendering layer for an element
 */
export function getElementLayer(el: VideoElement): CanvasLayer {
  if (el.layer) return el.layer;
  
  // Backward compatibility heuristics for older presets
  if (el.id === 'el-bg' || el.id === 'el-bg-square' || el.id === 'el-bg-yt' || el.id === 'el-stories-bg' || el.id === 'el-news-bg' || el.id === 'el-pers-bg') {
    return 'background';
  }
  if (el.type === 'video_placeholder') {
    return 'video';
  }
  if (el.type === 'progress_bar') {
    return 'effects';
  }
  if (el.type === 'text' || el.type === 'subtitle') {
    return 'text';
  }
  if (el.type === 'image' && (
    el.id.includes('logo') || 
    el.id.includes('watermark') || 
    el.name.toLowerCase().includes('logo') || 
    el.name.toLowerCase().includes('icon') ||
    el.imageUrl?.includes('cdn-icons')
  )) {
    return 'logo';
  }
  if (el.type === 'image') {
    return 'background';
  }
  
  return 'overlay';
}

/**
 * Standardized TemplateConfig object structure for server-side FFmpeg rendering
 */
export interface TemplateConfig {
  id: string;
  name: string;
  format: string;
  width: number;
  height: number;
  duration: number;
  fps: number;
  layers: {
    background: VideoElement[];
    video: VideoElement[];
    overlay: VideoElement[];
    text: VideoElement[];
    logo: VideoElement[];
    effects: VideoElement[];
  };
}

/**
 * Compiles the current active template and optional bulk-row values into a flat
 * layer-structured TemplateConfig ready for immediate media compilation.
 */
export function generateTemplateConfig(project: Template, bulkRow?: any): TemplateConfig {
  const configLayers = {
    background: [] as VideoElement[],
    video: [] as VideoElement[],
    overlay: [] as VideoElement[],
    text: [] as VideoElement[],
    logo: [] as VideoElement[],
    effects: [] as VideoElement[],
  };

  project.elements.forEach((el) => {
    // Interpolate values if dynamic variables exist
    let compiledText = el.text;
    if (el.dynamicVariable && bulkRow && bulkRow[el.dynamicVariable] !== undefined) {
      compiledText = bulkRow[el.dynamicVariable];
    }

    const compiledEl: VideoElement = {
      ...el,
      text: compiledText,
      // Ensure layer property is explicitly set in config
      layer: el.layer || getElementLayer(el),
    };

    const targetLayer = compiledEl.layer || 'overlay';
    if (configLayers[targetLayer]) {
      configLayers[targetLayer].push(compiledEl);
    } else {
      configLayers.overlay.push(compiledEl);
    }
  });

  return {
    id: project.id,
    name: project.name,
    format: project.format,
    width: project.width,
    height: project.height,
    duration: project.duration,
    fps: 30,
    layers: configLayers,
  };
}
