import React, { createContext, useContext, useState } from 'react';
import {
  loginAndfetchOsmUser,
  osmLogout,
  OsmUser,
} from '../../services/osm/auth/user';
import { useSnackbar } from './SnackbarContext';
import { OSM_USER_COOKIE } from '../../services/osm/consts';

type OsmAuthType = {
  loggedIn: boolean;
  osmUser: string;
  userImage: string;
  loading: boolean;
  handleLogin: () => void;
  handleLogout: () => void;
};


const OsmAuthContext = createContext<OsmAuthType>(undefined);


export const useOsmAuthContext = () => useContext(OsmAuthContext);
