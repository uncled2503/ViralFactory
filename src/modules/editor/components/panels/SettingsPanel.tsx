/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProjectStore } from '../../../../store/projectStore';
import { useUIStore } from '../../../../store/uiStore';
import { Settings, RefreshCw, Layers } from 'lucide-react';
import { generateTemplateConfig } from '../../../../utils/templateConfig';

interface PresetResolution {
  name: string;
  width: number;
  height: number;
}

const ASPECT_PRESETS: PresetResolution[] = [
  { name: 'Vertical TikTok / Reels (9:16)', width: 1080, height: 1920 },
  { name: 'Quadrado Instagram / Feed (1:1)', width: 1080, height: 1080 },
  { name: 'Horizontal YouTube / Vídeo (16:9)', width: 1920, height: 1080 }
];

const PRESET_COLORS = [
  '#000000', '#111827', '#1f2937', '#0f172a', '#1e1b4b', '#1c1917',
  '#312e81', '#581c87', '#022c22', '#1e3a8a', '#5c0632', '#78350f'
];

export default function SettingsPanel() {
  const activeProject = useProjectStore((s) => s.getCurrentProject());
  const updateCurrentProject = useProjectStore((s) => s.updateCurrentProject);
  const { showNotification } = useUIStore();
  const [showConfig, setShowConfig] = useState(false);

  const bulkRows = useProjectStore((s) => s.bulkRows);
  const activeBulkRowIndex = useProjectStore((s) => s.activeBulkRowIndex);
  const activeBulkRow = bulkRows.length > 0 ? bulkRows[activeBulkRowIndex] : undefined;

  if (!activeProject) {
    return (
      <div className="p-4 text-center text-xs text-zinc-500">
        Nenhum projeto ativo selecionado.
      </div>
    );
  }

  const config = generateTemplateConfig(activeProject, activeBulkRow);

  const handleApplyPreset = (preset: PresetResolution) => {
    updateCurrentProject({
      width: preset.width,
      height: preset.height
    });
    showNotification(`Resolução ajustada para ${preset.width}x${preset.height}!`, 'info');
  };

  const handleApplyBgColor = (color: string) => {
    // Look for background element or apply general color
    // We can update the canvas placeholder fill color, or change element el-bg's fill
    const bgElement = activeProject.elements.find((el) => el.id === 'el-bg' || el.id === 'el-bg-square' || el.id === 'el-bg-yt');
    if (bgElement) {
      // Direct update of background element fill
      useProjectStore.getState().updateCurrentProject({
        elements: activeProject.elements.map((el) => 
          el.id === bgElement.id ? { ...el, fill: color, imageUrl: undefined } : el
        )
      });
    } else {
      // Find any lock-locked element or create one
      showNotification('Preenchendo cor de fundo do template!', 'success');
    }
    showNotification(`Cor de fundo definida para ${color}!`, 'info');
  };

  return (
    <div className="flex flex-col h-full text-zinc-200">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-semibold flex items-center gap-1.5 text-zinc-100">
          <Settings className="w-4 h-4 text-indigo-500" />
          Ajustes do Projeto
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Configure as dimensões do vídeo, tempo total, taxa de quadros e cores do canvas.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* Project Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400">Nome do Projeto</label>
          <input
            type="text"
            value={activeProject.name}
            onChange={(e) => updateCurrentProject({ name: e.target.value })}
            placeholder="Ex: Meu Vídeo Incrível"
            className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none transition"
          />
        </div>

        {/* Video Duration */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-zinc-400">Duração Total</label>
            <span className="font-mono text-indigo-400 font-bold">{activeProject.duration} segundos</span>
          </div>
          <input
            type="range"
            min={1}
            max={60}
            value={activeProject.duration}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              updateCurrentProject({ duration: val });
            }}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Formats Aspect ratio presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400">Formatos e Aspectos Rápidos</label>
          <div className="space-y-1.5">
            {ASPECT_PRESETS.map((preset) => {
              const isMatch = activeProject.width === preset.width && activeProject.height === preset.height;
              return (
                <button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  className={`w-full p-2.5 text-left text-xs border rounded-xl flex items-center justify-between transition focus:outline-none ${
                    isMatch
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                      : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {preset.width}x{preset.height}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual Resolution inputs */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400">Resolução Customizada</label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500">Largura (px)</span>
              <input
                type="number"
                value={activeProject.width}
                onChange={(e) => updateCurrentProject({ width: Math.max(100, parseInt(e.target.value) || 1080) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500">Altura (px)</span>
              <input
                type="number"
                value={activeProject.height}
                onChange={(e) => updateCurrentProject({ height: Math.max(100, parseInt(e.target.value) || 1920) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Palette Canvas Bg picker */}
        <div className="space-y-2 pb-4">
          <label className="text-xs font-semibold text-zinc-400">Cores Sólidas de Fundo</label>
          <div className="grid grid-cols-6 gap-1.5">
            {PRESET_COLORS.map((col) => (
              <button
                key={col}
                onClick={() => handleApplyBgColor(col)}
                className="w-full aspect-square rounded-lg border border-zinc-800 transition transform hover:scale-110 cursor-pointer focus:outline-none"
                style={{ backgroundColor: col }}
                title={col}
              />
            ))}
          </div>
        </div>

        {/* TemplateConfig Accordion */}
        <div className="space-y-2 border-t border-zinc-900 pt-4">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="w-full py-2.5 px-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              TemplateConfig (FFmpeg Prep)
            </span>
            <span className="text-[10px] font-mono">{showConfig ? 'Ocultar' : 'Visualizar'}</span>
          </button>

          {showConfig && (
            <div className="mt-2 bg-zinc-950 rounded-xl p-3 border border-zinc-900 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Código JSON Gerado</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
                    showNotification('TemplateConfig copiado para a área de transferência!', 'success');
                  }}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Copiar JSON
                </button>
              </div>
              <pre className="text-[9px] font-mono text-zinc-400 bg-zinc-900/40 p-2.5 rounded-lg overflow-x-auto max-h-72 scrollbar-thin scrollbar-thumb-zinc-850">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
