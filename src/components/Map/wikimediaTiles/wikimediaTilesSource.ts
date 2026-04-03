import { GeoJSONSource, MapLayerMouseEvent, Popup } from 'maplibre-gl';
import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec';
import { EMPTY_GEOJSON_SOURCE } from '../consts';
import { getGlobalMap } from '../../../services/mapStorage';

export const WIKIMEDIA_SOURCE = 'wikimedia-tiles';
export const WIKIMEDIA_LAYER = 'wikimedia-photos';
const WIKI_API = 'https://commons.wikimedia.org/w/api.php';
const WIKIMEDIA_MIN_ZOOM = 14;

type WikimediaPhoto = {
  pageid: number;
  title: string;
  lat: number;
  lon: number;
};

const fetchWikimediaPhotos = async (
  north: number,
  west: number,
  south: number,
  east: number,
): Promise<WikimediaPhoto[]> => {
  const url = `${WIKI_API}?action=query&list=geosearch&gsbbox=${north}|${west}|${south}|${east}&gsnamespace=6&gslimit=500&format=json&origin=*`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data?.query?.geosearch || [];
  } catch (e) {
    console.warn('wikimediaTiles fetch error:', e); // eslint-disable-line no-console
    return [];
  }
};

const updateData = async () => {
  const map = getGlobalMap();
  if (!map?.getSource(WIKIMEDIA_SOURCE)) return;

  const zoom = map.getZoom();

  if (zoom < WIKIMEDIA_MIN_ZOOM) {
    map.getSource<GeoJSONSource>(WIKIMEDIA_SOURCE)?.setData({
      type: 'FeatureCollection',
      features: [],
    });
    return;
  }

  const bounds = map.getBounds();
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const west = bounds.getWest();
  const east = bounds.getEast();

  const photos = await fetchWikimediaPhotos(north, west, south, east);

  const features = photos.map((photo) => ({
    type: 'Feature' as const,
    id: photo.pageid,
    geometry: {
      type: 'Point' as const,
      coordinates: [photo.lon, photo.lat],
    },
    properties: {
      pageid: String(photo.pageid),
      title: photo.title,
    },
  }));

  map.getSource<GeoJSONSource>(WIKIMEDIA_SOURCE)?.setData({
    type: 'FeatureCollection',
    features,
  });
};

export const wikimediaLayer = {
  id: WIKIMEDIA_LAYER,
  type: 'circle' as const,
  source: WIKIMEDIA_SOURCE,
  paint: {
    'circle-radius': 6,
    'circle-color': '#1a73e8',
    'circle-stroke-width': 1.5,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 0.85,
  },
};

let eventsAdded = false;
let currentPopup: Popup | null = null;

const fetchThumbnail = async (pageid: string): Promise<string | null> => {
  const url = `${WIKI_API}?action=query&pageids=${pageid}&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data?.query?.pages?.[pageid]?.imageinfo?.[0]?.thumburl ?? null;
  } catch {
    return null;
  }
};

const onLayerClick = (e: MapLayerMouseEvent) => {
  if (!e.features?.length) return;
  const map = getGlobalMap();
  const feature = e.features[0];
  const { pageid, title } = feature.properties;
  const coords = e.lngLat;

  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }

  const fileName = title.replace('File:', '');
  const commonsUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`;

  const container = document.createElement('div');
  container.style.cssText = 'max-width:260px;font-family:sans-serif';

  const imgWrapper = document.createElement('div');
  imgWrapper.style.cssText =
    'min-height:80px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;border-radius:4px 4px 0 0;overflow:hidden';
  imgWrapper.textContent = '⏳';
  container.appendChild(imgWrapper);

  const footer = document.createElement('div');
  footer.style.cssText = 'padding:6px 2px 2px';
  const link = document.createElement('a');
  link.href = commonsUrl;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = fileName;
  link.style.cssText = 'font-size:12px;word-break:break-word';
  footer.appendChild(link);
  container.appendChild(footer);

  const popup = new Popup({ offset: 10, maxWidth: '280px' })
    .setLngLat(coords)
    .setDOMContent(container)
    .addTo(map);
  currentPopup = popup;

  fetchThumbnail(pageid).then((thumbUrl) => {
    if (popup !== currentPopup) return; // popup was closed/replaced
    if (thumbUrl) {
      const img = document.createElement('img');
      img.src = thumbUrl;
      img.alt = fileName;
      img.style.cssText = 'width:100%;display:block';
      imgWrapper.textContent = '';
      imgWrapper.appendChild(img);
    } else {
      imgWrapper.textContent = '🖼️';
    }
  });
};

const onMouseEnter = () => {
  const map = getGlobalMap();
  map.getCanvas().style.cursor = 'pointer'; // eslint-disable-line no-param-reassign
};

const onMouseLeave = () => {
  const map = getGlobalMap();
  map.getCanvas().style.cursor = ''; // eslint-disable-line no-param-reassign
};

export const addWikimediaTilesSource = (style: StyleSpecification) => {
  style.sources[WIKIMEDIA_SOURCE] = EMPTY_GEOJSON_SOURCE;
  style.layers.push(wikimediaLayer);

  if (!eventsAdded) {
    const map = getGlobalMap();
    map.on('load', updateData);
    map.on('styledata', updateData);
    map.on('moveend', updateData);
    map.on('click', WIKIMEDIA_LAYER, onLayerClick);
    map.on('mouseenter', WIKIMEDIA_LAYER, onMouseEnter);
    map.on('mouseleave', WIKIMEDIA_LAYER, onMouseLeave);
    eventsAdded = true;
  }
};

export const removeWikimediaTilesSource = () => {
  if (eventsAdded) {
    const map = getGlobalMap();
    map.off('load', updateData);
    map.off('styledata', updateData);
    map.off('moveend', updateData);
    map.off('click', WIKIMEDIA_LAYER, onLayerClick);
    map.off('mouseenter', WIKIMEDIA_LAYER, onMouseEnter);
    map.off('mouseleave', WIKIMEDIA_LAYER, onMouseLeave);
    eventsAdded = false;
  }
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
};
