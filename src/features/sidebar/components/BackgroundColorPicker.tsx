// src/features/sidebar/components/BackgroundColorPicker.tsx
import { useEditorStore } from '../../../store/useEditorStore';

export const BackgroundColorPicker = () => {
  const backgroundColor = useEditorStore((state) => state.backgroundColor);
  const setBackgroundColor = useEditorStore((state) => state.setBackgroundColor);

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Cor de Fundo do Banner
      </label>
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-md shadow-sm border border-gray-300 dark:border-slate-600 overflow-hidden cursor-pointer">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
          />
        </div>
        <span className="text-sm font-mono text-gray-500 dark:text-gray-400 uppercase">
          {backgroundColor}
        </span>
      </div>
    </div>
  );
};
