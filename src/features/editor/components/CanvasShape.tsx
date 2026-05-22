// src/features/editor/components/CanvasShape.tsx
import { useRef, useEffect } from 'react';
import { Rect, Circle, Transformer } from 'react-konva';
import type Konva from 'konva';
import { useEditorStore, type Layer } from '../../../store/useEditorStore';
import { useSnapping } from '../hooks/useSnapping';

type CanvasShapeProps = {
  layer: Layer;
};

export const CanvasShape = ({ layer }: CanvasShapeProps) => {
  const isSelected = useEditorStore((state) => state.selectedId === layer.id);
  const shapeRef = useRef<Konva.Shape>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const updateLayer = useEditorStore((state) => state.updateLayer);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);

  const { handleDragMove, handleDragEnd, getBoundBoxFunc } = useSnapping();

  // Quando a forma é selecionada, atrelamos o Transformer a ela
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // Precisamos avisar ao Transformer qual nó ele deve controlar
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEndLocal = (e: Konva.KonvaEventObject<DragEvent>) => {
    handleDragEnd(); // Limpa as guias
    updateLayer(layer.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Resetamos a escala e aplicamos na largura/altura real para evitar distorções
    node.scaleX(1);
    node.scaleY(1);

    if (layer.shapeType === 'circle') {
      // Círculos no Konva têm width/height igual ao diâmetro, ou definidos pelo radius.
      // O transformer escala o bounding box, então scaleX e scaleY serão iguais se mantivermos a proporção.
      const newSize = Math.max(5, layer.width * scaleX);
      updateLayer(layer.id, {
        x: node.x(),
        y: node.y(),
        width: newSize,
        height: newSize,
      });
    } else {
      // Retângulo
      updateLayer(layer.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, layer.width * scaleX),
        height: Math.max(5, layer.height * scaleY),
      });
    }
  };

  return (
    <>
      {layer.shapeType === 'circle' ? (
        <Circle
          ref={shapeRef as React.RefObject<Konva.Circle>}
          x={layer.x}
          y={layer.y}
          width={layer.width}
          height={layer.height}
          fill={layer.fill}
          draggable
          onClick={() => setSelectedId(layer.id)}
          onTap={() => setSelectedId(layer.id)}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEndLocal}
          onTransformEnd={handleTransformEnd}
        />
      ) : (
        <Rect
          ref={shapeRef as React.RefObject<Konva.Rect>}
          x={layer.x}
          y={layer.y}
          width={layer.width}
          height={layer.height}
          fill={layer.fill}
          draggable
          onClick={() => setSelectedId(layer.id)}
          onTap={() => setSelectedId(layer.id)}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEndLocal}
          onTransformEnd={handleTransformEnd}
        />
      )}

      {/* Transformer: exibe as alças de redimensionamento */}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={getBoundBoxFunc(5)}
          keepRatio={layer.shapeType === 'circle'} // Círculos mantêm a proporção
          enabledAnchors={
            layer.shapeType === 'circle' 
              ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] // Círculo só redimensiona pelas pontas
              : ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'] // Retângulo redimensiona livre
          }
        />
      )}
    </>
  );
};
