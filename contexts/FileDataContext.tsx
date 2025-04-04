import React, { createContext, useContext, useState } from 'react';

// Define the context with fileData and stateqr
const FileDataContext = createContext<{
  fileData: any[];
  setFileData: React.Dispatch<React.SetStateAction<any[]>>;
  stateqr: string | null;
  setStateQR: React.Dispatch<React.SetStateAction<string | null>>;
  statedup: string | null;
  setStatedup: React.Dispatch<React.SetStateAction<string | null>>;
}>({
  fileData: [],
  setFileData: () => {},
  stateqr: null,
  setStateQR: () => {},
  statedup: null,
  setStatedup: () => {},
});

// Create a custom hook to use the FileDataContext
export const useFileData = () => useContext(FileDataContext);

// Provider component to wrap around your app
export const FileDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fileData, setFileData] = useState<any[]>([]);
  const [stateqr, setStateQR] = useState<string | null>(null); // Add stateqr

  return (
    <FileDataContext.Provider value={{ fileData, setFileData, stateqr, setStateQR }}>
      {children}
    </FileDataContext.Provider>
  );
};