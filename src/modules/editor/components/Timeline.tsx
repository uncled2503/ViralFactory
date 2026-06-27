/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { useUIStore } from '../../../store/uiStore';
import { useProjectStore } from '../../../store/projectStore';
import { useEditorStore } from '../../../store/editorStore';
import { 
  Play, 
  Pause, 
  Clock, 
  RotateCcw,
  Type,
  Square,
  Circle,
  Video,
  Image as ImageIcon,
  Sliders,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Copy,
  Music,
  FileText,
  ChevronRight,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';

type TrackType = 'video' | 'text' | 'overlay' | 'logo' | 'audio' | 'subtitle';

const TRACKS_CONFIG = [
  { id: 'video' as TrackType, name: 'Vídeo (V1)', icon: Video, color: 'bg-indigo-600/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/15' },
  { id: 'text' as TrackType, name: 'Texto (T1)', icon: Type, color: 'bg-violet-600/10 border-violet-500/30 text-violet-300 hover:bg-violet-600/15' },
  { id: 'overlay' as TrackType, name: 'Overlay (O1)', icon: LayersIcon, color: 'bg-amber-600/10 border-amber-500/30 text-amber-300 hover:bg-amber-600/15' },
  { id: 'logo' as TrackType, name: 'Logo (L1)', icon: Sparkles, color: 'bg-pink-600/10 border-pink-500/30 text-pink-300 hover:bg-pink-600/15' },
  { id: 'audio' as TrackType, name: 'Áudio (A1)', icon: Music, color: 'bg-emerald-600/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/15' },
  { id: 'subtitle' as TrackType, name: 'Legenda (S1)', icon: FileText, color: 'bg-yellow-600/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-600/15' },
];

function LayersIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

export default function Timeline() {
  const { 
    isPlaying, 
    setIsPlaying, 
    currentTime, 
    setCurrentTime, 
    timelineHeight,
    hiddenTracks,
    toggleTrackHidden,
    lockedTracks,
    toggleTrackLocked,
    showNotification
  } = useUIStore();

  const activeProject = useProjectStore((s) => s.getCurrentProject());
  const { 
    selectedElementId, 
    setSelectedElementId, 
    updateElement, 
    deleteElement, 
    duplicateElement,
    addElement 
  } = useEditorStore();

  // Timeline States
  const [timelineZoom, setTimelineZoom] = useState<number>(1.5);
  const [timeFormat, setTimeFormat] = useState<'smpte' | 'seconds' | 'frames'>('smpte');
  const [dragState, setDragState] = useState<{
    elementId: string;
    type: 'move' | 'trim-left' | 'trim-right';
    initialStartTime: number;
    initialEndTime: number;
    initialMouseX: number;
  } | null>(null);

  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  const duration = activeProject?.duration || 10;
  const elements = activeProject?.elements || [];
  const fps = activeProject?.fps || 30;

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const pixelsPerSecond = 80 * timelineZoom;
  const timelineContentWidth = duration * pixelsPerSecond;

  // Playhead update ticking loop
  useEffect(() => {
    const tick = (now: number) => {
      if (!isPlaying) return;

      if (!lastTimeRef.current) {
        lastTimeRef.current = now;
      }

      const elapsedSeconds = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const nextTime = currentTime + elapsedSeconds;
      if (nextTime >= duration) {
        setCurrentTime(0); // Loop back
      } else {
        setCurrentTime(nextTime);
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(tick);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, setCurrentTime]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleFpsChange = (newFps: number) => {
    if (activeProject) {
      useProjectStore.getState().updateCurrentProject({ fps: newFps });
      showNotification(`FPS alterado para ${newFps} frames por segundo!`, 'info');
    }
  };

  // Helper to resolve track for an element
  const getTrackForElement = (el: any): TrackType => {
    if (el.type === 'subtitle') return 'subtitle';
    if (el.type === 'audio') return 'audio';
    if (el.type === 'text') return 'text';
    if (el.type === 'video_placeholder') return 'video';
    if (el.type === 'image') return 'logo';
    if (el.layer === 'video' || el.layer === 'background') return 'video';
    if (el.layer === 'text') return 'text';
    if (el.layer === 'logo') return 'logo';
    if (el.layer === 'effects' || el.layer === 'overlay') return 'overlay';
    if (el.type === 'rect' || el.type === 'circle' || el.type === 'progress_bar') return 'overlay';
    return 'overlay';
  };

  // Format Time codes beautifully
  const formatTimecodeValue = (time: number) => {
    if (timeFormat === 'seconds') {
      return `${time.toFixed(2)}s`;
    }
    
    const totalFrames = Math.floor(time * fps);
    if (timeFormat === 'frames') {
      return `${totalFrames} f`;
    }

    // SMPTE Code: hh:mm:ss:ff
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    const f = Math.floor((time - Math.floor(time)) * fps);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
  };

  // Handling dragging for element block or trim handles
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>, 
    elementId: string, 
    type: 'move' | 'trim-left' | 'trim-right',
    initialStartTime: number,
    initialEndTime: number
  ) => {
    e.stopPropagation();
    setSelectedElementId(elementId);
    e.currentTarget.setPointerCapture(e.pointerId);

    setDragState({
      elementId,
      type,
      initialStartTime,
      initialEndTime,
      initialMouseX: e.clientX,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState) return;
    e.stopPropagation();

    const deltaX = e.clientX - dragState.initialMouseX;
    const deltaTime = deltaX / pixelsPerSecond;

    const element = elements.find(el => el.id === dragState.elementId);
    if (!element) return;

    const track = getTrackForElement(element);
    if (lockedTracks.includes(track) || element.isLocked) {
      return; // Locked track or element
    }

    if (dragState.type === 'move') {
      const elementDuration = dragState.initialEndTime - dragState.initialStartTime;
      let newStart = dragState.initialStartTime + deltaTime;
      newStart = Math.max(0, Math.min(newStart, duration - elementDuration));
      
      // Magnetic Snapping helper (0.12s threshold)
      const snapThreshold = 0.12;
      if (Math.abs(newStart) < snapThreshold) {
        newStart = 0;
      } else if (Math.abs(newStart - currentTime) < snapThreshold) {
        newStart = currentTime;
      } else if (Math.abs((newStart + elementDuration) - currentTime) < snapThreshold) {
        newStart = currentTime - elementDuration;
      } else if (Math.abs((newStart + elementDuration) - duration) < snapThreshold) {
        newStart = duration - elementDuration;
      }

      const newEnd = newStart + elementDuration;
      updateElement(dragState.elementId, {
        startTime: Math.round(newStart * 100) / 100,
        endTime: Math.round(newEnd * 100) / 100,
      });
    } else if (dragState.type === 'trim-left') {
      let newStart = dragState.initialStartTime + deltaTime;
      newStart = Math.max(0, Math.min(newStart, dragState.initialEndTime - 0.2));

      // Snap trim-left to playhead
      if (Math.abs(newStart - currentTime) < 0.12) {
        newStart = currentTime;
      } else if (Math.abs(newStart) < 0.12) {
        newStart = 0;
      }

      updateElement(dragState.elementId, {
        startTime: Math.round(newStart * 100) / 100,
      });
    } else if (dragState.type === 'trim-right') {
      let newEnd = dragState.initialEndTime + deltaTime;
      newEnd = Math.max(dragState.initialStartTime + 0.2, Math.min(newEnd, duration));

      // Snap trim-right to playhead
      if (Math.abs(newEnd - currentTime) < 0.12) {
        newEnd = currentTime;
      } else if (Math.abs(newEnd - duration) < 0.12) {
        newEnd = duration;
      }

      updateElement(dragState.elementId, {
        endTime: Math.round(newEnd * 100) / 100,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDragState(null);
      showNotification('Elemento ajustado com sucesso!', 'success');
    }
  };

  // Scrubbing the time ruler
  const handleRulerScrubStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    handleRulerScrub(e);
  };

  const handleRulerScrub = (e: any) => {
    if (!scrollContainerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const time = clickX / pixelsPerSecond;
    setCurrentTime(Math.max(0, Math.min(time, duration)));
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
      }
    };
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isScrubbing && scrollContainerRef.current) {
        const rulerEl = document.getElementById('timeline-interactive-ruler');
        if (rulerEl) {
          const rect = rulerEl.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const time = clickX / pixelsPerSecond;
          setCurrentTime(Math.max(0, Math.min(time, duration)));
        }
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isScrubbing, pixelsPerSecond, duration, setCurrentTime]);

  // Insert Mock element for testing tracks instantly
  const handleQuickAdd = (type: TrackType) => {
    if (!activeProject) return;
    
    const colors = {
      video: '#6366f1',
      text: '#a855f7',
      overlay: '#f59e0b',
      logo: '#ec4899',
      audio: '#10b981',
      subtitle: '#fbbf24',
    };

    const labels = {
      video: '📹 Gameplay HD',
      text: '📝 Título Premiere',
      overlay: '🎨 Retângulo Filtro',
      logo: '⭐ Logomarca',
      audio: '🎵 Trilha Trance',
      subtitle: '💬 Legenda Dinâmica',
    };

    const elementTypes: Record<TrackType, any> = {
      video: 'video_placeholder',
      text: 'text',
      overlay: 'rect',
      logo: 'image',
      audio: 'audio',
      subtitle: 'subtitle',
    };

    const startTime = Math.min(2, duration - 4);
    const endTime = startTime + 4;

    addElement(elementTypes[type], {
      name: labels[type],
      fill: colors[type],
      startTime,
      endTime,
      text: type === 'text' || type === 'subtitle' ? labels[type] : undefined,
    });

    showNotification(`${labels[type]} adicionado na trilha!`, 'success');
  };

  return (
    <div 
      className="bg-zinc-950 border-t border-zinc-800 flex flex-col overflow-hidden select-none"
      style={{ height: timelineHeight }}
      id="editor-timeline"
    >
      {/* 1. Playback & Track Controls Header Toolbar */}
      <div className="h-12 border-b border-zinc-900 bg-zinc-950 px-4 flex items-center justify-between shrink-0 select-none z-10">
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            id="timeline-btn-play"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer shadow ${
              isPlaying 
                ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
            title={isPlaying ? 'Pausar' : 'Iniciar Playback'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>
          
          <button
            onClick={() => {
              setCurrentTime(0);
              setIsPlaying(false);
            }}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition"
            title="Voltar ao início"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Timecode digital readouts */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg font-mono text-xs shadow-inner">
            <span className="text-emerald-400 font-bold tracking-widest text-[13px]">{formatTimecodeValue(currentTime)}</span>
            <span className="text-zinc-600 font-bold">/</span>
            <span className="text-zinc-400">{formatTimecodeValue(duration)}</span>
          </div>

          {/* Time Format Toggle buttons */}
          <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-850 text-[10px] font-bold text-zinc-500">
            {(['smpte', 'seconds', 'frames'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setTimeFormat(fmt)}
                className={`px-2 py-1 rounded transition uppercase ${
                  timeFormat === fmt 
                    ? 'bg-zinc-850 text-indigo-400 shadow-xs' 
                    : 'hover:text-zinc-300'
                }`}
              >
                {fmt === 'smpte' ? 'SMPTE' : fmt === 'seconds' ? 'S' : 'F'}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Add Elements Track testing bar */}
        <div className="hidden lg:flex items-center gap-1.5 bg-zinc-900/50 border border-zinc-900 p-1 rounded-xl">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider px-2">Inserir:</span>
          {TRACKS_CONFIG.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => handleQuickAdd(t.id)}
                className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 font-semibold rounded-lg flex items-center gap-1 transition active:scale-95 cursor-pointer hover:border-zinc-700"
                title={`Adicionar ${t.name} na linha do tempo`}
              >
                <Plus className="w-3 h-3 text-indigo-400" />
                <span>{t.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* FPS selector & Zoom sliders */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          {/* FPS select */}
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-[10px] text-zinc-500">FPS:</span>
            <select
              value={fps}
              onChange={(e) => handleFpsChange(parseInt(e.target.value))}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer font-bold text-[11px]"
            >
              <option value="24">24 fps</option>
              <option value="30">30 fps</option>
              <option value="60">60 fps</option>
            </select>
          </div>

          {/* Zoom Level */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimelineZoom(Math.max(0.5, timelineZoom - 0.25))}
              className="p-1 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-zinc-500 hover:text-white rounded transition"
              title="Diminuir Zoom"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-850">
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.25"
                value={timelineZoom}
                onChange={(e) => setTimelineZoom(parseFloat(e.target.value))}
                className="w-16 h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="w-8 text-right font-bold text-zinc-400">{Math.round(timelineZoom * 100)}%</span>
            </div>
            <button
              onClick={() => setTimelineZoom(Math.min(5.0, timelineZoom + 0.25))}
              className="p-1 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-zinc-500 hover:text-white rounded transition"
              title="Aumentar Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Synced Scroll Container: Left header tracks rails & Right horizontal scale timeline content */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto bg-zinc-950 scrollbar-thin scrollbar-thumb-zinc-800 relative select-none"
      >
        <div 
          className="flex flex-col select-none relative"
          style={{ width: `calc(240px + ${timelineContentWidth}px)` }}
        >
          {/* --- A. TIMELINE TIME RULER ROW --- */}
          <div className="h-8 flex border-b border-zinc-900 select-none sticky top-0 bg-zinc-950 z-30">
            {/* Corner Left Sticky block */}
            <div className="w-60 h-8 border-r border-zinc-900 bg-zinc-950 px-4 flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider sticky left-0 z-20 shrink-0">
              <span>Trilhas (Channels)</span>
              <Clock className="w-3.5 h-3.5 text-zinc-600" />
            </div>

            {/* Scale Ruler */}
            <div 
              id="timeline-interactive-ruler"
              className="flex-1 h-8 bg-zinc-950 relative cursor-col-resize select-none overflow-hidden"
              onMouseDown={handleRulerScrubStart}
              title="Clique ou arraste para navegar no tempo (scrub)"
            >
              {/* Vertical Tick markers */}
              {Array.from({ length: duration + 1 }).map((_, i) => {
                const leftPos = i * pixelsPerSecond;
                return (
                  <div 
                    key={i} 
                    className="absolute bottom-0 flex flex-col items-center -translate-x-1/2 select-none"
                    style={{ left: `${leftPos}px` }}
                  >
                    <span className="text-[9px] text-zinc-600 font-mono font-bold mb-1 select-none">{i}s</span>
                    <div className="h-2 w-[1.5px] bg-zinc-800" />
                  </div>
                );
              })}

              {/* Sub-second minor ticks */}
              {timelineZoom >= 1.5 && Array.from({ length: duration * 2 }).map((_, i) => {
                if (i % 2 === 0) return null; // skip seconds
                const leftPos = (i * 0.5) * pixelsPerSecond;
                return (
                  <div 
                    key={`sub-${i}`} 
                    className="absolute bottom-0 h-1 w-[1px] bg-zinc-900 -translate-x-1/2"
                    style={{ left: `${leftPos}px` }}
                  />
                );
              })}
            </div>
          </div>

          {/* --- B. TRACKS LANES --- */}
          <div className="relative divide-y divide-zinc-900/40">
            {TRACKS_CONFIG.map((track) => {
              const IconComponent = track.icon;
              const isHidden = hiddenTracks.includes(track.id);
              const isLocked = lockedTracks.includes(track.id);

              // Filter elements belonging to this track lane
              const laneElements = elements.filter((el) => getTrackForElement(el) === track.id);

              return (
                <div key={track.id} className="h-12 flex relative group select-none hover:bg-zinc-900/10">
                  
                  {/* LEFT STICKY TRACK HEADER */}
                  <div className="w-60 h-12 border-r border-zinc-900 bg-zinc-950 px-4 flex items-center justify-between sticky left-0 z-20 shrink-0 shadow-md">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <div className={`p-1.5 rounded-lg bg-zinc-900 border border-zinc-850`}>
                        <IconComponent className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                      <span className="text-xs font-bold truncate max-w-[120px]">{track.name}</span>
                    </div>

                    {/* Lock and Hide/Mute Actions */}
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                      {/* Hide button */}
                      <button
                        onClick={() => toggleTrackHidden(track.id)}
                        className={`p-1 rounded hover:bg-zinc-900 transition cursor-pointer ${
                          isHidden 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 opacity-100' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                        title={isHidden ? 'Ativar trilha' : 'Ocultar/Mudar trilha'}
                      >
                        {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      {/* Lock button */}
                      <button
                        onClick={() => toggleTrackLocked(track.id)}
                        className={`p-1 rounded hover:bg-zinc-900 transition cursor-pointer ${
                          isLocked 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 opacity-100' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                        title={isLocked ? 'Desbloquear trilha' : 'Bloquear trilha'}
                      >
                        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* RIGHT LANES TIMELINE SLIDER BG */}
                  <div className="flex-1 h-12 relative bg-zinc-950/20 overflow-hidden">
                    {/* Vertical grid line indicators */}
                    {Array.from({ length: duration + 1 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="absolute top-0 bottom-0 w-[1px] bg-zinc-900/30 pointer-events-none"
                        style={{ left: `${i * pixelsPerSecond}px` }}
                      />
                    ))}

                    {/* Elements absolute timeline blocks */}
                    {laneElements.map((el) => {
                      const isSelected = selectedElementId === el.id;
                      const isElLocked = el.isLocked || isLocked;
                      const isElHidden = el.isHidden || isHidden;

                      // Compute positions
                      const leftPos = el.startTime * pixelsPerSecond;
                      const barWidth = (el.endTime - el.startTime) * pixelsPerSecond;

                      return (
                        <div
                          key={el.id}
                          style={{
                            left: `${leftPos}px`,
                            width: `${barWidth}px`,
                          }}
                          className={`absolute top-2 h-8 rounded-lg border flex items-center justify-between select-none shadow-lg transition-shadow duration-150 ${track.color} ${
                            isSelected 
                              ? 'ring-2 ring-indigo-500/60 border-indigo-400 font-bold z-10 scale-[1.01]' 
                              : ''
                          } ${isElHidden ? 'opacity-30' : ''}`}
                        >
                          {/* Left Trim Handle */}
                          {!isElLocked && (
                            <div 
                              className="absolute top-0 left-0 bottom-0 w-2.5 bg-zinc-100/10 hover:bg-zinc-100/30 border-r border-zinc-100/10 cursor-col-resize rounded-l-lg transition-colors flex items-center justify-center text-[8px] select-none font-bold text-zinc-500"
                              onPointerDown={(e) => handlePointerDown(e, el.id, 'trim-left', el.startTime, el.endTime)}
                              onPointerMove={handlePointerMove}
                              onPointerUp={handlePointerUp}
                              title="Arrastar para diminuir/aumentar início"
                            >
                              |
                            </div>
                          )}

                          {/* Center Draggable / Selection Area */}
                          <div 
                            className={`flex-1 h-full flex items-center justify-between px-3 truncate ${
                              isElLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                            }`}
                            onPointerDown={!isElLocked ? (e) => handlePointerDown(e, el.id, 'move', el.startTime, el.endTime) : () => setSelectedElementId(el.id)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedElementId(el.id);
                            }}
                          >
                            <div className="flex items-center gap-1.5 truncate pr-2 select-none">
                              {isElLocked && <Lock className="w-2.5 h-2.5 text-zinc-500 shrink-0" />}
                              {isElHidden && <EyeOff className="w-2.5 h-2.5 text-zinc-500 shrink-0" />}
                              <span className="text-[11px] font-bold truncate select-none">{el.name}</span>
                            </div>
                            
                            <span className="text-[9px] font-mono text-zinc-500 font-medium select-none shrink-0 bg-zinc-950/45 px-1.5 py-0.5 rounded">
                              {(el.endTime - el.startTime).toFixed(1)}s
                            </span>
                          </div>

                          {/* Right Quick Action contextual Menu pop buttons (only when selected!) */}
                          {isSelected && (
                            <div className="absolute -top-7 right-0 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl px-1.5 py-0.5 flex items-center gap-1.5 z-40 select-none animate-fadeIn">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateElement(el.id, { isHidden: !el.isHidden });
                                  showNotification(el.isHidden ? 'Elemento exibido' : 'Elemento ocultado', 'info');
                                }}
                                className="p-1 hover:bg-zinc-850 rounded text-zinc-400 hover:text-white"
                                title={el.isHidden ? 'Exibir no Canvas' : 'Ocultar no Canvas'}
                              >
                                {el.isHidden ? <Eye className="w-2.5 h-2.5 text-rose-400" /> : <EyeOff className="w-2.5 h-2.5" />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateElement(el.id, { isLocked: !el.isLocked });
                                  showNotification(el.isLocked ? 'Elemento desbloqueado' : 'Elemento bloqueado', 'info');
                                }}
                                className="p-1 hover:bg-zinc-850 rounded text-zinc-400 hover:text-white"
                                title={el.isLocked ? 'Desbloquear Objeto' : 'Bloquear Objeto'}
                              >
                                {el.isLocked ? <Unlock className="w-2.5 h-2.5 text-amber-400" /> : <Lock className="w-2.5 h-2.5" />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateElement(el.id);
                                  showNotification('Elemento duplicado na trilha!', 'success');
                                }}
                                className="p-1 hover:bg-zinc-850 rounded text-zinc-400 hover:text-white"
                                title="Duplicar Elemento"
                              >
                                <Copy className="w-2.5 h-2.5 text-indigo-400" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteElement(el.id);
                                  showNotification('Elemento removido da trilha!', 'info');
                                }}
                                className="p-1 hover:bg-zinc-850 rounded text-zinc-400 hover:text-rose-400"
                                title="Deletar Elemento"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}

                          {/* Right Trim Handle */}
                          {!isElLocked && (
                            <div 
                              className="absolute top-0 right-0 bottom-0 w-2.5 bg-zinc-100/10 hover:bg-zinc-100/30 border-l border-zinc-100/10 cursor-col-resize rounded-r-lg transition-colors flex items-center justify-center text-[8px] select-none font-bold text-zinc-500"
                              onPointerDown={(e) => handlePointerDown(e, el.id, 'trim-right', el.startTime, el.endTime)}
                              onPointerMove={handlePointerMove}
                              onPointerUp={handlePointerUp}
                              title="Arrastar para diminuir/aumentar fim"
                            >
                              |
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* --- C. ACTIVE PLAYHEAD LINE (spanning vertical channels) --- */}
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-rose-500 z-10 pointer-events-none select-none"
              style={{ left: `calc(240px + ${currentTime * pixelsPerSecond}px)` }}
            >
              {/* Playhead pointer handle head */}
              <div className="absolute -top-3.5 -left-[5px] w-3 h-3 bg-rose-500 rotate-45 rounded-sm shadow-md" />
              <div className="absolute top-0 bottom-0 w-[1px] bg-rose-500/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
