// src/features/standardizer/components/ImageStandardizer.tsx
import { useState } from 'react';
import JSZip from 'jszip';
import { useEditorStore } from '../../../store/useEditorStore';

// Configurações do Cloudinary (podem ser configuradas no arquivo .env na raiz do projeto)
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'djwjvrdhe';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'padronizador';

export const ImageStandardizer = () => {
  const setView = useEditorStore((state) => state.setView);
  const isDarkMode = useEditorStore((state) => state.isDarkMode);
  const toggleDarkMode = useEditorStore((state) => state.toggleDarkMode);

  const [files, setFiles] = useState<File[]>([]);
  const [targetWidth, setTargetWidth] = useState<number>(1200);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Adiciona os novos arquivos à lista existente (se quiser permitir adição iterativa)
      // Aqui vamos apenas substituir pela nova seleção para simplificar o fluxo
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
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

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
         resolve({width: img.width, height: img.height});
         URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const processImageWithCloudinary = async (file: File, width: number, height: number): Promise<Blob | null> => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      console.warn('Cloudinary não configurado. Realizando corte padrão.');
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Erro ao fazer upload da imagem');

      const data = await uploadRes.json();
      const publicId = data.public_id;

      // URL de transformação com Generative Fill
      const genFillUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_pad,b_gen_fill,w_${width},h_${height}/${publicId}.jpg`;

      // O Cloudinary segura a requisição até a IA gerar a imagem
      const imgRes = await fetch(genFillUrl);
      if (!imgRes.ok) throw new Error('Erro ao gerar imagem no Cloudinary');

      return await imgRes.blob();
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const processImageCanvas = (file: File, width: number, height: number): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        // Lógica de object-fit: cover
        const scale = Math.max(width / img.width, height / img.height);
        const x = (width / 2) - (img.width / 2) * scale;
        const y = (height / 2) - (img.height / 2) * scale;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleStandardize = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    const zip = new JSZip();
    const folder = zip.folder('imagens-padronizadas');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      const dims = await getImageDimensions(file);
      const imgAspectRatio = dims.width / dims.height;
      const targetAspectRatio = targetWidth / targetHeight;
      
      const isSameRatio = Math.abs(imgAspectRatio - targetAspectRatio) < 0.05; // tolerância de 5%

      let blob: Blob | null = null;

      if (isSameRatio) {
        blob = await processImageCanvas(file, targetWidth, targetHeight);
      } else {
        blob = await processImageWithCloudinary(file, targetWidth, targetHeight);
        
        // Fallback para caso o cloudinary falhe (por falta de config ou erro)
        if (!blob) {
           blob = await processImageCanvas(file, targetWidth, targetHeight);
        }
      }

      if (blob && folder) {
        const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        folder.file(`${originalNameWithoutExt}-padronizada.jpg`, blob);
      }
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'imagens-padronizadas.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsProcessing(false);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-slate-900 overflow-hidden relative">
      {/* Botões Superiores */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => setView('menu')}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md shadow-sm border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Voltar ao Menu
        </button>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <button 
          onClick={toggleDarkMode}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          title="Alternar Tema"
        >
          <span className="material-symbols-outlined">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mb-4">
              <span className="material-symbols-outlined text-3xl">photo_library</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Padronizador de Imagens</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Corte e redimensione dezenas de fotos para um formato exato em segundos, sem distorcer.
            </p>
          </div>

          {/* Configurações */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6 mb-8 border border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-4">Formato Alvo (Pixels)</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Largura</label>
                <input
                  type="number"
                  value={targetWidth}
                  onChange={(e) => setTargetWidth(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex items-center justify-center pt-5 text-gray-400">
                <span className="material-symbols-outlined">close</span>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Altura</label>
                <input
                  type="number"
                  value={targetHeight}
                  onChange={(e) => setTargetHeight(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="mb-8">
            <label 
              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                isDragging
                  ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/30 hover:bg-green-400 dark:hover:bg-green-900/30' 
                  : 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <span className="material-symbols-outlined text-4xl text-gray-400 dark:text-gray-500 mb-3">upload_file</span>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-green-600 dark:text-green-400">Clique para anexar</span> ou arraste e solte
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Múltiplos arquivos suportados (JPG, PNG)</p>
              </div>
              <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
            </label>
          </div>

          {/* Lista de Arquivos */}
          {files.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {files.length} {files.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
                </h3>
                <button onClick={() => setFiles([])} className="text-xs text-red-500 hover:text-red-700 font-medium">
                  Limpar tudo
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto 
                [&::-webkit-scrollbar]:w-3 
                dark:[&::-webkit-scrollbar-track]:bg-gray-500 
                dark:[&::-webkit-scrollbar-thumb]:bg-blue-900 
                [&::-webkit-scrollbar-thumb]:rounded-full pr-2 flex flex-col gap-2 "
              >
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-slate-700 p-2 rounded-lg border border-gray-200 dark:border-slate-700 ">
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[80%]">{file.name}</span>
                    <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 flex items-center">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Barra de Progresso e Botão de Ação */}
          {isProcessing ? (
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-6 relative overflow-hidden">
              <div 
                className="bg-green-600 h-6 transition-all duration-300 ease-out flex items-center justify-center"
                style={{ width: `${progress}%` }}
              >
                <span className="text-xs font-bold text-white absolute w-full text-center mix-blend-difference">{progress}% Concluído</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleStandardize}
              disabled={files.length === 0}
              className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                ${files.length === 0 
                  ? 'bg-gray-300 dark:bg-slate-600 cursor-not-allowed shadow-none' 
                  : 'bg-green-600 hover:bg-green-700 hover:-translate-y-1'
                }`}
            >
              <span className="material-symbols-outlined">folder_zip</span>
              Padronizar e Baixar ZIP
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
