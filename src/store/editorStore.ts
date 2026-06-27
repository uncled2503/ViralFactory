/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { useProjectStore } from './projectStore';
import { VideoElement, ElementType, CanvasLayer } from '../types';

interface EditorState {
  selectedElementId: string | null;
  zoom: number;
  history: VideoElement[][];
  historyIndex: number;
  
  // Selection
  setSelectedElementId: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  
  // Elements Operations
  addElement: (type: ElementType, customProps?: Partial<VideoElement>) => void;
  updateElement: (id: string, updates: Partial<VideoElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  alignElement: (id: string, alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  
  // History
  initHistory: (elements: VideoElement[]) => void;
  saveHistoryState: (elements: VideoElement[]) => void;
  undo: () => void;
  redo: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  selectedElementId: null,
  zoom: 1.0,
  history: [],
  historyIndex: -1,

  setSelectedElementId: (selectedElementId) => set({ selectedElementId }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(zoom, 4.0)) }),

  initHistory: (elements) => {
    set({
      history: [JSON.parse(JSON.stringify(elements))],
      historyIndex: 0
    });
  },

  saveHistoryState: (elements) => {
    const { history, historyIndex } = get();
    const cleanElements = JSON.parse(JSON.stringify(elements));
    const nextHistory = history.slice(0, historyIndex + 1);
    
    set({
      history: [...nextHistory, cleanElements],
      historyIndex: nextHistory.length
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    
    const prevIndex = historyIndex - 1;
    const elements = JSON.parse(JSON.stringify(history[prevIndex]));
    
    // Update project store
    useProjectStore.getState().updateCurrentProject({ elements });
    set({ historyIndex: prevIndex, selectedElementId: null });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    
    const nextIndex = historyIndex + 1;
    const elements = JSON.parse(JSON.stringify(history[nextIndex]));
    
    // Update project store
    useProjectStore.getState().updateCurrentProject({ elements });
    set({ historyIndex: nextIndex, selectedElementId: null });
  },

  addElement: (type, customProps = {}) => {
    const project = useProjectStore.getState().getCurrentProject();
    if (!project) return;

    const canvasWidth = project.width;
    const canvasHeight = project.height;

    // Generate balanced, screen-centered sizes
    let width = 300;
    let height = 150;
    let x = (canvasWidth - width) / 2;
    let y = (canvasHeight - height) / 2;
    let fill = '#ffffff';
    let text = '';
    
    if (type === 'rect') {
      width = 250;
      height = 250;
      x = (canvasWidth - width) / 2;
      y = (canvasHeight - height) / 2;
      fill = '#3b82f6';
    } else if (type === 'circle') {
      width = 200;
      height = 200;
      x = (canvasWidth - width) / 2;
      y = (canvasHeight - height) / 2;
      fill = '#ef4444';
    } else if (type === 'text') {
      width = 500;
      height = 100;
      x = (canvasWidth - width) / 2;
      y = (canvasHeight - height) / 2;
      fill = '#ffffff';
      text = 'Novo Texto';
    } else if (type === 'subtitle') {
      width = 800;
      height = 120;
      x = (canvasWidth - width) / 2;
      y = canvasHeight - 250;
      fill = '#facc15'; // yellow text by default
      text = 'Legenda Dinâmica';
    } else if (type === 'progress_bar') {
      width = canvasWidth * 0.8;
      height = 16;
      x = (canvasWidth - width) / 2;
      y = canvasHeight - 120;
      fill = '#fbbf24';
    } else if (type === 'video_placeholder') {
      width = 600;
      height = 400;
      x = (canvasWidth - width) / 2;
      y = (canvasHeight - height) / 2;
      fill = '#10b981';
    } else if (type === 'image') {
      width = 300;
      height = 300;
      x = (canvasWidth - width) / 2;
      y = (canvasHeight - height) / 2;
      fill = '#ffffff';
    }

    let defaultLayer: CanvasLayer = 'overlay';
    if (type === 'text' || type === 'subtitle') {
      defaultLayer = 'text';
    } else if (type === 'video_placeholder') {
      defaultLayer = 'video';
    } else if (type === 'image') {
      defaultLayer = 'logo';
    } else if (type === 'progress_bar') {
      defaultLayer = 'effects';
    }

    const id = `el-${Date.now()}`;
    const newElement: VideoElement = {
      id,
      type,
      layer: customProps.layer || defaultLayer,
      name: `${type.toUpperCase()} #${project.elements.length + 1}`,
      x,
      y,
      width,
      height,
      rotation: 0,
      opacity: 1,
      fill,
      startTime: 0,
      endTime: project.duration,
      ...customProps,
    };

    if (type === 'text' || type === 'subtitle') {
      newElement.text = customProps.text || text;
      newElement.fontSize = customProps.fontSize || (type === 'subtitle' ? 36 : 48);
      newElement.fontFamily = customProps.fontFamily || 'Inter';
      newElement.fontStyle = customProps.fontStyle || 'bold';
      newElement.align = customProps.align || 'center';
    }

    const updatedElements = [...project.elements, newElement];
    useProjectStore.getState().updateCurrentProject({ elements: updatedElements });
    get().saveHistoryState(updatedElements);
    set({ selectedElementId: id });
  },

  updateElement: (id, updates) => {
    const project = useProjectStore.getState().getCurrentProject();
    if (!project) return;

    let hasChanged = false;
    const updatedElements = project.elements.map((el) => {
      if (el.id === id) {
        // Double check if actually changed to prevent history noise
        const keys = Object.keys(updates) as Array<keyof VideoElement>;
        const changed = keys.some((key) => el[key] !== updates[key]);
        if (changed) {
          hasChanged = true;
          return { ...el, ...updates };
        }
      }
      return el;
    });

    if (hasChanged) {
      useProjectStore.getState().updateCurrentProject({ elements: updatedElements });
      get().saveHistoryState(updatedElements);
    }
  },

  deleteElement: (id) => {
    const project = useProjectStore.getState().getCurrentProject();
    if (!project) return;

    const updatedElements = project.elements.filter((el) => el.id !== id);
    useProjectStore.getState().updateCurrentProject({ elements: updatedElements });
    get().saveHistoryState(updatedElements);
    
    const { selectedElementId } = get();
    if (selectedElementId === id) {
      set({ selectedElementId: null });
    }
  },

  duplicateElement: (id) => {
    const project = useProjectStore.getState().getCurrentProject();
    if (!project) return;

    const sourceEl = project.elements.find((el) => el.id === id);
    if (!sourceEl) return;

    const newId = `el-${Date.now()}`;
    const duplicated: VideoElement = {
      ...JSON.parse(JSON.stringify(sourceEl)),
      id: newId,
      name: `${sourceEl.name} (Cópia)`,
      x: sourceEl.x + 40, // offset position slightly
      y: sourceEl.y + 40,
    };

    const updatedElements = [...project.elements, duplicated];
    useProjectStore.getState().updateCurrentProject({ elements: updatedElements });
    get().saveHistoryState(updatedElements);
    set({ selectedElementId: newId });
  },

  alignElement: (id, alignment) => {
    const project = useProjectStore.getState().getCurrentProject();
    if (!project) return;

    const element = project.elements.find((el) => el.id === id);
    if (!element) return;

    const canvasWidth = project.width;
    const canvasHeight = project.height;

    let x = element.x;
    let y = element.y;

    switch (alignment) {
      case 'left':
        x = 0;
        break;
      case 'center':
        x = (canvasWidth - element.width) / 2;
        break;
      case 'right':
        x = canvasWidth - element.width;
        break;
      case 'top':
        y = 0;
        break;
      case 'middle':
        y = (canvasHeight - element.height) / 2;
        break;
      case 'bottom':
        y = canvasHeight - element.height;
        break;
    }

    get().updateElement(id, { x, y });
  },

  bringToFront: (id) => {
    const project = useProjectStore.getState().getCurrentProject();
    if (!project) return;

    const elements = [...project.elements];
    const index = elements.findIndex((el) => el.id === id);
    if (index === -1 || index === elements.length - 1) return;

    const [target] = elements.splice(index, 1);
    elements.push(target);

    useProjectStore.getState().updateCurrentProject({ elements });
    get().saveHistoryState(elements);
  },

  sendToBack: (id) => {
    const project = useProjectStore.getState().getCurrentProject();
    if (!project) return;

    const elements = [...project.elements];
    const index = elements.findIndex((el) => el.id === id);
    if (index === -1 || index === 0) return;

    const [target] = elements.splice(index, 1);
    elements.unshift(target);

    useProjectStore.getState().updateCurrentProject({ elements });
    get().saveHistoryState(elements);
  },
}));
