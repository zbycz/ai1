import { Box, Button, Link } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import React, { useState } from 'react';
import { t } from '../../services/intl';
import { useOsmAuthContext } from '../utils/OsmAuthContext';
import { useEditDialogContext } from './helpers/EditDialogContext';
import { useEditDialogFeature } from './EditDialog/utils';
import CommentIcon from '@mui/icons-material/Comment';
import { UploadDialog } from './UploadDialog/UploadDialog';

const getLabel = (
  loggedIn: boolean,
  isAddPlace: boolean,
  isUndelete: boolean,
) => {
  if (isAddPlace) return t('featurepanel.add_place_button');
  if (isUndelete) return t('featurepanel.undelete_button');
  if (loggedIn) return t('featurepanel.edit_button');
  return t('featurepanel.note_button');
};

export const EditButton = () => {
  const { isAddPlace, isUndelete } = useEditDialogFeature();
  const { loggedIn } = useOsmAuthContext();
  const { open } = useEditDialogContext();
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <Box mt={3} mb={3} mx="auto" sx={{ textAlign: 'center' }}>
      <Button
        size="large"
        startIcon={
          isAddPlace || isUndelete ? (
            <AddLocationIcon />
          ) : loggedIn ? (
            <EditIcon />
          ) : (
            <CommentIcon />
          )
        }
        variant="outlined"
        color="primary"
        onClick={open}
      >
        {getLabel(loggedIn, isAddPlace, isUndelete)}
      </Button>
      <Box mt={1}>
        <Link
          component="button"
          variant="body2"
          onClick={() => setUploadOpen(true)}
          sx={{ color: 'text.secondary', textDecoration: 'none', cursor: 'pointer' }}
        >
          {t('uploaddialog.open_button')}
        </Link>
      </Box>
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </Box>
  );
};
