import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';

/**
 * Componente ImageUploader
 * Fornece um botão estilizado para selecionar arquivos do computador.
 * Lê as dimensões da imagem antes de enviá-la para o estado global.
 */
export const ImageUploader = () => {
  // Extraímos apenas a função addLayer da nossa store
  const addLayer = useEditorStore((state) => state.addLayer);

  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    // Cria uma URL temporária na memória do navegador para esta imagem
    const imageUrl = URL.createObjectURL(file);

    // Precisamos descobrir a largura e altura originais da imagem
    const img = new Image();
    
    img.onload = () => {
      // Quando a imagem terminar de carregar na memória, calculamos um tamanho inicial.
      const maxWidth = 400; 
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;

      // Adiciona a nova camada ao nosso estado global
      addLayer({
        id: crypto.randomUUID(),
        url: imageUrl,
        x: 50,
        y: 50,
        width: img.width * scale,
        height: img.height * scale,
        isBackground: false,
      });
    };

    img.src = imageUrl;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Limpa o input para permitir subir a mesma imagem duas vezes seguidas
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Adicionar Imagem
      </label>
      {/* Componente Dropzone */}
      <label 
        className={`cursor-pointer flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-xl border-2 border-dashed transition-all duration-200 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
            : 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className={`material-symbols-outlined transition-all ${isDragging ? 'text-4xl scale-110' : 'text-3xl'}`}>
          {isDragging ? 'file_download' : 'add_photo_alternate'}
        </span>
        <span className="text-sm font-medium text-center">
          {isDragging ? 'Solte a imagem aqui' : 'Clique ou arraste uma imagem'}
        </span>
        <input 
          type="file" 
          accept="image/png, image/jpeg, image/webp" 
          className="hidden" 
          onChange={handleFileChange} 
        />
      </label>
    </div>
  );
};