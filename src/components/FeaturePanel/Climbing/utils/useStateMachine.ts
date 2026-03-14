
export type State =
  | 'editRoute'
  | 'extendRoute'
  | 'init'
  | 'pointMenu'
  | 'routeSelected';

export type StateAction =
  | 'addPointInBetween'
  | 'addPointToEnd'
  | 'cancelPointMenu'
  | 'cancelRouteSelection'
  | 'changePointType'
  | 'changeLineType'
  | 'createRoute'
  | 'deletePoint'
  | 'deleteRoute'
  | 'dragPoint'
  | 'editRoute'
  | 'extendRoute'
  | 'finishRoute'
  | 'routeSelect'
  | 'showPointMenu'
  | 'undoPoint';

export type ActionWithCallback = {
  nextState: State;
  callback?: (props: unknown) => void;
};

