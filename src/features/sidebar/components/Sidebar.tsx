/**
 * Componente Sidebar
 * Responsável por abrigar os controles de upload, seleção de formatos e ações.
 * Definimos uma largura fixa (w-80) e um fundo branco para contrastar com a área de edição.
 */

// src/features/sidebar/components/Sidebar.tsx
import { ImageUploader } from './ImageUploader';
import { FormatSelector } from './FormatSelector';
import { LayerActions } from './LayerActions';
import { TextAdder } from './TextAdder';
import { BackgroundColorPicker } from './BackgroundColorPicker';
import { ShapeAdder } from './ShapeAdder';
import { useEditorStore } from '../../../store/useEditorStore';

export const Sidebar = () => {
  const setView = useEditorStore((state) => state.setView);

  return (
    <aside className="w-80 bg-white dark:bg-slate-800 h-full shadow-xl flex flex-col p-6 z-10 overflow-y-auto transition-colors border-r border-transparent dark:border-slate-700">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Banner Gen
        </h1>
        <button 
          onClick={() => setView('menu')}
          className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Menu
        </button>
      </div>
      
      <div className="flex-1 flex flex-col gap-6">
        <FormatSelector />
        <BackgroundColorPicker />
        <hr className="border-gray-200 dark:border-slate-700" />
        <ImageUploader />
        <TextAdder />
        <ShapeAdder />
        
        {/* Componente que só aparece quando uma camada é clicada */}
        <LayerActions />
      </div>
    </aside>
  );
};