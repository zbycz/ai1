import { fetchParentFeatures } from '../../../../../services/osm/fetchParentFeatures';
import { fetchWays } from '../../../../../services/osm/fetchWays';
import { addEmptyOriginalState, fetchFreshItem } from '../itemsHelpers';
import { getNewId } from '../../../../../services/getCoordsFeature';

import { DataItem } from '../types';
import { convertToRelationFactory } from '../convertToRelationFactory';
import { describe, it, expect, beforeEach, mock } from 'bun:test';

mock.module('../../../../../services/osm/fetchParentFeatures', () => ({
  fetchParentFeatures: mock(),
}));
mock.module('../../../../../services/osm/fetchWays', () => ({
  fetchWays: mock(),
}));
mock.module('../itemsHelpers', async () => {
  const actual = await import('../itemsHelpers');
  return { ...actual, fetchFreshItem: mock() };
});
mock.module('../../../../../services/getCoordsFeature', () => ({
  getNewId: mock(),
}));

const initialNode: DataItem = addEmptyOriginalState({
  shortId: 'n123',
  version: 1,
  tagsEntries: [
    ['natural', 'peak'],
    ['name', 'stays in both'],
    ['climbing', 'crag'],
    ['climbing:asdf', 'ghj'],
    ['sport', 'climbing'],
  ],
  toBeDeleted: false,
  nodeLonLat: [14, 50],
  sections: [],
});

const parentFeature = { osmMeta: { type: 'relation', id: 99 } };
const parentItem = {
  shortId: 'r99',
  tagsEntries: [['type', 'site']],
  version: 1,
  toBeDeleted: false,
  members: [],
} as DataItem;

describe('convertToRelationFactory', () => {
  beforeEach(() => {
  });

  it('should convert node to relation', async () => {
    (fetchParentFeatures as any).mockResolvedValue([parentFeature]);
    (fetchFreshItem as any).mockResolvedValue(parentItem);
    (fetchWays as any).mockResolvedValue([]);
    (getNewId as any).mockReturnValue(-1);

    let data = [initialNode];
    const setData = (fn: (prev: DataItem[]) => DataItem[]) => {
      data = fn(data);
    };

    const convertToRelation = convertToRelationFactory(setData, 'n123');

    const newShortId = await convertToRelation();
    expect(newShortId).toBe('r-1');

    expect(data).toHaveLength(3);
    expect(data[0].shortId).toBe('n123');
    expect(data[0].tagsEntries).toEqual([
      ['natural', 'peak'],
      ['name', 'stays in both'],
    ]);
    expect(data[1].shortId).toBe('r-1');
    expect(data[1].tagsEntries).toEqual([
      ['type', 'site'],
      ['site', 'climbing'],
      ['name', 'stays in both'],
      ['climbing', 'crag'],
      ['climbing:asdf', 'ghj'],
      ['sport', 'climbing'],
    ]);
    expect(data[2].shortId).toBe('r99');
  });

  it('should throw error if node is part of a way', async () => {
    (fetchParentFeatures as any).mockResolvedValue([]);
    (fetchWays as any).mockResolvedValue([{}]);
    (getNewId as any).mockReturnValue(-1);

    let data = [initialNode];
    const setData = (fn: (prev: DataItem[]) => DataItem[]) => {
      data = fn(data);
    };

    const convertToRelation = convertToRelationFactory(setData, 'n123');

    await expect(convertToRelation()).rejects.toThrow(
      "Can't convert node n123 which is part of a way.",
    );
  });
});
