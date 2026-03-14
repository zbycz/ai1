import React, { useEffect } from 'react';
import { RoutesLayer } from '../src/components/FeaturePanel/Climbing/Editor/RoutesLayer';
import {
  ClimbingContextProvider,
  useClimbingContext,
} from '../src/components/FeaturePanel/Climbing/contexts/ClimbingContext';
import type { Feature } from '../src/services/types';
import type { ClimbingRoute } from '../src/components/FeaturePanel/Climbing/types';

const PHOTO_URL = 'example-crag-photo';

const SAMPLE_FEATURE: Feature = {
  type: 'Feature',
  osmMeta: { type: 'relation', id: 1 },
  tags: { name: 'Example Crag', natural: 'rock', sport: 'climbing' },
  properties: { class: '', subclass: '' },
  center: [14.42, 50.08],
};

const SAMPLE_ROUTES: ClimbingRoute[] = [
  {
    id: 'route-1',
    feature: { ...SAMPLE_FEATURE, osmMeta: { type: 'way', id: 101 } },
    updatedTags: { name: 'Morning Slab', 'climbing:grade:uiaa': '5+' },
    paths: {
      [PHOTO_URL]: [
        { x: 25, y: 92, units: 'percentage' },
        { x: 27, y: 70, units: 'percentage' },
        { x: 23, y: 50, units: 'percentage' },
        { x: 26, y: 30, units: 'percentage' },
        { x: 24, y: 10, units: 'percentage', type: 'anchor' },
      ],
    },
  },
  {
    id: 'route-2',
    feature: { ...SAMPLE_FEATURE, osmMeta: { type: 'way', id: 102 } },
    updatedTags: { name: 'The Crack', 'climbing:grade:uiaa': '7a' },
    paths: {
      [PHOTO_URL]: [
        { x: 50, y: 92, units: 'percentage' },
        { x: 52, y: 65, units: 'percentage' },
        { x: 48, y: 45, units: 'percentage' },
        { x: 51, y: 25, units: 'percentage' },
        { x: 50, y: 8, units: 'percentage', type: 'anchor' },
      ],
    },
  },
  {
    id: 'route-3',
    feature: { ...SAMPLE_FEATURE, osmMeta: { type: 'way', id: 103 } },
    updatedTags: { name: 'Right Wall', 'climbing:grade:uiaa': '6b' },
    paths: {
      [PHOTO_URL]: [
        { x: 75, y: 92, units: 'percentage' },
        { x: 73, y: 68, units: 'percentage' },
        { x: 77, y: 48, units: 'percentage' },
        { x: 74, y: 28, units: 'percentage' },
        { x: 76, y: 10, units: 'percentage', type: 'anchor' },
      ],
    },
  },
];

const Setup = () => {
  const { setRoutes, setPhotoPath, setImageSize, setAreRoutesLoading } =
    useClimbingContext();

  useEffect(() => {
    setImageSize({ width: window.innerWidth, height: window.innerHeight });
    setPhotoPath(PHOTO_URL);
    setRoutes(SAMPLE_ROUTES);
    setAreRoutesLoading(false);
  }, [setAreRoutesLoading, setImageSize, setPhotoPath, setRoutes]);

  return null;
};

export default function IndexPage() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#d6c9b0',
      }}
    >
      <ClimbingContextProvider feature={SAMPLE_FEATURE}>
        <Setup />
        <RoutesLayer isVisible />
      </ClimbingContextProvider>
    </div>
  );
}
