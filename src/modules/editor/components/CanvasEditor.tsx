/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Transformer, Line } from 'react-konva';
import { useProjectStore } from '../../../store/projectStore';
import { useEditorStore } from '../../../store/editorStore';
import { useUIStore } from '../../../store/uiStore';
import KonvaElement from './KonvaElement';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Grid, 
  Sliders,
  Sparkles,
  Clipboard,
  CornerUpLeft,
  CornerUpRight
} from 'lucide-react';

export default function CanvasEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const copiedElementRef = useRef<any>(null);

  const { 
    zoom, 
    selectedElementId, 
    setSelectedElementId, 
    updateElement, 
    addElement, 
    deleteElement, 
    duplicateElement,
    undo,
    redo
  } = useEditorStore();
  
  const { bulkRows, activeBulkRowIndex, getCurrentProject } = useProjectStore();
  const { currentTime, showNotification } = useUIStore();

  const [containerSize, setContainerSize] = useState({ width: 600, height: 600 });
  
  // Custom Guidelines state
  const [guides, setGuides] = useState<{ id: string; type: 'h' | 'v'; value: number }[]>([]);
  const [showGuides, setShowGuides] = useState(true);
  const [enableSnap, setEnableSnap] = useState(true);
  
  // Active snapping lines computed during dragging
  const [activeSnapLines, setActiveSnapLines] = useState<{ type: 'h' | 'v'; value: number }[]>([]);

  const activeProject = getCurrentProject();

  // ResizeObserver to track container bounds dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        // Compensate for ruler offset (24px padding on left/top)
        setContainerSize({ 
          width: Math.max(100, (width || 600)), 
          height: Math.max(100, (height || 600)) 
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update Transformer selection node
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    
    if (selectedElementId) {
      const selectedNode = stageRef.current.findOne(`#${selectedElementId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    } else {
      transformerRef.current.nodes([]);
    }
  }, [selectedElementId, activeProject?.elements]);

  // Keyboard Shortcuts Manager
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing inside inputs or textarea fields
      const active = document.activeElement;
      if (active) {
        const tag = active.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || active.getAttribute('contenteditable') === 'true') {
          return;
        }
      }

      const isCtrl = e.ctrlKey || e.metaKey;

      // Undo: Ctrl+Z
      if (isCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        showNotification('Ação desfeita!', 'info');
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((isCtrl && e.shiftKey && e.key.toLowerCase() === 'z') || (isCtrl && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
        showNotification('Ação refita!', 'info');
      }

      // Copy: Ctrl+C
      if (isCtrl && e.key.toLowerCase() === 'c') {
        if (selectedElementId && activeProject) {
          e.preventDefault();
          const targetEl = activeProject.elements.find(el => el.id === selectedElementId);
          if (targetEl) {
            copiedElementRef.current = targetEl;
            showNotification(`Elemento "${targetEl.name}" copiado!`, 'success');
          }
        }
      }

      // Paste: Ctrl+V
      if (isCtrl && e.key.toLowerCase() === 'v') {
        if (copiedElementRef.current) {
          e.preventDefault();
          const copied = copiedElementRef.current;
          const { id, name, ...rest } = copied;
          addElement(copied.type, {
            ...rest,
            name: `${copied.name} (Cópia)`,
            x: copied.x + 40,
            y: copied.y + 40,
          });
          showNotification('Elemento colado com sucesso!', 'success');
        }
      }

      // Duplicate: Ctrl+D
      if (isCtrl && e.key.toLowerCase() === 'd') {
        if (selectedElementId) {
          e.preventDefault();
          duplicateElement(selectedElementId);
          showNotification('Elemento duplicado!', 'success');
        }
      }

      // Delete: Backspace or Delete
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedElementId) {
          e.preventDefault();
          deleteElement(selectedElementId);
          showNotification('Elemento removido!', 'info');
        }
      }

      // Precision position adjustments with Arrow keys
      if (selectedElementId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && activeProject) {
        e.preventDefault();
        const targetEl = activeProject.elements.find(el => el.id === selectedElementId);
        if (targetEl && !targetEl.isLocked) {
          const offset = e.shiftKey ? 10 : 1;
          let dx = 0;
          let dy = 0;
          if (e.key === 'ArrowUp') dy = -offset;
          if (e.key === 'ArrowDown') dy = offset;
          if (e.key === 'ArrowLeft') dx = -offset;
          if (e.key === 'ArrowRight') dx = offset;

          updateElement(selectedElementId, {
            x: targetEl.x + dx,
            y: targetEl.y + dy,
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, activeProject?.elements, undo, redo, addElement, deleteElement, duplicateElement, updateElement, activeProject]);

  if (!activeProject) {
    return (
      <div className="flex-1 bg-zinc-900 flex items-center justify-center text-zinc-500 font-medium text-xs">
        Carregando editor...
      </div>
    );
  }

  const projectWidth = activeProject.width;
  const projectHeight = activeProject.height;

  // Compute Responsive Base Scale (fit boundaries with standard 48px padding offset)
  const marginOffset = 80;
  const scaleX = (containerSize.width - marginOffset) / projectWidth;
  const scaleY = (containerSize.height - marginOffset) / projectHeight;
  const baseScale = Math.min(scaleX, scaleY);
  
  // Combine base automatic layout with custom manual zoom factor
  const finalScale = baseScale * zoom;

  // Compute centered canvas card alignment offsets
  const leftOffset = (containerSize.width - projectWidth * finalScale) / 2;
  const topOffset = (containerSize.height - projectHeight * finalScale) / 2;

  // Deselect on stage background clicks
  const handleStageClick = (e: any) => {
    const clickedOnStage = e.target === e.target.getStage();
    if (clickedOnStage) {
      setSelectedElementId(null);
    }
  };

  const activeBulkRow = bulkRows.length > 0 ? bulkRows[activeBulkRowIndex] : null;

  // Adding Custom Guides by clicking on rulers
  const handleHorizontalRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const value = Math.round((clickX - leftOffset) / finalScale);
    if (value >= 0 && value <= projectWidth) {
      setGuides((prev) => [...prev, { id: `g-${Date.now()}`, type: 'v', value }]);
      showNotification(`Guia vertical inserida em ${value}px`, 'success');
    }
  };

  const handleVerticalRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const value = Math.round((clickY - topOffset) / finalScale);
    if (value >= 0 && value <= projectHeight) {
      setGuides((prev) => [...prev, { id: `g-${Date.now()}`, type: 'h', value }]);
      showNotification(`Guia horizontal inserida em ${value}px`, 'success');
    }
  };

  // Quick action presets for guides
  const handleAddPresetGuides = (type: 'thirds' | 'margins' | 'center') => {
    if (type === 'center') {
      setGuides([
        { id: 'gc-h', type: 'h', value: Math.round(projectHeight / 2) },
        { id: 'gc-v', type: 'v', value: Math.round(projectWidth / 2) }
      ]);
      showNotification('Guias de centralização aplicadas!', 'info');
    } else if (type === 'thirds') {
      setGuides([
        { id: 'gt-h1', type: 'h', value: Math.round(projectHeight / 3) },
        { id: 'gt-h2', type: 'h', value: Math.round((projectHeight / 3) * 2) },
        { id: 'gt-v1', type: 'v', value: Math.round(projectWidth / 3) },
        { id: 'gt-v2', type: 'v', value: Math.round((projectWidth / 3) * 2) }
      ]);
      showNotification('Grid de regra dos terços aplicada!', 'info');
    } else if (type === 'margins') {
      const marginH = Math.round(projectWidth * 0.1);
      const marginV = Math.round(projectHeight * 0.1);
      setGuides([
        { id: 'gm-h1', type: 'h', value: marginV },
        { id: 'gm-h2', type: 'h', value: projectHeight - marginV },
        { id: 'gm-v1', type: 'v', value: marginH },
        { id: 'gm-v2', type: 'v', value: projectWidth - marginH }
      ]);
      showNotification('Margens de segurança de 10% aplicadas!', 'info');
    }
  };

  // MiniMap Dimensions
  const miniWidth = 120;
  const miniHeight = Math.round(miniWidth * (projectHeight / projectWidth));
  const miniScale = miniWidth / projectWidth;

  // Coordinate marking configurations for rulers (ticks drawn every N pixels)
  const rulerStep = projectWidth >= 1920 ? 200 : (projectWidth >= 1080 ? 100 : 50);

  return (
    <div className="flex-1 bg-zinc-950 flex flex-col relative overflow-hidden select-none outline-none h-full" id="editor-canvas-stage-wrapper">
      
      {/* 1. Zoom, Guides and Snaps Toolbar */}
      <div className="h-11 border-b border-zinc-900 bg-zinc-950 px-4 flex items-center justify-between z-20 text-xs shrink-0 select-none">
        
        {/* Alignment Toggles */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 gap-1.5">
            <button
              onClick={() => {
                setEnableSnap(!enableSnap);
                showNotification(enableSnap ? 'Alinhamento magnético desativado' : 'Alinhamento magnético ativo', 'info');
              }}
              className={`py-1 px-2 rounded-md transition font-medium cursor-pointer ${
                enableSnap 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
              title="Ativar/Desativar o Snap Magnético"
            >
              Snap Magnético
            </button>
            <button
              onClick={() => {
                setShowGuides(!showGuides);
                showNotification(showGuides ? 'Guias ocultadas' : 'Guias visíveis', 'info');
              }}
              className={`py-1 px-2 rounded-md transition font-medium cursor-pointer flex items-center gap-1 ${
                showGuides 
                  ? 'bg-zinc-800 text-indigo-400 font-bold' 
                  : 'text-zinc-500 hover:text-white'
              }`}
              title="Exibir/Ocultar Guias do Canvas"
            >
              {showGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              Guias
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex bg-zinc-900/60 rounded-lg p-0.5 border border-zinc-900 text-[10px] text-zinc-400 gap-1">
            <button 
              onClick={() => handleAddPresetGuides('center')}
              className="px-2 py-1 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
            >
              Cruz de Centro
            </button>
            <button 
              onClick={() => handleAddPresetGuides('thirds')}
              className="px-2 py-1 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
            >
              Terços
            </button>
            <button 
              onClick={() => handleAddPresetGuides('margins')}
              className="px-2 py-1 hover:text-white rounded hover:bg-zinc-800 cursor-pointer"
            >
              Margens (10%)
            </button>
            {guides.length > 0 && (
              <button 
                onClick={() => {
                  setGuides([]);
                  showNotification('Todas as guias foram removidas!', 'info');
                }}
                className="px-2 py-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/20 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Out */}
          <button
            onClick={() => useEditorStore.getState().setZoom(zoom - 0.15)}
            className="p-1.5 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition cursor-pointer"
            title="Reduzir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          
          {/* Zoom Slider */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 px-1 bg-zinc-900 p-1 rounded-lg border border-zinc-850">
            <input
              type="range"
              min="0.25"
              max="3.0"
              step="0.05"
              value={zoom}
              onChange={(e) => useEditorStore.getState().setZoom(parseFloat(e.target.value))}
              className="w-20 h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="font-bold w-10 text-right">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Zoom In */}
          <button
            onClick={() => useEditorStore.getState().setZoom(zoom + 0.15)}
            className="p-1.5 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition cursor-pointer"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Fit Screen */}
          <button
            onClick={() => {
              useEditorStore.getState().setZoom(1.0);
              showNotification('Canvas ajustado à tela!', 'info');
            }}
            className="p-1.5 bg-indigo-600/10 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 rounded-lg transition flex items-center gap-1 cursor-pointer font-semibold"
            title="Ajustar Visualização"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Ajustar</span>
          </button>
        </div>
      </div>

      {/* Rulers and Canvas stage workspace */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Top-Left joint junction coordinate corner */}
        <div className="absolute top-0 left-0 w-6 h-6 bg-zinc-950 border-r border-b border-zinc-900 flex items-center justify-center z-30 font-mono text-[9px] text-zinc-500 font-bold">
          px
        </div>

        {/* 2. Top Horizontal Ruler */}
        <div 
          onClick={handleHorizontalRulerClick}
          className="absolute top-0 left-6 right-0 h-6 bg-zinc-950 border-b border-zinc-900 z-20 overflow-hidden cursor-crosshair select-none"
          title="Clique para adicionar uma guia vertical de alinhamento"
        >
          {/* Generate tick markings */}
          {Array.from({ length: Math.ceil(projectWidth / rulerStep) + 1 }).map((_, idx) => {
            const val = idx * rulerStep;
            const xPos = leftOffset + val * finalScale;
            return (
              <div 
                key={`h-tick-${val}`}
                className="absolute border-l border-zinc-850 h-3 flex flex-col justify-end"
                style={{ left: `${xPos}px`, bottom: 0 }}
              >
                <span className="text-[7.5px] leading-none text-zinc-600 font-mono pl-0.5 pb-0.5">{val}</span>
              </div>
            );
          })}
        </div>

        {/* 3. Left Vertical Ruler */}
        <div 
          onClick={handleVerticalRulerClick}
          className="absolute top-6 left-0 w-6 bottom-0 bg-zinc-950 border-r border-zinc-900 z-20 overflow-hidden cursor-crosshair select-none"
          title="Clique para adicionar uma guia horizontal de alinhamento"
        >
          {/* Generate tick markings */}
          {Array.from({ length: Math.ceil(projectHeight / rulerStep) + 1 }).map((_, idx) => {
            const val = idx * rulerStep;
            const yPos = topOffset + val * finalScale;
            return (
              <div 
                key={`v-tick-${val}`}
                className="absolute border-t border-zinc-850 w-3 flex flex-row items-center justify-end"
                style={{ top: `${yPos}px`, right: 0 }}
              >
                <span className="text-[7.5px] leading-none text-zinc-600 font-mono pr-0.5 transform rotate-270 origin-center">{val}</span>
              </div>
            );
          })}
        </div>

        {/* 4. Main workspace stage viewport (compensated by margins 24px/left-6) */}
        <div 
          ref={containerRef}
          className="absolute top-6 left-6 right-0 bottom-0 overflow-hidden bg-zinc-900 flex items-center justify-center select-none"
          id="editor-canvas-stage-viewport"
        >
          {/* Background dot-grid patterns */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

          {/* Actual canvas card wrapper */}
          <div 
            className="absolute bg-zinc-950 shadow-2xl shadow-black rounded-lg border border-zinc-800/80 overflow-hidden"
            style={{
              width: projectWidth * finalScale,
              height: projectHeight * finalScale,
              left: `${leftOffset}px`,
              top: `${topOffset}px`,
            }}
          >
            <Stage
              ref={stageRef}
              width={projectWidth * finalScale}
              height={projectHeight * finalScale}
              scaleX={finalScale}
              scaleY={finalScale}
              onClick={handleStageClick}
              onTap={handleStageClick}
              className="absolute inset-0 overflow-hidden"
            >
              <Layer>
                {/* Visual template elements (Background -> Video -> Overlay -> Text -> Logo -> Effects) */}
                {activeProject.elements.map((el) => (
                  <KonvaElement
                    key={el.id}
                    element={el}
                    isSelected={selectedElementId === el.id}
                    bulkRow={activeBulkRow}
                    currentTime={currentTime}
                    totalDuration={activeProject.duration}
                    onSelect={() => setSelectedElementId(el.id)}
                    onChange={(updates) => updateElement(el.id, updates)}
                    onSnapChange={setActiveSnapLines}
                    guides={guides}
                    enableSnap={enableSnap}
                    projectWidth={projectWidth}
                    projectHeight={projectHeight}
                  />
                ))}

                {/* Transformer handles overlay for active selections */}
                {selectedElementId && (
                  <Transformer
                    ref={transformerRef}
                    keepRatio={true}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                    rotateAnchorOffset={32}
                    borderStroke="#6366f1"
                    borderStrokeWidth={1.5}
                    anchorStroke="#6366f1"
                    anchorFill="#ffffff"
                    anchorSize={8}
                    anchorCornerRadius={2}
                  />
                )}

                {/* Draw Custom Alignment Guidelines if enabled */}
                {showGuides && guides.map((g) => (
                  g.type === 'v' ? (
                    <Line
                      key={g.id}
                      points={[g.value, 0, g.value, projectHeight]}
                      stroke="#06b6d4"
                      strokeWidth={1 / finalScale} // keep border thickness scale independent
                      dash={[6, 6]}
                      opacity={0.7}
                    />
                  ) : (
                    <Line
                      key={g.id}
                      points={[0, g.value, projectWidth, g.value]}
                      stroke="#06b6d4"
                      strokeWidth={1 / finalScale}
                      dash={[6, 6]}
                      opacity={0.7}
                    />
                  )
                ))}

                {/* Real-time Magnetic snap overlays (Red Guidelines) */}
                {activeSnapLines.map((line, idx) => (
                  line.type === 'v' ? (
                    <Line
                      key={`snap-v-${idx}`}
                      points={[line.value, 0, line.value, projectHeight]}
                      stroke="#f43f5e"
                      strokeWidth={1.5 / finalScale}
                      opacity={1}
                    />
                  ) : (
                    <Line
                      key={`snap-h-${idx}`}
                      points={[0, line.value, projectWidth, line.value]}
                      stroke="#f43f5e"
                      strokeWidth={1.5 / finalScale}
                      opacity={1}
                    />
                  )
                ))}
              </Layer>
            </Stage>
          </div>

          {/* Floating interactive SVG MiniMap card */}
          <div className="absolute bottom-4 right-4 bg-zinc-950/85 border border-zinc-800/80 shadow-2xl p-3 rounded-2xl backdrop-blur-md flex flex-col gap-2 select-none z-10 w-[144px]">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">MiniMap</span>
            <div 
              className="bg-black/60 rounded-lg border border-zinc-900/60 overflow-hidden relative flex items-center justify-center"
              style={{
                width: miniWidth,
                height: miniHeight
              }}
            >
              <svg 
                width={miniWidth} 
                height={miniHeight} 
                className="absolute inset-0 w-full h-full"
                viewBox={`0 0 ${miniWidth} ${miniHeight}`}
              >
                {/* SVG representation of elements */}
                {activeProject.elements.map((el) => {
                  const elX = el.x * miniScale;
                  const elY = el.y * miniScale;
                  const elW = el.width * miniScale;
                  const elH = el.height * miniScale;
                  const isSelected = el.id === selectedElementId;

                  if (el.type === 'circle') {
                    const r = elW / 2;
                    return (
                      <circle
                        key={`mini-${el.id}`}
                        cx={elX + r}
                        cy={elY + r}
                        r={r}
                        fill={el.fill}
                        opacity={el.opacity * 0.8}
                        stroke={isSelected ? '#6366f1' : 'none'}
                        strokeWidth={isSelected ? 1 : 0}
                      />
                    );
                  }

                  return (
                    <rect
                      key={`mini-${el.id}`}
                      x={elX}
                      y={elY}
                      width={Math.max(2, elW)}
                      height={Math.max(2, elH)}
                      fill={el.fill}
                      opacity={el.opacity * 0.8}
                      rx={1}
                      stroke={isSelected ? '#6366f1' : 'none'}
                      strokeWidth={isSelected ? 1 : 0}
                    />
                  );
                })}
              </svg>
            </div>
            
            {/* Quick Helper Labels */}
            <div className="text-[9px] font-mono text-zinc-500 flex justify-between">
              <span>{projectWidth}px</span>
              <span>{projectHeight}px</span>
            </div>
          </div>

          {/* Quick Helper guidelines Double Click explanation bubble */}
          {guides.length > 0 && (
            <div className="absolute bottom-4 left-4 bg-zinc-900/90 border border-zinc-800 text-[10px] text-zinc-400 py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-md font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <span>Dica: clique em Limpar no topo para apagar guias</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
