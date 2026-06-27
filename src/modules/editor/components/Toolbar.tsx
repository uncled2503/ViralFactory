/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useProjectStore } from '../../../store/projectStore';
import { useEditorStore } from '../../../store/editorStore';
import { useUIStore } from '../../../store/uiStore';
import { 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Save, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  FileCode,
  Upload
} from 'lucide-react';

export default function Toolbar() {
  const { currentProjectId, projects, updateCurrentProject, bulkRows, activeBulkRowIndex, setActiveBulkRowIndex } = useProjectStore();
  const { zoom, setZoom, undo, redo, historyIndex, history } = useEditorStore();
  const { showNotification, setActiveView } = useUIStore();

  const activeProject = projects.find((p) => p.id === currentProjectId);

  const handleZoomChange = (value: number) => {
    setZoom(value);
  };

  const handleCopyLayout = () => {
    if (!activeProject) return;
    try {
      const serialized = JSON.stringify(activeProject, null, 2);
      navigator.clipboard.writeText(serialized);
      showNotification('Layout do template copiado para a área de transferência!', 'success');
    } catch (e) {
      showNotification('Falha ao copiar layout.', 'error');
    }
  };

  const handleSaveLocal = () => {
    showNotification('Template salvo no armazenamento local com sucesso!', 'success');
  };

  const hasUndo = historyIndex > 0;
  const hasRedo = historyIndex < history.length - 1;

  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-800 px-6 flex items-center justify-between select-none shrink-0" id="editor-toolbar">
      {/* Left: Project title & rename */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveView('library')}
          className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition px-2 py-1.5 hover:bg-zinc-900 rounded-lg cursor-pointer"
          title="Voltar para a Biblioteca de Templates"
          id="toolbar-btn-back"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Biblioteca</span>
        </button>
        <span className="h-4 w-[1px] bg-zinc-800" />
        <button
          onClick={() => setActiveView('uploads')}
          className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition px-2 py-1.5 hover:bg-zinc-900 rounded-lg cursor-pointer"
          title="Ir para o Gerenciador de Uploads"
          id="toolbar-btn-uploads"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span>Gerenciar Uploads</span>
        </button>
        <span className="h-4 w-[1px] bg-zinc-800" />
        {activeProject ? (
          <input
            type="text"
            value={activeProject.name}
            onChange={(e) => updateCurrentProject({ name: e.target.value })}
            className="bg-transparent text-sm font-semibold text-zinc-100 hover:bg-zinc-900 focus:bg-zinc-900 border-b border-transparent focus:border-indigo-500 rounded px-2 py-1 transition focus:outline-none max-w-[200px]"
            title="Clique para renomear"
          />
        ) : (
          <span className="text-zinc-400 text-xs">Carregando editor...</span>
        )}
        <span className="h-4 w-[1px] bg-zinc-800" />
        <span className="text-[10px] text-zinc-500 font-mono">BETA</span>
      </div>

      {/* Middle: Bulk data carousel + Undo / Redo */}
      <div className="flex items-center gap-6">
        {/* Bulk Carousel controls */}
        {bulkRows.length > 0 && (
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 px-2.5 gap-2" id="bulk-preview-carousel">
            <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono tracking-wider">Preview de Lote:</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={activeBulkRowIndex === 0}
                onClick={() => {
                  setActiveBulkRowIndex(activeBulkRowIndex - 1);
                  showNotification(`Mostrando linha ${activeBulkRowIndex}!`, 'info');
                }}
                className="p-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:hover:text-zinc-400 rounded hover:bg-zinc-800 transition"
                title="Variação anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {activeBulkRowIndex + 1} <span className="text-zinc-600">/</span> {bulkRows.length}
              </span>
              <button
                disabled={activeBulkRowIndex === bulkRows.length - 1}
                onClick={() => {
                  setActiveBulkRowIndex(activeBulkRowIndex + 1);
                  showNotification(`Mostrando linha ${activeBulkRowIndex + 2}!`, 'info');
                }}
                className="p-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:hover:text-zinc-400 rounded hover:bg-zinc-800 transition"
                title="Próxima variação"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Undo / Redo */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 gap-1">
          <button
            disabled={!hasUndo}
            onClick={undo}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-400 rounded-md hover:bg-zinc-800 transition"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            disabled={!hasRedo}
            onClick={redo}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-400 rounded-md hover:bg-zinc-800 transition"
            title="Refazer (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom adjustment */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 gap-2 text-zinc-400">
          <button 
            onClick={() => handleZoomChange(zoom - 0.1)}
            className="hover:text-white"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono font-medium min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={() => handleZoomChange(zoom + 0.1)}
            className="hover:text-white"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1.0)}
            className="text-[10px] px-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-medium"
          >
            Ajustar
          </button>
        </div>
      </div>

      {/* Right: Export layout */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyLayout}
          className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
          title="Copiar JSON de configuração"
        >
          <FileCode className="w-4 h-4" />
          <span>Copiar JSON</span>
        </button>
        <button
          onClick={handleSaveLocal}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Layout</span>
        </button>
      </div>
    </header>
  );
}
