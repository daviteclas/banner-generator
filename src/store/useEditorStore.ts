import { create } from 'zustand';

// 1. Definição dos Tipos (Documentação e Segurança)
export type BannerFormat = {
  id: string;
  name: string;
  width: number;
  height: number;
};

export type Layer = {
  id: string;         // ID único para o react-konva conseguir rastrear a imagem
  type?: 'image' | 'text' | 'shape'; // Define o tipo de camada
  shapeType?: 'rect' | 'circle'; // Define o subtipo se for uma forma
  url?: string;       // URL da imagem
  text?: string;      // Conteúdo para tipo texto
  fontFamily?: string;// Fonte para tipo texto
  fontSize?: number;  // Tamanho da fonte para tipo texto
  fill?: string;      // Cor do texto ou preenchimento da forma
  x: number;          // Posição no eixo X
  y: number;          // Posição no eixo Y
  width: number;      // Largura da imagem no canvas (ou largura base do texto)
  height: number;     // Altura da imagem no canvas (ou altura do texto)
  isBackground: boolean; // Define se esta camada é o fundo fixo
};

// Interface que descreve o que nossa Store guarda (Estado + Ações)
interface EditorState {
  format: BannerFormat;
  layers: Layer[];
  // NOVO: Guarda o ID da camada selecionada. Se for null, nada está selecionado.
  selectedId: string | null; 
  
  // NOVO: Estado de navegação
  view: 'menu' | 'editor' | 'auto-gen' | 'standardizer';
  
  // NOVO: Linhas guias para o snapping
  guides: number[][];

  // NOVO: Dark mode toggle
  isDarkMode: boolean;

  setFormat: (format: BannerFormat) => void;
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, newProps: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  setSelectedId: (id: string | null) => void; 
  setView: (view: 'menu' | 'editor' | 'auto-gen' | 'standardizer') => void;
  clearLayers: () => void;
  
  // NOVO: Ações para gerenciar as guias e dark mode
  setGuides: (guides: number[][]) => void;
  clearGuides: () => void;
  toggleDarkMode: () => void;

  // NOVO: Cor de fundo do Canvas
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
}

// Formato padrão inicial
const DEFAULT_FORMAT: BannerFormat = {
  id: 'ppl',
  name: '1200x628 (PPL)',
  width: 1200,
  height: 628,
};

const getInitialDarkMode = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

// 2. Criação da Store com Zustand
export const useEditorStore = create<EditorState>((set) => ({
  // Valores iniciais
  format: DEFAULT_FORMAT,
  layers: [],
  selectedId: null,
  view: 'menu',
  guides: [],
  isDarkMode: getInitialDarkMode(),
  backgroundColor: '#ffffff', // Branco por padrão

  // Implementação das Ações
  setFormat: (format) => set({ format }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  
  addLayer: (layer) => set((state) => ({ 
    layers: [...state.layers, layer] 
  })),
  
  updateLayer: (id, newProps) => set((state) => ({
    layers: state.layers.map((layer) => 
      layer.id === id ? { ...layer, ...newProps } : layer
    )
  })),

  removeLayer: (id) => set((state) => ({
    layers: state.layers.filter((layer) => layer.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId,
  })),

  setSelectedId: (id) => set({ selectedId: id }),
  setView: (view) => set({ view }),
  clearLayers: () => set({ layers: [], selectedId: null, guides: [] }),
  setGuides: (guides) => set({ guides }),
  clearGuides: () => set({ guides: [] }),
  
  toggleDarkMode: () => set((state) => {
    const newDarkMode = !state.isDarkMode;
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    return { isDarkMode: newDarkMode };
  }),
}));