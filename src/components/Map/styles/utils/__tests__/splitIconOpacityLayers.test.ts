import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec';
import { splitIconOpacityLayers } from '../splitIconOpacityLayers';

const makeSymbolLayer = (
  overrides: Partial<LayerSpecification> & { id: string },
): LayerSpecification =>
  ({
    type: 'symbol',
    source: 'test-source',
    'source-layer': 'poi',
    ...overrides,
  }) as LayerSpecification;

describe('splitIconOpacityLayers', () => {
  it('passes through layers without paint', () => {
    const layers = [makeSymbolLayer({ id: 'no-paint' })];
    expect(splitIconOpacityLayers(layers)).toEqual(layers);
  });

  it('passes through layers without icon-opacity', () => {
    const layers = [
      makeSymbolLayer({
        id: 'text-only',
        paint: { 'text-color': '#000' },
      }),
    ];
    expect(splitIconOpacityLayers(layers)).toEqual(layers);
  });

  it('passes through layers with static numeric icon-opacity (0.4)', () => {
    const layers = [
      makeSymbolLayer({
        id: 'oneway',
        paint: { 'icon-opacity': 0.4 },
      }),
    ];
    expect(splitIconOpacityLayers(layers)).toEqual(layers);
  });

  it('passes through layers with static numeric icon-opacity (0.7) - shortbread transport pattern', () => {
    const layers = [
      makeSymbolLayer({
        id: 'poi-transport',
        paint: { 'icon-opacity': 0.7, 'icon-color': 'rgb(102,98,106)' },
        minzoom: 15,
      }),
    ];
    expect(splitIconOpacityLayers(layers)).toEqual(layers);
  });

  it('passes through layers with expression-based icon-opacity (hover pattern)', () => {
    const hoverExpression = [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      0.5,
      1,
    ];
    const layers = [
      makeSymbolLayer({
        id: 'poi-hover',
        paint: { 'icon-opacity': hoverExpression as any },
      }),
    ];
    expect(splitIconOpacityLayers(layers)).toEqual(layers);
  });

  it('passes through non-symbol layers (fill type)', () => {
    const layer = {
      id: 'landcover',
      type: 'fill',
      source: 'test-source',
      'source-layer': 'landcover',
      paint: { 'fill-color': '#green' },
    } as LayerSpecification;
    expect(splitIconOpacityLayers([layer])).toEqual([layer]);
  });

  it('splits shortbread pattern: stops [[16, 0], [17, 0.4]]', () => {
    const layers = [
      makeSymbolLayer({
        id: 'poi-waste',
        paint: {
          'icon-opacity': {
            stops: [
              [16, 0],
              [17, 0.4],
            ],
          } as any,
          'text-opacity': {
            stops: [
              [16, 0],
              [17, 0.4],
            ],
          } as any,
        },
      }),
    ];

    const result = splitIconOpacityLayers(layers);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('poi-waste-z17');
    expect(result[0].minzoom).toBe(17);
    expect(result[0]).not.toHaveProperty('maxzoom');
    expect((result[0] as any).paint['icon-opacity']).toBe(0.4);
    // text-opacity should remain unchanged
    expect((result[0] as any).paint['text-opacity']).toEqual({
      stops: [
        [16, 0],
        [17, 0.4],
      ],
    });
  });

  it('splits shortbread pattern: stops [[16, 0], [17, 0.4], [20, 0.4]]', () => {
    const layers = [
      makeSymbolLayer({
        id: 'poi-health',
        paint: {
          'icon-opacity': {
            stops: [
              [16, 0],
              [17, 0.4],
              [20, 0.4],
            ],
          } as any,
        },
      }),
    ];

    const result = splitIconOpacityLayers(layers);

    // Two segments: z17 with maxzoom 20, z20 without maxzoom
    expect(result).toHaveLength(2);

    expect(result[0].id).toBe('poi-health-z17');
    expect(result[0].minzoom).toBe(17);
    expect(result[0].maxzoom).toBe(20);
    expect((result[0] as any).paint['icon-opacity']).toBe(0.4);

    expect(result[1].id).toBe('poi-health-z20');
    expect(result[1].minzoom).toBe(20);
    expect(result[1]).not.toHaveProperty('maxzoom');
    expect((result[1] as any).paint['icon-opacity']).toBe(0.4);
  });

  it('handles multiple non-zero stops', () => {
    const layers = [
      makeSymbolLayer({
        id: 'poi-multi',
        paint: {
          'icon-opacity': {
            stops: [
              [10, 0.3],
              [14, 0.7],
              [18, 1],
            ],
          } as any,
        },
      }),
    ];

    const result = splitIconOpacityLayers(layers);

    expect(result).toHaveLength(3);

    expect(result[0].id).toBe('poi-multi-z10');
    expect(result[0].minzoom).toBe(10);
    expect(result[0].maxzoom).toBe(14);
    expect((result[0] as any).paint['icon-opacity']).toBe(0.3);

    expect(result[1].id).toBe('poi-multi-z14');
    expect(result[1].minzoom).toBe(14);
    expect(result[1].maxzoom).toBe(18);
    expect((result[1] as any).paint['icon-opacity']).toBe(0.7);

    expect(result[2].id).toBe('poi-multi-z18');
    expect(result[2].minzoom).toBe(18);
    expect(result[2]).not.toHaveProperty('maxzoom');
    expect((result[2] as any).paint['icon-opacity']).toBe(1);
  });

  it('respects existing minzoom on the layer', () => {
    const layers = [
      makeSymbolLayer({
        id: 'poi-existing-minzoom',
        minzoom: 15,
        paint: {
          'icon-opacity': {
            stops: [
              [12, 0],
              [14, 0.5],
            ],
          } as any,
        },
      }),
    ];

    const result = splitIconOpacityLayers(layers);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('poi-existing-minzoom-z14');
    // minzoom should be max(14, 15) = 15
    expect(result[0].minzoom).toBe(15);
  });

  it('respects existing maxzoom on the layer', () => {
    const layers = [
      makeSymbolLayer({
        id: 'poi-existing-maxzoom',
        maxzoom: 18,
        paint: {
          'icon-opacity': {
            stops: [
              [12, 0],
              [14, 0.5],
            ],
          } as any,
        },
      }),
    ];

    const result = splitIconOpacityLayers(layers);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('poi-existing-maxzoom-z14');
    expect(result[0].minzoom).toBe(14);
    expect(result[0].maxzoom).toBe(18);
  });

  it('clamps maxzoom when existing maxzoom is lower than next stop', () => {
    const layers = [
      makeSymbolLayer({
        id: 'poi-clamped',
        maxzoom: 16,
        paint: {
          'icon-opacity': {
            stops: [
              [10, 0],
              [14, 0.5],
              [18, 1],
            ],
          } as any,
        },
      }),
    ];

    const result = splitIconOpacityLayers(layers);

    expect(result).toHaveLength(2);
    expect(result[0].maxzoom).toBe(16); // min(18, 16) = 16
    expect(result[1].maxzoom).toBe(16); // existing maxzoom preserved
  });

  it('handles all-zero opacity stops by returning original layer', () => {
    const layers = [
      makeSymbolLayer({
        id: 'poi-invisible',
        paint: {
          'icon-opacity': {
            stops: [
              [10, 0],
              [20, 0],
            ],
          } as any,
        },
      }),
    ];

    const result = splitIconOpacityLayers(layers);
    // All stops have 0 opacity, so no new layers; returns original
    expect(result).toEqual(layers);
  });

  it('processes multiple layers independently', () => {
    const layers = [
      makeSymbolLayer({
        id: 'poi-a',
        paint: {
          'icon-opacity': {
            stops: [
              [16, 0],
              [17, 0.4],
            ],
          } as any,
        },
      }),
      makeSymbolLayer({
        id: 'poi-b',
        paint: { 'icon-opacity': 0.7 },
      }),
      makeSymbolLayer({
        id: 'poi-c',
        paint: {
          'icon-opacity': {
            stops: [
              [12, 0],
              [14, 0.5],
              [18, 1],
            ],
          } as any,
        },
      }),
    ];

    const result = splitIconOpacityLayers(layers);

    // poi-a: 1 layer (z17)
    // poi-b: 1 layer (unchanged)
    // poi-c: 2 layers (z14, z18)
    expect(result).toHaveLength(4);
    expect(result.map((l) => l.id)).toEqual([
      'poi-a-z17',
      'poi-b',
      'poi-c-z14',
      'poi-c-z18',
    ]);
  });

  it('preserves other paint properties when splitting', () => {
    const layers = [
      makeSymbolLayer({
        id: 'poi-styled',
        paint: {
          'icon-opacity': {
            stops: [
              [16, 0],
              [17, 0.4],
            ],
          } as any,
          'icon-color': 'rgb(102,98,106)',
          'text-color': '#333',
          'text-halo-width': 2,
        },
      }),
    ];

    const result = splitIconOpacityLayers(layers);

    expect(result).toHaveLength(1);
    const paint = (result[0] as any).paint;
    expect(paint['icon-opacity']).toBe(0.4);
    expect(paint['icon-color']).toBe('rgb(102,98,106)');
    expect(paint['text-color']).toBe('#333');
    expect(paint['text-halo-width']).toBe(2);
  });

  it('preserves layout and filter properties when splitting', () => {
    const layers = [
      makeSymbolLayer({
        id: 'poi-complex',
        filter: ['==', 'class', 'shop'],
        layout: {
          'icon-image': 'shop_11',
          'text-font': ['Noto Sans Regular'],
        },
        paint: {
          'icon-opacity': {
            stops: [
              [16, 0],
              [17, 0.4],
            ],
          } as any,
        },
      }),
    ];

    const result = splitIconOpacityLayers(layers);

    expect(result).toHaveLength(1);
    expect((result[0] as any).filter).toEqual(['==', 'class', 'shop']);
    expect((result[0] as any).layout['icon-image']).toBe('shop_11');
  });

  it('deep clones layers to avoid mutation', () => {
    const original = makeSymbolLayer({
      id: 'poi-mutation-test',
      paint: {
        'icon-opacity': {
          stops: [
            [16, 0],
            [17, 0.4],
          ],
        } as any,
        'text-color': '#000',
      },
    });
    const layers = [original];

    const result = splitIconOpacityLayers(layers);

    // Modify the result
    (result[0] as any).paint['text-color'] = '#fff';

    // Original should not be affected
    expect((original as any).paint['text-color']).toBe('#000');
  });

  it('handles empty layers array', () => {
    expect(splitIconOpacityLayers([])).toEqual([]);
  });

  it('handles single stop (edge case - should pass through)', () => {
    const layers = [
      makeSymbolLayer({
        id: 'poi-single-stop',
        paint: {
          'icon-opacity': { stops: [[16, 0.5]] } as any,
        },
      }),
    ];

    // Single stop is not enough for splitting (< 2 stops)
    expect(splitIconOpacityLayers(layers)).toEqual(layers);
  });
});
