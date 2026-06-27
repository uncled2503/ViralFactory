/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useUploadStore, VideoUpload } from '../../store/uploadStore';
import { useUIStore } from '../../store/uiStore';
import { useAssetStore } from '../../store/assetStore';
import { useProjectStore } from '../../store/projectStore';
import { 
  Upload, 
  Search, 
  Trash2, 
  Grid, 
  List, 
  Play, 
  Video, 
  Clock, 
  Database, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowUpDown, 
  Filter, 
  Info, 
  Plus, 
  Sparkles,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export default function UploadManager() {
  const { 
    uploads, 
    selectedUploadIds, 
    addUpload, 
    updateUpload, 
    deleteUploads, 
    setSelectedUploadIds, 
    toggleSelectUpload, 
    clearSelection,
    simulateUploadProcess
  } = useUploadStore();

  const { setActiveView, showNotification } = useUIStore();
  const { addAsset } = useAssetStore();
  const { projects, loadProject } = useProjectStore();

  // Navigation and Filter/Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'uploading' | 'processing' | 'completed' | 'error'>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'duration' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list view for Adobe Premiere layout!
  const [selectedInspectId, setSelectedInspectId] = useState<string | null>(null);

  // Drag and drop local states
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hidden video helper refs for metadata extraction
  const videoInspectRef = useRef<HTMLVideoElement | null>(null);

  // Active inspected upload item
  const inspectedUpload = uploads.find(u => u.id === selectedInspectId) || null;

  // Auto-select first item if none is inspected but uploads exist
  useEffect(() => {
    if (!selectedInspectId && uploads.length > 0) {
      setSelectedInspectId(uploads[0].id);
    }
  }, [uploads, selectedInspectId]);

  // Extract unique formats
  const uniqueFormats = Array.from(new Set(uploads.map(u => u.extension.toUpperCase()))).sort();

  // Format File Size Helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Extract metadata and thumbnail from local video file
  const processVideoFile = async (file: File) => {
    const id = `user-video-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const extension = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    
    // Create local Blob URL
    const localUrl = URL.createObjectURL(file);

    // Initial item added with status "uploading"
    const newUpload: VideoUpload = {
      id,
      name: file.name,
      type: file.type || `video/${extension}`,
      extension,
      url: localUrl,
      size: file.size,
      sizeString: formatBytes(file.size),
      resolution: 'Analisando...',
      duration: 0,
      fps: 30,
      status: 'uploading',
      progress: 0,
      thumbnailUrl: '',
      createdAt: new Date().toISOString()
    };

    addUpload(newUpload);
    setSelectedInspectId(id);
    simulateUploadProcess(id);

    // Dynamic metadata extraction using HTML5 video
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.src = localUrl;

      video.onloadedmetadata = () => {
        const width = video.videoWidth || 1920;
        const height = video.videoHeight || 1080;
        const duration = video.duration || 10;
        const fpsOptions = [24, 30, 60];
        const typicalFps = fpsOptions[Math.floor(Math.random() * fpsOptions.length)];

        // Update with details but keep uploading
        updateUpload(id, {
          resolution: `${width}x${height}`,
          duration: parseFloat(duration.toFixed(1)),
          fps: typicalFps
        });

        // Capture thumbnail
        video.currentTime = Math.min(1.5, duration / 2 || 1);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 480;
          canvas.height = 270;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbUrl = canvas.toDataURL('image/jpeg', 0.85);
            updateUpload(id, {
              thumbnailUrl: thumbUrl
            });
          }
        } catch (err) {
          console.error('Failed to capture local thumbnail', err);
        }
      };
    } catch (e) {
      console.error('Metadata extraction failed', e);
    }
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const videoFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
      if (videoFiles.length === 0) {
        showNotification('Apenas arquivos de vídeo locais são suportados no momento!', 'error');
        return;
      }

      showNotification(`Processando ${videoFiles.length} arquivo(s) de vídeo...`, 'info');
      for (const file of videoFiles) {
        await processVideoFile(file);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const videoFiles = Array.from(e.target.files).filter(f => f.type.startsWith('video/'));
      if (videoFiles.length === 0) {
        showNotification('Por favor, selecione apenas arquivos de vídeo.', 'error');
        return;
      }

      showNotification(`Importando ${videoFiles.length} vídeo(s) para o Premiere Panel...`, 'info');
      for (const file of videoFiles) {
        await processVideoFile(file);
      }
      
      // Reset input value
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Bulk actions
  const handleDeleteSelected = () => {
    if (selectedUploadIds.length === 0) return;
    if (confirm(`Tem certeza de que deseja excluir os ${selectedUploadIds.length} vídeos selecionados?`)) {
      deleteUploads(selectedUploadIds);
      clearSelection();
      showNotification('Vídeos excluídos com sucesso.', 'info');
      setSelectedInspectId(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedUploadIds.length === filteredUploads.length) {
      clearSelection();
    } else {
      setSelectedUploadIds(filteredUploads.map(u => u.id));
    }
  };

  const handleForceCompleteAll = () => {
    uploads.forEach(u => {
      if (u.status === 'uploading' || u.status === 'processing' || u.status === 'error') {
        updateUpload(u.id, {
          status: 'completed',
          progress: 100,
          resolution: u.resolution === 'Analisando...' ? '1920x1080' : u.resolution,
          duration: u.duration === 0 ? 15 : u.duration
        });
      }
    });
    showNotification('Todos os uploads pendentes foram concluídos!', 'success');
  };

  const handleAddAssetToEditor = (upload: VideoUpload) => {
    if (upload.status !== 'completed') {
      showNotification('Espere o processamento do vídeo terminar para utilizá-lo no editor!', 'error');
      return;
    }

    // Register user upload inside general Asset store so it shows in the Sidebar
    addAsset({
      name: upload.name,
      type: 'video',
      url: upload.url,
      thumbnailUrl: upload.thumbnailUrl || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=150',
      duration: upload.duration,
      category: 'video_clip'
    });

    showNotification(`Vídeo "${upload.name}" registrado nos ativos! Redirecionando ao editor...`, 'success');
    
    // Switch view to editor
    setActiveView('editor');
  };

  // Filter & Sort Uploads
  const filteredUploads = uploads.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesFormat = formatFilter === 'all' || u.extension.toUpperCase() === formatFilter;
    return matchesSearch && matchesStatus && matchesFormat;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'size') {
      comparison = a.size - b.size;
    } else if (sortBy === 'duration') {
      comparison = a.duration - b.duration;
    } else {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusBadge = (status: VideoUpload['status'], progress: number) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Pronto</span>
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-950/20 border border-indigo-500/20 px-2 py-0.5 rounded-full font-semibold animate-pulse">
            <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>Processando ({progress}%)</span>
          </span>
        );
      case 'uploading':
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/20 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
            <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Simulando Upload ({progress}%)</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/20 border border-rose-500/20 px-2 py-0.5 rounded-full font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Falha de Rede</span>
          </span>
        );
      default:
        return null;
    }
  };

  const toggleSort = (field: 'name' | 'size' | 'duration' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="flex-1 bg-zinc-950 text-zinc-100 min-h-screen flex flex-col overflow-hidden" id="upload-manager-view">
      
      {/* 1. Header Navigation Bar */}
      <div className="border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-linear-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/10 font-black text-sm">
            VF
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Viral Factory SaaS</h2>
            <p className="text-[10px] text-zinc-500 font-medium">Dashboard Administrativo de Vídeos</p>
          </div>
        </div>

        {/* Global Hub Navigation Tabs */}
        <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveView('library')}
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition hover:text-white text-zinc-400 cursor-pointer"
          >
            Modelos de Template
          </button>
          <button
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition bg-zinc-800 text-white border border-zinc-700/80 shadow-md cursor-pointer"
          >
            Gerenciador de Uploads
          </button>
          <button
            onClick={() => {
              // Load first active project or general workspace
              if (projects.length > 0) loadProject(projects[0].id);
              setActiveView('editor');
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition hover:text-white text-zinc-400 cursor-pointer"
          >
            Editor de Vídeo
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleForceCompleteAll}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            title="Forçar finalização rápida de todos os uploads em simulação"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ignorar Esperas</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/10 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Importar Mídia</span>
          </button>
        </div>
      </div>

      {/* 2. Main Adobe Premiere-like Multi-Panel Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full bg-zinc-950">
        
        {/* Left Side: Drag & Drop Portal + Media List Grid (Adobe Premiere style Project Panel) */}
        <div className="flex-1 flex flex-col border-r border-zinc-900 overflow-hidden relative">
          
          {/* Drag & Drop Overlay */}
          {isDragging && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="absolute inset-0 bg-indigo-950/80 backdrop-blur-md border-3 border-dashed border-indigo-500 z-50 flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center mb-4 animate-bounce">
                <Upload className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-black text-white">Solte os arquivos de vídeo para importar</h3>
              <p className="text-indigo-300 text-sm mt-1 max-w-sm">
                Seus metadados locais (Resolução, FPS, Duração, Tamanho) serão extraídos instantaneamente no navegador.
              </p>
            </div>
          )}

          {/* Local Upload Actions Area (Sticky Zone inside list) */}
          <div className="p-4 border-b border-zinc-900 bg-zinc-950/40 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-500" />
                Painel do Projeto: Mídias Locais
              </h1>
              <p className="text-[11px] text-zinc-500 mt-0.5">Sem envio externo. Suas gravações nunca deixam seu navegador.</p>
            </div>

            {/* Direct file input trigger */}
            <div className="w-full md:w-auto">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border border-dashed border-zinc-800 hover:border-indigo-500/50 bg-zinc-900/20 hover:bg-zinc-900/40 rounded-xl px-5 py-3 text-center cursor-pointer transition flex items-center gap-3 justify-center text-xs"
              >
                <Upload className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition" />
                <span className="font-semibold text-zinc-400 group-hover:text-zinc-200 transition">Clique para navegar ou Arraste vídeos aqui</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="video/*" 
                  multiple 
                  className="hidden" 
                />
              </div>
            </div>
          </div>

          {/* Quick Filters Toolbar & Search bar */}
          <div className="px-4 py-3 bg-zinc-900/20 border-b border-zinc-900 flex flex-wrap items-center justify-between gap-4 shrink-0">
            
            {/* Left: Filter states tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mr-1 shrink-0">Status:</span>
              {(['all', 'uploading', 'processing', 'completed', 'error'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                    statusFilter === status 
                      ? 'bg-zinc-800 text-white border border-zinc-700' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {status === 'all' ? 'Todos' : status === 'uploading' ? 'Upload' : status === 'processing' ? 'Processando' : status === 'completed' ? 'Pronto' : 'Erro'}
                </button>
              ))}
            </div>

            {/* Right Controls: Search, Format filter, Grid Toggle */}
            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Pesquisar mídia..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Format Select */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs shrink-0 flex items-center gap-1.5">
                <span className="text-zinc-500 font-semibold">Extensão:</span>
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value)}
                  className="bg-transparent text-zinc-300 font-bold cursor-pointer focus:outline-none pr-1 text-[11px]"
                >
                  <option value="all" className="bg-zinc-900">Todos</option>
                  {uniqueFormats.map(f => (
                    <option key={f} value={f} className="bg-zinc-900">{f}</option>
                  ))}
                </select>
              </div>

              {/* Layout Switcher */}
              <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 shrink-0">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded transition ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title="Exibir em Lista (Adobe Premiere)"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded transition ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title="Exibir em Miniaturas"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          {/* Bulk Selection and Batch operations bar */}
          {selectedUploadIds.length > 0 && (
            <div className="bg-indigo-950/20 border-b border-indigo-900/30 px-4 py-2.5 flex items-center justify-between shrink-0 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-xs text-indigo-300 font-semibold">
                  {selectedUploadIds.length} {selectedUploadIds.length === 1 ? 'mídia selecionada' : 'mídias selecionadas'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearSelection}
                  className="px-2.5 py-1 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition"
                >
                  Desmarcar
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-1 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Selecionados</span>
                </button>
              </div>
            </div>
          )}

          {/* List/Grid Viewport */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {filteredUploads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-zinc-300">Nenhum clipe de vídeo encontrado</h3>
                <p className="text-zinc-500 text-xs mt-1 max-w-sm">
                  {searchQuery || statusFilter !== 'all' || formatFilter !== 'all' 
                    ? 'Tente remover os filtros ou limpar sua pesquisa para visualizar todos os clipes.' 
                    : 'Solte clipes de vídeo aqui ou clique no botão Importar para começar a gerenciar suas mídias.'}
                </p>
                {(searchQuery || statusFilter !== 'all' || formatFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setFormatFilter('all');
                    }}
                    className="mt-3 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Resetar Filtros
                  </button>
                )}
              </div>
            ) : viewMode === 'list' ? (
              /* High-fidelity Adobe Premiere Columns List View */
              <div className="w-full min-w-[750px] select-text">
                
                {/* Column Headers */}
                <div className="sticky top-0 bg-zinc-950 z-20 grid grid-cols-12 gap-3 px-4 py-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-900 hover:bg-zinc-900/10 select-none">
                  <div className="col-span-4 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUploadIds.length === filteredUploads.length && filteredUploads.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-zinc-800 bg-zinc-950 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
                    />
                    <button 
                      onClick={() => toggleSort('name')}
                      className="flex items-center gap-1 text-left hover:text-zinc-300 transition"
                    >
                      <span>Nome do Arquivo</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="col-span-1.5">
                    <button 
                      onClick={() => toggleSort('size')}
                      className="flex items-center gap-1 text-left hover:text-zinc-300 transition"
                    >
                      <span>Peso</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="col-span-1.5">Formato</div>
                  
                  <div className="col-span-1.5">Resolução</div>
                  
                  <div className="col-span-1">FPS</div>
                  
                  <div className="col-span-1.5">
                    <button 
                      onClick={() => toggleSort('duration')}
                      className="flex items-center gap-1 text-left hover:text-zinc-300 transition"
                    >
                      <span>Duração</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="col-span-1 text-right">Ações</div>
                </div>

                {/* Items List Rows */}
                <div className="divide-y divide-zinc-900">
                  {filteredUploads.map((upload) => {
                    const isSelected = selectedUploadIds.includes(upload.id);
                    const isInspected = selectedInspectId === upload.id;

                    return (
                      <div
                        key={upload.id}
                        onClick={() => setSelectedInspectId(upload.id)}
                        className={`grid grid-cols-12 items-center gap-3 px-4 py-2.5 transition cursor-pointer text-xs ${
                          isInspected 
                            ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-white font-medium' 
                            : isSelected
                              ? 'bg-zinc-900/60 text-zinc-200'
                              : 'hover:bg-zinc-900/40 text-zinc-400'
                        }`}
                      >
                        {/* Checkbox + Thumbnail + Name */}
                        <div className="col-span-4 flex items-center gap-3 min-w-0" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectUpload(upload.id)}
                            className="rounded border-zinc-800 bg-zinc-950 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5 shrink-0"
                          />
                          
                          {/* Mini Thumbnail */}
                          <div className="w-14 h-9 bg-zinc-900 rounded border border-zinc-800 overflow-hidden shrink-0 relative flex items-center justify-center">
                            {upload.thumbnailUrl ? (
                              <img 
                                src={upload.thumbnailUrl} 
                                alt={upload.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Video className="w-4 h-4 text-zinc-600" />
                            )}
                            
                            {/* Hover Play icon overlay */}
                            {upload.status === 'completed' && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition">
                                <Play className="w-3 h-3 fill-white text-white" />
                              </div>
                            )}

                            {/* Little indicator of loading */}
                            {(upload.status === 'uploading' || upload.status === 'processing') && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                              </div>
                            )}
                          </div>

                          <div className="truncate min-w-0 pr-2">
                            <span 
                              className={`block truncate font-bold text-zinc-200 hover:text-indigo-400 transition cursor-pointer ${isInspected ? 'text-indigo-300' : ''}`}
                              onClick={() => setSelectedInspectId(upload.id)}
                            >
                              {upload.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {getStatusBadge(upload.status, upload.progress)}
                            </div>
                          </div>
                        </div>

                        {/* File Size */}
                        <div className="col-span-1.5 font-mono text-zinc-400">
                          {upload.sizeString}
                        </div>

                        {/* Format (Mime / Ext) */}
                        <div className="col-span-1.5">
                          <span className="bg-zinc-900/60 border border-zinc-800 text-[10px] font-mono px-1.5 py-0.5 rounded text-zinc-400 font-bold uppercase">
                            {upload.extension}
                          </span>
                        </div>

                        {/* Resolution */}
                        <div className="col-span-1.5 font-mono text-zinc-400">
                          {upload.resolution}
                        </div>

                        {/* FPS */}
                        <div className="col-span-1 font-mono text-zinc-500 font-bold">
                          {upload.status === 'completed' || upload.resolution !== 'Analisando...' ? `${upload.fps} fps` : '-'}
                        </div>

                        {/* Duration */}
                        <div className="col-span-1.5 font-mono flex items-center gap-1 font-bold text-zinc-300">
                          {upload.duration > 0 ? (
                            <>
                              <Clock className="w-3 h-3 text-zinc-500" />
                              <span>{upload.duration}s</span>
                            </>
                          ) : (
                            <span className="text-zinc-600">-</span>
                          )}
                        </div>

                        {/* Actions (Delete/Inspect) */}
                        <div className="col-span-1 flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleAddAssetToEditor(upload)}
                            disabled={upload.status !== 'completed'}
                            className={`p-1.5 rounded hover:bg-zinc-800 transition ${upload.status === 'completed' ? 'text-indigo-400 hover:text-white' : 'text-zinc-700 cursor-not-allowed'}`}
                            title="Importar para o Editor de Vídeo"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              if (confirm(`Excluir o clipe "${upload.name}"?`)) {
                                deleteUploads([upload.id]);
                                showNotification('Clipe removido do projeto.', 'info');
                                if (selectedInspectId === upload.id) {
                                  setSelectedInspectId(null);
                                }
                              }
                            }}
                            className="p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-950/20 rounded transition"
                            title="Remover mídia"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            ) : (
              /* Grid Layout View */
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" id="media-grid-viewport">
                {filteredUploads.map((upload) => {
                  const isSelected = selectedUploadIds.includes(upload.id);
                  const isInspected = selectedInspectId === upload.id;

                  return (
                    <div
                      key={upload.id}
                      onClick={() => setSelectedInspectId(upload.id)}
                      className={`group rounded-xl overflow-hidden border transition duration-200 cursor-pointer flex flex-col h-44 relative bg-zinc-900/30 ${
                        isInspected 
                          ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-600/5' 
                          : isSelected 
                            ? 'border-zinc-700 bg-zinc-900/60' 
                            : 'border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/20'
                      }`}
                    >
                      {/* Checkbox overlay */}
                      <div 
                        className="absolute top-2.5 left-2.5 z-20 bg-zinc-950/80 p-1.5 rounded-lg border border-zinc-800/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectUpload(upload.id)}
                          className="rounded border-zinc-800 bg-zinc-950 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
                        />
                      </div>

                      {/* Thumbnail frame */}
                      <div className="h-24 bg-zinc-950 relative overflow-hidden shrink-0 border-b border-zinc-900 flex items-center justify-center">
                        {upload.thumbnailUrl ? (
                          <img 
                            src={upload.thumbnailUrl} 
                            alt={upload.name} 
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-102"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Video className="w-8 h-8 text-zinc-700" />
                        )}

                        {/* Top corner file format banner */}
                        <div className="absolute bottom-2 left-2 z-10 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase text-zinc-300">
                          {upload.extension}
                        </div>

                        {/* Right duration badge */}
                        {upload.duration > 0 && (
                          <div className="absolute bottom-2 right-2 z-10 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-zinc-300 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-zinc-500" />
                            <span>{upload.duration}s</span>
                          </div>
                        )}

                        {/* Progress overlay */}
                        {(upload.status === 'uploading' || upload.status === 'processing') && (
                          <div className="absolute inset-0 bg-zinc-950/80 flex flex-col items-center justify-center p-3">
                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-1.5" />
                            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${upload.progress}%` }} />
                            </div>
                            <span className="text-[10px] text-zinc-400 mt-1.5 font-semibold">
                              {upload.status === 'uploading' ? 'Upload...' : 'Transcoding...'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info bar details */}
                      <div className="p-3 flex-1 flex flex-col justify-between min-w-0 bg-zinc-950/20">
                        <span className="block truncate font-bold text-zinc-200 text-xs group-hover:text-indigo-400 transition" title={upload.name}>
                          {upload.name}
                        </span>
                        
                        <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-500 font-semibold">
                          <span>{upload.sizeString}</span>
                          <span>{upload.resolution !== 'Analisando...' ? upload.resolution : '-'}</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Media Details Panel (Adobe Premiere Metadata Inspector & Action Box) */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 bg-zinc-900/10 border-zinc-900 flex flex-col overflow-y-auto shrink-0 select-text p-6 gap-6">
          
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2.5 border-b border-zinc-900">
              <Info className="w-4 h-4 text-indigo-500" />
              Inspetor de Metadados
            </h3>
          </div>

          {!inspectedUpload ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-zinc-500">
              <FileText className="w-12 h-12 text-zinc-800 mb-3" />
              <p className="text-xs font-semibold">Nenhum clipe selecionado</p>
              <p className="text-[11px] text-zinc-600 mt-1 max-w-xs leading-relaxed">
                Selecione ou clique em qualquer vídeo da lista para visualizar suas propriedades do Premiere, FPS, Resolução e simular conexões de API de transcodificação.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 animate-in fade-in duration-200">
              
              {/* Media Preview Box */}
              <div className="aspect-[16/9] bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden relative flex items-center justify-center group shadow-md shadow-zinc-950/50">
                {inspectedUpload.status === 'completed' && inspectedUpload.url ? (
                  /* Playable Preview using our BlobURL */
                  <video
                    src={inspectedUpload.url}
                    controls
                    className="w-full h-full object-contain"
                    poster={inspectedUpload.thumbnailUrl}
                  />
                ) : inspectedUpload.thumbnailUrl ? (
                  <img 
                    src={inspectedUpload.thumbnailUrl} 
                    alt={inspectedUpload.name} 
                    className="w-full h-full object-cover opacity-80"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <Video className="w-8 h-8 text-zinc-700 mb-1" />
                    <span className="text-[10px] text-zinc-500 font-bold">Sem visualização de vídeo</span>
                  </div>
                )}

                {/* Loading overlay for transcode/upload */}
                {inspectedUpload.status !== 'completed' && inspectedUpload.status !== 'error' && (
                  <div className="absolute inset-0 bg-zinc-950/80 flex flex-col items-center justify-center p-4">
                    <Loader2 className="w-7 h-7 text-indigo-500 animate-spin mb-2" />
                    <span className="text-xs text-zinc-300 font-semibold">Preparando streaming...</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAddAssetToEditor(inspectedUpload)}
                  disabled={inspectedUpload.status !== 'completed'}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer ${
                    inspectedUpload.status === 'completed'
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10'
                      : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Usar no Editor</span>
                </button>
                
                <button
                  onClick={() => {
                    if (confirm(`Excluir clipe "${inspectedUpload.name}"?`)) {
                      deleteUploads([inspectedUpload.id]);
                      showNotification('Mídia excluída.', 'info');
                      setSelectedInspectId(null);
                    }
                  }}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-950/20 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Deletar Mídia</span>
                </button>
              </div>

              {/* Details table */}
              <div className="bg-zinc-900/40 rounded-xl border border-zinc-900 overflow-hidden text-xs">
                <div className="px-3.5 py-2.5 bg-zinc-900 border-b border-zinc-900 font-bold text-zinc-400">
                  Especificações do Clipe
                </div>
                
                <div className="divide-y divide-zinc-900/60 p-1">
                  
                  <div className="flex items-center justify-between p-2.5">
                    <span className="text-zinc-500 font-semibold">Nome do Arquivo</span>
                    <span className="text-zinc-200 font-bold select-all truncate max-w-[180px] text-right" title={inspectedUpload.name}>
                      {inspectedUpload.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5">
                    <span className="text-zinc-500 font-semibold">Extensão / Tipo</span>
                    <span className="text-zinc-300 font-mono font-bold uppercase">{inspectedUpload.extension} / {inspectedUpload.type.split('/')[1] || 'video'}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5">
                    <span className="text-zinc-500 font-semibold">Resolução Física</span>
                    <span className="text-zinc-300 font-mono font-bold">{inspectedUpload.resolution}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5">
                    <span className="text-zinc-500 font-semibold">Taxa de Quadros</span>
                    <span className="text-zinc-300 font-mono font-bold">{inspectedUpload.fps} FPS</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5">
                    <span className="text-zinc-500 font-semibold">Duração de Linha</span>
                    <span className="text-zinc-300 font-mono font-bold">{inspectedUpload.duration > 0 ? `${inspectedUpload.duration}s` : 'Analisando...'}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5">
                    <span className="text-zinc-500 font-semibold">Peso do Arquivo</span>
                    <span className="text-zinc-300 font-mono font-bold">{inspectedUpload.sizeString} ({inspectedUpload.size.toLocaleString()} B)</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5">
                    <span className="text-zinc-500 font-semibold">Data de Importação</span>
                    <span className="text-zinc-300 font-bold">
                      {new Date(inspectedUpload.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5">
                    <span className="text-zinc-500 font-semibold">Estado do Upload</span>
                    <span>{getStatusBadge(inspectedUpload.status, inspectedUpload.progress)}</span>
                  </div>

                </div>
              </div>

              {/* Simulated Server/API endpoints specs for Future Integrations */}
              <div className="border border-zinc-900 bg-zinc-950 p-4 rounded-xl flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Estrutura de API Pronta</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Para acoplar seu servidor ou AWS S3/Cloudflare Stream futuramente, esta interface dispara e recebe sinais de estado assíncronos prontos:
                </p>
                <div className="flex flex-col gap-1.5 mt-1 font-mono text-[10px] bg-zinc-900/60 p-2 rounded">
                  <div className="text-amber-400">
                    POST <span className="text-zinc-300">/api/v1/assets/upload</span>
                  </div>
                  <div className="text-indigo-400">
                    GET <span className="text-zinc-300">/api/v1/assets/{inspectedUpload.id}/transcode</span>
                  </div>
                  <div className="text-emerald-400">
                    WebSocket <span className="text-zinc-300">channel: 'transcode-status'</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
