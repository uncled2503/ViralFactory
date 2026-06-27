/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useAssetStore } from '../../../../store/assetStore';
import { useEditorStore } from '../../../../store/editorStore';
import { useUIStore } from '../../../../store/uiStore';
import { Upload, Music, Image as ImageIcon, Trash2, Plus } from 'lucide-react';

export default function AssetsPanel() {
  const { assets, addAsset, deleteAsset, getAssetsByCategory } = useAssetStore();
  const { addElement } = useEditorStore();
  const { showNotification, setActiveView } = useUIStore();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backgroundAssets = getAssetsByCategory('background');
  const userUploads = getAssetsByCategory('user_upload');
  const audioTracks = getAssetsByCategory('audio_track');

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      showNotification('Apenas arquivos de imagem, áudio ou vídeo são suportados!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const type: 'image' | 'video' | 'audio' = file.type.startsWith('image/') 
        ? 'image' 
        : file.type.startsWith('video/') 
          ? 'video' 
          : 'audio';

      addAsset({
        name: file.name,
        type,
        url: reader.result as string,
        thumbnailUrl: type === 'image' ? (reader.result as string) : undefined,
        category: 'user_upload',
      });
      showNotification(`Arquivo "${file.name}" carregado com sucesso!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleAddAssetToCanvas = (assetUrl: string, name: string) => {
    addElement('image', {
      imageUrl: assetUrl,
      name,
      width: 400,
      height: 400,
    });
    showNotification(`Imagem "${name}" adicionada ao canvas!`, 'info');
  };

  return (
    <div className="flex flex-col h-full text-zinc-200">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-semibold flex items-center gap-1.5 text-zinc-100">
          <Upload className="w-4 h-4 text-indigo-500" />
          Gerenciador de Arquivos
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Faça upload de logotipos, imagens ou trilhas de áudio para customizar seu vídeo.
        </p>

        {/* Link to advanced full screen Premiere Upload Manager */}
        <button
          onClick={() => setActiveView('uploads')}
          className="w-full mt-3 px-3 py-2 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-400 hover:text-white rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Painel do Projeto Completo (Premiere)</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* Upload Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-indigo-500 bg-indigo-500/10' 
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*"
            className="hidden"
          />
          <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold block text-zinc-300">Arraste arquivos aqui</span>
          <span className="text-[10px] text-zinc-500 block mt-1">Ou clique para procurar (Imagens, Vídeos ou Áudios)</span>
        </div>

        {/* User Uploads list */}
        {userUploads.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Meus Uploads</h4>
            <div className="grid grid-cols-2 gap-2">
              {userUploads.map((upload) => (
                <div key={upload.id} className="group relative rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden flex flex-col h-32">
                  <div className="flex-1 bg-zinc-950 flex items-center justify-center relative overflow-hidden">
                    {upload.type === 'image' && upload.thumbnailUrl ? (
                      <img src={upload.thumbnailUrl} alt={upload.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Music className="w-8 h-8 text-indigo-400" />
                    )}
                    {/* Add hover cover buttons */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      {upload.type === 'image' ? (
                        <button
                          onClick={() => handleAddAssetToCanvas(upload.url, upload.name)}
                          className="p-1.5 bg-indigo-600 rounded-full hover:bg-indigo-500 text-white"
                          title="Adicionar ao editor"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-300 bg-zinc-900 px-2 py-1 rounded">Áudio</span>
                      )}
                      <button
                        onClick={() => {
                          deleteAsset(upload.id);
                          showNotification('Upload removido.', 'info');
                        }}
                        className="p-1.5 bg-rose-600 rounded-full hover:bg-rose-500 text-white"
                        title="Deletar arquivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-1.5 text-center bg-zinc-900">
                    <span className="text-[10px] font-medium block truncate text-zinc-400 group-hover:text-zinc-200">
                      {upload.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preset background library */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Planos de Fundo</h4>
          <div className="grid grid-cols-2 gap-2">
            {backgroundAssets.map((bg) => (
              <button
                key={bg.id}
                onClick={() => handleAddAssetToCanvas(bg.url, bg.name)}
                className="group relative rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden text-left focus:outline-none h-20"
              >
                <img src={bg.thumbnailUrl || bg.url} alt={bg.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition duration-200" referrerPolicy="no-referrer" />
                <div className="absolute inset-x-0 bottom-0 bg-zinc-950/70 p-1 text-center">
                  <span className="text-[10px] text-zinc-300 group-hover:text-white truncate block">{bg.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preset audio tracks list */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Trilhas Sonoras</h4>
          <div className="space-y-2">
            {audioTracks.map((track) => (
              <div key={track.id} className="flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center">
                    <Music className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold block text-zinc-200 truncate">{track.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">06:12</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Prepend audio track to active background audio slot or notify
                    showNotification(`Trilha "${track.name}" selecionada como áudio de fundo!`, 'success');
                  }}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] rounded-lg transition"
                >
                  Usar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
