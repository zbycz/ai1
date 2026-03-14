import { Alert, Snackbar, AlertProps } from '@mui/material';
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';

type Severity = 'success' | 'info' | 'warning' | 'error' | undefined;
type ShowToast = (
  message: string | React.ReactNode,
  severity?: Severity,
  action?: AlertProps['action'],
) => void;
type SnackbarContextType = {
  showToast: ShowToast;
};

const SnackbarContext = createContext<SnackbarContextType>({
  showToast: () => undefined,
});

export const useSnackbar = () => useContext(SnackbarContext);


// TODO maybe allow more messages ?
// TODO maybe similar code is already in Mui?  but useSnackbar is configuration only
