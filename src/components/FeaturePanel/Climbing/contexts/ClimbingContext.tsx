import React, {
  createContext,
  useContext,
  } from 'react';
import {
  ClimbingRoute,
  PathPoint,
  PathPoints,
  Position,
  PositionPx,
  Size,
  ZoomState,
} from '../types';
import {
  ActionWithCallback,
  State,
  StateAction,
  } from '../utils/useStateMachine';
import { Setter } from '../../../../types';

type LoadedPhotos = Record<string, Record<number, boolean>>;
type ImageSize = {
  width: number;
  height: number;
};

type ClimbingContextType = {
  editorPosition: PositionPx;
  imageSize: ImageSize;
  imageContainerSize: ImageSize;
  isRoutesLayerVisible: boolean;
  setIsRoutesLayerVisible: Setter<boolean>;
  isPointMoving: boolean;
  isPanningDisabled: boolean;
  setIsPanningDisabled: Setter<boolean>;
  isRouteSelected: (routeNumber: number) => boolean;
  isOtherRouteSelected: (routeNumber: number) => boolean;
  isRouteHovered: (routeNumber: number) => boolean;
  isPointSelected: (pointNumber: number) => boolean;
  pointSelectedIndex: number;
  routes: Array<ClimbingRoute>;
  routeSelectedIndex: number | null | undefined;
  isPointClicked: boolean;
  setIsPointClicked: Setter<boolean>;
  setEditorPosition: Setter<PositionPx>;
  setImageSize: Setter<ImageSize>;
  setImageContainerSize: Setter<ImageSize>;
  photoPaths: Array<string>;
  setPhotoPaths: Setter<string[]>;
  photoPath: string;
  setPhotoPath: Setter<string>;
  setIsPointMoving: Setter<boolean>;
  setPointSelectedIndex: Setter<number>;
  setRoutes: Setter<ClimbingRoute[]>;
  setRouteSelectedIndex: Setter<number>;
  updateRouteOnIndex: (
    routeIndex: number,
    callback?: (route: ClimbingRoute) => ClimbingRoute,
  ) => void;
  updatePathOnRouteIndex: (
    routeIndex: number,
    callback?: (path: PathPoints) => PathPoints,
  ) => void;
  getPixelPosition: (position: Position) => PositionPx;
  getPathForRoute: (route: ClimbingRoute) => PathPoints;
  getCurrentPath: () => PathPoints;
  getPercentagePosition: (position: PositionPx) => Position;
  addZoom: (position: PositionPx) => PositionPx;
  machine: {
    currentState: Partial<Record<StateAction, ActionWithCallback>>;
    currentStateName: State;
    execute: (desiredAction: StateAction, props?: unknown) => void;
  };
  scrollOffset: PositionPx;
  setScrollOffset: Setter<PositionPx>;
  findCloserPoint: (position: Position) => PathPoint | null;
  photoZoom: ZoomState;
  setPhotoZoom: Setter<ZoomState>;
  areRoutesLoading: boolean;
  setAreRoutesLoading: Setter<boolean>;
  mousePosition: PositionPx;
  setMousePosition: Setter<PositionPx | null>;
  pointElement: null | HTMLElement;
  setPointElement: (pointElement: null | HTMLElement) => void;
  moveRoute: (from: number, to: number) => void;
  isEditMode: boolean;
  setIsEditMode: Setter<boolean>;
  viewportSize: Size;
  setViewportSize: Setter<Size>;
  routeIndexHovered: number | null | undefined;
  setRouteIndexHovered: Setter<number>;
  routeIndexExpanded: number | null;
  setRouteIndexExpanded: Setter<number | null>;
  loadedPhotos: LoadedPhotos;
  setLoadedPhotos: Setter<LoadedPhotos>;
  loadPhotoRelatedData: () => void;
  filterDifficulty: Array<string>;
  setFilterDifficulty: Setter<string[]>;
  photoRef: React.MutableRefObject<any>;
  svgRef: React.MutableRefObject<any>;
  getAllRoutesPhotos: (cragPhotos: Array<string>) => void;
  showDebugMenu: boolean;
  setShowDebugMenu: Setter<boolean>;
  isAddingPointBlockedRef: React.MutableRefObject<any>;
  isZoomingRef: React.MutableRefObject<any>;
  arePointerEventsDisabled: boolean; // @TODO do we need it?
  setArePointerEventsDisabled: Setter<boolean>;
  preparePhotos: (cragPhotos: Array<string>) => void;
  routeListTopOffsets: Array<number>;
  setRouteListTopOffset: (
    routeIndex: number,
    routeListTopOffset: number,
  ) => void;
};

// @TODO generate?
const ClimbingContext = createContext<ClimbingContextType | null>(null);




export const useClimbingContext = () => {
  const context = useContext(ClimbingContext);
  if (!context) {
    throw new Error(
      'useClimbingContext must be used within a ClimbingProvider',
    );
  }
  return context;
};
