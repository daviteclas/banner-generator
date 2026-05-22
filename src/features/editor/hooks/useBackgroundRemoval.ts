import { useState } from 'react';
import { pipeline, env, RawImage } from '@huggingface/transformers';

// Desabilita modelos locais (pois rodamos no navegador puro)
env.allowLocalModels = false;

// Inicializamos o modelo fora do hook para garantir que ele seja instanciado como singleton
let segmentatorPipeline: any = null;

const getSegmentator = async () => {
  if (!segmentatorPipeline) {
    console.log("Iniciando download/carregamento do modelo RMBG-1.4 (~40MB)...");
    try {
      segmentatorPipeline = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
        device: 'webgpu' // Tenta usar WebGPU se o navegador suportar para aceleração massiva
      });
    } catch (e) {
      console.warn("WebGPU não suportado. Usando processamento padrão via WASM.");
      segmentatorPipeline = await pipeline('image-segmentation', 'briaai/RMBG-1.4');
    }
    console.log("Modelo carregado com sucesso!");
  }
  return segmentatorPipeline;
};

export const useBackgroundRemoval = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const removeBackground = async (imageUrl: string): Promise<string | null> => {
    try {
      setIsProcessing(true);
      
      const segmentator = await getSegmentator();
      
      // Carrega a imagem nativa do transformers.js
      const rawImage = await RawImage.fromURL(imageUrl);

      // A IA do RMBG-1.4 recorta com perfeição State-of-the-Art
      const result = await segmentator(rawImage);
      
      // O pipeline pode retornar um array de resultados (máscaras) dependendo da versão
      const maskObject = Array.isArray(result) ? result[0] : result;
      const maskRaw = maskObject.mask || maskObject; // Extrai o RawImage da máscara

      // Vamos aplicar essa máscara super precisa na imagem original via Canvas
      const canvas = document.createElement('canvas');
      canvas.width = rawImage.width;
      canvas.height = rawImage.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Desenhamos a imagem original real no Canvas
      const origImg = new Image();
      origImg.src = imageUrl;
      await new Promise((resolve, reject) => {
        origImg.onload = resolve;
        origImg.onerror = reject;
      });
      ctx.drawImage(origImg, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const isGrayscale = maskRaw.channels === 1;

      // Fundimos a máscara gerada pela IA diretamente na transparência da foto!
      for (let i = 0; i < imgData.data.length; i += 4) {
        const pixelIndex = i / 4;
        
        // Se a máscara tem só 1 canal (grayscale), lemos por pixelIndex
        // Se for RGBA, lemos o canal Red usando o próprio índice 'i'
        const maskAlpha = isGrayscale ? maskRaw.data[pixelIndex] : maskRaw.data[i];
        
        imgData.data[i + 3] = maskAlpha;
      }

      ctx.putImageData(imgData, 0, 0);

      // Retorna o resultado final limpo
      const transparentImageUrl = await new Promise<string>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(URL.createObjectURL(blob));
          else resolve(imageUrl);
        }, 'image/png');
      });

      return transparentImageUrl;
    } catch (error) {
      console.error("Erro na remoção com Transformers.js:", error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { removeBackground, isProcessing };
};