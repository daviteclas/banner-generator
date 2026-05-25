import { useState, type ChangeEvent } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { useBackgroundRemoval } from '../../editor/hooks/useBackgroundRemoval';
import { BANNER_FORMATS } from '../../../utils/formats';

/**
 * Função utilitária para obter a largura e altura originais de um arquivo de imagem.
 */
const getImageDimensions = (file: File): Promise<{ width: number; height: number; url: string }> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height, url });
    };
    img.src = url;
  });
};

export const AutoGenerator = () => {
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [productPosition, setProductPosition] = useState<'left' | 'center' | 'right'>('center');
  const [isDraggingBg, setIsDraggingBg] = useState(false);
  const [isDraggingProduct, setIsDraggingProduct] = useState(false);

  const setView = useEditorStore((state) => state.setView);
  const setFormat = useEditorStore((state) => state.setFormat);
  const clearLayers = useEditorStore((state) => state.clearLayers);
  const addLayer = useEditorStore((state) => state.addLayer);

  const { removeBackground, isProcessing } = useBackgroundRemoval();

  const handleBgChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setBgFile(e.target.files[0]);
  };

  const handleProductChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setProductFile(e.target.files[0]);
  };

  const handleBgDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingBg(false);
    if (e.dataTransfer.files?.[0]) setBgFile(e.dataTransfer.files[0]);
  };

  const handleProductDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingProduct(false);
    if (e.dataTransfer.files?.[0]) setProductFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleBgDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingBg(true);
  };

  const handleBgDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingBg(false);
    }
  };

  const handleProductDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingProduct(true);
  };

  const handleProductDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingProduct(false);
    }
  };

  const handleGenerate = async () => {
    if (!bgFile || !productFile) return;

    // 1. Limpa o canvas e define o formato Push 1200x500
    clearLayers();
    const pushFormat = BANNER_FORMATS.find(f => f.id === 'push-500');
    if (pushFormat) {
      setFormat(pushFormat);
    }

    // 2. Obtem dimensões do fundo original e calcula para cobrir sem distorção (cover)
    const bgData = await getImageDimensions(bgFile);
    
    const scaleX = 1200 / bgData.width;
    const scaleY = 500 / bgData.height;
    const scale = Math.max(scaleX, scaleY);
    
    const newWidth = bgData.width * scale;
    const newHeight = bgData.height * scale;
    const newX = (1200 - newWidth) / 2;
    const newY = (500 - newHeight) / 2;
    
    addLayer({
      id: crypto.randomUUID(),
      url: bgData.url,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      isBackground: true,
    });

    // 3. Obtem dimensões e URL do produto
    const productData = await getImageDimensions(productFile);
    
    // Usa IA para remover o fundo da imagem do produto
    const transparentUrl = await removeBackground(productData.url);
    if (transparentUrl) {
      // Define tamanho máximo para o produto de forma que caiba bem no banner
      const maxProductHeight = 400;
      const productScale = productData.height > maxProductHeight 
        ? maxProductHeight / productData.height 
        : 1;
        
      const finalProductWidth = productData.width * productScale;
      const finalProductHeight = productData.height * productScale;
      
      // Calcula posição X baseada na escolha do usuário
      let productX = (1200 - finalProductWidth) / 2; // center default
      if (productPosition === 'left') {
        productX = 100; // margem esquerda
      } else if (productPosition === 'right') {
        productX = 1200 - finalProductWidth - 100; // margem direita
      }

      const productY = (500 - finalProductHeight) / 2;

      // Adiciona camada do produto sem fundo
      addLayer({
        id: crypto.randomUUID(),
        url: transparentUrl,
        x: productX,
        y: productY,
        width: finalProductWidth,
        height: finalProductHeight,
        isBackground: false,
      });
    }

    // 4. Redireciona para o Editor
    setView('editor');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-indigo-50 to-blue-100 dark:from-slate-900 dark:to-indigo-950 w-full p-4 transition-colors">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 relative transition-colors border border-transparent dark:border-slate-700">
        <button 
          onClick={() => setView('menu')}
          className="absolute top-6 left-6 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center gap-2 text-lg"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
          Voltar
        </button>

        <div className="text-center mb-8 mt-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gerador Automático (Push)</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Envie as imagens abaixo para gerar o banner magicamente.</p>
        </div>

        <div className="space-y-6">
          {/* Fundo */}
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDraggingBg 
                ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/30' 
                : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
            }`}
            onDragOver={handleDragOver}
            onDragEnter={handleBgDragEnter}
            onDragLeave={handleBgDragLeave}
            onDrop={handleBgDrop}
          >
            <label className="cursor-pointer block">
              <span className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">1. Imagem de Fundo</span>
              <span className="block text-sm text-gray-500 dark:text-gray-400 mb-4">Recomendado formato paisagem</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleBgChange} />
              <div className="inline-block px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                {bgFile ? bgFile.name : 'Selecionar Arquivo'}
              </div>
            </label>
          </div>

          {/* Produto */}
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDraggingProduct 
                ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/30' 
                : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
            }`}
            onDragOver={handleDragOver}
            onDragEnter={handleProductDragEnter}
            onDragLeave={handleProductDragLeave}
            onDrop={handleProductDrop}
          >
            <label className="cursor-pointer block">
              <span className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">2. Imagem do Produto</span>
              <span className="block text-sm text-gray-500 dark:text-gray-400 mb-4">A IA removerá o fundo desta imagem</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleProductChange} />
              <div className="inline-block px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                {productFile ? productFile.name : 'Selecionar Arquivo'}
              </div>
            </label>
          </div>
        </div>

        {/* Posição do Produto */}
        <div className="mt-8 border-t border-gray-200 dark:border-slate-700 pt-6">
          <span className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-4 text-center">3. Posição do Produto</span>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setProductPosition('left')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                productPosition === 'left' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              À Esquerda
            </button>
            <button
              onClick={() => setProductPosition('center')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                productPosition === 'center' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              Ao Centro
            </button>
            <button
              onClick={() => setProductPosition('right')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                productPosition === 'right' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              À Direita
            </button>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={handleGenerate}
            disabled={!bgFile || !productFile || isProcessing}
            className={`w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all ${
              !bgFile || !productFile 
                ? 'bg-gray-300 cursor-not-allowed' 
                : isProcessing 
                ? 'bg-indigo-400 cursor-wait animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1'
            }`}
          >
            {isProcessing ? 'Processando Imagem com IA...' : 'Gerar Banner Automático'}
          </button>
        </div>
      </div>
    </div>
  );
};
