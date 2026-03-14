import React, { createContext, useContext, useEffect, useState } from 'react';
import { ClimbingTick, Setter } from '../../types';
import { EditTickModal } from '../FeaturePanel/Climbing/EditTickModal';
import { TickStyle } from '../FeaturePanel/Climbing/types';
import { getAllTicks } from '../../services/my-ticks/ticks';
import { Button } from '@mui/material';
import { useSnackbar } from './SnackbarContext';
import { useUserSettingsContext } from './userSettings/UserSettingsContext';
import {
  deleteClimbingTick,
  getClimbingTicks,
  postClimbingTick,
  putClimbingTick,
} from '../../services/my-ticks/myTicksApi';
import { useQuery, useQueryClient } from 'react-query';
import { PROJECT_ID } from '../../services/project';
import { useOsmAuthContext } from './OsmAuthContext';


type TicksContextType = {
  editedTickId: number | null;
  setEditedTickId: Setter<number | null>;
  addTick: (shortId: string) => Promise<void>;
  deleteTick: (tickId: number) => Promise<void>;
  updateTick: (tick: Partial<ClimbingTick>) => Promise<void>;
  ticks: ClimbingTick[] | null;
  error: unknown;
  isFetching: boolean;
  isTicked: (shortId: string) => boolean;
};



const TicksContext = createContext<TicksContextType>(undefined);








export const useTicksContext = () => {
  const context = useContext(TicksContext);
  if (!context) {
    throw new Error('useTicksContext must be used within a TicksProvider');
  }
  return context;
};
