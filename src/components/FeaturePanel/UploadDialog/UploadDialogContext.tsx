import React, { createContext, useContext, useState } from 'react';

type UploadDialogType = {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
};

const UploadDialogContext = createContext<UploadDialogType>(undefined);

export const UploadDialogProvider = ({ children }) => {
  const [open, setOpen] = useState(false);

  const value: UploadDialogType = {
    open,
    openDialog: () => setOpen(true),
    closeDialog: () => setOpen(false),
  };

  return (
    <UploadDialogContext.Provider value={value}>
      {children}
    </UploadDialogContext.Provider>
  );
};

export const useUploadDialogContext = () => useContext(UploadDialogContext);
