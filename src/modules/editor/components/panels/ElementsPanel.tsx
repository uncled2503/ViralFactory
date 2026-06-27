/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useEditorStore } from '../../../../store/editorStore';
import { useAssetStore } from '../../../../store/assetStore';
import { useUIStore } from '../../../../store/uiStore';
import { ElementType } from '../../../../types';
import { 
  Square, 
  Circle, 
  Video, 
  Flame, 
  MousePointerClick, 
  Sliders 
} from 'lucide-react';

export default function ElementsPanel() {
  const { addElement } = useEditorStore();
  const { getAssetsByCategory } = useAssetStore();
  const { showNotification } = useUIStore();
  const stickers = getAssetsByCategory('sticker');

  const handleAddShape = (type: ElementType, name: string, props = {}) => {
    addElement(type, props);
    showNotification(`Elemento "${name}" adicionado ao editor!`, 'info');
  };

  const handleAddSticker = (stickerUrl: string, name: string) => {
    addElement('image', {
      imageUrl: stickerUrl,
      name,
      width: 150,
      height: 150,
    });
    showNotification(`Sticker "${name}" adicionado!`, 'info');
  };

  return (
    <div className="flex flex-col h-full text-zinc-200">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-semibold flex items-center gap-1.5 text-zinc-100">
          <Sliders className="w-4 h-4 text-indigo-500" />
          Elementos Gráficos
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Adicione formas, botões, ícones ou placeholders para posicionar no seu template.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* Core vector shapes */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Formas Básicas</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAddShape('rect', 'Retângulo')}
              className="flex items-center gap-2 p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 rounded-xl transition text-left focus:outline-none"
            >
              <Square className="w-5 h-5 text-indigo-400 fill-indigo-400/10" />
              <span className="text-xs font-medium">Retângulo</span>
            </button>
            <button
              onClick={() => handleAddShape('circle', 'Círculo')}
              className="flex items-center gap-2 p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 rounded-xl transition text-left focus:outline-none"
            >
              <Circle className="w-5 h-5 text-emerald-400 fill-emerald-400/10" />
              <span className="text-xs font-medium">Círculo</span>
            </button>
          </div>
        </div>

        {/* Video & Utilities placeholders */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Marcadores de Vídeo</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAddShape('video_placeholder', 'Mídia Principal')}
              className="flex flex-col items-start gap-1.5 p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 rounded-xl transition text-left focus:outline-none"
            >
              <Video className="w-5 h-5 text-rose-400" />
              <span className="text-xs font-medium">Vídeo Clipe</span>
              <span className="text-[10px] text-zinc-500">Espaço de fundo</span>
            </button>
            <button
              onClick={() => handleAddShape('progress_bar', 'Progresso')}
              className="flex flex-col items-start gap-1.5 p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 rounded-xl transition text-left focus:outline-none"
            >
              <div className="h-4 w-full bg-zinc-800 rounded border border-zinc-700 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2/3 bg-amber-500" />
              </div>
              <span className="text-xs font-medium">Barra Progresso</span>
              <span className="text-[10px] text-zinc-500">Progresso do vídeo</span>
            </button>
          </div>
        </div>

        {/* Preset Stickers */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Figurinhas & Badges</h4>
          <div className="grid grid-cols-3 gap-2">
            {stickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleAddSticker(sticker.url, sticker.name)}
                className="group flex flex-col items-center justify-center p-2.5 bg-zinc-900/60 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-900 rounded-xl transition focus:outline-none"
              >
                <div className="w-12 h-12 flex items-center justify-center p-1 bg-zinc-950 rounded-lg group-hover:scale-105 transition-transform mb-1.5">
                  <img src={sticker.url} alt={sticker.name} className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                </div>
                <span className="text-[10px] text-zinc-400 text-center truncate w-full group-hover:text-zinc-200">
                  {sticker.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
