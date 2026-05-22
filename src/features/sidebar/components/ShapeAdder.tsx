// src/features/sidebar/components/ShapeAdder.tsx
import { useEditorStore } from '../../../store/useEditorStore';

export const ShapeAdder = () => {
  const addLayer = useEditorStore((state) => state.addLayer);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const format = useEditorStore((state) => state.format);

  const handleAddShape = (shapeType: 'rect' | 'circle') => {
    const newId = `shape-${Date.now()}`;
    const size = 150; // Tamanho base inicial
    
    addLayer({
      id: newId,
      type: 'shape',
      shapeType: shapeType,
      fill: '#e53e3e', // Vermelho padrão
      // Centralizar no formato atual
      x: format.width / 2 - size / 2,
      y: format.height / 2 - size / 2,
      width: size,
      height: size,
      isBackground: false,
    });
    
    setSelectedId(newId);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Formas Geométricas
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleAddShape('rect')}
          className="py-2 px-2 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <span className="material-symbols-outlined text-xl">rectangle</span>
          Retângulo
        </button>
        <button
          onClick={() => handleAddShape('circle')}
          className="py-2 px-2 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <span className="material-symbols-outlined text-xl">circle</span>
          Círculo
        </button>
      </div>
    </div>
  );
};
