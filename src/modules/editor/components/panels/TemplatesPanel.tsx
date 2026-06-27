/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useProjectStore } from '../../../../store/projectStore';
import { useUIStore } from '../../../../store/uiStore';
import { useEditorStore } from '../../../../store/editorStore';
import { Sparkles, Video } from 'lucide-react';

export default function TemplatesPanel() {
  const { templates, createProjectFromTemplate, loadProject } = useProjectStore();
  const { initHistory } = useEditorStore();
  const { showNotification } = useUIStore();

  const handleSelectTemplate = (id: string, name: string) => {
    const newProjId = createProjectFromTemplate(id);
    if (newProjId) {
      loadProject(newProjId);
      const elements = useProjectStore.getState().getCurrentProject()?.elements || [];
      initHistory(elements);
      showNotification(`Modelo "${name}" carregado com sucesso!`, 'success');
    }
  };

  return (
    <div className="flex flex-col h-full text-zinc-200">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-semibold flex items-center gap-1.5 text-zinc-100">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Modelos Prontos (Templates)
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Selecione um ponto de partida profissional para criar seus vídeos em lote.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* Formats grouping */}
        {[
          { key: '9:16', label: 'Vertical (9:16)' },
          { key: '1:1', label: 'Quadrado (1:1)' },
          { key: '16:9', label: 'Horizontal (16:9)' },
          { key: '4:5', label: 'Retrato (4:5)' }
        ].map(({ key, label }) => {
          const categoryTemplates = templates.filter((t) => t.format === key);
          if (categoryTemplates.length === 0) return null;

          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 tracking-wider uppercase">
                <Video className="w-3.5 h-3.5" />
                {label}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {categoryTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    id={`template-card-${tpl.id}`}
                    onClick={() => handleSelectTemplate(tpl.id, tpl.name)}
                    className="group relative flex flex-col text-left rounded-xl overflow-hidden border border-zinc-800 hover:border-indigo-500 bg-zinc-900/50 hover:bg-zinc-900 transition-all focus:outline-none"
                  >
                    {/* Thumbnail preview aspect container */}
                    <div className="aspect-[4/5] w-full bg-zinc-950 relative overflow-hidden">
                      <img
                        src={tpl.thumbnailUrl}
                        alt={tpl.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-amber-400 font-mono font-bold">
                        {tpl.duration}s
                      </div>
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white line-clamp-1">
                        {tpl.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                        <Video className="w-3 h-3 text-zinc-500" />
                        {tpl.width} x {tpl.height}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
