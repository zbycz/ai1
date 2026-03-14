import {
  GradeSystem,
} from '../../../services/tagging/climbing/gradeSystems';
import { Setter } from '../../../types';

type Interval = [number, number];

export type ClimbingFilterSettings = {
  filterGradeSystem: GradeSystem;
  gradeInterval: Interval | null;
  minimumRoutes: number;
};




export type ClimbingFilter = {
  grades: string[];
  gradeInterval: Interval;
  setGradeInterval: Setter<Interval>;
  minimumRoutes: number;
  setMinimumRoutes: Setter<number>;
  isDefaultFilter: boolean;
  isGradeIntervalDefault: boolean;
  isMinimumRoutesDefault: boolean;
  reset: () => void;
};

