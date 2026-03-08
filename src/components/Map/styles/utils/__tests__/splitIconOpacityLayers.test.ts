import { LayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import {
  hasIconOpacityStops,
  splitIconOpacityLayer,
  splitIconOpacityLayers,
} from '../splitIconOpacityLayers';

describe('splitIconOpacityLayers', () => {
  describe('hasIconOpacityStops', () => {
    it('returns true for symbol layer with icon-opacity stops', () => {
      const layer: LayerSpecification = {
        id: 'test-layer',
        type: 'symbol',
        source: 'test-source',
        paint: {
          'icon-opacity': {
            stops: [
              [16, 0],
              [17, 0.4],
            ],
          },
        },
      };
      expect(hasIconOpacityStops(layer)).toBe(true);
    });

    it('returns false for symbol layer with constant icon-opacity', () => {
      const layer: LayerSpecification = {
        id: 'test-layer',
        type: 'symbol',
        source: 'test-source',
        paint: {
          'icon-opacity': 0.5,
        },
      };
      expect(hasIconOpacityStops(layer)).toBe(false);
    });

    it('returns false for non-symbol layer', () => {
      const layer: LayerSpecification = {
        id: 'test-layer',
        type: 'fill',
        source: 'test-source',
        paint: {
          'fill-opacity': {
            stops: [
              [16, 0],
              [17, 0.4],
            ],
          },
        },
      };
      expect(hasIconOpacityStops(layer)).toBe(false);
    });

    it('returns false for symbol layer without paint property', () => {
      const layer: LayerSpecification = {
        id: 'test-layer',
        type: 'symbol',
        source: 'test-source',
      };
      expect(hasIconOpacityStops(layer)).toBe(false);
    });

    it('returns false for symbol layer without icon-opacity', () => {
      const layer: LayerSpecification = {
        id: 'test-layer',
        type: 'symbol',
        source: 'test-source',
        paint: {
          'text-color': '#000',
        },
      };
      expect(hasIconOpacityStops(layer)).toBe(false);
    });
  });

  describe('splitIconOpacityLayer', () => {
    it('transforms layer with hidden-to-visible icon-opacity stops', () => {
      const layer: LayerSpecification = {
        id: 'poi-layer',
        type: 'symbol',
        source: 'test-source',
        'source-layer': 'pois',
        paint: {
          'icon-opacity': {
            stops: [
              [16, 0],
              [17, 0.4],
            ],
          },
          'icon-color': 'rgb(85,85,85)',
        },
      };

      const result = splitIconOpacityLayer(layer);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'poi-layer',
        type: 'symbol',
        minzoom: 17,
        paint: {
          'icon-opacity': 0.4,
          'icon-color': 'rgb(85,85,85)',
        },
      });
    });

    it('handles both icon-opacity and text-opacity stops', () => {
      const layer: LayerSpecification = {
        id: 'poi-layer',
        type: 'symbol',
        source: 'test-source',
        paint: {
          'icon-opacity': {
            stops: [
              [16, 0],
              [17, 0.4],
            ],
          },
          'text-opacity': {
            stops: [
              [16, 0],
              [17, 0.4],
            ],
          },
        },
      };

      const result = splitIconOpacityLayer(layer);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        minzoom: 17,
        paint: {
          'icon-opacity': 0.4,
          'text-opacity': 0.4,
        },
      });
    });

    it('uses the higher zoom level when icon and text have different visible zooms', () => {
      const layer: LayerSpecification = {
        id: 'poi-layer',
        type: 'symbol',
        source: 'test-source',
        paint: {
          'icon-opacity': {
            stops: [
              [15, 0],
              [16, 0.4],
            ],
          },
          'text-opacity': {
            stops: [
              [17, 0],
              [18, 0.6],
            ],
          },
        },
      };

      const result = splitIconOpacityLayer(layer);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        minzoom: 18, // Uses the higher zoom
        paint: {
          'icon-opacity': 0.4,
          'text-opacity': 0.6,
        },
      });
    });

    it('preserves existing minzoom if higher than the visible zoom', () => {
      const layer: LayerSpecification = {
        id: 'poi-layer',
        type: 'symbol',
        source: 'test-source',
        minzoom: 18,
        paint: {
          'icon-opacity': {
            stops: [
              [16, 0],
              [17, 0.4],
            ],
          },
        },
      };

      const result = splitIconOpacityLayer(layer);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        minzoom: 18, // Preserved from original
      });
    });

    it('returns original layer unchanged for non-symbol layers', () => {
      const layer: LayerSpecification = {
        id: 'fill-layer',
        type: 'fill',
        source: 'test-source',
        paint: {
          'fill-color': '#ff0000',
        },
      };

      const result = splitIconOpacityLayer(layer);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(layer);
    });

    it('returns original layer unchanged for constant icon-opacity', () => {
      const layer: LayerSpecification = {
        id: 'poi-layer',
        type: 'symbol',
        source: 'test-source',
        paint: {
          'icon-opacity': 0.5,
        },
      };

      const result = splitIconOpacityLayer(layer);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(layer);
    });

    it('returns original layer when all stops have non-zero opacity', () => {
      const layer: LayerSpecification = {
        id: 'poi-layer',
        type: 'symbol',
        source: 'test-source',
        paint: {
          'icon-opacity': {
            stops: [
              [15, 0.3],
              [17, 0.6],
            ],
          },
        },
      };

      const result = splitIconOpacityLayer(layer);

      // First stop is already visible (0.3), so returns with minzoom at first visible stop
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        minzoom: 15,
        paint: {
          'icon-opacity': 0.3,
        },
      });
    });

    it('handles multiple zero-opacity stops before becoming visible', () => {
      const layer: LayerSpecification = {
        id: 'poi-layer',
        type: 'symbol',
        source: 'test-source',
        paint: {
          'icon-opacity': {
            stops: [
              [14, 0],
              [15, 0],
              [16, 0],
              [17, 0.4],
              [18, 0.6],
            ],
          },
        },
      };

      const result = splitIconOpacityLayer(layer);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        minzoom: 17, // First non-zero stop
        paint: {
          'icon-opacity': 0.4,
        },
      });
    });

    it('handles layer without paint property', () => {
      const layer: LayerSpecification = {
        id: 'poi-layer',
        type: 'symbol',
        source: 'test-source',
      };

      const result = splitIconOpacityLayer(layer);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(layer);
    });

    it('preserves other paint properties', () => {
      const layer: LayerSpecification = {
        id: 'poi-layer',
        type: 'symbol',
        source: 'test-source',
        paint: {
          'icon-opacity': {
            stops: [
              [16, 0],
              [17, 0.4],
            ],
          },
          'icon-color': '#ff0000',
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
      };

      const result = splitIconOpacityLayer(layer);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        paint: {
          'icon-opacity': 0.4,
          'icon-color': '#ff0000',
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
      });
    });

    it('preserves layout and other layer properties', () => {
      const layer: LayerSpecification = {
        id: 'poi-layer',
        type: 'symbol',
        source: 'test-source',
        'source-layer': 'pois',
        filter: ['==', ['get', 'class'], 'restaurant'],
        layout: {
          'icon-image': 'restaurant',
          'text-field': ['get', 'name'],
        },
        paint: {
          'icon-opacity': {
            stops: [
              [16, 0],
              [17, 0.4],
            ],
          },
        },
      };

      const result = splitIconOpacityLayer(layer);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'poi-layer',
        type: 'symbol',
        source: 'test-source',
        'source-layer': 'pois',
        filter: ['==', ['get', 'class'], 'restaurant'],
        layout: {
          'icon-image': 'restaurant',
          'text-field': ['get', 'name'],
        },
      });
    });
  });

  describe('splitIconOpacityLayers', () => {
    it('transforms all layers with icon-opacity stops', () => {
      const layers: LayerSpecification[] = [
        {
          id: 'background',
          type: 'background',
          paint: { 'background-color': '#fff' },
        },
        {
          id: 'poi-1',
          type: 'symbol',
          source: 'test',
          paint: {
            'icon-opacity': {
              stops: [
                [16, 0],
                [17, 0.4],
              ],
            },
          },
        },
        {
          id: 'road',
          type: 'line',
          source: 'test',
          paint: { 'line-color': '#000' },
        },
        {
          id: 'poi-2',
          type: 'symbol',
          source: 'test',
          paint: {
            'icon-opacity': {
              stops: [
                [14, 0],
                [15, 0.6],
              ],
            },
          },
        },
      ];

      const result = splitIconOpacityLayers(layers);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual(layers[0]); // background unchanged
      expect(result[1]).toMatchObject({
        id: 'poi-1',
        minzoom: 17,
        paint: { 'icon-opacity': 0.4 },
      });
      expect(result[2]).toEqual(layers[2]); // road unchanged
      expect(result[3]).toMatchObject({
        id: 'poi-2',
        minzoom: 15,
        paint: { 'icon-opacity': 0.6 },
      });
    });

    it('handles empty layers array', () => {
      const result = splitIconOpacityLayers([]);
      expect(result).toEqual([]);
    });

    it('preserves layer order', () => {
      const layers: LayerSpecification[] = [
        { id: 'a', type: 'background', paint: { 'background-color': '#fff' } },
        {
          id: 'b',
          type: 'symbol',
          source: 'test',
          paint: {
            'icon-opacity': {
              stops: [
                [16, 0],
                [17, 0.4],
              ],
            },
          },
        },
        {
          id: 'c',
          type: 'fill',
          source: 'test',
          paint: { 'fill-color': '#000' },
        },
      ];

      const result = splitIconOpacityLayers(layers);

      expect(result.map((l) => l.id)).toEqual(['a', 'b', 'c']);
    });
  });
});
