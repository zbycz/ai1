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
        { x: 0.25, y: 0.92, units: 'percentage' },
        { x: 0.27, y: 0.7, units: 'percentage' },
        { x: 0.23, y: 0.5, units: 'percentage' },
        { x: 0.26, y: 0.3, units: 'percentage' },
        { x: 0.24, y: 0.1, units: 'percentage', type: 'anchor' },
      ],
    },
  },
  {
    id: 'route-2',
    feature: { ...SAMPLE_FEATURE, osmMeta: { type: 'way', id: 102 } },
    updatedTags: { name: 'The Crack', 'climbing:grade:uiaa': '7a' },
    paths: {
      [PHOTO_URL]: [
        { x: 0.5, y: 0.92, units: 'percentage' },
        { x: 0.52, y: 0.65, units: 'percentage' },
        { x: 0.48, y: 0.45, units: 'percentage' },
        { x: 0.51, y: 0.25, units: 'percentage' },
        { x: 0.5, y: 0.08, units: 'percentage', type: 'anchor' },
      ],
    },
  },
  {
    id: 'route-3',
    feature: { ...SAMPLE_FEATURE, osmMeta: { type: 'way', id: 103 } },
    updatedTags: { name: 'Right Wall', 'climbing:grade:uiaa': '6b' },
    paths: {
      [PHOTO_URL]: [
        { x: 0.75, y: 0.92, units: 'percentage' },
        { x: 0.73, y: 0.68, units: 'percentage' },
        { x: 0.77, y: 0.48, units: 'percentage' },
        { x: 0.74, y: 0.28, units: 'percentage' },
        { x: 0.76, y: 0.1, units: 'percentage', type: 'anchor' },
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
