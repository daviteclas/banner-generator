// src/features/editor/hooks/useCanvasScale.ts
import { useState, useEffect, type RefObject } from 'react';
import type { BannerFormat } from '../../../store/useEditorStore';

/**
 * Hook customizado para calcular a escala do canvas.
 * Ele garante que o banner sempre caiba dentro do container visível na tela.
 * 
 * @param containerRef Referência (useRef) da div que envolve o canvas.
 * @param format O formato atual do banner (largura e altura).
 * @returns O valor da escala (ex: 0.5 significa que está com 50% do tamanho).
 */
export const useCanvasScale = (
  containerRef: RefObject<HTMLDivElement | null>,
  format: BannerFormat
) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // Função que calcula o tamanho ideal
    const calculateScale = () => {
      // Se o container não estiver pronto, não faz nada
      if (!containerRef.current) return;

      // Pega a largura e altura do espaço disponível na tela
      const { clientWidth, clientHeight } = containerRef.current;
      
      // Deixamos uma margem (padding) de 80 pixels para o canvas não encostar nas bordas
      const padding = 80;
      const availableWidth = clientWidth - padding;
      const availableHeight = clientHeight - padding;

      // Calcula a proporção necessária para caber na largura e na altura
      const scaleX = availableWidth / format.width;
      const scaleY = availableHeight / format.height;

      // Escolhemos a menor escala para garantir que o banner caiba por inteiro,
      // sem cortar nem em cima e nem dos lados.
      const bestScale = Math.min(scaleX, scaleY);
      
      setScale(bestScale);
    };

    // Calcula na primeira vez que renderiza
    calculateScale();

    // Recalcula toda vez que o usuário redimensionar a janela do navegador
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
    
  }, [format.width, format.height, containerRef]); // Refaz o cálculo se o formato mudar

  return scale;
};