import { useEffect } from 'react';
import { Feature } from '../types';
import { fetchOverpassCenterForFeature } from './osmApi';
import { getImageDefs } from '../images/getImageDefs';
import { getCountryCode } from './getCountryCode';
import { Setter } from '../../types';

/**
 * Lazily fetches the geographic center of a way or relation from Overpass API in the browser,
 * after the feature panel has been shown with the OSM API data.
 * - For nodes, center is already available from lat/lon in the OSM element.
 * - For map-clicked features, center is already set from featureCenterCache (no fetch needed).
 * - For features loaded via direct URL (SSR or browser navigation without a prior map click),
 *   the center is fetched here and the feature is updated with center, imageDefs, and countryCode.
 */
export const useLoadFeatureCenter = (
  feature: Feature | null,
  setFeature: Setter<Feature | null>,
) => {
  const featureId = feature?.osmMeta?.id;
  const featureType = feature?.osmMeta?.type;

  useEffect(() => {
    if (
      !feature ||
      feature.center ||
      feature.skeleton ||
      feature.error ||
      featureType === 'node'
    ) {
      return;
    }

    let cancelled = false;

    fetchOverpassCenterForFeature(feature)
      .then(async (center) => {
        if (cancelled || !center) return;

        const countryCode = await getCountryCode({ ...feature, center });
        if (cancelled) return;

        setFeature((prev) => {
          if (
            !prev ||
            prev.osmMeta.id !== featureId ||
            prev.osmMeta.type !== featureType
          ) {
            return prev; // feature changed while fetching
          }
          if (prev.center) {
            return prev; // center already set (e.g. from cache or another update)
          }
          return {
            ...prev,
            center,
            imageDefs: getImageDefs(prev.tags, prev.osmMeta.type, center),
            ...(countryCode ? { countryCode } : {}),
          };
        });
      })
      .catch((e) => {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.warn('useLoadFeatureCenter:', e);
        }
      });

    return () => {
      cancelled = true;
    };
  // Intentionally using featureId and featureType (not `feature`) to avoid re-triggering
  // when the feature object reference changes (e.g., after we set the center below, which
  // would create an infinite loop). The OSM metadata, tags, and members used by
  // fetchOverpassCenterForFeature are stable after the initial feature load.
  }, [featureId, featureType]); // eslint-disable-line react-hooks/exhaustive-deps
};
