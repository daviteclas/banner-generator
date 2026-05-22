// src/features/sidebar/components/TextAdder.tsx
import { useEditorStore } from '../../../store/useEditorStore';

export const TextAdder = () => {
  const addLayer = useEditorStore((state) => state.addLayer);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const format = useEditorStore((state) => state.format);

  const handleAddText = () => {
    const newId = `text-${Date.now()}`;
    addLayer({
      id: newId,
      type: 'text',
      text: 'Novo Texto',
      fontFamily: 'Inter',
      fontSize: 48,
      fill: '#000000',
      // Centralizar no formato atual
      x: format.width / 2 - 100,
      y: format.height / 2 - 24,
      width: 200,
      height: 48,
      isBackground: false,
    });
    setSelectedId(newId);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleAddText}
        className="py-3 px-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-gray-600 dark:text-gray-300 hover:border-gray-400 hover:bg-gray-200 dark:hover:border-slate-500 dark:hover:bg-gray-700 dark:hover:bg-slate-750 transition-colors flex items-center justify-center gap-2 font-medium"
      >
        <span className="material-symbols-outlined">title</span>
        Adicionar Texto
      </button>
    </div>
  );
};
