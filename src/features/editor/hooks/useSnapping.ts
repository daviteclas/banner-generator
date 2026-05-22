// src/features/editor/hooks/useSnapping.ts
import { useCallback } from 'react';
import type Konva from 'konva';
import { useEditorStore } from '../../../store/useEditorStore';

const SNAP_THRESHOLD = 10;

export const useSnapping = () => {
  const format = useEditorStore((state) => state.format);
  const setGuides = useEditorStore((state) => state.setGuides);
  const clearGuides = useEditorStore((state) => state.clearGuides);

  // Calcula o snapping durante o arrasto de um nó
  const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    
    // Pegar o centro absoluto do nó
    const width = node.width() * node.scaleX();
    const height = node.height() * node.scaleY();
    const x = node.x();
    const y = node.y();
    
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const canvasCenterX = format.width / 2;
    const canvasCenterY = format.height / 2;

    let snapped = false;
    let newX = x;
    let newY = y;
    const newGuides: number[][] = [];

    // Verificação de Eixo Horizontal (Centro, Esquerda, Direita)
    if (Math.abs(centerX - canvasCenterX) < SNAP_THRESHOLD) {
      newX = canvasCenterX - width / 2;
      newGuides.push([canvasCenterX, 0, canvasCenterX, format.height]);
      snapped = true;
    } else if (Math.abs(x) < SNAP_THRESHOLD) {
      newX = 0;
      newGuides.push([0, 0, 0, format.height]);
      snapped = true;
    } else if (Math.abs(x + width - format.width) < SNAP_THRESHOLD) {
      newX = format.width - width;
      newGuides.push([format.width, 0, format.width, format.height]);
      snapped = true;
    }

    // Verificação de Eixo Vertical (Centro, Topo, Base)
    if (Math.abs(centerY - canvasCenterY) < SNAP_THRESHOLD) {
      newY = canvasCenterY - height / 2;
      newGuides.push([0, canvasCenterY, format.width, canvasCenterY]);
      snapped = true;
    } else if (Math.abs(y) < SNAP_THRESHOLD) {
      newY = 0;
      newGuides.push([0, 0, format.width, 0]);
      snapped = true;
    } else if (Math.abs(y + height - format.height) < SNAP_THRESHOLD) {
      newY = format.height - height;
      newGuides.push([0, format.height, format.width, format.height]);
      snapped = true;
    }

    if (snapped) {
      node.position({ x: newX, y: newY });
      setGuides(newGuides);
    } else {
      clearGuides();
    }
  }, [format.width, format.height, setGuides, clearGuides]);

  const handleDragEnd = useCallback(() => {
    clearGuides();
  }, [clearGuides]);

  const getBoundBoxFunc = useCallback((minSize = 10) => {
    return (oldBox: any, newBox: any) => {
      if (newBox.width < minSize || newBox.height < minSize) {
        return oldBox;
      }

      // Checar borda esquerda (x próximo a 0)
      if (Math.abs(newBox.x) < SNAP_THRESHOLD) {
        newBox.width += newBox.x; // aumenta a largura pra compensar
        newBox.x = 0;
      }
      
      // Checar borda direita
      if (Math.abs(newBox.x + newBox.width - format.width) < SNAP_THRESHOLD) {
        newBox.width = format.width - newBox.x;
      }

      // Checar borda superior
      if (Math.abs(newBox.y) < SNAP_THRESHOLD) {
        newBox.height += newBox.y;
        newBox.y = 0;
      }

      // Checar borda inferior
      if (Math.abs(newBox.y + newBox.height - format.height) < SNAP_THRESHOLD) {
        newBox.height = format.height - newBox.y;
      }

      return newBox;
    };
  }, [format.width, format.height]);

  return {
    handleDragMove,
    handleDragEnd,
    getBoundBoxFunc
  };
};
