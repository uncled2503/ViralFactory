/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { Template, BulkRow, VideoElement } from '../types';

interface ProjectState {
  projects: Template[]; // Treating projects as templates to maintain seamless editor backward-compatibility
  currentProjectId: string | null;
  templates: Template[];
  bulkRows: BulkRow[];
  activeBulkRowIndex: number;
  
  // Projects Actions
  createProject: (name: string, width: number, height: number, duration?: number) => string;
  createProjectFromTemplate: (templateId: string) => string;
  loadProject: (id: string) => void;
  updateCurrentProject: (updates: Partial<Omit<Template, 'id' | 'createdAt'>>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  saveProject: (project: Template) => void;
  
  // Templates Actions
  createTemplate: (
    name: string, 
    category: Template['category'], 
    format: Template['format'], 
    width: number, 
    height: number, 
    duration: number,
    tags?: string[]
  ) => string;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;
  toggleFavoriteTemplate: (id: string) => void;
  
  // Bulk Actions
  setBulkRows: (rows: BulkRow[]) => void;
  setActiveBulkRowIndex: (index: number) => void;
  clearBulkData: () => void;
  
  // Selector helper
  getCurrentProject: () => Template | null;
}

const PRESET_TEMPLATES: Template[] = [
  {
    id: 'tpl-viral-quote',
    name: 'TikTok/Reels - Frase Motivacional',
    category: 'Reels',
    format: '9:16',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=300',
    width: 1080,
    height: 1920,
    duration: 10,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-10T10:00:00.000Z',
    tags: ['Citação', 'Motivacional', 'Mindset'],
    favorito: true,
    elements: [
      {
        id: 'el-bg',
        type: 'image',
        name: 'Plano de Fundo',
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        rotation: 0,
        opacity: 0.85,
        fill: '#111827',
        imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1080',
        startTime: 0,
        endTime: 10,
        isLocked: true,
      },
      {
        id: 'el-box-card',
        type: 'rect',
        name: 'Placa Central',
        x: 90,
        y: 660,
        width: 900,
        height: 600,
        rotation: 0,
        opacity: 0.8,
        fill: '#000000',
        stroke: '#fbbf24',
        strokeWidth: 4,
        startTime: 0,
        endTime: 10,
      },
      {
        id: 'el-header',
        type: 'text',
        name: 'Cabeçalho Fixo',
        x: 140,
        y: 720,
        width: 800,
        height: 60,
        rotation: 0,
        opacity: 1,
        fill: '#fbbf24',
        text: 'CONSELHO DO DIA 💡',
        fontSize: 48,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'center',
        startTime: 0,
        endTime: 10,
      },
      {
        id: 'el-quote',
        type: 'text',
        name: 'Frase Dinâmica',
        x: 140,
        y: 840,
        width: 800,
        height: 280,
        rotation: 0,
        opacity: 1,
        fill: '#ffffff',
        text: '"A paciência é um elemento chave do sucesso."',
        fontSize: 40,
        fontFamily: 'Inter',
        fontStyle: 'normal',
        align: 'center',
        startTime: 0,
        endTime: 10,
        dynamicVariable: 'quote_text',
      },
      {
        id: 'el-author',
        type: 'text',
        name: 'Autor Dinâmico',
        x: 140,
        y: 1140,
        width: 800,
        height: 50,
        rotation: 0,
        opacity: 1,
        fill: '#9ca3af',
        text: '- Autor Desconhecido',
        fontSize: 28,
        fontFamily: 'Inter',
        fontStyle: 'italic',
        align: 'right',
        startTime: 0,
        endTime: 10,
        dynamicVariable: 'author',
      },
      {
        id: 'el-watermark',
        type: 'text',
        name: 'Marca D\'água',
        x: 140,
        y: 1450,
        width: 800,
        height: 50,
        rotation: 0,
        opacity: 0.5,
        fill: '#ffffff',
        text: '@viral_factory',
        fontSize: 32,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'center',
        startTime: 0,
        endTime: 10,
      },
      {
        id: 'el-bell',
        type: 'image',
        name: 'Sino Notificação',
        x: 490,
        y: 1530,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
        fill: '#ffffff',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png',
        startTime: 0,
        endTime: 10,
      },
      {
        id: 'el-progress',
        type: 'progress_bar',
        name: 'Barra de Progresso',
        x: 90,
        y: 1240,
        width: 900,
        height: 20,
        rotation: 0,
        opacity: 1,
        fill: '#fbbf24',
        startTime: 0,
        endTime: 10,
      }
    ],
  },
  {
    id: 'tpl-product-promo',
    name: 'Instagram - E-commerce Promo',
    category: 'Feed',
    format: '1:1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300',
    width: 1080,
    height: 1080,
    duration: 8,
    createdAt: '2026-02-15T14:30:00.000Z',
    updatedAt: '2026-02-15T14:30:00.000Z',
    tags: ['Vendas', 'Promo', 'E-commerce'],
    favorito: false,
    elements: [
      {
        id: 'el-bg-square',
        type: 'image',
        name: 'Fundo Artístico',
        x: 0,
        y: 0,
        width: 1080,
        height: 1080,
        rotation: 0,
        opacity: 0.9,
        fill: '#1e1b4b',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080',
        startTime: 0,
        endTime: 8,
        isLocked: true,
      },
      {
        id: 'el-title',
        type: 'text',
        name: 'Título Comercial',
        x: 100,
        y: 100,
        width: 880,
        height: 100,
        rotation: 0,
        opacity: 1,
        fill: '#ffffff',
        text: 'PROMOÇÃO DA SEMANA',
        fontSize: 54,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'center',
        startTime: 0,
        endTime: 8,
      },
      {
        id: 'el-product-box',
        type: 'rect',
        name: 'Caixa do Produto',
        x: 290,
        y: 280,
        width: 500,
        height: 420,
        rotation: 0,
        opacity: 0.9,
        fill: '#111827',
        stroke: '#818cf8',
        strokeWidth: 5,
        startTime: 0,
        endTime: 8,
      },
      {
        id: 'el-product-name',
        type: 'text',
        name: 'Nome do Produto',
        x: 310,
        y: 330,
        width: 460,
        height: 120,
        rotation: 0,
        opacity: 1,
        fill: '#818cf8',
        text: 'Tênis UltraSport Air',
        fontSize: 36,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'center',
        startTime: 0,
        endTime: 8,
        dynamicVariable: 'product_name',
      },
      {
        id: 'el-product-price',
        type: 'text',
        name: 'Preço Original',
        x: 310,
        y: 470,
        width: 460,
        height: 50,
        rotation: 0,
        opacity: 1,
        fill: '#9ca3af',
        text: 'De: R$ 499,90',
        fontSize: 28,
        fontFamily: 'Inter',
        fontStyle: 'normal',
        align: 'center',
        startTime: 0,
        endTime: 8,
        dynamicVariable: 'old_price',
      },
      {
        id: 'el-product-promo',
        type: 'text',
        name: 'Preço Oferta',
        x: 310,
        y: 540,
        width: 460,
        height: 80,
        rotation: 0,
        opacity: 1,
        fill: '#4ade80',
        text: 'Por: R$ 249,90',
        fontSize: 48,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'center',
        startTime: 0,
        endTime: 8,
        dynamicVariable: 'new_price',
      },
      {
        id: 'el-fire-icon',
        type: 'image',
        name: 'Ícone Fogo',
        x: 490,
        y: 730,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
        fill: '#ffffff',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/785/785116.png',
        startTime: 0,
        endTime: 8,
      },
      {
        id: 'el-cta',
        type: 'text',
        name: 'CTA',
        x: 100,
        y: 880,
        width: 880,
        height: 80,
        rotation: 0,
        opacity: 1,
        fill: '#fbbf24',
        text: '🔥 LINK NA BIO - COMPRE JÁ 🔥',
        fontSize: 32,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'center',
        startTime: 0,
        endTime: 8,
      }
    ],
  },
  {
    id: 'tpl-youtube-landscape',
    name: 'YouTube - Banner de Destaque',
    category: 'YouTube',
    format: '16:9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=300',
    width: 1920,
    height: 1080,
    duration: 15,
    createdAt: '2026-03-01T09:15:00.000Z',
    updatedAt: '2026-03-01T09:15:00.000Z',
    tags: ['Aviso', 'Tech', 'Lançamento'],
    favorito: false,
    elements: [
      {
        id: 'el-bg-yt',
        type: 'image',
        name: 'Fundo Tech',
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        rotation: 0,
        opacity: 0.9,
        fill: '#0f172a',
        imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1920',
        startTime: 0,
        endTime: 15,
        isLocked: true,
      },
      {
        id: 'el-yt-title',
        type: 'text',
        name: 'Título Principal',
        x: 200,
        y: 350,
        width: 1520,
        height: 120,
        rotation: 0,
        opacity: 1,
        fill: '#ffffff',
        text: 'NÃO PERCA O PRÓXIMO EPISÓDIO',
        fontSize: 72,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'center',
        startTime: 0,
        endTime: 15,
      },
      {
        id: 'el-yt-sub',
        type: 'text',
        name: 'Subtítulo Dinâmico',
        x: 200,
        y: 500,
        width: 1520,
        height: 80,
        rotation: 0,
        opacity: 1,
        fill: '#ec4899',
        text: 'Tema: Como Automatizar Criação de Vídeos em Massa',
        fontSize: 42,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'center',
        startTime: 0,
        endTime: 15,
        dynamicVariable: 'video_theme',
      },
      {
        id: 'el-yt-date',
        type: 'text',
        name: 'Data Lançamento',
        x: 200,
        y: 650,
        width: 1520,
        height: 60,
        rotation: 0,
        opacity: 1,
        fill: '#e2e8f0',
        text: 'Lançamento: Próxima Terça às 19h',
        fontSize: 32,
        fontFamily: 'Inter',
        fontStyle: 'normal',
        align: 'center',
        startTime: 0,
        endTime: 15,
        dynamicVariable: 'launch_date',
      }
    ],
  },
  {
    id: 'tpl-tiktok-challenge',
    name: 'TikTok - Desafio de Perguntas',
    category: 'TikTok',
    format: '9:16',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300',
    width: 1080,
    height: 1920,
    duration: 15,
    createdAt: '2026-04-12T11:20:00.000Z',
    updatedAt: '2026-04-12T11:20:00.000Z',
    tags: ['Desafio', 'TikTok', 'Trend'],
    favorito: true,
    elements: [
      {
        id: 'el-challenge-bg',
        type: 'rect',
        name: 'Fundo Escuro',
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        rotation: 0,
        opacity: 1,
        fill: '#090d16',
        startTime: 0,
        endTime: 15,
        isLocked: true,
      },
      {
        id: 'el-challenge-title',
        type: 'text',
        name: 'Pergunta Desafio',
        x: 100,
        y: 400,
        width: 880,
        height: 200,
        rotation: 0,
        opacity: 1,
        fill: '#ffffff',
        text: 'QUAL O PLANETA MAIS PRÓXIMO DO SOL?',
        fontSize: 54,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'center',
        startTime: 0,
        endTime: 15,
      },
      {
        id: 'el-opt-a',
        type: 'text',
        name: 'Opção A',
        x: 140,
        y: 750,
        width: 800,
        height: 120,
        rotation: 0,
        opacity: 1,
        fill: '#fb7185',
        text: '🔴 A) Vênus',
        fontSize: 48,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'left',
        startTime: 0,
        endTime: 15,
      },
      {
        id: 'el-opt-b',
        type: 'text',
        name: 'Opção B',
        x: 140,
        y: 920,
        width: 800,
        height: 120,
        rotation: 0,
        opacity: 1,
        fill: '#34d399',
        text: '🟢 B) Mercúrio',
        fontSize: 48,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'left',
        startTime: 0,
        endTime: 15,
      }
    ],
  },
  {
    id: 'tpl-stories-minimal',
    name: 'Stories - Bastidores Diários',
    category: 'Stories',
    format: '9:16',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=300',
    width: 1080,
    height: 1920,
    duration: 12,
    createdAt: '2026-05-20T16:45:00.000Z',
    updatedAt: '2026-05-20T16:45:00.000Z',
    tags: ['Stories', 'Vlog', 'Bastidores'],
    favorito: false,
    elements: [
      {
        id: 'el-stories-bg',
        type: 'image',
        name: 'Foto Stories',
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        rotation: 0,
        opacity: 1,
        fill: '#111827',
        imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1080',
        startTime: 0,
        endTime: 12,
        isLocked: true,
      },
      {
        id: 'el-stories-tag',
        type: 'text',
        name: 'Bastidores Text',
        x: 140,
        y: 250,
        width: 800,
        height: 100,
        rotation: 0,
        opacity: 1,
        fill: '#ffffff',
        text: 'MEU DIA A DIA',
        fontSize: 36,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'left',
        startTime: 0,
        endTime: 12,
      }
    ],
  },
  {
    id: 'tpl-shorts-news',
    name: 'Shorts - Canal de Notícias',
    category: 'Shorts',
    format: '9:16',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=300',
    width: 1080,
    height: 1920,
    duration: 10,
    createdAt: '2026-06-01T08:00:00.000Z',
    updatedAt: '2026-06-01T08:00:00.000Z',
    tags: ['Shorts', 'Notícias', 'Fatos'],
    favorito: false,
    elements: [
      {
        id: 'el-news-bg',
        type: 'rect',
        name: 'Placa de Fundo',
        x: 0,
        y: 0,
        width: 1080,
        height: 1920,
        rotation: 0,
        opacity: 1,
        fill: '#1e293b',
        startTime: 0,
        endTime: 10,
        isLocked: true,
      },
      {
        id: 'el-news-header',
        type: 'rect',
        name: 'Header Vermelho',
        x: 0,
        y: 100,
        width: 1080,
        height: 150,
        rotation: 0,
        opacity: 1,
        fill: '#ef4444',
        startTime: 0,
        endTime: 10,
      },
      {
        id: 'el-news-header-text',
        type: 'text',
        name: 'Texto Header',
        x: 50,
        y: 140,
        width: 980,
        height: 80,
        rotation: 0,
        opacity: 1,
        fill: '#ffffff',
        text: 'NOTÍCIAS DO MUNDO',
        fontSize: 48,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'center',
        startTime: 0,
        endTime: 10,
      }
    ],
  },
  {
    id: 'tpl-personalizado-promo',
    name: 'Design - Banner Vertical Promo',
    category: 'Personalizados',
    format: '4:5',
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=300',
    width: 1080,
    height: 1350,
    duration: 10,
    createdAt: '2026-06-15T18:10:00.000Z',
    updatedAt: '2026-06-15T18:10:00.000Z',
    tags: ['Personalizado', 'Vendas', 'Banner'],
    favorito: false,
    elements: [
      {
        id: 'el-pers-bg',
        type: 'rect',
        name: 'Fundo Cinza',
        x: 0,
        y: 0,
        width: 1080,
        height: 1350,
        rotation: 0,
        opacity: 1,
        fill: '#f1f5f9',
        startTime: 0,
        endTime: 10,
        isLocked: true,
      },
      {
        id: 'el-pers-text',
        type: 'text',
        name: 'Texto Banner',
        x: 100,
        y: 500,
        width: 880,
        height: 200,
        rotation: 0,
        opacity: 1,
        fill: '#0f172a',
        text: 'CRIE DESIGNS INCRÍVEIS',
        fontSize: 64,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'center',
        startTime: 0,
        endTime: 10,
      }
    ],
  }
];

const PRESET_BULK_ROWS: BulkRow[] = [
  {
    'quote_text': '"Tudo o que um sonho precisa para ser realizado é alguém que acredite que ele possa ser realizado."',
    'author': '- Roberto Shinyashiki',
    'product_name': 'Tênis Running Air V3',
    'old_price': 'De: R$ 599,90',
    'new_price': 'Por: R$ 299,90',
    'video_theme': 'Como Escalar seu SaaS de R$ 0 a R$ 10k',
    'launch_date': 'Terça, dia 05 às 20h'
  },
  {
    'quote_text': '"O sucesso é a soma de pequenos esforços repetidos dia após dia."',
    'author': '- Robert Collier',
    'product_name': 'Camisa DryFit Elite',
    'old_price': 'De: R$ 149,90',
    'new_price': 'Por: R$ 89,90',
    'video_theme': 'Estratégias para Automatizar Vídeos Curtos',
    'launch_date': 'Quarta, dia 06 às 19h'
  },
  {
    'quote_text': '"Não espere por circunstâncias ideais, crie-as."',
    'author': '- George Bernard Shaw',
    'product_name': 'Fone Bluetooth OverEar',
    'old_price': 'De: R$ 349,90',
    'new_price': 'Por: R$ 189,90',
    'video_theme': 'Dominando a API do Gemini no Backend',
    'launch_date': 'Sexta, dia 08 às 18h'
  }
];

export const useProjectStore = create<ProjectState>((set, get) => ({
  templates: PRESET_TEMPLATES,
  projects: PRESET_TEMPLATES,
  currentProjectId: 'tpl-viral-quote',
  bulkRows: PRESET_BULK_ROWS,
  activeBulkRowIndex: 0,

  createProject: (name, width, height, duration = 15) => {
    // Falls back to creating a template
    const id = get().createTemplate(name, 'Personalizados', '9:16', width, height, duration, ['Personalizado']);
    return id;
  },

  createProjectFromTemplate: (templateId) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) return '';
    
    const id = `tpl-${Date.now()}`;
    const elementsCopy = JSON.parse(JSON.stringify(template.elements));
    
    const newTemplate: Template = {
      ...template,
      id,
      name: `${template.name} - Cópia`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorito: false,
      elements: elementsCopy,
    };
    
    set((state) => {
      const updatedTemplates = [...state.templates, newTemplate];
      return {
        templates: updatedTemplates,
        projects: updatedTemplates,
        currentProjectId: id,
      };
    });
    return id;
  },

  loadProject: (id) => {
    set({ currentProjectId: id });
  },

  updateCurrentProject: (updates) => {
    const { currentProjectId } = get();
    if (!currentProjectId) return;
    get().updateTemplate(currentProjectId, updates);
  },

  deleteProject: (id) => {
    get().deleteTemplate(id);
  },

  duplicateProject: (id) => {
    get().duplicateTemplate(id);
  },

  saveProject: (project) => {
    get().updateTemplate(project.id, project);
  },

  // Templates specific actions
  createTemplate: (name, category, format, width, height, duration, tags = []) => {
    const id = `tpl-${Date.now()}`;
    
    // Choose appropriate initial visual elements based on format/resolutions
    const defaultElements: VideoElement[] = [
      {
        id: `el-bg-${Date.now()}`,
        type: 'rect',
        name: 'Plano de Fundo',
        x: 0,
        y: 0,
        width,
        height,
        rotation: 0,
        opacity: 1,
        fill: '#0f172a', // Zinc 900 slate
        startTime: 0,
        endTime: duration,
        isLocked: true,
      },
      {
        id: `el-text-${Date.now()}`,
        type: 'text',
        name: 'Título Principal',
        x: Math.round(width * 0.1),
        y: Math.round(height * 0.4),
        width: Math.round(width * 0.8),
        height: 200,
        rotation: 0,
        opacity: 1,
        fill: '#ffffff',
        text: 'Seu Novo Template ⚡',
        fontSize: Math.round(width * 0.05) || 40,
        fontFamily: 'Inter',
        fontStyle: 'bold',
        align: 'center',
        startTime: 0,
        endTime: duration,
      }
    ];

    // Select dynamic placeholder image based on category
    let thumbnailWord = 'tech';
    if (category === 'TikTok' || category === 'Reels' || category === 'Shorts') thumbnailWord = 'creative';
    if (category === 'Stories') thumbnailWord = 'lifestyle';
    if (category === 'Feed') thumbnailWord = 'shop';
    if (category === 'YouTube') thumbnailWord = 'video';
    
    const thumbnailUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&sig=${Date.now()}`;

    const newTemplate: Template = {
      id,
      name,
      category,
      format,
      thumbnailUrl,
      width,
      height,
      duration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: tags.length > 0 ? tags : [category, format],
      favorito: false,
      elements: defaultElements,
    };

    set((state) => {
      const updatedTemplates = [...state.templates, newTemplate];
      return {
        templates: updatedTemplates,
        projects: updatedTemplates,
        currentProjectId: id,
      };
    });

    return id;
  },

  updateTemplate: (id, updates) => {
    set((state) => {
      const updatedTemplates = state.templates.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      return {
        templates: updatedTemplates,
        projects: updatedTemplates,
      };
    });
  },

  deleteTemplate: (id) => {
    set((state) => {
      const remaining = state.templates.filter((t) => t.id !== id);
      let nextActive = state.currentProjectId;
      if (state.currentProjectId === id) {
        nextActive = remaining.length > 0 ? remaining[0].id : null;
      }
      return {
        templates: remaining,
        projects: remaining,
        currentProjectId: nextActive,
      };
    });
  },

  duplicateTemplate: (id) => {
    const template = get().templates.find((t) => t.id === id);
    if (!template) return;
    
    const duplicated: Template = {
      ...template,
      id: `tpl-${Date.now()}`,
      name: `${template.name} (Duplicado)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorito: false,
      elements: JSON.parse(JSON.stringify(template.elements)),
    };

    set((state) => {
      const updatedTemplates = [...state.templates, duplicated];
      return {
        templates: updatedTemplates,
        projects: updatedTemplates,
      };
    });
  },

  toggleFavoriteTemplate: (id) => {
    set((state) => {
      const updatedTemplates = state.templates.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            favorito: !t.favorito,
          };
        }
        return t;
      });
      return {
        templates: updatedTemplates,
        projects: updatedTemplates,
      };
    });
  },

  setBulkRows: (bulkRows) => set({ bulkRows, activeBulkRowIndex: 0 }),
  
  setActiveBulkRowIndex: (activeBulkRowIndex) => set({ activeBulkRowIndex }),
  
  clearBulkData: () => set({ bulkRows: [], activeBulkRowIndex: 0 }),

  getCurrentProject: () => {
    const { currentProjectId, templates } = get();
    if (!currentProjectId) return null;
    return templates.find((t) => t.id === currentProjectId) || null;
  }
}));
