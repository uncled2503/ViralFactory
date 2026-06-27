/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useEditorStore } from '../../../../store/editorStore';
import { useUIStore } from '../../../../store/uiStore';
import { Type, Sparkles, AlertCircle } from 'lucide-react';

interface TextPreset {
  id: string;
  label: string;
  subtitle: string;
  fontSize: number;
  fontStyle: 'normal' | 'bold' | 'italic';
  fill: string;
  fontFamily: string;
  type: 'text' | 'subtitle';
}

const TEXT_PRESETS: TextPreset[] = [
  {
    id: 'header-title',
    label: 'Título Principal',
    subtitle: 'Texto de grande destaque',
    fontSize: 54,
    fontStyle: 'bold',
    fill: '#ffffff',
    fontFamily: 'Inter',
    type: 'text',
  },
  {
    id: 'header-subtitle',
    label: 'Subtítulo',
    subtitle: 'Texto complementar',
    fontSize: 36,
    fontStyle: 'normal',
    fill: '#9ca3af',
    fontFamily: 'Inter',
    type: 'text',
  },
  {
    id: 'body-text',
    label: 'Texto de Corpo',
    subtitle: 'Informações detalhadas',
    fontSize: 24,
    fontStyle: 'normal',
    fill: '#e5e7eb',
    fontFamily: 'Inter',
    type: 'text',
  },
  {
    id: 'dynamic-subtitle',
    label: 'Legenda Vídeo',
    subtitle: 'Destacada e ideal para vídeos',
    fontSize: 44,
    fontStyle: 'bold',
    fill: '#facc15', // Neon Yellow
    fontFamily: 'Inter',
    type: 'subtitle',
  }
];

export default function TextPanel() {
  const { addElement } = useEditorStore();
  const { showNotification } = useUIStore();

  const handleAddText = (preset: TextPreset) => {
    addElement(preset.type, {
      name: preset.label,
      text: preset.type === 'subtitle' ? 'Legenda Dinâmica' : 'Clique duas vezes para editar',
      fontSize: preset.fontSize,
      fontStyle: preset.fontStyle,
      fill: preset.fill,
      fontFamily: preset.fontFamily,
    });
    showNotification(`Elemento de texto "${preset.label}" adicionado!`, 'info');
  };

  return (
    <div className="flex flex-col h-full text-zinc-200">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-semibold flex items-center gap-1.5 text-zinc-100">
          <Type className="w-4 h-4 text-amber-500" />
          Tipografia & Textos
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Adicione elementos de texto personalizáveis com suporte a variáveis de customização.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-400 leading-relaxed">
            Dica: Adicione variáveis dinâmicas do seu arquivo de dados mapeando a propriedade 
            <strong> Variável Dinâmica</strong> no painel de propriedades.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Estilos Padrão</h4>
          <div className="flex flex-col gap-2">
            {TEXT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                id={`btn-add-text-${preset.id}`}
                onClick={() => handleAddText(preset)}
                className="group flex flex-col items-start p-3 bg-zinc-900 border border-zinc-800 hover:border-indigo-500 hover:bg-zinc-900 transition-all rounded-xl text-left focus:outline-none"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-400">
                    {preset.label}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono">
                    {preset.fontSize}px
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 mt-0.5">
                  {preset.subtitle}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic styling effects presets (Neon, Classic Board) */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Estilos com Efeitos</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addElement('text', {
                name: 'Neon Pink',
                text: 'NEON',
                fill: '#f43f5e',
                fontSize: 60,
                fontStyle: 'bold',
                fontFamily: 'Inter',
                stroke: '#1e1b4b',
                strokeWidth: 4,
              })}
              className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 rounded-xl text-center focus:outline-none"
            >
              <span className="text-sm font-bold text-rose-500 font-sans tracking-wide drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                Neon Rosa
              </span>
            </button>
            <button
              onClick={() => addElement('text', {
                name: 'Retro Yellow',
                text: 'RETRO',
                fill: '#eab308',
                fontSize: 50,
                fontStyle: 'bold',
                fontFamily: 'Inter',
                stroke: '#000000',
                strokeWidth: 6,
              })}
              className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 rounded-xl text-center focus:outline-none"
            >
              <span className="text-sm font-black text-amber-500 font-sans tracking-tight uppercase" style={{ WebkitTextStroke: '1px black' }}>
                Retro Amarelo
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
