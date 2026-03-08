import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePersistedState } from './usePersistedState';
import { DEFAULT_MAP } from '../../config.mjs';
import { PROJECT_ID } from '../../services/project';
import { useBoolState } from '../helpers';
import { Setter } from '../../types';
import { LonLat } from '../../services/types';
import Router from 'next/router';
import {
  DEFAULT_VIEW,
  getMapViewFromHash,
  getViewFromClientIp,
} from '../App/helpers';
import { osmappLayers } from '../LayerSwitcher/osmappLayers';
import { fakeStaticExportSkipDefaultMapView } from '../App/fakeStaticExportHelpers';
import { isEqual } from 'lodash';

export type LayerIcon = React.ComponentType<{ fontSize: 'small' }>;

// [b.getWest(), b.getNorth(), b.getEast(), b.getSouth()]
export type Bbox = [number, number, number, number];

export type Layer = {
  type: 'basemap' | 'overlay' | 'user' | 'spacer';
  name?: string;
  secondLine?: string;
  url?: string;
  darkUrl?: string; // optional url for dark mode
  key?: string;
  Icon?: LayerIcon;
  isSatelite?: boolean;
  attribution?: string[]; // missing in spacer TODO refactor this ugly type
  maxzoom?: number;
  minzoom?: number;
  bboxes?: Bbox[];
};

// [z, lat, lon] - string because we use RoundedPosition
export type View = [string, string, string];

export type MapClickOverride =
  | ((coords: LonLat, label: string) => void)
  | undefined;
export type MapClickOverrideRef = React.MutableRefObject<MapClickOverride>;

type MapStateContextType = {
  bbox: Bbox;
  setBbox: Setter<Bbox>;
  view: View;
  setView: Setter<View>;
  viewForMap: View;
  setViewFromMap: Setter<View>;
  activeLayers: string[];
  setActiveLayers: Setter<string[]>;
  userLayers: Layer[];
  setUserLayers: Setter<Layer[]>;
  mapClickOverrideRef: MapClickOverrideRef;
  mapLoaded: boolean;
  setMapLoaded: () => void;
  allActiveLayers: Layer[];
};

export const MapStateContext = createContext<MapStateContextType>(undefined);

const usePersistMapView = (view: View) => {
  useEffect(() => {
    if (fakeStaticExportSkipDefaultMapView(view)) return;

    window.location.hash = view.join('/');
    localStorage.setItem('mapView', view.join('/'));
  }, [view]);
};

const useUpdateViewFromHash = (setView: Setter<View>) => {
  useEffect(() => {
    Router.beforePopState(() => {
      const mapViewFromHash = getMapViewFromHash();
      if (mapViewFromHash) {
        setView(mapViewFromHash);
      }
      return true; // let nextjs handle the route change as well
    });
  }, [setView]);
};

const useActiveLayersState = () => {
  const isClimbing = PROJECT_ID === 'openclimbing';
  const initLayers = isClimbing
    ? ['outdoor', 'climbing']
    : [DEFAULT_MAP, 'indoor'];
  return usePersistedState('activeLayers', initLayers);
};

// On first client render, restore map view from localStorage.
// If nothing is stored yet, fall back to ip-api.com geolocation.
// This only runs when no hash view was supplied (i.e. initialMapView is DEFAULT_VIEW).
const useRestoreMapView = (
  initialMapView: View,
  setBothViews: Setter<View>,
) => {
  useEffect(() => {
    if (!isEqual(initialMapView, DEFAULT_VIEW)) return; // hash view already applied

    const stored = localStorage.getItem('mapView');
    if (stored) {
      const parts = stored.split('/');
      if (
        parts.length === 3 &&
        parts.every((p) => !Number.isNaN(parseFloat(p)))
      ) {
        setBothViews(parts as View);
        return;
      }
    }

    // No stored view – ask ip-api.com to geolocate this client
    getViewFromClientIp().then((ipView) => {
      if (ipView) setBothViews(ipView);
    });
  }, [initialMapView, setBothViews]); // eslint-disable-line react-hooks/exhaustive-deps -- runs once on mount; both values are stable
};

export const MapStateProvider: React.FC = ({ children }) => {
  const initialMapView = getMapViewFromHash() || DEFAULT_VIEW;

  const [activeLayers, setActiveLayers] = useActiveLayersState();
  const [bbox, setBbox] = useState<Bbox>();
  const [view, setView] = useState(initialMapView);
  const [viewForMap, setViewForMap] = useState(initialMapView);
  const [userLayers, setUserLayers] = usePersistedState<Layer[]>(
    'userLayerIndex',
    [],
  );
  const [allActiveLayers, setAllActiveLayers] = useState<Layer[]>([]);
  const mapClickOverrideRef = useRef<MapClickOverride>();
  const [mapLoaded, setMapLoaded, setNotLoaded] = useBoolState(true);
  useEffect(setNotLoaded, [setNotLoaded]);

  useEffect(() => {
    const activeOsmappLayers = activeLayers
      .map((key) => osmappLayers[key])
      .filter((x) => x);
    const activeUserLayers = userLayers.filter(({ url }) =>
      activeLayers.includes(url),
    );
    setAllActiveLayers([...activeUserLayers, ...activeOsmappLayers]);
  }, [activeLayers, userLayers]);

  const setBothViews: Setter<View> = useCallback((newView) => {
    setView(newView);
    setViewForMap(newView);
  }, []);

  const mapState: MapStateContextType = {
    bbox,
    setBbox,
    view, // always up-to-date (for use in react)
    setView: setBothViews,
    viewForMap, // updated only when map has to be updated
    setViewFromMap: setView,
    activeLayers,
    setActiveLayers,
    userLayers,
    setUserLayers,
    mapClickOverrideRef,
    mapLoaded,
    setMapLoaded,
    allActiveLayers,
  };

  usePersistMapView(view);
  useUpdateViewFromHash(setBothViews);
  useRestoreMapView(initialMapView, setBothViews);

  return (
    <MapStateContext.Provider value={mapState}>
      {children}
    </MapStateContext.Provider>
  );
};

export const useMapStateContext = () => useContext(MapStateContext);
