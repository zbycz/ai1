import {
  Feature,
  FeatureTags,
  LonLat,
  LonLatRounded,
  LonLatBoth,
} from './services/types';

// Accuracy = 1m, see https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude
const roundDeg = (deg) => (deg.toFixed ? deg.toFixed(5) : deg);

const positionToDeg = ([lon, lat]: LonLatBoth) =>
  `${roundDeg(lat)}° ${roundDeg(lon)}°`;

const positionToDegUrl = ([lon, lat]: LonLatBoth) =>
  `${roundDeg(lat)},${roundDeg(lon)}`;

// Degrees and Minutes
const toDM = (x) =>
  `${Math.floor(x)}° ${((x - Math.floor(x)) * 60).toFixed(3)}'`;

const positionToDM = ([lat, lon]: LonLatBoth) =>
  `${toDM(lat)} ${toDM(lon)}`;

// https://wiki.openstreetmap.org/wiki/Zoom_levels
// https://medium.com/techtrument/how-many-miles-are-in-a-pixel-a0baf4611fff
// const metersPerPxOnEquator = 156543.03392
// const mPerPx = metersPerPxOnEquator * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom)
const getRoundedPosition = (
  [lon, lat]: LonLat,
  zoom: number,
): LonLatRounded => {
  const degPerPx = Math.cos((lat * Math.PI) / 180) / 2 ** zoom;
  const exp = Math.round(Math.log10(degPerPx)) * -1;
  return [lon.toFixed(exp), lat.toFixed(exp)];
};

export const roundedToDegUrl = ([lon, lat]: LonLatRounded) => `${lat},${lon}`;
const roundedToDeg = ([lon, lat]: LonLatRounded) => `${lat}° ${lon}°`;

const getUtfStrikethrough = (text: string) =>
  text
    .split('')
    .map((char) => `${char}\u0336`)
    .join('');

export const join = (a, sep, b) => `${a || ''}${a && b ? sep : ''}${b || ''}`;

export const publishDbgObject = (key, value) => {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    if (!window.dbg) window.dbg = {};
    // @ts-ignore
    window.dbg[key] = value;
    // @ts-ignore
    if (!window.d) window.d = {};
    // @ts-ignore
    window.d[key] = value;
  }
};

const not =
  <T>(predicate: (item: T) => boolean) =>
  (item: T) =>
    !predicate(item);

const isClimbingCragOrArea = (tags: FeatureTags) =>
  tags.climbing === 'crag' || tags.climbing === 'area';

// decides whether to fetch memberFeatures
const isClimbingRelation = (feature: Feature) =>
  feature.osmMeta.type === 'relation' && isClimbingCragOrArea(feature.tags);

const isClimbingCrag = (feature: Feature) =>
  feature.osmMeta.type === 'relation' && feature.tags.climbing === 'crag';

const isFeatureClimbingRoute = (feature: Feature) =>
  isClimbingRoute(feature?.tags);

const isClimbingRoute = (tags: FeatureTags) =>
  ['route_bottom', 'route_top', 'route'].includes(tags.climbing);

const isRouteMaster = ({
  tags,
  osmMeta,
}: WithTags & { osmMeta: { type: string } }) =>
  tags.type === 'route_master' && osmMeta.type === 'relation';

type WithTags = {
  tags: Feature['tags'];
};

const isPublictransportStop = ({ tags }: WithTags) =>
  Object.keys(tags).includes('public_transport') ||
  tags.railway === 'station' ||
  tags.railway === 'halt';

const isPublictransportRoute = ({ tags }: WithTags) =>
  tags.type === 'route';
