/**
 * Props para o nosso componente de Canvas.
 * Ele precisa receber a escala calculada externamente.
 */
// src/features/editor/components/BannerCanvas.tsx
import { Stage, Layer, Rect, Line } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useEditorStore } from '../../../store/useEditorStore';
import { CanvasImage } from './CanvasImage';
import { CanvasText } from './CanvasText';
import { CanvasShape } from './CanvasShape';
import type Konva from 'konva';

interface BannerCanvasProps {
  scale: number;
  stageRef?: React.RefObject<Konva.Stage | null>;
}

export const BannerCanvas = ({ scale, stageRef }: BannerCanvasProps) => {
  // Pegamos os valores separadamente para evitar loops de re-renderização
  const format = useEditorStore((state) => state.format);
  const layers = useEditorStore((state) => state.layers);
  const setSelectedId = useEditorStore((state) => state.setSelectedId);
  const backgroundColor = useEditorStore((state) => state.backgroundColor);

  // Função que verifica se clicamos no fundo vazio
  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // O e.target é o elemento clicado. O e.target.getStage() é o palco inteiro.
    // Se forem iguais, significa que clicamos no vazio (ou no retângulo de fundo).
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null); // Remove a seleção
    }
  };

  const PADDING = 20; // Espaço extra para o Transformer não ser cortado nas bordas

  return (
    <Stage
      ref={stageRef}
      width={format.width * scale + PADDING * 2}
      height={format.height * scale + PADDING * 2}
      className="drop-shadow-2xl"
      // Detecta cliques (mouse) ou toques (celular) no palco
      onMouseDown={checkDeselect}
      onTouchStart={checkDeselect}
    >
      <Layer x={PADDING} y={PADDING} scale={{ x: scale, y: scale }}>
        <Rect
          x={0}
          y={0}
          width={format.width}
          height={format.height}
          fill={backgroundColor}
          cornerRadius={0}
          // Permitir clicar no retângulo para deselecionar também
          onMouseDown={() => setSelectedId(null)}
          onTouchStart={() => setSelectedId(null)}
        />
        
        {layers.map((layer) => {
          if (layer.type === 'text') {
            return <CanvasText key={layer.id} layer={layer} />;
          }
          if (layer.type === 'shape') {
            return <CanvasShape key={layer.id} layer={layer} />;
          }
          return <CanvasImage key={layer.id} layer={layer} />;
        })}

        {/* Linhas Guias Magnéticas */}
        {useEditorStore((state) => state.guides).map((pts, i) => (
          <Line
            key={`guide-${i}`}
            points={pts}
            stroke="#ec4899" // Rosa estilo Canva
            strokeWidth={1}
            dash={[4, 4]}
          />
        ))}
      </Layer>
    </Stage>
  );
};