import { LayerSpecification } from '@maplibre/maplibre-gl-style-spec';

/**
 * Checks if a value is an object with stops array (zoom-based interpolation).
 * Supports both legacy stops format and expression format.
 */
type StopsObject = {
  stops: [number, number][];
  base?: number;
};

function isStopsObject(value: unknown): value is StopsObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    'stops' in value &&
    Array.isArray((value as StopsObject).stops)
  );
}

/**
 * Extracts the zoom level where icon-opacity becomes visible (non-zero).
 * Returns null if the layer doesn't use zoom-based icon-opacity stops.
 */
function extractVisibleZoom(
  iconOpacity: unknown,
): { visibleZoom: number; visibleOpacity: number } | null {
  if (!isStopsObject(iconOpacity)) {
    return null;
  }

  const stops = iconOpacity.stops;

  // Find the first stop where opacity is non-zero
  for (let i = 0; i < stops.length; i++) {
    const [zoom, opacity] = stops[i];
    if (opacity > 0) {
      return { visibleZoom: zoom, visibleOpacity: opacity };
    }
  }

  return null;
}

/**
 * Checks if a layer uses icon-opacity with stops to hide/show icons at different zoom levels.
 * This is the pattern we want to transform into minzoom/maxzoom.
 */
export function hasIconOpacityStops(layer: LayerSpecification): boolean {
  if (layer.type !== 'symbol') {
    return false;
  }

  const paint = (layer as { paint?: Record<string, unknown> }).paint;
  if (!paint) {
    return false;
  }

  const iconOpacity = paint['icon-opacity'];
  return isStopsObject(iconOpacity);
}

/**
 * Splits a layer that uses icon-opacity stops into multiple layers using minzoom/maxzoom.
 *
 * When icon-opacity has stops like [[16, 0], [17, 0.4]], this means:
 * - At zoom 16: opacity is 0 (hidden)
 * - At zoom 17: opacity is 0.4 (visible)
 *
 * This function transforms such layers into layers with proper minzoom/maxzoom
 * settings, which is more efficient for rendering as the GPU can skip
 * rendering hidden layers entirely.
 *
 * @param layer - The layer to potentially split
 * @returns An array of layers. If the layer doesn't have icon-opacity stops
 *          or uses them for purposes other than show/hide, returns the original layer.
 */
export function splitIconOpacityLayer(
  layer: LayerSpecification,
): LayerSpecification[] {
  if (layer.type !== 'symbol') {
    return [layer];
  }

  // Type cast once for reuse throughout the function
  const symbolLayer = layer as LayerSpecification & {
    paint?: Record<string, unknown>;
    minzoom?: number;
  };

  const paint = symbolLayer.paint;
  if (!paint) {
    return [layer];
  }

  const iconOpacity = paint['icon-opacity'];
  const textOpacity = paint['text-opacity'];

  const iconInfo = extractVisibleZoom(iconOpacity);
  const textInfo = extractVisibleZoom(textOpacity);

  // If neither uses stops with a hidden-to-visible pattern, return original
  if (!iconInfo && !textInfo) {
    return [layer];
  }

  // Determine the zoom level at which the layer becomes visible.
  // If both icon and text have visible zooms, use the higher one (more conservative).
  // If only one exists, use that value. The early return above ensures at least one exists.
  const visibleZoom = Math.max(
    iconInfo?.visibleZoom ?? 0,
    textInfo?.visibleZoom ?? 0,
  );

  // This should not happen due to the early return above, but guard against edge cases
  if (visibleZoom === 0) {
    return [layer];
  }

  // Get the final opacity value (at the visible zoom)
  const finalIconOpacity = iconInfo?.visibleOpacity ?? undefined;
  const finalTextOpacity = textInfo?.visibleOpacity ?? undefined;

  // Create a new layer with minzoom set and constant opacity
  const newPaint = { ...paint };

  // Replace the stops with constant values
  if (iconInfo) {
    newPaint['icon-opacity'] = finalIconOpacity;
  }
  if (textInfo) {
    newPaint['text-opacity'] = finalTextOpacity;
  }

  // Create the new layer with minzoom
  // Use the higher of the existing minzoom and the computed visible zoom
  const existingMinzoom = symbolLayer.minzoom ?? 0;
  const newMinzoom = Math.max(existingMinzoom, visibleZoom);

  // We need to cast as unknown first to handle the type transition
  const newLayer = {
    ...layer,
    minzoom: newMinzoom,
    paint: newPaint,
  } as unknown as LayerSpecification;

  return [newLayer];
}

/**
 * Transforms all layers in a style that use icon-opacity stops for show/hide
 * into layers using minzoom/maxzoom instead.
 *
 * This is more efficient for rendering as the GPU can skip hidden layers
 * entirely rather than rendering them with 0 opacity.
 *
 * @param layers - The layers array from a MapLibre style
 * @returns A new layers array with transformed layers
 */
export function splitIconOpacityLayers(
  layers: LayerSpecification[],
): LayerSpecification[] {
  return layers.flatMap(splitIconOpacityLayer);
}
