/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProjectStore } from '../../../../store/projectStore';
import { useUIStore } from '../../../../store/uiStore';
import { useEditorStore } from '../../../../store/editorStore';
import { Database, Plus, RefreshCw, Trash2, HelpCircle } from 'lucide-react';

export default function BulkPanel() {
  const { bulkRows, activeBulkRowIndex, setBulkRows, setActiveBulkRowIndex, clearBulkData } = useProjectStore();
  const { showNotification } = useUIStore();
  const { selectedElementId, updateElement } = useEditorStore();
  const [csvText, setCsvText] = useState('');
  const [showInput, setShowInput] = useState(false);

  const activeProject = useProjectStore((s) => s.getCurrentProject());
  const selectedElement = activeProject?.elements.find((el) => el.id === selectedElementId);

  // Parse comma-separated text into JSON list of row objects
  const handleParseCSV = () => {
    if (!csvText.trim()) {
      showNotification('Digite dados CSV válidos primeiro!', 'error');
      return;
    }

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        showNotification('O CSV deve conter pelo menos uma linha de cabeçalho e uma linha de dados!', 'error');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const parsedRows = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
        const rowObj: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          rowObj[header] = cols[index] || '';
        });
        parsedRows.push(rowObj);
      }

      if (parsedRows.length === 0) {
        showNotification('Nenhum registro encontrado no CSV!', 'error');
        return;
      }

      setBulkRows(parsedRows);
      setCsvText('');
      setShowInput(false);
      showNotification(`${parsedRows.length} linhas de dados importadas para renderização em massa!`, 'success');
    } catch (err) {
      showNotification('Erro ao processar CSV. Verifique a formatação.', 'error');
    }
  };

  const handleApplyVariableToSelected = (columnName: string) => {
    if (!selectedElement) {
      showNotification('Selecione primeiro um elemento de texto no canvas para vincular esta variável!', 'info');
      return;
    }
    if (selectedElement.type !== 'text' && selectedElement.type !== 'subtitle') {
      showNotification('Apenas elementos de texto podem receber variáveis dinâmicas!', 'error');
      return;
    }

    updateElement(selectedElement.id, { dynamicVariable: columnName });
    showNotification(`Elemento "${selectedElement.name}" agora renderiza a coluna "${columnName}"!`, 'success');
  };

  const headers = bulkRows.length > 0 ? Object.keys(bulkRows[0]) : [];

  return (
    <div className="flex flex-col h-full text-zinc-200">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-semibold flex items-center gap-1.5 text-zinc-100">
          <Database className="w-4 h-4 text-emerald-500" />
          Gerador em Massa (Planilha)
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Gere dezenas de variações de vídeo automaticamente conectando colunas aos elementos.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* Connection explanation */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
          <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
            Como funciona a edição em lote?
          </h4>
          <ol className="text-[11px] text-zinc-400 list-decimal pl-4 mt-1.5 space-y-1">
            <li>Carregue ou digite uma planilha de dados no editor.</li>
            <li>Selecione um elemento de texto no canvas central.</li>
            <li>Clique no botão <span className="text-emerald-400 font-semibold">Vincular</span> abaixo para associar o elemento à coluna.</li>
            <li>Navegue pelas linhas abaixo para pré-visualizar as variações de vídeo!</li>
          </ol>
        </div>

        {/* CSV input toggle */}
        {!showInput ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowInput(true);
                // Pre-populate with sample CSV format for ease of testing
                setCsvText(
                  "quote_text,author,product_name,old_price,new_price\n" +
                  "\"Não limite seus desafios. Desafie seus limites!\",- Desconhecido,Fone Pro Max,R$ 399,R$ 199\n" +
                  "\"Comece de onde você está. Use o que você tem.\",- Arthur Ashe,Smartwatch Fit,R$ 499,R$ 299\n" +
                  "\"A melhor forma de prever o futuro é criá-lo.\",- Peter Drucker,Teclado Mecânico,R$ 299,R$ 149"
                );
              }}
              className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl font-semibold text-xs text-indigo-400 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Importar Novos Dados
            </button>
            {bulkRows.length > 0 && (
              <button
                onClick={() => {
                  clearBulkData();
                  showNotification('Planilha de dados limpa.', 'info');
                }}
                className="px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-rose-500 hover:text-rose-400"
                title="Limpar dados"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 border border-zinc-800 bg-zinc-900/40 p-3 rounded-xl">
            <h4 className="text-xs font-semibold text-zinc-300">Pressione e Cole seu CSV (valores separados por vírgula):</h4>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="coluna1,coluna2,coluna3..."
              className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowInput(false)}
                className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleParseCSV}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
              >
                Processar CSV
              </button>
            </div>
          </div>
        )}

        {/* Column variable mappings */}
        {headers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Mapeamento de Colunas</h4>
            <p className="text-[10px] text-zinc-500">
              Selecione um elemento de texto no Canvas e clique em uma coluna para mapear:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {headers.map((col) => {
                // Check if any element in active template currently uses this column
                const isMapped = activeProject?.elements.some((el) => el.dynamicVariable === col);

                return (
                  <button
                    key={col}
                    onClick={() => handleApplyVariableToSelected(col)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
                      isMapped
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-indigo-500'
                    }`}
                  >
                    <span>{col}</span>
                    <Plus className="w-3 h-3 text-zinc-500" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loaded table preview rows */}
        {bulkRows.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Linhas da Planilha ({bulkRows.length})</h4>
              <span className="text-[10px] text-zinc-500 italic">Clique para pré-visualizar</span>
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pr-1">
              {bulkRows.map((row, index) => {
                const isActive = activeBulkRowIndex === index;
                const previewText = row[headers[0]] || Object.values(row)[0] || '';

                return (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveBulkRowIndex(index);
                      showNotification(`Pré-visualizando variação da Linha ${index + 1}!`, 'info');
                    }}
                    className={`w-full p-2.5 text-left border rounded-xl flex items-center justify-between transition focus:outline-none ${
                      isActive
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                        : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="truncate flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-500">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-medium truncate max-w-[160px]">
                        {previewText}
                      </span>
                    </div>
                    {isActive && (
                      <span className="text-[9px] bg-indigo-600 text-white font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Ativo
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
