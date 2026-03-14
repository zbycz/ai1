import { Feature as GeojsonFeature, Geometry } from 'geojson';
import { OsmType } from './services/types';

export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

// below ONLY shared types among server + client



// @see climbingTilesSource#processFeature()



export type ClimbingTick = {
  id: number;
  osmUserId: number;
  shortId: string | null;
  timestamp: string;
  style: string | null;
  myGrade: string | null;
  note: string | null;
  pairing: Record<string, string> | null;
};

export type ClimbingTickDb = Omit<ClimbingTick, 'shortId'> & {
  osmType: string | null;
  osmId: number | null;
};
