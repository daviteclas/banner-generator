// src/utils/formats.ts
import type { BannerFormat } from '../store/useEditorStore';

/**
 * Lista de formatos suportados pelo nosso Gerador de Banners.
 * Separar esses dados aqui facilita caso precisemos adicionar novos formatos no futuro.
 * O componente FormatSelector lê esta lista automaticamente para gerar os botões.
 */
export const BANNER_FORMATS: BannerFormat[] = [
  {
    id: 'ppl',
    name: '1200x628 (PPL - Push, Meta)',
    width: 1200,
    height: 628,
  },
  {
    // NOVO FORMATO ADICIONADO: Proporção específica para notificações Push
    id: 'push-500',
    name: '1200x500 (Push)',
    width: 1200,
    height: 500,
  },
  {
    id: 'ippl',
    name: '1080x1320 (IPPL - Instagram)',
    width: 1080,
    height: 1320,
  },
  {
    id: 'story',
    name: '1080x1920 (Story Fullscreen)',
    width: 1080,
    height: 1920,
  },
  {
    id: 'square',
    name: '1200x1200 (Quadrado - Meta)',
    width: 1200,
    height: 1200,
  },
];