import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec';

type StopsProperty = {
  stops: [number, number][];
};

type LayerWithIconPaint = LayerSpecification & {
  paint: Record<string, unknown>;
};

const isStopsProperty = (value: unknown): value is StopsProperty =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  'stops' in value &&
  Array.isArray((value as StopsProperty).stops);

/**
 * Splits layers that use zoom-based `icon-opacity` stops into multiple layers
 * using `minzoom`/`maxzoom` instead. This frees up `icon-opacity` for use by
 * `addHoverPaint` hover effects.
 *
 * For example, a layer with `icon-opacity: { stops: [[16, 0], [17, 0.4]] }`
 * is converted to a single layer with `minzoom: 17` and `icon-opacity: 0.4`,
 * because the icon is invisible below zoom 17.
 */
export const splitIconOpacityLayers = (
  layers: LayerSpecification[],
): LayerSpecification[] =>
  layers.flatMap((layer) => {
    if (!('paint' in layer) || !layer.paint) return [layer];

    const iconOpacity = layer.paint['icon-opacity'];
    if (!isStopsProperty(iconOpacity)) return [layer];

    const { stops } = iconOpacity;
    if (stops.length < 2) return [layer];

    const result: LayerSpecification[] = [];

    for (let i = 0; i < stops.length; i++) {
      const [zoom, opacity] = stops[i];

      // Skip segments where opacity is 0 (icon is invisible)
      if (opacity === 0) continue;

      const nextStop = stops[i + 1];

      const newLayer = JSON.parse(JSON.stringify(layer)) as LayerWithIconPaint;

      // Set minzoom respecting existing layer minzoom
      newLayer.minzoom = Math.max(zoom, layer.minzoom ?? 0);

      // Set maxzoom respecting existing layer maxzoom
      if (nextStop) {
        newLayer.maxzoom = layer.maxzoom
          ? Math.min(nextStop[0], layer.maxzoom)
          : nextStop[0];
      } else if (layer.maxzoom != null) {
        newLayer.maxzoom = layer.maxzoom;
      } else {
        delete newLayer.maxzoom;
      }

      // Replace zoom-based stops with static opacity value
      newLayer.paint['icon-opacity'] = opacity;

      // Generate unique layer id
      newLayer.id = `${layer.id}-z${zoom}`;

      result.push(newLayer);
    }

    return result.length > 0 ? result : [layer];
  });
