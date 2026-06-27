/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useProjectStore } from '../../../store/projectStore';
import { useEditorStore } from '../../../store/editorStore';
import { useUIStore } from '../../../store/uiStore';
import { Monitor, Layers, Cpu, CheckCircle2 } from 'lucide-react';

export default function StatusBar() {
  const activeProject = useProjectStore((s) => s.getCurrentProject());
  const { zoom, selectedElementId } = useEditorStore();
  const { bulkRows } = useProjectStore();

  const elementCount = activeProject?.elements.length || 0;

  return (
    <footer className="h-8 bg-zinc-950 border-t border-zinc-900 px-6 flex items-center justify-between select-none shrink-0 font-mono text-[10px] text-zinc-500" id="editor-statusbar">
      {/* Left: Device / Size indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Monitor className="w-3 h-3 text-zinc-600" />
          <span>Resolução:</span>
          <span className="text-zinc-300 font-bold">
            {activeProject ? `${activeProject.width}x${activeProject.height}px` : 'N/A'}
          </span>
        </div>
        <span className="h-3 w-[1px] bg-zinc-800" />
        <div className="flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-zinc-600" />
          <span>Camadas:</span>
          <span className="text-zinc-300 font-bold">{elementCount}</span>
        </div>
      </div>

      {/* Middle: Selection Details */}
      <div className="hidden md:flex items-center gap-2">
        {selectedElementId ? (
          <span className="text-indigo-400">
            Foco Ativo: <strong className="font-sans font-bold text-indigo-300">{selectedElementId}</strong>
          </span>
        ) : (
          <span className="text-zinc-600">Nenhum elemento em foco</span>
        )}
      </div>

      {/* Right: Scale / CSV status info */}
      <div className="flex items-center gap-4">
        {bulkRows.length > 0 && (
          <div className="flex items-center gap-1 text-emerald-500 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{bulkRows.length} linhas vinculadas</span>
          </div>
        )}
        <span className="h-3 w-[1px] bg-zinc-800" />
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-zinc-600" />
          <span>CPU Render:</span>
          <span className="text-zinc-400 font-bold">Web Canvas (Local)</span>
        </div>
      </div>
    </footer>
  );
}
