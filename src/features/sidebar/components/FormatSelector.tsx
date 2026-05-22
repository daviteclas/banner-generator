// src/features/sidebar/components/FormatSelector.tsx
import { useEditorStore } from '../../../store/useEditorStore';
import { BANNER_FORMATS } from '../../../utils/formats';

/**
 * Componente FormatSelector
 * Renderiza uma lista de botões para o usuário escolher o tamanho do banner.
 */
export const FormatSelector = () => {
  // Extraímos o formato atual e a função para alterá-lo da nossa Store
  const currentFormat = useEditorStore((state) => state.format);
  const setFormat = useEditorStore((state) => state.setFormat);

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Tamanho do Banner
      </label>
      
      <div className="flex flex-col gap-2">
        {/* Percorremos a nossa lista de formatos estáticos */}
        {BANNER_FORMATS.map((format) => {
          // Verificamos se o botão atual é o mesmo que está no Zustand
          const isSelected = currentFormat.id === format.id;

          return (
            <button
              key={format.id}
              onClick={() => setFormat(format)}
              // Mudamos a cor dinamicamente: Azul se selecionado, Cinza se não
              className={`py-2 px-3 text-sm rounded-md border text-left transition-colors ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 font-medium'
                  : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {format.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};