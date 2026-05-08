import React, { ChangeEvent, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ImageIcon from '@mui/icons-material/Image';
import { useWikimediaAuth } from './useWikimediaAuth';
import { uploadToWikimediaCommons, UploadResult } from './wikimediaUpload';
import { useFeatureContext } from '../../utils/FeatureContext';
import { t } from '../../../services/intl';

const WIKIMEDIA_LOGO =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Commons-logo.svg/48px-Commons-logo.svg.png';
const WIKIPEDIA_LOGO =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/48px-Wikipedia-logo-v2.svg.png';
const REGISTER_URL = 'https://www.mediawiki.org/wiki/Special:CreateAccount';
const COMMONS_URL = 'https://commons.wikimedia.org';
const CC_BY_URL = 'https://creativecommons.org/licenses/by/4.0/';

// -- Not logged in screen --

const NotLoggedInContent = ({ onLogin }: { onLogin: () => void }) => (
  <Box sx={{ p: 2, position: 'relative' }}>
    <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, pr: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <img src={WIKIMEDIA_LOGO} alt="Wikimedia Commons" width={40} />
        <span style={{ fontSize: 20 }}>❤️</span>
      </Box>
      <img src={WIKIPEDIA_LOGO} alt="Wikipedia" width={40} />
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 9 }}>
        Wikipedia
      </Typography>
    </Box>

    <Typography
      variant="overline"
      sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}
    >
      {t('uploaddialog.upload_own_image')}
    </Typography>

    <Typography variant="body2" sx={{ mt: 1, mb: 4, pr: 8, color: 'text.secondary' }}>
      {t('uploaddialog.login_required_text')}{' '}
      <Link href="https://wikipedia.org" target="_blank" rel="noopener">
        Wikipedia
      </Link>
      .
    </Typography>

    <Stack spacing={1.5} alignItems="center" sx={{ mt: 4 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={onLogin}
        sx={{ minWidth: 200 }}
      >
        {t('uploaddialog.login_button')}
      </Button>
      <Link
        href={REGISTER_URL}
        target="_blank"
        rel="noopener"
        variant="button"
        sx={{ fontSize: '0.75rem', letterSpacing: 1 }}
      >
        {t('uploaddialog.register_button')}
      </Link>
    </Stack>
  </Box>
);

// -- Logged in / upload screen --

const LoggedInContent = ({
  username,
  onLogout,
  onUpload,
  uploading,
}: {
  username: string;
  onLogout: () => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, pr: 2 }}>
          <Typography
            variant="overline"
            sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}
          >
            {t('uploaddialog.upload_own_image')}
          </Typography>

          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            {t('uploaddialog.image_will_be_uploaded')}{' '}
            <Link href={COMMONS_URL} target="_blank" rel="noopener">
              Wikimedia Commons
            </Link>{' '}
            {t('uploaddialog.image_license_info')}{' '}
            <Link href={CC_BY_URL} target="_blank" rel="noopener">
              CC-BY-4.0
            </Link>
          </Typography>

          <Stack spacing={1} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 20 }} />
              <Typography variant="body2">{t('uploaddialog.allowed_own_photos')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />
              <Typography variant="body2">{t('uploaddialog.disallowed_copyrighted')}</Typography>
            </Box>
          </Stack>
        </Box>

        <img src={WIKIMEDIA_LOGO} alt="Wikimedia Commons" width={48} />
      </Box>

      <Stack spacing={1} alignItems="center" sx={{ mt: 3 }}>
        <Button
          component="label"
          variant="contained"
          color="primary"
          startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
          disabled={uploading}
          sx={{ minWidth: 220 }}
        >
          {t('uploaddialog.upload_button')}
          <input type="file" accept="image/*" hidden onChange={handleFileChange} />
        </Button>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {t('uploaddialog.logged_in_as')}{' '}
          <Link
            href={`https://commons.wikimedia.org/wiki/User:${encodeURIComponent(username)}`}
            target="_blank"
            rel="noopener"
          >
            {username}
          </Link>{' '}
          (
          <Link
            component="button"
            variant="caption"
            onClick={onLogout}
            sx={{ cursor: 'pointer' }}
          >
            {t('uploaddialog.logout_link')}
          </Link>
          )
        </Typography>
      </Stack>
    </Box>
  );
};

// -- Success screen --

const SuccessContent = ({ result }: { result: UploadResult }) => (
  <Box>
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, position: 'relative' }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main' }} />
        <Box sx={{ position: 'absolute', right: '50%', top: 0, mr: -10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <img src={WIKIMEDIA_LOGO} alt="Wikimedia Commons" width={36} />
            <span style={{ fontSize: 18 }}>❤️</span>
          </Box>
          <img src={WIKIPEDIA_LOGO} alt="Wikipedia" width={36} />
          <Typography variant="caption" sx={{ fontSize: 8, color: 'text.secondary' }}>
            Wikipedia
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" sx={{ mt: 2 }}>
        {t('uploaddialog.success_title')}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
        {t('uploaddialog.success_subtitle')}
      </Typography>
    </Box>

    <Divider />

    <Box sx={{ p: 2, bgcolor: 'grey.100', display: 'flex', gap: 2 }}>
      <Box
        sx={{
          width: 120,
          height: 90,
          bgcolor: 'grey.300',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Link
          href={`${COMMONS_URL}/wiki/${encodeURIComponent(result.title)}`}
          target="_blank"
          rel="noopener"
        >
          <img
            src={`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(result.filename)}?width=120`}
            alt={result.filename}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).insertAdjacentHTML('afterend', '<span aria-hidden="true" style="font-size:2rem">🖼</span>');
            }}
          />
        </Link>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 10 }}>
          {t('uploaddialog.result_name')}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {result.filename}
        </Typography>

        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 10 }}>
          {t('uploaddialog.result_license')}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          CC-BY-4.0
        </Typography>

        {result.location && (
          <>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 10 }}>
              {t('uploaddialog.result_location')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {result.location[1].toFixed(5)},{result.location[0].toFixed(5)}
            </Typography>
          </>
        )}

        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 10 }}>
          {t('uploaddialog.result_author')}
        </Typography>
        <Typography variant="body2">{result.username}</Typography>
      </Box>
    </Box>
  </Box>
);

// -- Main dialog --

type Props = {
  open: boolean;
  onClose: () => void;
};

export const UploadDialog = ({ open, onClose }: Props) => {
  const { feature } = useFeatureContext();
  const { user, loading: authLoading, login, logout, getToken } = useWikimediaAuth();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleClose = () => {
    setResult(null);
    setError(null);
    onClose();
  };

  const handleUpload = async (file: File) => {
    const token = getToken();
    if (!token || !user) return;

    setError(null);
    setUploading(true);
    try {
      const uploadResult = await uploadToWikimediaCommons(
        token,
        user.name,
        feature,
        file,
      );
      setResult(uploadResult);
    } catch (e) {
      setError(String(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { elevation: 0 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <ImageIcon fontSize="small" />
        <Box component="span" sx={{ flex: 1 }}>
          {t('uploaddialog.dialog_title')}
        </Box>
        <IconButton onClick={handleClose} size="small" edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0 }}>
        {result ? (
          <SuccessContent result={result} />
        ) : !user ? (
          <NotLoggedInContent onLogin={login} />
        ) : (
          <LoggedInContent
            username={user.name}
            onLogout={logout}
            onUpload={handleUpload}
            uploading={uploading || authLoading}
          />
        )}
        {error && (
          <Box sx={{ p: 2, pt: 0 }}>
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
