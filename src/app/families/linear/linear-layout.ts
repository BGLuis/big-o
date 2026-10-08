import { BoundingBox } from '../../engine/engine.types';
import { LinearState } from './linear-state';

export interface LinearLayoutResult {
  readonly elementBoxes: Map<string, BoundingBox>;
  readonly auxBoxes: Map<string, BoundingBox>;
  readonly barWidth: number;
  readonly showValueLabels: boolean;
  readonly showIndexLabels: boolean;
  readonly containerWidth: number;
  readonly containerHeight: number;
  readonly hasAux: boolean;
  readonly mainAreaHeight: number;
  readonly auxTitleY: number;
}

export function computeLinearLayout(
  state: LinearState,
  containerWidth: number,
  containerHeight: number
): LinearLayoutResult {
  const elementBoxes = new Map<string, BoundingBox>();
  const auxBoxes = new Map<string, BoundingBox>();
  const count = state.elements.length;
  const auxCount = state.auxElements?.length ?? 0;
  const hasAux = auxCount > 0;

  const paddingX = Math.min(16, containerWidth * 0.04);
  const paddingTop = 20;
  const paddingBottom = 30; // Room for index labels

  const mainAreaHeight = hasAux
    ? Math.max(100, Math.round(containerHeight * 0.58))
    : containerHeight;

  const usableWidth = Math.max(40, containerWidth - paddingX * 2);
  const usableHeight = Math.max(30, mainAreaHeight - paddingTop - paddingBottom);

  // Dynamic gap between 2px and 8px
  const gap = count > 30 ? 2 : count > 15 ? 4 : 8;

  // Bar width calculation with bounds
  const rawBarWidth = count > 0 ? (usableWidth - (count - 1) * gap) / count : 32;
  const barWidth = Math.max(4, Math.min(52, rawBarWidth));

  const totalContentWidth = count * barWidth + (count - 1) * gap;
  const startX = paddingX + Math.max(0, (usableWidth - totalContentWidth) / 2);

  // Determine label visibility thresholds based on bar width (min 20px for labels)
  const showValueLabels = barWidth >= 22;
  const showIndexLabels = barWidth >= 16;

  // Max value to scale bar heights proportionally
  const maxValue = Math.max(...state.elements.map((el) => el.value), 1);
  const minBarHeight = 16;

  for (let i = 0; i < count; i++) {
    const el = state.elements[i];
    const x = startX + i * (barWidth + gap);
    const normalizedHeight = (el.value / maxValue) * usableHeight;
    const height = Math.max(minBarHeight, Math.round(normalizedHeight));
    const y = paddingTop + (usableHeight - height);

    elementBoxes.set(el.id, {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      width: Math.round(barWidth * 10) / 10,
      height: Math.round(height * 10) / 10
    });
  }

  // Layout for auxiliary elements
  const auxTitleY = mainAreaHeight + 14;
  if (hasAux) {
    const auxGap = auxCount > 20 ? 2 : 6;
    const rawAuxWidth = (usableWidth - (auxCount - 1) * auxGap) / auxCount;
    const auxWidth = Math.max(14, Math.min(48, rawAuxWidth));
    const auxHeight = Math.min(36, Math.max(24, containerHeight - (mainAreaHeight + 26) - 20));
    const totalAuxWidth = auxCount * auxWidth + (auxCount - 1) * auxGap;
    const auxStartX = paddingX + Math.max(0, (usableWidth - totalAuxWidth) / 2);
    const auxY = mainAreaHeight + 24;

    for (let i = 0; i < auxCount; i++) {
      const item = state.auxElements[i];
      const x = auxStartX + i * (auxWidth + auxGap);
      auxBoxes.set(item.id, {
        x: Math.round(x * 10) / 10,
        y: Math.round(auxY * 10) / 10,
        width: Math.round(auxWidth * 10) / 10,
        height: Math.round(auxHeight * 10) / 10
      });
    }
  }

  return {
    elementBoxes,
    auxBoxes,
    barWidth,
    showValueLabels,
    showIndexLabels,
    containerWidth,
    containerHeight,
    hasAux,
    mainAreaHeight,
    auxTitleY
  };
}
