// src/features/editor/components/CanvasImage.tsx
import { useRef, useEffect } from 'react';
// Importamos o Transformer do react-konva
import { Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import { useEditorStore, type Layer } from '../../../store/useEditorStore';
import { useSnapping } from '../hooks/useSnapping';
// Importamos tipagens internas do Konva para garantir a segurança no TypeScript
import type Konva from 'konva';

interface CanvasImageProps {
  layer: Layer;
}

/**
 * Componente CanvasImage
 * Responsável por desenhar uma única camada (Layer) no palco do Konva.
 */
export const CanvasImage = ({ layer }: CanvasImageProps) => {
  // useImage tenta carregar a imagem e retorna um array. 
  // O primeiro item é a imagem pronta, ou 'undefined' enquanto carrega.
  const [image] = useImage(layer.url || '');

  // Pegamos o ID selecionado e as ações de atualizar da nossa Store
  const selectedId = useEditorStore((state) => state.selectedId);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const updateLayer = useEditorStore((state) => state.updateLayer);

  // Verificamos se esta imagem específica é a que está selecionada
  const isSelected = selectedId === layer.id;

  const { handleDragMove, handleDragEnd, getBoundBoxFunc } = useSnapping();

  // Criamos referências para acessar os elementos desenhados pelo Konva na tela
  const imageRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // Este useEffect "gruda" o Transformer na imagem sempre que ela for selecionada
  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      // Dizemos ao Transformer: "Assuma o controle deste nó (imagem)"
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  if (!image) return null;

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={image}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        draggable
        // Quando a imagem for clicada ou tocada, avisamos a Store
        onClick={() => setSelectedId(layer.id)}
        onTap={() => setSelectedId(layer.id)}
        
        onDragMove={handleDragMove}
        // Quando o usuário termina de arrastar, salvamos a nova posição (x, y) na Store
        onDragEnd={(e) => {
          handleDragEnd();
          updateLayer(layer.id, {
            x: e.target.x(),
            y: e.target.y(),
          });
        }}

        // Quando o usuário termina de redimensionar (esticar), calculamos o novo tamanho
        onTransformEnd={() => {
          const node = imageRef.current;
          if (!node) return;

          // O Konva altera a "escala" em vez da largura ao usar o Transformer.
          // Precisamos ler essa escala e multiplicá-la pela largura original
          // para ter o tamanho real na nossa Store.
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // Reseta a escala visual para 1 (importante para evitar distorções futuras)
          node.scaleX(1);
          node.scaleY(1);

          // Atualiza a Store com o novo tamanho e posição finais
          updateLayer(layer.id, {
            x: node.x(),
            y: node.y(),
            // Evita que a imagem fique com tamanho negativo ou zero (min: 5px)
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      
      {/* O Transformer só aparece se a imagem estiver selecionada */}
      {isSelected && (
        <Transformer
          ref={trRef}
          anchorFill="#ffffff"
          anchorStroke="#3b82f6"
          anchorSize={10}
          anchorCornerRadius={5}
          borderStroke="#3b82f6"
          borderStrokeWidth={2}
          padding={5}
          boundBoxFunc={getBoundBoxFunc(10)}
        />
      )}
    </>
  );
};