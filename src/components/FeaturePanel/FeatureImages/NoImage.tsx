import React from 'react';
import styled from '@emotion/styled';
import { grey } from '@mui/material/colors';
import { Button } from '@mui/material';
import { useFeatureContext } from '../../utils/FeatureContext';
import { HEIGHT } from './helpers';
import { iconsLookup } from '../../utils/icons/iconsLookup';
import { t } from '../../../services/intl';
import { useUploadDialogContext } from '../UploadDialog';

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: ${HEIGHT}px;
  background: ${({ theme }) =>
    theme.palette.mode === 'dark' ? grey['700'] : grey['100']};

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 8px;

  img {
    width: 100px;
    height: 100px;
    color: #eee;
    opacity: 0.15;
  }
`;

export const NoImage = () => {
  const { feature } = useFeatureContext();
  const { openDialog } = useUploadDialogContext();
  const { properties } = feature;
  const ico = properties.class;
  const icon = iconsLookup.includes(ico) ? ico : 'information';

  return (
    <Wrapper>
      <img src={`/icons/${icon}_11.svg`} alt={ico} title={ico} />
      <Button
        size="small"
        onClick={openDialog}
        sx={{
          textTransform: 'none',
          color: 'text.secondary',
          fontSize: '0.75rem',
          opacity: 0.7,
          '&:hover': { opacity: 1 },
        }}
      >
        {t('upload.upload_image_button')}
      </Button>
    </Wrapper>
  );
};
