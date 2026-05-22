// src/features/editor/components/EditorArea.tsx
import { useRef } from 'react';
import { useCanvasScale } from '../hooks/useCanvasScale';
import { BannerCanvas } from './BannerCanvas';
import { useEditorStore } from '../../../store/useEditorStore';
import type Konva from 'konva';

export const EditorArea = () => {
  // Criamos uma referência para a div container. Isso ajuda o React a medir o espaço na tela.
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  
  // Pegamos o formato do Zustand apenas para saber qual é
  const format = useEditorStore((state) => state.format);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  
  const isDarkMode = useEditorStore((state) => state.isDarkMode);
  const toggleDarkMode = useEditorStore((state) => state.toggleDarkMode);

  // Usamos nosso Hook para descobrir qual deve ser o zoom do canvas
  const scale = useCanvasScale(containerRef, format);

  const handleExport = () => {
    if (!stageRef.current) return;
    
    const dataURL = stageRef.current.toDataURL({
      pixelRatio: 1 / scale,
      x: 20, // PADDING do canvas
      y: 20,
      width: format.width * scale,
      height: format.height * scale,
    });
    
    const link = document.createElement('a');
    link.download = `banner-${format.width}x${format.height}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-slate-900 transition-colors">
      <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6 shadow-sm z-10 transition-colors">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Editor de Banner</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
            {format.width} x {format.height} px
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            title="Alternar Tema"
          >
            <span className="material-symbols-outlined">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          
          <button 
            onClick={() => {
              // Deselecionar tudo para não aparecer as bordas na exportação
              setSelectedId(null);
              // Dar um tempo para o React Konva re-renderizar sem o Transformer
              setTimeout(handleExport, 100);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">download</span>
            Exportar Imagem
          </button>
        </div>
      </header>
      <main 
        ref={containerRef} // Conectamos a referência aqui
        className="flex-1 overflow-hidden flex items-center justify-center p-4"
      >
        {/* Container visual do Canvas */}
        <div className="relative flex items-center justify-center">
          {/* Renderizamos o palco do Konva passando a escala e a referência */}
          <BannerCanvas scale={scale} stageRef={stageRef} />
        </div>
      </main>
    </div>
  );
};