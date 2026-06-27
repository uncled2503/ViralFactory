/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useEditorStore } from '../../../store/editorStore';
import { useProjectStore } from '../../../store/projectStore';
import { useUIStore } from '../../../store/uiStore';
import { 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Lock, 
  Unlock, 
  Layers,
  Sparkles,
  Palette,
  Type,
  LayoutGrid,
  Maximize,
  Sliders,
  Eye,
  ShieldAlert
} from 'lucide-react';

import InspectorSection from './inspector/InspectorSection';
import InspectorInput from './inspector/InspectorInput';
import InspectorSlider from './inspector/InspectorSlider';
import InspectorColorPicker from './inspector/InspectorColorPicker';

const FONT_FAMILIES = [
  'Inter', 
  'Space Grotesk', 
  'Outfit', 
  'Playfair Display', 
  'JetBrains Mono', 
  'Fira Code', 
  'Arial'
];

const FONT_WEIGHTS = [
  { value: 'normal', label: 'Regular (400)' },
  { value: '100', label: 'Thin (100)' },
  { value: '300', label: 'Light (300)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi Bold (600)' },
  { value: 'bold', label: 'Bold (700)' },
  { value: '800', label: 'Extra Bold (800)' },
  { value: '900', label: 'Black (900)' }
];

export default function PropertyPanel() {
  const { 
    selectedElementId, 
    updateElement, 
    deleteElement, 
    duplicateElement, 
    bringToFront, 
    sendToBack, 
    alignElement 
  } = useEditorStore();
  const { bulkRows, getCurrentProject } = useProjectStore();
  const { showNotification } = useUIStore();

  const activeProject = getCurrentProject();
  const element = activeProject?.elements.find((el) => el.id === selectedElementId);

  if (!activeProject || !element) {
    return (
      <div className="w-80 bg-zinc-950 border-l border-zinc-800 flex flex-col items-center justify-center p-6 text-center select-none shrink-0" id="property-panel-empty">
        <Layers className="w-10 h-10 text-zinc-600 mb-3 animate-pulse" />
        <h4 className="text-xs font-semibold text-zinc-400">Nenhum elemento selecionado</h4>
        <p className="text-[11px] text-zinc-500 mt-1 max-w-[200px]">
          Selecione qualquer forma, texto ou imagem no editor para customizar suas propriedades no padrão Figma.
        </p>
      </div>
    );
  }

  const csvColumns = bulkRows.length > 0 ? Object.keys(bulkRows[0]) : [];

  const handlePropertyChange = (property: string, value: any) => {
    updateElement(element.id, { [property]: value });
  };

  const isText = element.type === 'text' || element.type === 'subtitle';
  const hasRadius = element.type === 'rect' || element.type === 'image' || element.type === 'video_placeholder';
  const hasFill = element.type !== 'image';

  return (
    <div className="w-80 bg-zinc-950 border-l border-zinc-800 flex flex-col h-full overflow-hidden select-none shrink-0" id="property-panel">
      
      {/* Figma Inspector Header */}
      <div className="p-4 border-b border-zinc-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Inspetor Figma</span>
        </div>
        <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full uppercase">
          {element.type}
        </span>
      </div>

      {/* Main Properties Scroll Box */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-900 scrollbar-thin scrollbar-thumb-zinc-800">
        
        {/* Identificação Section */}
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Nome do Objeto</span>
              <input
                id="element-name"
                type="text"
                value={element.name}
                onChange={(e) => handlePropertyChange('name', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800/80 rounded-lg px-2.5 h-8 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={() => {
                  handlePropertyChange('isLocked', !element.isLocked);
                  showNotification(element.isLocked ? 'Elemento desbloqueado!' : 'Elemento bloqueado!', 'info');
                }}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                  element.isLocked 
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-400' 
                    : 'bg-zinc-900 border-zinc-800/80 text-zinc-500 hover:text-white'
                }`}
                title={element.isLocked ? 'Desbloquear elemento' : 'Bloquear elemento'}
              >
                {element.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Quick Alignments Grid */}
          <div className="space-y-1.5">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Alinhamento Automático</span>
            <div className="grid grid-cols-6 gap-1">
              {(['left', 'center', 'right', 'top', 'middle', 'bottom'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => {
                    alignElement(element.id, align);
                    showNotification(`Elemento alinhado à: ${align}`, 'success');
                  }}
                  className="py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg text-[9px] font-bold capitalize transition cursor-pointer"
                  title={`Alinhar à ${align}`}
                >
                  {align === 'left' && 'Esq'}
                  {align === 'center' && 'Ctr'}
                  {align === 'right' && 'Dir'}
                  {align === 'top' && 'Topo'}
                  {align === 'middle' && 'Meio'}
                  {align === 'bottom' && 'Base'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic bulk spreadsheets data variables mapping */}
        {isText && (
          <div className="p-4 bg-emerald-500/5 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Planilha em Lote</label>
            </div>
            {csvColumns.length > 0 ? (
              <select
                id="dynamic-variable-select"
                value={element.dynamicVariable || ''}
                onChange={(e) => handlePropertyChange('dynamicVariable', e.target.value || undefined)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">-- Estático (Sem vínculo) --</option>
                {csvColumns.map((col) => (
                  <option key={col} value={col}>
                    {`Vincular à coluna: {${col}}`}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-[9px] text-zinc-500 italic block">
                Nenhum dado importado. Ative a aba de planilhas "Em Massa" para vincular variáveis.
              </span>
            )}
          </div>
        )}

        {/* Posição e Escala Section */}
        <InspectorSection id="position-scale" title="Layout e Dimensões">
          <div className="grid grid-cols-2 gap-3.5">
            <InspectorInput
              id="prop-x"
              label="Posição X"
              prefixText="X"
              unit="px"
              value={Math.round(element.x)}
              disabled={element.isLocked}
              onChange={(v) => handlePropertyChange('x', v)}
            />
            <InspectorInput
              id="prop-y"
              label="Posição Y"
              prefixText="Y"
              unit="px"
              value={Math.round(element.y)}
              disabled={element.isLocked}
              onChange={(v) => handlePropertyChange('y', v)}
            />
            <InspectorInput
              id="prop-w"
              label="Largura W"
              prefixText="W"
              unit="px"
              value={Math.round(element.width)}
              disabled={element.isLocked}
              min={1}
              onChange={(v) => handlePropertyChange('width', v)}
            />
            <InspectorInput
              id="prop-h"
              label="Altura H"
              prefixText="H"
              unit="px"
              value={Math.round(element.height)}
              disabled={element.isLocked}
              min={1}
              onChange={(v) => handlePropertyChange('height', v)}
            />
          </div>

          <div className="space-y-4 pt-1.5">
            <InspectorSlider
              id="prop-opacity"
              label="Opacidade"
              value={Math.round((element.opacity ?? 1) * 100)}
              min={0}
              max={100}
              unit="%"
              disabled={element.isLocked}
              onChange={(v) => handlePropertyChange('opacity', v / 100)}
            />
            <InspectorSlider
              id="prop-rotation"
              label="Rotação"
              value={Math.round(element.rotation ?? 0)}
              min={0}
              max={360}
              unit="°"
              disabled={element.isLocked}
              onChange={(v) => handlePropertyChange('rotation', v)}
            />
          </div>
        </InspectorSection>

        {/* Text specific inspector */}
        {isText && (
          <InspectorSection id="typography" title="Tipografia e Textos">
            {/* Real content */}
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wide block">Conteúdo Escrito</span>
              <textarea
                id="prop-text-content"
                value={element.text || ''}
                onChange={(e) => handlePropertyChange('text', e.target.value)}
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800/80 focus:border-indigo-500 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                placeholder="Insira o texto..."
              />
            </div>

            {/* Font family selection */}
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wide block">Família de Fonte</span>
              <select
                id="prop-font-family"
                value={element.fontFamily || 'Inter'}
                onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800/80 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Font weights & styles */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wide block">Peso da Fonte</span>
                <select
                  id="prop-font-weight"
                  value={element.fontWeight || 'normal'}
                  onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800/80 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none cursor-pointer font-mono"
                >
                  {FONT_WEIGHTS.map((fw) => (
                    <option key={fw.value} value={fw.value}>
                      {fw.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wide block">Estilo Itálico</span>
                <select
                  id="prop-font-style"
                  value={element.fontStyle === 'italic' ? 'italic' : 'normal'}
                  onChange={(e) => handlePropertyChange('fontStyle', e.target.value === 'italic' ? 'italic' : 'normal')}
                  className="w-full bg-zinc-900 border border-zinc-800/80 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Itálico</option>
                </select>
              </div>
            </div>

            {/* Alignment selector */}
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wide block">Alinhamento Texto</span>
              <div className="flex bg-zinc-900 border border-zinc-850 rounded-lg p-0.5 gap-1 w-fit">
                {(['left', 'center', 'right'] as const).map((al) => (
                  <button
                    key={al}
                    onClick={() => handlePropertyChange('align', al)}
                    className={`p-2 rounded transition cursor-pointer ${
                      element.align === al 
                        ? 'bg-zinc-800 text-indigo-400 font-bold' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {al === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                    {al === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                    {al === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Sizing, Letter spacing & spacing */}
            <div className="space-y-3.5 pt-1.5">
              <InspectorSlider
                id="prop-fontsize"
                label="Tamanho da Fonte"
                value={element.fontSize || 32}
                min={8}
                max={200}
                unit="px"
                onChange={(v) => handlePropertyChange('fontSize', v)}
              />

              <InspectorSlider
                id="prop-letterspacing"
                label="Espaçamento Letras"
                value={element.letterSpacing || 0}
                min={-5}
                max={40}
                unit="px"
                onChange={(v) => handlePropertyChange('letterSpacing', v)}
              />

              <InspectorSlider
                id="prop-lineheight"
                label="Altura da Linha"
                value={element.lineHeight !== undefined ? Math.round(element.lineHeight * 10) / 10 : 1.2}
                min={0.5}
                max={3}
                step={0.1}
                unit="x"
                onChange={(v) => handlePropertyChange('lineHeight', v)}
              />

              <InspectorSlider
                id="prop-padding"
                label="Padding Interno"
                value={element.padding || 0}
                min={0}
                max={100}
                unit="px"
                onChange={(v) => handlePropertyChange('padding', v)}
              />
            </div>
          </InspectorSection>
        )}

        {/* Color Preenchimento */}
        {hasFill && (
          <InspectorSection id="fill" title="Preenchimento (Cor)">
            <InspectorColorPicker
              id="prop-fill"
              label="Cor do Objeto"
              value={element.fill}
              onChange={(col) => handlePropertyChange('fill', col)}
            />
          </InspectorSection>
        )}

        {/* Stroke Section (Contorno) */}
        <InspectorSection id="stroke" title="Contorno (Stroke)">
          <div className="space-y-3.5">
            <InspectorColorPicker
              id="prop-stroke"
              label="Cor do Contorno"
              value={element.stroke || '#4f46e5'}
              onChange={(col) => handlePropertyChange('stroke', col)}
            />
            <InspectorSlider
              id="prop-strokewidth"
              label="Espessura da Borda"
              value={element.strokeWidth || 0}
              min={0}
              max={20}
              unit="px"
              onChange={(v) => handlePropertyChange('strokeWidth', v)}
            />
          </div>
        </InspectorSection>

        {/* Radius, Shadow & Blur filters */}
        <InspectorSection id="effects" title="Bordas e Filtros">
          <div className="space-y-4">
            {hasRadius && (
              <InspectorSlider
                id="prop-radius"
                label="Arredondado (Radius)"
                value={element.cornerRadius || 0}
                min={0}
                max={100}
                unit="px"
                onChange={(v) => handlePropertyChange('cornerRadius', v)}
              />
            )}

            <InspectorSlider
              id="prop-blur"
              label="Filtro de Desfoque (Blur)"
              value={element.blur || 0}
              min={0}
              max={40}
              unit="px"
              onChange={(v) => handlePropertyChange('blur', v)}
            />
          </div>
        </InspectorSection>

        {/* Dropshadow Section */}
        <InspectorSection id="shadow" title="Sombra Projetada (Shadow)" defaultOpen={false}>
          <div className="space-y-4">
            <InspectorColorPicker
              id="prop-shadowcolor"
              label="Cor da Sombra"
              value={element.shadowColor || '#000000'}
              onChange={(col) => handlePropertyChange('shadowColor', col)}
            />
            
            <InspectorSlider
              id="prop-shadowblur"
              label="Desfoque da Sombra"
              value={element.shadowBlur || 0}
              min={0}
              max={40}
              unit="px"
              onChange={(v) => handlePropertyChange('shadowBlur', v)}
            />

            <InspectorSlider
              id="prop-shadowopacity"
              label="Opacidade da Sombra"
              value={Math.round((element.shadowOpacity ?? 0) * 100)}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => handlePropertyChange('shadowOpacity', v / 100)}
            />

            <div className="grid grid-cols-2 gap-3">
              <InspectorInput
                id="prop-shadowx"
                label="Deslocamento X"
                prefixText="X"
                unit="px"
                value={element.shadowOffsetX ?? 0}
                onChange={(v) => handlePropertyChange('shadowOffsetX', v)}
              />
              <InspectorInput
                id="prop-shadowy"
                label="Deslocamento Y"
                prefixText="Y"
                unit="px"
                value={element.shadowOffsetY ?? 0}
                onChange={(v) => handlePropertyChange('shadowOffsetY', v)}
              />
            </div>
          </div>
        </InspectorSection>

        {/* Timings Window */}
        <InspectorSection id="visibility-timeline" title="Tempo de Exibição" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3 font-mono">
            <InspectorInput
              id="prop-start"
              label="Tempo Início"
              prefixText="Início"
              unit="s"
              value={element.startTime}
              min={0}
              max={element.endTime}
              onChange={(v) => handlePropertyChange('startTime', v)}
            />
            <InspectorInput
              id="prop-end"
              label="Tempo Fim"
              prefixText="Fim"
              unit="s"
              value={element.endTime}
              min={element.startTime}
              max={activeProject.duration}
              onChange={(v) => handlePropertyChange('endTime', v)}
            />
          </div>
        </InspectorSection>

        {/* FFmpeg layers & order */}
        <InspectorSection id="layers-order" title="Camadas de Compilação" defaultOpen={false}>
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wide block">Grupo de Render FFmpeg</span>
              <select
                id="prop-layer"
                value={element.layer || 'overlay'}
                onChange={(e) => handlePropertyChange('layer', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800/80 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="background">Background (Fundo)</option>
                <option value="video">Video (Gameplay)</option>
                <option value="overlay">Overlay (Visual)</option>
                <option value="text">Text (Títulos/Legendas)</option>
                <option value="logo">Logo (Marcas d'água)</option>
                <option value="effects">Effects (Filtros/Progresso)</option>
              </select>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wide block">Z-Index (Canvas)</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    bringToFront(element.id);
                    showNotification('Objeto trazido para a frente!', 'info');
                  }}
                  className="flex items-center justify-center gap-1.5 p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 rounded-xl transition font-medium cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Trazer Frente</span>
                </button>
                <button
                  onClick={() => {
                    sendToBack(element.id);
                    showNotification('Objeto enviado para trás!', 'info');
                  }}
                  className="flex items-center justify-center gap-1.5 p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 rounded-xl transition font-medium cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Enviar Trás</span>
                </button>
              </div>
            </div>
          </div>
        </InspectorSection>

      </div>

      {/* Footer Controls (Actions) */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-900 grid grid-cols-2 gap-2 text-xs font-semibold shrink-0">
        <button
          onClick={() => {
            duplicateElement(element.id);
            showNotification('Elemento duplicado!', 'success');
          }}
          className="flex items-center justify-center gap-1.5 p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-xl transition cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Duplicar</span>
        </button>
        <button
          onClick={() => {
            deleteElement(element.id);
            showNotification('Elemento removido!', 'info');
          }}
          className="flex items-center justify-center gap-1.5 p-2.5 bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 rounded-xl transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Deletar</span>
        </button>
      </div>

    </div>
  );
}
