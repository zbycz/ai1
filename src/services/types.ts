import type Vocabulary from '../locales/vocabulary';
import type { getSchemaForFeature } from './tagging/idTaggingScheme';
import type { Polygon } from 'geojson';

export type OsmType = 'node' | 'way' | 'relation';
export type OsmId = {
  type: OsmType;
  id: number; // negative value means new feature (to be added)
};

type PathType = { x: number; y: number; suffix: string }[];
type MemberPath = {
  path: PathType;
  member: Feature;
};
type ImageDefFromTag = {
  type: 'tag';
  k: string;
  v: string;
  instant: boolean; // true = no API call needed
  path?: PathType;
  memberPaths?: MemberPath[]; // merged on relation
};
type ImageDefFromCenter = {
  type: 'center';
  service: 'mapillary' | 'fody' | 'kartaview' | 'panoramax';
  center: LonLat;
};
type ImageDef = ImageDefFromTag | ImageDefFromCenter;

// coordinates in geojson format: [lon, lat] = [x,y]
export type LonLat = [number, number];
export type LonLatRounded = [string, string];
export type LonLatBoth = LonLat | LonLatRounded;

interface Point {
  type: 'Point';
  coordinates: LonLat;
}

interface LineString {
  type: 'LineString';
  coordinates: LonLat[];
}

interface GeometryCollection {
  type: 'GeometryCollection';
  geometries: Array<Point | LineString | GeometryCollection | Polygon>;
}

type FeatureGeometry = Point | LineString | GeometryCollection | Polygon;


export type FeatureTags = {
  [key: string]: string;
};

type RelationMember = {
  type: OsmType;
  ref: number;
  role: string;
};

type FeatureProperties = {
  class: string;
  subclass: string;
  [key: string]: string | number | boolean;
  osmappRouteCount?: number;
  osmappHasImages?: boolean;
  osmappType?: 'node' | 'way' | 'relation';
  osmappLabel?: string;
};

// TODO split in two types /extend/
export type Feature = {
  point?: boolean; // TODO rename to isMarker or isCoords
  type: 'Feature';
  id?: number; // for map hover effect
  geometry?: FeatureGeometry;
  osmMeta: {
    type: OsmType;
    id: number;
    visible?: string;
    version?: number;
    changeset?: number;
    timestamp?: string;
    user?: string;
    uid?: number;
    lat?: string;
    lon?: string;
    role?: string; // only for memberFeatures
  };
  tags: FeatureTags;
  members?: RelationMember[]; // only for relations
  memberFeatures?: Feature[]; // for relations with children (full)
  parentFeatures?: Feature[];
  imageDefs?: ImageDef[];
  properties: FeatureProperties;
  center: LonLat;
  countryCode?: string; // ISO3166-1 code lowercase, undefined = no country
  roundedCenter?: LonLatRounded;
  error?: 'network' | 'unknown' | '404' | '500'; // etc.
  deleted?: boolean;
  schema?: ReturnType<typeof getSchemaForFeature>; // undefined means error

  // skeleton
  layer?: { id: string };
  source?: string;
  sourceLayer?: string;
  state?: { hover: boolean };
  skeleton?: boolean; // that means loading is in progress
  nonOsmObject?: boolean;
};

export type MessagesType = typeof Vocabulary;
export type TranslationId = keyof MessagesType;

