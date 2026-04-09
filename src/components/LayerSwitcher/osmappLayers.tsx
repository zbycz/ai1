import React from 'react';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ExploreIcon from '@mui/icons-material/Explore';
import FilterHdrIcon from '@mui/icons-material/FilterHdr';
import MapIcon from '@mui/icons-material/Map';
import SatelliteIcon from '@mui/icons-material/Satellite';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Bbox, Layer, useMapStateContext } from '../utils/MapStateContext';
import { intl, t, Translation } from '../../services/intl';
import { isBrowser } from '../helpers';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import { Box } from '@mui/material';
import { PoiIcon } from '../utils/icons/PoiIcon';
import { PROJECT_ID } from '../../services/project';
import { useQuery } from 'react-query';
import { fetchJson } from '../../services/fetch';
import type { ClimbingStatsResponse } from '../../types';
import { nl2br } from '../utils/nl2br';
import { CLIMBING_TILES_HOST } from '../../services/osm/consts';
import { TooltipButton } from '../utils/TooltipButton';

interface Layers {
  [key: string]: Layer;
}

const isOpenClimbing = PROJECT_ID === 'openclimbing';

const retina =
  ((isBrowser() && window.devicePixelRatio) || 1) >= 2 ? '@2x' : '';

const ClimbingIcon = () => {
  return (
    <Box ml={0.5}>
      <PoiIcon ico="climbing" size={16} />
    </Box>
  );
};

const getLocalTime = (lastRefresh: string) =>
  lastRefresh ? new Date(lastRefresh).toLocaleString(intl.lang) : null;

const fetchClimbingStats = () =>
  fetchJson<ClimbingStatsResponse>(
    `${CLIMBING_TILES_HOST}api/climbing-tiles/stats`,
  );

const ClimbingSecondaryInner = () => {
  const { data, error, isFetching } = useQuery([], () => fetchClimbingStats());

  if (isFetching) {
    return null;
  }

  if (error) {
    console.error('Error fetching climbing stats', error); // eslint-disable-line no-console
    return null;
  }

  const { lastRefresh, osmDataTimestamp, devStats } = data;
  const tooltip = (
    <>
      <Translation
        id="climbing_tiles.stats"
        values={{
          lastRefresh: getLocalTime(lastRefresh),
          osmTime: getLocalTime(osmDataTimestamp),
        }}
      />
      <br />
      <br />
      Dev stats:{' '}
      {nl2br(
        Object.entries(devStats)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n'),
      )}
      <br />
    </>
  );

  return (
    <>
      {getLocalTime(osmDataTimestamp).replace(/:\d+( [APM]+)?$/, '$1')}
      <TooltipButton
        sx={{ fontSize: '14px', margin: '-8px -3px -6px -3px' }}
        tooltip={tooltip}
      />
    </>
  );
};

const ClimbingSecondary = () => {
  if (process.env.NEXT_PUBLIC_ENABLE_CLIMBING_TILES) {
    return <ClimbingSecondaryInner />;
  }
  return <>lite</>;
};

const WikimediaSecondary = () => {
  const { view } = useMapStateContext();
  const zoom = parseFloat(view?.[0] ?? '0');
  if (zoom >= 14) return null;
  return <>{t('wikimedia.zoom_required')}</>;
};

const africaBbox: Bbox = [
  -20, // west
  -35, // south
  55, // east
  40, // north
];

const czBbox: Bbox = [
  12.09, // west
  48.55, // south
  18.87, // east
  51.06, // north
];

export const osmappLayers: Layers = {
  basic: {
    name: `${t('layers.basic')} Maptiler`,
    type: 'basemap',
    Icon: ExploreIcon,
    attribution: ['maptiler', 'osm'],
  },
  basicOfr: {
    name: `${t('layers.basic')} OpenFreeMap`,
    type: 'basemap',
    Icon: ExploreIcon,
    attribution: [
      '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a>',
      'osm',
    ],
  },
  shortbread: {
    name: `${t('layers.basic')} Shortbread (beta)`,
    type: 'basemap',
    Icon: ExploreIcon,
    attribution: ['osm'],
  },
  makinaAfrica: {
    name: t('layers.makina_africa'),
    type: 'basemap',
    Icon: ExploreIcon,
    attribution: [
      '<a href="https://openplaceguide.org/">OPG</a> © <a href="https://openmaptiles.org/">OpenMapTiles</a>',
      'osm',
    ],
    bboxes: [africaBbox],
  },
  outdoor: {
    name: t('layers.outdoor'),
    type: 'basemap',
    Icon: FilterHdrIcon,
    attribution: ['maptiler', 'osm'],
    // https://api.maptiler.com/tiles/outdoor/tiles.json?key=xxx .planettime="1703030400000",
  },
  s1: { type: 'spacer' },
  carto: {
    name: t('layers.carto'),
    type: 'basemap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    Icon: MapIcon,
    attribution: ['osm'],
  },
  sat: {
    name: t('layers.maptilerSat'),
    type: 'basemap',
    url: `https://api.maptiler.com/tiles/satellite-v2/tiles.json?key=${process.env.NEXT_PUBLIC_API_KEY_MAPTILER}`,
    Icon: SatelliteIcon,
    attribution: ['maptiler'],
    isSatelite: true,
  },
  bingSat: {
    name: t('layers.bingSat'),
    type: 'basemap',
    url: 'https://ecn.{bingSubdomains}.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=13657',
    Icon: SatelliteIcon,
    attribution: ['&copy; <a href="https://www.bing.com/maps">Microsoft</a>'],
    maxzoom: 19,
    isSatelite: true,
  },
  cuzkSat: {
    name: 'ČÚZK ortofoto (CZ)',
    type: 'basemap',
    url: 'https://geoportal.cuzk.cz/WMS_ORTOFOTO_PUB/service.svc/get?FORMAT=image/png&TRANSPARENT=TRUE&VERSION=1.3.0&SERVICE=WMS&REQUEST=GetMap&LAYERS=GR_ORTFOTORGB&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}',
    Icon: SatelliteIcon,
    attribution: ['&copy; <a href="https://geoportal.cuzk.cz">ČÚZK</a>'],
    bboxes: [czBbox],
    isSatelite: true,
  },
  ...(isOpenClimbing
    ? {
        cuzkMap: {
          name: 'ČÚZK map (CZ)',
          type: 'basemap',
          url: 'https://geoportal.cuzk.cz/WMS_ZM10_PUB/WMService.aspx?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&LAYERS=GR_ZM10&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}',
          Icon: MapIcon,
          attribution: ['&copy; <a href="https://geoportal.cuzk.cz">ČÚZK</a>'],
          bboxes: [czBbox],
          isSatelite: false,
        },
        cuzkGrayscale: {
          name: 'ČÚZK grayscale (CZ)',
          type: 'basemap',
          url: 'https://ags.cuzk.cz/arcgis2/services/dmr5g/ImageServer/WMSServer?FORMAT=image/png&TRANSPARENT=TRUE&VERSION=1.3.0&SERVICE=WMS&REQUEST=GetMap&LAYERS=dmr5g:GrayscaleHillshade&STYLES=&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}',
          Icon: MapIcon,
          attribution: ['&copy; <a href="https://geoportal.cuzk.cz">ČÚZK</a>'],
          bboxes: [czBbox],
          isSatelite: false,
        },
      }
    : {}),

  // mtb: {
  //   name: t('layers.mtb'),
  //   type: 'basemap',
  //   url: 'https://openstreetmap.cz/proxy.php/tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png', // TODO proxy
  // },
  bike: {
    name: t('layers.bike'),
    secondLine: 'Thunderforest.com',
    type: 'basemap',
    url: `https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}${retina}.png?apikey=${process.env.NEXT_PUBLIC_API_KEY_THUNDERFOREST}`,
    Icon: DirectionsBikeIcon,
    attribution: [
      '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>',
      'osm',
    ],
  },
  transport: {
    name: t('layers.transport'),
    secondLine: 'Thunderforest.com',
    type: 'basemap',
    url: `https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}${retina}.png?apikey=${process.env.NEXT_PUBLIC_API_KEY_THUNDERFOREST}`,
    darkUrl: `https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}${retina}.png?apikey=${process.env.NEXT_PUBLIC_API_KEY_THUNDERFOREST}`,
    Icon: DirectionsBusIcon,
  },
  ...(process.env.NEXT_PUBLIC_API_KEY_INDOOREQUAL
    ? {
        indoor: {
          name: `${t('layers.indoor')} (beta)`,
          type: 'overlay',
          Icon: MapsHomeWorkIcon,
          attribution: [
            '&copy; <a href="https://indoorequal.com/">indoor=</a>',
            'osm',
          ],
          minzoom: 16,
        },
      }
    : {}),
  snow: {
    name: t('layers.snow'),
    type: 'overlay',
    url: 'https://www.opensnowmap.org/tiles-pistes/{z}/{x}/{y}.png',
    Icon: AcUnitIcon,
    attribution: [
      '&copy; <a href="https://www.opensnowmap.org/">opensnowmap.org</a>',
      'osm',
    ],
  },
  climbing: {
    name: t('layers.climbing'),
    type: 'overlay',
    Icon: ClimbingIcon,
    Secondary: ClimbingSecondary,
    attribution: ['osm'],
  },
  wikimedia: {
    name: t('layers.wikimedia'),
    type: 'overlay',
    Icon: PhotoCameraIcon,
    Secondary: WikimediaSecondary,
    attribution: [
      '&copy; <a href="https://commons.wikimedia.org">Wikimedia Commons</a>',
    ],
  },
};
