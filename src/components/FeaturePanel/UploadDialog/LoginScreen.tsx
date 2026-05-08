import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import { t } from '../../../services/intl';
import { useWikimediaAuth } from '../../utils/WikimediaAuthContext';

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

export const LoginScreen = () => {
  const { login, loading } = useWikimediaAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setLocalError(t('upload.login_fill_credentials'));
      return;
    }
    setLocalError(null);
    try {
      await login(username, password);
    } catch (e) {
      setLocalError(e.message || String(e));
    }
  };

  return (
    <Box>
      <Typography variant="overline" display="block" gutterBottom>
        {t('upload.title')}
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box flex={1} mr={2}>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t('upload.login_description')}{' '}
            <a
              href="https://www.mediawiki.org/wiki/Special:CreateAccount"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wikipedia
            </a>
            .
          </Typography>

          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField
              label={t('upload.login_username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="small"
              fullWidth
              autoComplete="username"
            />
            <TextField
              label={t('upload.login_password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              fullWidth
              autoComplete="current-password"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            {localError && (
              <Typography variant="body2" color="error">
                {localError}
              </Typography>
            )}
          </Box>
        </Box>

        <WikimediaCommonsLogo />
      </Box>

      <Box mt={3} display="flex" flexDirection="column" alignItems="center" gap={1}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleLogin}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {t('upload.login_button')}
        </Button>
        <Button
          size="small"
          color="primary"
          href="https://www.mediawiki.org/wiki/Special:CreateAccount"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('upload.register_button')}
        </Button>
      </Box>
    </Box>
  );
};
