// src/features/sidebar/components/ImageUploader.tsx
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Pega o primeiro arquivo selecionado
    const file = e.target.files?.[0];
    if (!file) return;

    // Cria uma URL temporária na memória do navegador para esta imagem
    const imageUrl = URL.createObjectURL(file);

    // Precisamos descobrir a largura e altura originais da imagem
    // Para isso, criamos um elemento de imagem HTML "invisível"
    const img = new Image();
    
    img.onload = () => {
      // Quando a imagem terminar de carregar na memória, calculamos um tamanho inicial.
      // Se a imagem for muito grande, reduzimos para caber melhor no canvas de 1200x628.
      const maxWidth = 400; 
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;

      // Adiciona a nova camada ao nosso estado global
      addLayer({
        id: crypto.randomUUID(), // Gera um ID único nativo do navegador
        url: imageUrl,
        x: 50, // Posição inicial no eixo X
        y: 50, // Posição inicial no eixo Y
        width: img.width * scale,
        height: img.height * scale,
        isBackground: false,
      });

      // Limpa o input para permitir subir a mesma imagem duas vezes seguidas, se desejado
      e.target.value = '';
    };

    img.src = imageUrl;
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Adicionar Imagem
      </label>
      {/* Escondemos o input padrão feio e estilizamos o label para agir como botão */}
      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors">
        <span className="material-symbols-outlined">upload_file</span>
        <span>Escolher arquivo</span>
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