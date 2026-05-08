import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import { t } from '../../../services/intl';
import { useWikimediaAuth } from '../../utils/WikimediaAuthContext';
import { useUploadDialogContext } from './UploadDialogContext';
import { LoginScreen } from './LoginScreen';
import { UploadScreen } from './UploadScreen';
import { SuccessScreen } from './SuccessScreen';
import { LonLat } from '../../../services/types';

type UploadResult = {
  title: string;
  filename: string;
  username: string;
  date: string;
  location: LonLat | null;
};

const useIsFullScreen = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'));
};

export const UploadDialog = () => {
  const { open, closeDialog } = useUploadDialogContext();
  const { wikiUser } = useWikimediaAuth();
  const fullScreen = useIsFullScreen();
  const [successResult, setSuccessResult] = useState<UploadResult | null>(null);

  const handleClose = () => {
    closeDialog();
    setTimeout(() => setSuccessResult(null), 300);
  };

  const handleSuccess = (result: UploadResult) => {
    setSuccessResult(result);
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          elevation: 0,
        },
      }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" gap={2} alignItems="center">
            <ImageIcon />
            {t('upload.dialog_title')}
          </Stack>
          <IconButton color="secondary" edge="end" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Stack sx={{ p: 3, pt: 1 }}>
        {successResult ? (
          <SuccessScreen result={successResult} />
        ) : wikiUser ? (
          <UploadScreen onSuccess={handleSuccess} />
        ) : (
          <LoginScreen />
        )}
      </Stack>
    </Dialog>
  );
};
