// src/features/editor/components/CanvasText.tsx
import { useRef, useEffect, useState } from 'react';
import { Text as KonvaText, Transformer, Group } from 'react-konva';
import { Html } from 'react-konva-utils';
import { useEditorStore, type Layer } from '../../../store/useEditorStore';
import { useSnapping } from '../hooks/useSnapping';
import type Konva from 'konva';

interface CanvasTextProps {
  layer: Layer;
}

export const CanvasText = ({ layer }: CanvasTextProps) => {
  const selectedId = useEditorStore((state) => state.selectedId);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const updateLayer = useEditorStore((state) => state.updateLayer);

  const isSelected = selectedId === layer.id;
  const [isEditing, setIsEditing] = useState(false);

  const { handleDragMove, handleDragEnd, getBoundBoxFunc } = useSnapping();

  const textRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // Se o usuário desmarcar o texto, fechar a edição
  useEffect(() => {
    if (!isSelected && isEditing) {
      setIsEditing(false);
    }
  }, [isSelected, isEditing]);

  useEffect(() => {
    if (isSelected && !isEditing && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, isEditing]);

  const [localText, setLocalText] = useState(layer.text || 'Seu texto aqui');

  // Sincroniza estado local quando a camada muda de fora (ex: sidebar) ou ao entrar em edição
  useEffect(() => {
    setLocalText(layer.text || 'Seu texto aqui');
  }, [layer.text, isEditing]);

  const textContent = layer.text || 'Seu texto aqui';
  const fontSize = layer.fontSize || 32;
  const fontFamily = layer.fontFamily || 'Inter';
  const fill = layer.fill || '#000000';

  return (
    <>
      {!isEditing && (
        <KonvaText
          ref={textRef}
          text={textContent}
          x={layer.x}
          y={layer.y}
          width={layer.width}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fill={fill}
          draggable={isSelected}
          onClick={() => setSelectedId(layer.id)}
          onTap={() => setSelectedId(layer.id)}
          onDblClick={() => setIsEditing(true)}
          onDblTap={() => setIsEditing(true)}
          
          onDragMove={handleDragMove}
          onDragEnd={(e) => {
            handleDragEnd();
            updateLayer(layer.id, {
              x: e.target.x(),
              y: e.target.y(),
            });
          }}

          // Evitar que as letras fiquem esticadas durante o redimensionamento
          onTransform={() => {
            const node = textRef.current;
            if (!node) return;

            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            // Resetamos a escala instantaneamente
            node.scaleX(1);
            node.scaleY(1);

            // Atualizamos a largura e fonte no próprio KonvaText em tempo real
            node.width(Math.max(20, node.width() * scaleX));
            node.fontSize(Math.max(10, node.fontSize() * scaleY));
          }}

          onTransformEnd={() => {
            const node = textRef.current;
            if (!node) return;
            
            updateLayer(layer.id, {
              x: node.x(),
              y: node.y(),
              width: node.width(),
              fontSize: node.fontSize(),
            });
          }}
        />
      )}

      {isEditing && (
        <Group x={layer.x} y={layer.y}>
          <Html divProps={{ style: { position: 'absolute' } }}>
            <textarea
              value={localText}
              onChange={(e) => setLocalText(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                updateLayer(layer.id, { text: localText });
              }}
              autoFocus
              style={{
                width: layer.width ? `${layer.width}px` : 'auto',
                minWidth: '100px',
                height: `${fontSize * 1.5}px`, // Aproximação da altura
                fontSize: `${fontSize}px`,
                fontFamily: fontFamily,
                color: fill,
                background: 'transparent',
                border: '1px dashed #3b82f6',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                padding: '0px',
                margin: '0px',
                lineHeight: 1,
              }}
            />
          </Html>
        </Group>
      )}
      
      {isSelected && !isEditing && (
        <Transformer
          ref={trRef}
          anchorFill="#ffffff"
          anchorStroke="#3b82f6"
          anchorSize={10}
          anchorCornerRadius={5}
          borderStroke="#3b82f6"
          borderStrokeWidth={2}
          padding={5}
          // Habilitar as alças laterais para alterar só a largura e as do canto para tamanho
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'middle-left',
            'middle-right',
          ]}
          boundBoxFunc={getBoundBoxFunc(20)}
        />
      )}
    </>
  );
};
