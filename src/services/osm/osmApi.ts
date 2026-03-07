import { FetchError, getShortId, getUrlOsmId } from '../helpers';
import { fetchJson } from '../fetch';
import { Feature, LonLat, OsmId } from '../types';
import { removeFetchCache } from '../fetchCache';
import { isBrowser } from '../../components/helpers';
import { addSchemaToFeature } from '../tagging/idTaggingScheme';
import { fetchSchemaTranslations } from '../tagging/translations';
import { osmToFeature } from './osmToFeature';
import { getImageDefs, mergeMemberImageDefs } from '../images/getImageDefs';
import { fetchOverpassCenter } from '../overpass/fetchOverpassCenter';
import {
  isClimbingRelation,
  isPublictransportRoute,
  isRouteMaster,
} from '../../utils';
import { getOsmHistoryUrl, getOsmUrl } from './urls';
import { getOsmElement } from './quickFetchFeature';
import { fetchParentFeatures } from './fetchParentFeatures';
import { featureCenterCache } from './featureCenterToCache';
import { getCountryCode } from './getCountryCode';
import { getItemsMap, getMemberFeatures } from './helpers';
import { getFullFeatureWithMemberFeatures } from './getFullFeatureWithMemberFeatures';
import { OsmElement, OsmResponse } from './types';
import { fetchOverpass } from '../overpass/fetchOverpass';

export const getLastBeforeDeleted = async (
  e: FetchError,
  apiId: OsmId,
): Promise<OsmElement | undefined> => {
  if (!(e instanceof FetchError && e.code === '410')) {
    return undefined;
  }

  const url = getOsmHistoryUrl(apiId); // TODO use multi fetch instead of history: https://wiki.openstreetmap.org/wiki/API_v0.6#Multi_fetch:_GET_/api/0.6/[nodes|ways|relations]?#parameters
  const { elements } = await fetchJson<OsmResponse>(url, { nocache: true }); // nocache - used in fetchFreshItem()
  const length = elements?.length;

  if (length >= 2) {
    const lastWithTags = elements[length - 2];
    const last = elements[length - 1];
    return {
      ...lastWithTags,
      ...last,
      osmappDeletedMarker: true,
    } as OsmElement;
  }
};

const getOsmPromise = async (apiId: OsmId) => {
  try {
    return await getOsmElement(apiId);
  } catch (e) {
    const undeleted = await getLastBeforeDeleted(e, apiId);
    if (undeleted) {
      return undeleted;
    }
    throw e;
  }
};

const getCenterFromCache = (apiId: OsmId): LonLat | false => {
  if (apiId.type === 'node') return false;
  if (!isBrowser()) return false;
  return featureCenterCache[getShortId(apiId)] || false;
};

export const clearFeatureCache = (apiId) => {
  removeFetchCache(getOsmUrl(apiId)); // watch out, must be same as in getOsmPromise()
  removeFetchCache(getOsmHistoryUrl(apiId));
};

/**
 * Fetches the geographic center of a feature from Overpass, for lazy loading in the browser.
 * For nodes center is available from the OSM element (lat/lon), so this returns false.
 * For public transport routes, fetches center from the first member stop/platform.
 */
export const fetchOverpassCenterForFeature = async (
  feature: Feature,
): Promise<LonLat | false> => {
  const { osmMeta, tags, members } = feature;

  if (osmMeta.type === 'node') {
    return false;
  }

  if (
    isPublictransportRoute({ tags }) ||
    isRouteMaster({ tags, osmMeta })
  ) {
    const firstMember = members?.[0];
    if (firstMember) {
      return fetchOverpassCenter({
        id: firstMember.ref,
        type: firstMember.type,
      });
    }
  }

  return fetchOverpassCenter(osmMeta);
};

const getElementsAndCenter = async (apiId: OsmId) => {
  const element = await getOsmPromise(apiId);
  // For nodes, center is derived from lat/lon in osmToFeature().
  // For ways/relations, we use the featureCenterCache (populated on map click) if available.
  const center = getCenterFromCache(apiId);
  return { element, center };
};

const fetchFeatureWithCenter = async (apiId: OsmId) => {
  const [{ element, center }] = await Promise.all([
    getElementsAndCenter(apiId),
    fetchSchemaTranslations(),
  ]);

  const feature = osmToFeature(element);
  if (!feature.center && center) {
    feature.center = center;
    feature.imageDefs = getImageDefs(
      feature.tags,
      feature.osmMeta.type,
      center,
    );
  }

  if (feature.center) {
    const countryCode = await getCountryCode(feature);
    if (countryCode) {
      feature.countryCode = countryCode;
    }
  }

  return addSchemaToFeature(feature);
};

const addMemberFeaturesToArea = async (relation: Feature) => {
  const { osmMeta } = relation;
  const fullQuery = `[out:json];rel(${osmMeta.id});>>;out center qt;`;

  const overpass = await fetchOverpass(fullQuery);
  const itemsMap = getItemsMap(overpass.elements);
  const memberFeatures = getMemberFeatures(relation.members, itemsMap).map(
    (memberFeature) => {
      const crag: Feature = {
        ...memberFeature,
        memberFeatures: getMemberFeatures(memberFeature.members, itemsMap),
      };
      mergeMemberImageDefs(crag);
      return crag;
    },
  );

  // TODO merge this with osmToFeature()

  return { ...relation, memberFeatures };
};

const addMemberFeatures = async (feature: Feature) => {
  if (feature.osmMeta.type !== 'relation') {
    return feature;
  }

  const { tags, osmMeta: apiId } = feature;

  if (tags.climbing === 'area') {
    return await addMemberFeaturesToArea(feature);
  }

  const full = await getFullFeatureWithMemberFeatures(apiId);
  const out: Feature = {
    ...feature,
    memberFeatures: full.memberFeatures,
  };
  mergeMemberImageDefs(out);
  return out;
};

// TODO parent should be probably fetched for every feaure in fetchFeatureWithCenter()
//  - wait until UI is prepared
//  - maybe this can be merged in fetchFeatureWithCenter()
//  - check: Warning: data for page "/[[...all]]" (path "/relation/4810774") is 627 kB which exceeds the threshold of 128 kB, this amount of data can reduce performance. See more info here: https://nextjs.org/docs/messages/large-page-data
const addMembersAndParents = async (feature: Feature): Promise<Feature> => {
  if (
    isClimbingRelation(feature) ||
    isPublictransportRoute(feature) ||
    isRouteMaster(feature)
  ) {
    const [parentFeatures, featureWithMemberFeatures] = await Promise.all([
      fetchParentFeatures(feature.osmMeta),
      addMemberFeatures(feature),
    ]);

    return {
      ...featureWithMemberFeatures,
      center: feature.center, // feature may have center from featureCenterCache (map click)
      parentFeatures,
    };
  }

  // fallback for climbing=route and climbing=boulder and non-relation crags/areas
  if (feature.tags.climbing || feature.tags.sport === 'climbing') {
    const parentFeatures = await fetchParentFeatures(feature.osmMeta);
    return { ...feature, parentFeatures };
  }

  return feature;
};

export const fetchFeature = async (apiId: OsmId): Promise<Feature> => {
  try {
    // offline features for testing
    if (apiId.type === 'relation' && apiId.id === 6) {
      await fetchSchemaTranslations();
      const osmApiTestItems = await import('./offlineItems');
      return osmApiTestItems.TEST_CRAG;
    }
    if (apiId.type === 'node' && apiId.id === 6) {
      await fetchSchemaTranslations();
      const osmApiTestItems = await import('./offlineItems');
      return osmApiTestItems.TEST_NODE;
    }

    const feature = await fetchFeatureWithCenter(apiId);
    const finalFeature = await addMembersAndParents(feature);

    return finalFeature;
  } catch (e) {
    console.error(`fetchFeature(${getShortId(apiId)}):`, e); // eslint-disable-line no-console

    const error = (
      e instanceof FetchError ? e.code : 'unknown'
    ) as Feature['error'];

    return {
      type: 'Feature',
      skeleton: true,
      nonOsmObject: false,
      osmMeta: apiId,
      center: undefined,
      tags: { name: getUrlOsmId(apiId) },
      properties: { class: '', subclass: '' },
      error,
    };
  }
};
