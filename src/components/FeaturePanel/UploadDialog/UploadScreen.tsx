import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Link,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudIcon from '@mui/icons-material/Cloud';
import exifr from 'exifr';
import { t } from '../../../services/intl';
import { useWikimediaAuth } from '../../utils/WikimediaAuthContext';
import { useFeatureContext } from '../../utils/FeatureContext';
import { getShortId } from '../../../services/helpers';
import { intl } from '../../../services/intl';
import { LonLat } from '../../../services/types';

const WikimediaCommonsLogo = () => (
  <Box
    sx={{
      width: 60,
      height: 60,
      borderRadius: '50%',
      background: '#3b5998',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <CloudIcon sx={{ color: 'white', fontSize: 32 }} />
  </Box>
);

export type UploadResult = {
  title: string;
  filename: string;
  username: string;
  date: string;
  location: LonLat | null;
};

type Props = {
  onSuccess: (result: UploadResult) => void;
};

const extractExifData = async (file: File) => {
  try {
    const exif = await exifr.parse(file);
    const location: LonLat | null =
      exif?.latitude && exif?.longitude
        ? [exif.longitude, exif.latitude]
        : null;
    const date = exif?.DateTimeOriginal
      ? new Date(exif.DateTimeOriginal)
      : new Date();
    return { location, date };
  } catch (_e) {
    return { location: null as LonLat | null, date: new Date() };
  }
};

const doUpload = async (
  file: File,
  shortId: string,
  location: LonLat | null,
  date: Date,
): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('shortId', shortId);
  formData.append('lang', intl.lang || 'en');
  formData.append('filename', file.name);
  if (location) formData.append('location', JSON.stringify(location));
  formData.append('date', date.toISOString());

  const res = await fetch('/api/wiki-upload', { method: 'POST', body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data as UploadResult;
};

const LicenseInfo = () => (
  <Box flex={1} mr={2}>
    <Typography variant="body2" color="text.secondary" paragraph>
      {t('upload.description_prefix')}{' '}
      <Link href="https://commons.wikimedia.org/" target="_blank" rel="noopener noreferrer">
        Wikimedia Commons
      </Link>{' '}
      {t('upload.description_license')}{' '}
      <Link href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
        CC-BY-SA-4.0
      </Link>
    </Typography>
    <Box display="flex" flexDirection="column" gap={1} mt={2}>
      <Box display="flex" alignItems="center" gap={1}>
        <CheckCircleIcon color="success" fontSize="small" />
        <Typography variant="body2">{t('upload.allowed_own_photos')}</Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <CancelIcon color="error" fontSize="small" />
        <Typography variant="body2">{t('upload.disallowed_copyrighted')}</Typography>
      </Box>
    </Box>
  </Box>
);

export const UploadScreen = ({ onSuccess }: Props) => {
  const { wikiUser, logout } = useWikimediaAuth();
  const { feature } = useFeatureContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { location, date } = await extractExifData(file);
      const result = await doUpload(file, getShortId(feature.osmMeta), location, date);
      onSuccess(result);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <Typography variant="overline" display="block" gutterBottom>
        {t('upload.title')}
      </Typography>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <LicenseInfo />
        <WikimediaCommonsLogo />
      </Box>
      {error && (
        <Typography variant="body2" color="error" mt={2}>
          {error}
        </Typography>
      )}
      <Box mt={3} display="flex" flexDirection="column" alignItems="center" gap={1}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {t('upload.upload_button')}
        </Button>
        <Typography variant="caption" color="text.secondary">
          {t('upload.logged_in_as')}{' '}
          <Link href={`https://commons.wikimedia.org/wiki/User:${wikiUser}`} target="_blank" rel="noopener noreferrer">
            {wikiUser}
          </Link>{' '}
          (<Link component="button" variant="caption" onClick={logout} sx={{ cursor: 'pointer' }}>
            {t('upload.logout')}
          </Link>)
        </Typography>
      </Box>
    </Box>
  );
};
