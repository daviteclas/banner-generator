// src/features/sidebar/components/LayerActions.tsx
import { useEditorStore } from '../../../store/useEditorStore';
import { useBackgroundRemoval } from '../../editor/hooks/useBackgroundRemoval';

export const LayerActions = () => {
  const selectedId = useEditorStore((state) => state.selectedId);
  const layers = useEditorStore((state) => state.layers);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const removeLayer = useEditorStore((state) => state.removeLayer);

  const { removeBackground, isProcessing } = useBackgroundRemoval();

  const selectedLayer = layers.find((layer) => layer.id === selectedId);

  if (!selectedLayer) return null;

  const handleRemoveBackground = async () => {
    if (!selectedLayer.url) return;
    const newUrl = await removeBackground(selectedLayer.url);
    if (newUrl) {
      updateLayer(selectedLayer.id, { url: newUrl });
    }
  };

  const isText = selectedLayer.type === 'text';
  const isShape = selectedLayer.type === 'shape';

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
          {isText ? 'Editar Texto' : isShape ? 'Editar Forma' : 'Editar Imagem'}
        </label>
        <button
          onClick={() => removeLayer(selectedLayer.id)}
          className="text-red-500 hover:text-red-700 p-1"
          title="Deletar Camada"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      {isText ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={selectedLayer.text || ''}
            onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows={3}
            placeholder="Digite seu texto..."
          />
          
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fonte</label>
              <select
                value={selectedLayer.fontFamily || 'Inter'}
                onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-md text-sm"
              >
                <option value="Inter">Inter</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
            
            <div className="w-20">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Cor</label>
              <input
                type="color"
                value={selectedLayer.fill || '#000000'}
                onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
                className="w-full h-7 p-0 border-0 rounded cursor-pointer bg-transparent"
              />
            </div>
          </div>
        </div>
      ) : isShape ? (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Cor de Preenchimento</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={selectedLayer.fill || '#e53e3e'}
                onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
                className="w-10 h-10 p-0 rounded cursor-pointer bg-transparent shadow-sm border border-gray-300 dark:border-slate-600"
              />
              <span className="text-sm font-mono text-gray-500 dark:text-gray-400 uppercase">
                {selectedLayer.fill || '#e53e3e'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleRemoveBackground}
            disabled={isProcessing}
            className={`py-2 px-4 rounded-md text-sm font-medium text-white transition-colors flex justify-center items-center ${
              isProcessing ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? 'Removendo fundo...' : 'Remover Fundo Mágico'}
          </button>
          
          {isProcessing && (
            <span className="text-xs text-blue-600 text-center mt-1">
              O primeiro uso pode levar alguns segundos.
            </span>
          )}
        </div>
      )}
    </div>
  );
};