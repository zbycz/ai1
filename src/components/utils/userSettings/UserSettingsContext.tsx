import React, { createContext, useContext } from 'react';
import {
  GradeSystem,
} from '../../../services/tagging/climbing/gradeSystems';
import { TickStyle } from '../../FeaturePanel/Climbing/types';
import {
  ClimbingFilter,
  ClimbingFilterSettings,
  } from './getClimbingFilter';
import { Setter } from '../../../types';

type CragViewLayout = 'vertical' | 'horizontal' | 'auto';

type UserSettingsType = Partial<{
  isImperial: boolean;
  'weather.enabled': boolean;
  'climbing.gradeSystem': GradeSystem;
  'climbing.isGradesOnPhotosVisible': boolean;
  'climbing.defaultClimbingStyle': TickStyle;
  'climbing.selectRoutesByScrolling': boolean;
  'climbing.switchPhotosByScrolling': boolean;
  'climbing.showRelatedPhotoByRouteClick': boolean;
  'climbing.visibleGradeSystems': Record<string, boolean>;
  'climbing.cragViewLayout': CragViewLayout;
  'climbing.splitPaneSize': null | number;
  'climbing.filter': ClimbingFilterSettings;
}>;

type UserSettingsContextType = {
  userSettings: UserSettingsType;
  setUserSettings: Setter<UserSettingsType>;
  setUserSetting: <T extends keyof UserSettingsType>(
    key: T,
    value: UserSettingsType[T],
  ) => void;
  climbingFilter: ClimbingFilter;
  gradeSystem: GradeSystem;
};


const UserSettingsContext =
  createContext<UserSettingsContextType>(undefined);


export const useUserSettingsContext = () => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error(
      'useUserSettingsContext must be used within a UserSettingsProvider',
    );
  }
  return context;
};
