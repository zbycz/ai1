import { RouteDifficulty } from '../../../components/FeaturePanel/Climbing/types';
import {
  csvToArray,
  GRADE_TABLE,
  gradeColors,
  gradeTableString,
} from './gradeData';
import { DEFAULT_GRADE_SYSTEM, GradeSystem } from './gradeSystems';
import { FeatureTags } from '../../types';


// @TODO use memo for this function?
const convertGrade = (
  from: GradeSystem,
  to: GradeSystem,
  value: string,
) => {
  if (!from || !to || !value || !GRADE_TABLE[from]) return null;

  const indexInTable = GRADE_TABLE[from].findIndex((item) =>
    item.startsWith(value),
  );

  if (GRADE_TABLE[to][indexInTable]) {
    return GRADE_TABLE[to][indexInTable];
  }
  return null;
};

export const getDifficulty = (
  tags: FeatureTags,
): RouteDifficulty | undefined => {
  if (!tags) {
    return undefined;
  }

  const gradeKeys = Object.keys(tags).filter((key) =>
    key.startsWith('climbing:grade'),
  );

  if (gradeKeys.length) {
    const key = gradeKeys[0]; // @TODO store all found grades
    const system = key.split(':', 3)[2];

    return {
      gradeSystem: (system ?? DEFAULT_GRADE_SYSTEM) as GradeSystem, // @TODO `gradeSystem` type should be `string`
      grade: tags[key],
    };
  }

  return undefined;
};

const getGradeSystemFromOsmTag = (osmTagKey: string) =>
  osmTagKey.split(':', 3)[2];

export const getDifficulties = (tags: FeatureTags): RouteDifficulty[] => {
  if (!tags) {
    return undefined;
  }

  const gradeKeys = Object.keys(tags).filter((key) =>
    key.startsWith('climbing:grade'),
  );

  return gradeKeys.map((gradeKey) => ({
    grade: tags[gradeKey],
    gradeSystem: getGradeSystemFromOsmTag(gradeKey) ?? '?',
  }));
};

const sanitizeApproximationSymbol = (grade) => {
  return grade?.replace('~', '');
};

export const getDifficultyColor = (
  routeDifficulty: RouteDifficulty,
  mode: 'light' | 'dark',
): string => {
  const DEFAULT_COLOR = '#555';
  if (!routeDifficulty) {
    return DEFAULT_COLOR;
  }

  const gradeWithoutApproximationCharacters = sanitizeApproximationSymbol(
    routeDifficulty.grade,
  );

  const uiaaGrade =
    routeDifficulty.gradeSystem !== 'uiaa'
      ? convertGrade(
          routeDifficulty.gradeSystem,
          'uiaa',
          gradeWithoutApproximationCharacters,
        )
      : gradeWithoutApproximationCharacters;
  return gradeColors[uiaaGrade]?.[mode] || DEFAULT_COLOR;
};

export const findOrConvertRouteGrade = (
  routeDifficulties: RouteDifficulty[],
  selectedRouteSystem: string,
) => {
  const difficultyDiscoveredFromTag = routeDifficulties?.find(
    (routeDifficulty) =>
      routeDifficulty?.gradeSystem === selectedRouteSystem ||
      !selectedRouteSystem,
  );
  const routeDifficulty = difficultyDiscoveredFromTag || {
    grade:
      convertGrade(
        routeDifficulties?.[0]?.gradeSystem,
        selectedRouteSystem,
        sanitizeApproximationSymbol(routeDifficulties?.[0]?.grade),
      ) ?? '?',
    gradeSystem: selectedRouteSystem,
  };
  return {
    isConverted: difficultyDiscoveredFromTag === undefined,
    routeDifficulty,
  };
};


