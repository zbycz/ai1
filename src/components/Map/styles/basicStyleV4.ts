// MapTiler Planet v4 style based on basicStyle
// Uses the planet-v4 tile schema which offers improved performance and more features
// https://docs.maptiler.com/schema/planet-v4/

import { LayerSpecification } from '@maplibre/maplibre-gl-style-spec';

import { addHoverPaint } from '../behaviour/featureHover';
import { GLYPHS, OSMAPP_SOURCES, OSMAPP_SPRITE } from '../consts';
import { splitIconOpacityLayers } from './utils/splitIconOpacityLayers';
import { basicStyle } from './basicStyle';

/**
 * Transforms layers to use maptiler_planet_v4 source instead of maptiler_planet
 */
function transformToV4Layers(
  layers: LayerSpecification[],
): LayerSpecification[] {
  return layers.map((layer) => {
    // Type guard for layers with source property
    const sourceLayer = layer as LayerSpecification & {
      source?: string;
    };

    if (sourceLayer.source === 'maptiler_planet') {
      return {
        ...layer,
        source: 'maptiler_planet_v4',
      };
    }
    return layer;
  });
}

// Get the base layers from basicStyle and transform them to v4
const v4Layers = splitIconOpacityLayers(
  transformToV4Layers((basicStyle as { layers: LayerSpecification[] }).layers),
);

export const basicStyleV4 = addHoverPaint({
  version: 8,
  name: 'OSM Bright v4',
  sources: OSMAPP_SOURCES,
  sprite: OSMAPP_SPRITE,
  glyphs: GLYPHS,
  layers: v4Layers,
  id: 'basic-style-v4',
});
