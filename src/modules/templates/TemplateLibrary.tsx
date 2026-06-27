/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { Template } from '../../types';
import { 
  Search, 
  Grid, 
  List, 
  Star, 
  Trash2, 
  Copy, 
  Edit3, 
  Plus, 
  Video, 
  Tag, 
  Calendar, 
  Clock, 
  X, 
  Check,
  Sparkles,
  Smartphone,
  Tv,
  Square,
  Sliders,
  ChevronRight,
  FolderPlus,
  Play
} from 'lucide-react';

export default function TemplateLibrary() {
  const { 
    templates, 
    createTemplate, 
    deleteTemplate, 
    duplicateTemplate, 
    toggleFavoriteTemplate,
    updateTemplate,
    loadProject
  } = useProjectStore();

  const { setActiveView, showNotification } = useUIStore();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedFormat, setSelectedFormat] = useState<string>('Todos');
  const [selectedTag, setSelectedTag] = useState<string>('Todos');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name' | 'duration'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Quick Rename Modal/Prompt state
  const [renamingTemplateId, setRenamingTemplateId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // New Template Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  
  // New Template Form Fields
  const [newTplFormat, setNewTplFormat] = useState<'9:16' | '16:9' | '1:1' | '4:5'>('9:16');
  const [newTplWidth, setNewTplWidth] = useState(1080);
  const [newTplHeight, setNewTplHeight] = useState(1920);
  const [newTplDuration, setNewTplDuration] = useState(15);
  const [newTplName, setNewTplName] = useState('');
  const [newTplCategory, setNewTplCategory] = useState<Template['category']>('TikTok');
  const [newTplTagsString, setNewTplTagsString] = useState('');

  // 1. Categories List
  const categories: string[] = [
    'Todos', 
    'TikTok', 
    'Reels', 
    'Shorts', 
    'Stories', 
    'Feed', 
    'YouTube', 
    'Personalizados'
  ];

  // 2. Formats List
  const formats: string[] = ['Todos', '9:16', '16:9', '1:1', '4:5'];

  // 3. Extract unique tags from templates
  const allTags = Array.from(
    new Set(templates.flatMap(t => t.tags || []))
  ).sort();

  // 4. Handle Format Selection (Step 1) and auto-assign typical resolutions
  const handleSelectFormatInModal = (fmt: '9:16' | '16:9' | '1:1' | '4:5') => {
    setNewTplFormat(fmt);
    if (fmt === '9:16') {
      setNewTplWidth(1080);
      setNewTplHeight(1920);
      setNewTplCategory('TikTok');
    } else if (fmt === '16:9') {
      setNewTplWidth(1920);
      setNewTplHeight(1080);
      setNewTplCategory('YouTube');
    } else if (fmt === '1:1') {
      setNewTplWidth(1080);
      setNewTplHeight(1080);
      setNewTplCategory('Feed');
    } else if (fmt === '4:5') {
      setNewTplWidth(1080);
      setNewTplHeight(1350);
      setNewTplCategory('Personalizados');
    }
  };

  // 5. Create Template handler
  const handleCreateTemplate = () => {
    const finalName = newTplName.trim() || `Template ${newTplFormat} - Sem Nome`;
    const finalTags = newTplTagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const newId = createTemplate(
      finalName,
      newTplCategory,
      newTplFormat,
      newTplWidth,
      newTplHeight,
      newTplDuration,
      finalTags
    );

    setIsCreateModalOpen(false);
    resetCreateForm();
    showNotification('Template criado com sucesso! Abrindo no editor...', 'success');
    
    // Switch to editor
    loadProject(newId);
    setActiveView('editor');
  };

  const resetCreateForm = () => {
    setCreateStep(1);
    setNewTplFormat('9:16');
    setNewTplWidth(1080);
    setNewTplHeight(1920);
    setNewTplDuration(15);
    setNewTplName('');
    setNewTplCategory('TikTok');
    setNewTplTagsString('');
  };

  // 6. Rename Handler
  const startRename = (tpl: Template) => {
    setRenamingTemplateId(tpl.id);
    setRenameValue(tpl.name);
  };

  const submitRename = () => {
    if (!renamingTemplateId) return;
    if (!renameValue.trim()) {
      showNotification('O nome do template não pode estar vazio.', 'error');
      return;
    }
    updateTemplate(renamingTemplateId, { name: renameValue.trim() });
    setRenamingTemplateId(null);
    showNotification('Template renomeado com sucesso!', 'success');
  };

  // 7. Duplicate Handler
  const handleDuplicate = (id: string, name: string) => {
    duplicateTemplate(id);
    showNotification(`Duplicado "${name}" com sucesso!`, 'success');
  };

  // 8. Delete Handler
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza de que deseja excluir o template "${name}"?`)) {
      deleteTemplate(id);
      showNotification('Template excluído com sucesso.', 'info');
    }
  };

  // 9. Open Editor for a Template
  const handleOpenEditor = (id: string) => {
    loadProject(id);
    setActiveView('editor');
    showNotification('Editor carregado com sucesso.', 'info');
  };

  // 10. Filter and Sort Templates list
  const filteredTemplates = templates.filter(t => {
    // Search
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category
    const matchesCategory = selectedCategory === 'Todos' || t.category === selectedCategory;

    // Format
    const matchesFormat = selectedFormat === 'Todos' || t.format === selectedFormat;

    // Tag Filter
    const matchesTag = selectedTag === 'Todos' || t.tags.includes(selectedTag);

    // Favorite toggle
    const matchesFavorite = !showOnlyFavorites || t.favorito;

    return matchesSearch && matchesCategory && matchesFormat && matchesTag && matchesFavorite;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'duration') {
      return b.duration - a.duration;
    } else if (sortBy === 'created') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // Default: updated date
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'TikTok':
        return 'border-cyan-500/30 text-cyan-400 bg-cyan-950/10';
      case 'Reels':
        return 'border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-950/10';
      case 'Shorts':
        return 'border-red-500/30 text-red-400 bg-red-950/10';
      case 'Stories':
        return 'border-amber-500/30 text-amber-400 bg-amber-950/10';
      case 'Feed':
        return 'border-blue-500/30 text-blue-400 bg-blue-950/10';
      case 'YouTube':
        return 'border-rose-600/30 text-rose-400 bg-rose-950/10';
      default:
        return 'border-purple-500/30 text-purple-400 bg-purple-950/10';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 text-zinc-100 min-h-screen pb-16 animate-in fade-in duration-200" id="template-library-page">
      
      {/* SaaS Hub Top Bar */}
      <div className="border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/10 font-black text-xs">
            VF
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide">Viral Factory SaaS</h2>
            <p className="text-[9px] text-zinc-500 font-medium">Biblioteca de Mídias & Modelos</p>
          </div>
        </div>

        <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition bg-zinc-800 text-white border border-zinc-700/80 shadow-md cursor-pointer"
          >
            Modelos de Template
          </button>
          <button
            onClick={() => setActiveView('uploads')}
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition hover:text-white text-zinc-400 cursor-pointer"
            id="nav-to-uploads"
          >
            Gerenciador de Uploads
          </button>
          <button
            onClick={() => {
              setActiveView('editor');
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition hover:text-white text-zinc-400 cursor-pointer"
          >
            Editor de Vídeo
          </button>
        </div>
      </div>

      {/* Upper Brand Promo Area */}
      <div className="relative overflow-hidden border-b border-zinc-900 bg-linear-to-b from-zinc-900/50 to-zinc-950 px-8 py-10 md:px-12 md:py-14">
        {/* Abstract background circles */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-fuchsia-600/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
              Biblioteca de Templates
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-xl leading-relaxed">
              Crie conteúdos virais em segundos. Edite, gerencie e duplique seus designs com a mesma facilidade do Canva.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            id="btn-new-template"
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/25 transition cursor-pointer active:scale-98"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Novo Template</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-12 py-8 flex flex-col gap-6">
        
        {/* Controls Layout Block: Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-900 pb-4">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
                  isActive 
                    ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Filters, search, views, sort layout rail */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Grid Filters Rail */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Format Filter */}
            <div className="flex items-center gap-1.5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-zinc-500 font-medium">Formato:</span>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="bg-transparent text-zinc-300 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="Todos" className="bg-zinc-900">Todos</option>
                {formats.filter(f => f !== 'Todos').map(f => (
                  <option key={f} value={f} className="bg-zinc-900">{f}</option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div className="flex items-center gap-1.5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-zinc-500 font-medium">Tag:</span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-transparent text-zinc-300 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="Todos" className="bg-zinc-900">Todas as Tags</option>
                {allTags.map(t => (
                  <option key={t} value={t} className="bg-zinc-900">{t}</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-zinc-500 font-medium">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-zinc-300 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="updated" className="bg-zinc-900">Recentes</option>
                <option value="created" className="bg-zinc-900">Data Criação</option>
                <option value="name" className="bg-zinc-900">Nome (A-Z)</option>
                <option value="duration" className="bg-zinc-900">Duração</option>
              </select>
            </div>

            {/* Favorite Filter Toggle */}
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`p-2 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                showOnlyFavorites 
                  ? 'bg-amber-600/15 border-amber-500/40 text-amber-400' 
                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Filtrar por Favoritos"
            >
              <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            {/* Divider line */}
            <span className="h-6 w-[1px] bg-zinc-800" />

            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-zinc-800 text-white shadow-xs' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Visualização em Grid"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'list' 
                    ? 'bg-zinc-800 text-white shadow-xs' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Visualização em Lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedCategory !== 'Todos' || selectedFormat !== 'Todos' || selectedTag !== 'Todos' || showOnlyFavorites || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 -mt-2 bg-zinc-900/10 px-4 py-2 border border-zinc-900 rounded-xl text-xs text-zinc-400">
            <span>Filtros ativos:</span>
            {selectedCategory !== 'Todos' && (
              <span className="bg-zinc-900 px-2.5 py-0.5 rounded-md text-zinc-300 font-medium">Categoria: {selectedCategory}</span>
            )}
            {selectedFormat !== 'Todos' && (
              <span className="bg-zinc-900 px-2.5 py-0.5 rounded-md text-zinc-300 font-medium">Formato: {selectedFormat}</span>
            )}
            {selectedTag !== 'Todos' && (
              <span className="bg-zinc-900 px-2.5 py-0.5 rounded-md text-zinc-300 font-medium">Tag: {selectedTag}</span>
            )}
            {showOnlyFavorites && (
              <span className="bg-zinc-900 px-2.5 py-0.5 rounded-md text-zinc-300 font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Favoritos
              </span>
            )}
            {searchQuery && (
              <span className="bg-zinc-900 px-2.5 py-0.5 rounded-md text-zinc-300 font-medium">Busca: "{searchQuery}"</span>
            )}
            <button
              onClick={() => {
                setSelectedCategory('Todos');
                setSelectedFormat('Todos');
                setSelectedTag('Todos');
                setShowOnlyFavorites(false);
                setSearchQuery('');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline ml-auto cursor-pointer"
            >
              Limpar Todos
            </button>
          </div>
        )}

        {/* Main Grid / List Contents render */}
        {filteredTemplates.length === 0 ? (
          <div className="border border-zinc-900 bg-zinc-950 rounded-2xl py-24 flex flex-col items-center justify-center text-center px-4" id="empty-state">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Nenhum template encontrado</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-sm">
              Tente ajustar seus termos de pesquisa ou remover alguns filtros para explorar mais designs.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Todos');
                setSelectedFormat('Todos');
                setSelectedTag('Todos');
                setShowOnlyFavorites(false);
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold hover:bg-zinc-800 hover:text-white transition cursor-pointer"
            >
              Resetar Filtros
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="templates-grid-view">
            {filteredTemplates.map((tpl) => {
              const isRenaming = renamingTemplateId === tpl.id;
              
              return (
                <div 
                  key={tpl.id}
                  className="group bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl flex flex-col"
                >
                  {/* Thumbnail / Image container preview */}
                  <div className="aspect-[4/3] bg-zinc-950 relative overflow-hidden shrink-0 border-b border-zinc-900/60">
                    <img 
                      src={tpl.thumbnailUrl} 
                      alt={tpl.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Dark gradient shadow inside preview */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent opacity-100 transition-opacity" />

                    {/* Top hover quick actions overlay */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteTemplate(tpl.id);
                        }}
                        className={`p-2 rounded-lg backdrop-blur-md shadow-xs transition cursor-pointer ${
                          tpl.favorito 
                            ? 'bg-amber-500/20 text-amber-400' 
                            : 'bg-zinc-950/40 hover:bg-zinc-950/80 text-zinc-300 hover:text-white'
                        }`}
                        title={tpl.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                      >
                        <Star className={`w-3.5 h-3.5 ${tpl.favorito ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </div>

                    {/* Bottom layout metadata badge row inside preview */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                      <span className={`text-[9px] font-bold tracking-wider uppercase border rounded-md px-1.5 py-0.5 ${getCategoryColor(tpl.category)}`}>
                        {tpl.category}
                      </span>
                      
                      <div className="flex items-center gap-2 text-[10px] text-zinc-300 font-semibold font-mono bg-zinc-950/70 backdrop-blur-xs rounded-md px-1.5 py-0.5">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        <span>{tpl.duration}s</span>
                      </div>
                    </div>

                    {/* Hover Visual Edit Overlay */}
                    <div className="absolute inset-0 bg-zinc-950/65 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <button
                        onClick={() => handleOpenEditor(tpl.id)}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition cursor-pointer active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Editar Template</span>
                      </button>
                    </div>

                  </div>

                  {/* Info Card Body text info */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      
                      {/* Name input (if renaming) */}
                      {isRenaming ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="w-full bg-zinc-950 border border-indigo-500 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') submitRename();
                              if (e.key === 'Escape') setRenamingTemplateId(null);
                            }}
                          />
                          <button
                            onClick={submitRename}
                            className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-500"
                            title="Confirmar"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setRenamingTemplateId(null)}
                            className="p-1 bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700"
                            title="Cancelar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <h4 className="font-bold text-zinc-100 text-sm leading-snug truncate group-hover:text-indigo-400 transition" title={tpl.name}>
                          {tpl.name}
                        </h4>
                      )}

                      {/* Format Resolution string */}
                      <span className="text-[10px] font-semibold text-zinc-500 font-mono flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        <span>Formato {tpl.format} — {tpl.width}x{tpl.height}px</span>
                      </span>

                      {/* Tags pills */}
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {tpl.tags.map((tag) => (
                          <span 
                            key={tag} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTag(tag);
                            }}
                            className="text-[9px] bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-indigo-300 font-medium px-1.5 py-0.5 rounded transition cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex items-center justify-between border-t border-zinc-900/80 pt-3 mt-auto">
                      <span className="text-[9px] text-zinc-500 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(tpl.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startRename(tpl)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
                          title="Renomear"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(tpl.id, tpl.name)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tpl.id, tpl.name)}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View Layout */
          <div className="flex flex-col gap-3" id="templates-list-view">
            {/* Header row for list */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-900/60">
              <div className="col-span-5">Template</div>
              <div className="col-span-2">Categoria</div>
              <div className="col-span-2">Format / Resol</div>
              <div className="col-span-1">Duração</div>
              <div className="col-span-2 text-right">Ações</div>
            </div>

            {filteredTemplates.map((tpl) => {
              const isRenaming = renamingTemplateId === tpl.id;

              return (
                <div 
                  key={tpl.id}
                  className="grid grid-cols-12 items-center gap-4 bg-zinc-900/20 hover:bg-zinc-900 border border-zinc-900/60 rounded-xl p-3 transition"
                >
                  {/* Title and image block */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-16 h-12 bg-zinc-950 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                      <img 
                        src={tpl.thumbnailUrl} 
                        alt={tpl.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {isRenaming ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="w-full bg-zinc-950 border border-indigo-500 rounded px-2 py-1 text-xs text-zinc-100"
                            autoFocus
                          />
                          <button onClick={submitRename} className="p-1 bg-indigo-600 rounded text-white"><Check className="w-3 h-3" /></button>
                          <button onClick={() => setRenamingTemplateId(null)} className="p-1 bg-zinc-800 rounded text-zinc-400"><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <h4 
                          onClick={() => handleOpenEditor(tpl.id)}
                          className="font-bold text-zinc-200 text-xs truncate hover:text-indigo-400 transition cursor-pointer"
                        >
                          {tpl.name}
                        </h4>
                      )}
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tpl.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[8px] text-zinc-500">#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider border rounded-md px-2 py-0.5 ${getCategoryColor(tpl.category)}`}>
                      {tpl.category}
                    </span>
                  </div>

                  {/* Format & Resolution */}
                  <div className="col-span-2 text-xs text-zinc-400 font-medium font-mono">
                    <span className="text-zinc-500 font-semibold">{tpl.format}</span> ({tpl.width}x{tpl.height})
                  </div>

                  {/* Duration */}
                  <div className="col-span-1 text-xs text-zinc-400 font-bold font-mono">
                    {tpl.duration}s
                  </div>

                  {/* Action elements */}
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        toggleFavoriteTemplate(tpl.id);
                        showNotification(tpl.favorito ? 'Removido dos favoritos' : 'Adicionado aos favoritos', 'info');
                      }}
                      className={`p-1.5 rounded-lg transition ${tpl.favorito ? 'text-amber-400 hover:bg-amber-950/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                    >
                      <Star className={`w-3.5 h-3.5 ${tpl.favorito ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleOpenEditor(tpl.id)}
                      className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                    >
                      <span>Abrir</span>
                    </button>

                    <button
                      onClick={() => startRename(tpl)}
                      className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                      title="Renomear"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(tpl.id, tpl.name)}
                      className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                      title="Duplicar"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(tpl.id, tpl.name)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/10 rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 11. Custom Novo Template Step-by-Step Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md px-4" id="modal-new-template">
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col transform scale-100 transition-all">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FolderPlus className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Criar Novo Template</h3>
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Passo {createStep} de 3</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetCreateForm();
                }}
                className="text-zinc-500 hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Step Indicator */}
            <div className="px-6 pt-4 shrink-0">
              <div className="flex items-center gap-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full bg-indigo-500 transition-all duration-300 ${createStep === 1 ? 'w-1/3' : createStep === 2 ? 'w-2/3' : 'w-full'}`} />
              </div>
            </div>

            {/* Modal Body / Steps Viewport */}
            <div className="p-6 overflow-y-auto flex-1 min-h-[260px]">
              
              {/* PASSO 1: ESCOLHER FORMATO */}
              {createStep === 1 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="font-bold text-zinc-100 text-sm">Passo 1: Selecione o formato do layout</h4>
                    <p className="text-zinc-500 text-xs mt-0.5">Determine a proporção de tela ideal para a rede de destino.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    
                    {/* 9:16 Vertical Card */}
                    <button
                      onClick={() => handleSelectFormatInModal('9:16')}
                      className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col gap-3 ${
                        newTplFormat === '9:16'
                          ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-md shadow-indigo-600/5'
                          : 'bg-zinc-950/40 hover:bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Smartphone className="w-5 h-5 text-indigo-400" />
                        {newTplFormat === '9:16' && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs">Vertical (9:16)</h5>
                        <p className="text-[10px] text-zinc-500 mt-0.5">TikTok, Reels, Shorts, Stories</p>
                      </div>
                    </button>

                    {/* 16:9 Landscape Card */}
                    <button
                      onClick={() => handleSelectFormatInModal('16:9')}
                      className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col gap-3 ${
                        newTplFormat === '16:9'
                          ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-md shadow-indigo-600/5'
                          : 'bg-zinc-950/40 hover:bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Tv className="w-5 h-5 text-indigo-400" />
                        {newTplFormat === '16:9' && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs">Horizontal (16:9)</h5>
                        <p className="text-[10px] text-zinc-500 mt-0.5">YouTube, Vimeo, TV</p>
                      </div>
                    </button>

                    {/* 1:1 Square Card */}
                    <button
                      onClick={() => handleSelectFormatInModal('1:1')}
                      className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col gap-3 ${
                        newTplFormat === '1:1'
                          ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-md shadow-indigo-600/5'
                          : 'bg-zinc-950/40 hover:bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Square className="w-5 h-5 text-indigo-400" />
                        {newTplFormat === '1:1' && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs">Quadrado (1:1)</h5>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Instagram Feed, Ads</p>
                      </div>
                    </button>

                    {/* 4:5 Portrait Card */}
                    <button
                      onClick={() => handleSelectFormatInModal('4:5')}
                      className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col gap-3 ${
                        newTplFormat === '4:5'
                          ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-md shadow-indigo-600/5'
                          : 'bg-zinc-950/40 hover:bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Sliders className="w-5 h-5 text-indigo-400" />
                        {newTplFormat === '4:5' && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs">Retrato (4:5)</h5>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Feed Detalhado, Facebook</p>
                      </div>
                    </button>

                  </div>
                </div>
              )}

              {/* PASSO 2: ESCOLHER RESOLUÇÃO */}
              {createStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="font-bold text-zinc-100 text-sm">Passo 2: Defina a resolução em pixels</h4>
                    <p className="text-zinc-500 text-xs mt-0.5">Escolha uma resolução recomendada ou personalize livremente.</p>
                  </div>

                  {/* Recommended Resolutions based on format selection */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Predefinições Recomendadas</span>
                    
                    {newTplFormat === '9:16' && (
                      <button
                        onClick={() => { setNewTplWidth(1080); setNewTplHeight(1920); }}
                        className={`p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          newTplWidth === 1080 && newTplHeight === 1920
                            ? 'bg-zinc-850 border-indigo-500 text-white'
                            : 'bg-zinc-950/30 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span>Full HD Vertical (1080x1920px)</span>
                        <span className="font-mono text-zinc-500 font-bold">1080x1920</span>
                      </button>
                    )}

                    {newTplFormat === '16:9' && (
                      <button
                        onClick={() => { setNewTplWidth(1920); setNewTplHeight(1080); }}
                        className={`p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          newTplWidth === 1920 && newTplHeight === 1080
                            ? 'bg-zinc-850 border-indigo-500 text-white'
                            : 'bg-zinc-950/30 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span>Full HD Horizontal (1920x1080px)</span>
                        <span className="font-mono text-zinc-500 font-bold">1920x1080</span>
                      </button>
                    )}

                    {newTplFormat === '1:1' && (
                      <button
                        onClick={() => { setNewTplWidth(1080); setNewTplHeight(1080); }}
                        className={`p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          newTplWidth === 1080 && newTplHeight === 1080
                            ? 'bg-zinc-850 border-indigo-500 text-white'
                            : 'bg-zinc-950/30 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span>Instagram Quadrado (1080x1080px)</span>
                        <span className="font-mono text-zinc-500 font-bold">1080x1080</span>
                      </button>
                    )}

                    {newTplFormat === '4:5' && (
                      <button
                        onClick={() => { setNewTplWidth(1080); setNewTplHeight(1350); }}
                        className={`p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          newTplWidth === 1080 && newTplHeight === 1350
                            ? 'bg-zinc-850 border-indigo-500 text-white'
                            : 'bg-zinc-950/30 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span>Instagram Portrait (1080x1350px)</span>
                        <span className="font-mono text-zinc-500 font-bold">1080x1350</span>
                      </button>
                    )}
                  </div>

                  {/* Manual / Custom dimensions Inputs */}
                  <div className="flex flex-col gap-2 border-t border-zinc-800/80 pt-4 mt-1.5">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Ajuste Personalizado</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide block mb-1">Largura (px)</label>
                        <input
                          type="number"
                          value={newTplWidth}
                          onChange={(e) => setNewTplWidth(Math.max(100, parseInt(e.target.value) || 1080))}
                          className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide block mb-1">Altura (px)</label>
                        <input
                          type="number"
                          value={newTplHeight}
                          onChange={(e) => setNewTplHeight(Math.max(100, parseInt(e.target.value) || 1920))}
                          className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* PASSO 3: DURAÇÃO PADRÃO, NOME, TAGS */}
              {createStep === 3 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="font-bold text-zinc-100 text-sm">Passo 3: Configurações Gerais</h4>
                    <p className="text-zinc-500 text-xs mt-0.5">Determine as propriedades de identificação do template.</p>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    
                    {/* Template Name */}
                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide block mb-1">Nome do Template</label>
                      <input
                        type="text"
                        placeholder="Ex: Reels Comercial de Desconto"
                        value={newTplName}
                        onChange={(e) => setNewTplName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none transition"
                        autoFocus
                      />
                    </div>

                    {/* Category Selector */}
                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide block mb-1">Categoria de Destino</label>
                      <select
                        value={newTplCategory}
                        onChange={(e) => setNewTplCategory(e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none cursor-pointer transition"
                      >
                        {categories.filter(c => c !== 'Todos').map(c => (
                          <option key={c} value={c} className="bg-zinc-900">{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Duration slider/input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">Duração do Template</label>
                        <span className="font-mono text-xs text-indigo-400 font-bold">{newTplDuration} segundos</span>
                      </div>
                      <div className="flex items-center gap-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-2.5">
                        <input
                          type="range"
                          min={2}
                          max={60}
                          value={newTplDuration}
                          onChange={(e) => setNewTplDuration(parseInt(e.target.value))}
                          className="flex-1 accent-indigo-500 cursor-pointer"
                        />
                        <input
                          type="number"
                          min={2}
                          max={60}
                          value={newTplDuration}
                          onChange={(e) => setNewTplDuration(Math.max(2, Math.min(60, parseInt(e.target.value) || 15)))}
                          className="w-12 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-[10px] font-bold font-mono text-center focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Tags input */}
                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide block mb-1">Tags (Separadas por vírgula)</label>
                      <input
                        type="text"
                        placeholder="Ex: Vendas, Desconto, Insta, Promo"
                        value={newTplTagsString}
                        onChange={(e) => setNewTplTagsString(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none transition"
                      />
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between shrink-0">
              
              {createStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCreateStep(createStep - 1)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  Anterior
                </button>
              ) : (
                <div />
              )}

              {createStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCreateStep(createStep + 1)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <span>Próximo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateTemplate}
                  id="modal-btn-create-template"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Criar Template</span>
                </button>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
