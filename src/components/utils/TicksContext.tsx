import React, { createContext, useContext } from 'react';
import { ClimbingTick, Setter } from '../../types';


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
