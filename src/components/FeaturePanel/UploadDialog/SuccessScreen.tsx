import React from 'react';
import { Box, Divider, Link, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudIcon from '@mui/icons-material/Cloud';
import { t } from '../../../services/intl';
import { LonLat } from '../../../services/types';

type SuccessResult = {
  title: string;
  filename: string;
  username: string;
  date: string;
  location: LonLat | null;
};

type Props = {
  result: SuccessResult;
};

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

export const SuccessScreen = ({ result }: Props) => {
  const commonsUrl = `https://commons.wikimedia.org/wiki/${result.title}`;
  const locationStr = result.location
    ? `${result.location[1].toFixed(5)},${result.location[0].toFixed(5)}`
    : null;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={3}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          flex={1}
          mt={2}
        >
          <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h6" align="center">
            {t('upload.success_heading')}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            mt={1}
          >
            {t('upload.success_description')}
          </Typography>
        </Box>

        <WikimediaCommonsLogo />
      </Box>

      <Divider />

      <Box mt={2} display="flex" gap={2} sx={{ background: '#f5f5f5', p: 2 }}>
        <Box
          sx={{
            width: 120,
            height: 120,
            background: '#e0e0e0',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Link href={commonsUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(result.filename)}?width=120`}
              alt={result.filename}
              style={{ maxWidth: 120, maxHeight: 120, objectFit: 'contain' }}
            />
          </Link>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {t('upload.field_name')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {result.filename}
          </Typography>

          <Typography variant="caption" color="text.secondary" display="block">
            {t('upload.field_license')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            CC-BY-SA-4.0
          </Typography>

          {locationStr && (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {t('upload.field_location')}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {locationStr}
              </Typography>
            </>
          )}

          <Typography variant="caption" color="text.secondary" display="block">
            {t('upload.field_author')}
          </Typography>
          <Typography variant="body2">{result.username}</Typography>
        </Box>
      </Box>
    </Box>
  );
};
