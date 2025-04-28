// import React, { createContext, useContext, useState, useEffect  } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // Define the context with fileData and stateqr
// const FileDataContext = createContext<{
//   fileData: any[];
//   setFileData: React.Dispatch<React.SetStateAction<any[]>>;
//   stateqr: string | null;
//   setStateQR: React.Dispatch<React.SetStateAction<string | null>>;
//   statedup: string | null;
//   setStatedup: React.Dispatch<React.SetStateAction<string | null>>;
// }>({
//   fileData: [],
//   setFileData: () => {},
//   stateqr: null,
//   setStateQR: () => {},
//   statedup: null,
//   setStatedup: () => {},
// });

// // Create a custom hook to use the FileDataContext
// export const useFileData = () => useContext(FileDataContext);

// // Provider component to wrap around your app
// export const FileDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [fileData, setFileData] = useState<any[]>([]);
//   const [stateqr, setStateQR] = useState<string | null>(null); // Add stateqr
//   const [statedup, setStatedup] = useState<any[]>([]); // <-- ahora es un array

//   return (
//     <FileDataContext.Provider value={{ fileData, setFileData, stateqr, setStateQR, statedup, setStatedup }}>
//       {children}
//     </FileDataContext.Provider>
//   );
// };

// import React, { createContext, useContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const FileDataContext = createContext<any>(null);

// export const FileDataProvider = ({ children }: { children: React.ReactNode }) => {
//   const [fileData, setFileDataState] = useState<any[]>([]);
//   const [statedup, setStatedupState] = useState<any[]>([]);

//   // Load from AsyncStorage
//   useEffect(() => {
//     const loadStoredData = async () => {
//       const storedFileData = await AsyncStorage.getItem("fileData");
//       const storedStatedup = await AsyncStorage.getItem("statedup");

//       if (storedFileData) setFileDataState(JSON.parse(storedFileData));
//       if (storedStatedup) setStatedupState(JSON.parse(storedStatedup));
//     };
//     loadStoredData();
//   }, []);

//   // Save fileData when it changes
//   useEffect(() => {
//     AsyncStorage.setItem("fileData", JSON.stringify(fileData));
//   }, [fileData]);

//   // Save statedup when it changes
//   useEffect(() => {
//     AsyncStorage.setItem("statedup", JSON.stringify(statedup));
//   }, [statedup]);

//   const setFileData = (data: any[]) => setFileDataState(data);
//   const setStatedup = (data: any[]) => setStatedupState(data);

//   return (
//     <FileDataContext.Provider value={{ fileData, setFileData, statedup, setStatedup }}>
//       {children}
//     </FileDataContext.Provider>
//   );
// };

// export const useFileData = () => useContext(FileDataContext);

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define a strong TypeScript type
type FileDataContextType = {
  fileData: any[];
  setFileData: (data: any[]) => void;
  statedup: any[];
  setStatedup: (data: any[]) => void;
};

// Create a safe context with default empty values
const FileDataContext = createContext<FileDataContextType>({
  fileData: [],
  setFileData: () => {},
  statedup: [],
  setStatedup: () => {},
});

// Provider component
export const FileDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [fileData, setFileDataState] = useState<any[]>([]);
  const [statedup, setStatedupState] = useState<any[]>([]);

  // Load data from AsyncStorage when app starts
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedFileData = await AsyncStorage.getItem("fileData");
        const storedStatedup = await AsyncStorage.getItem("statedup");

        if (storedFileData) setFileDataState(JSON.parse(storedFileData));
        if (storedStatedup) setStatedupState(JSON.parse(storedStatedup));
      } catch (error) {
        console.error("Error loading stored data:", error);
      }
    };
    loadStoredData();
  }, []);

  // Save fileData to AsyncStorage when it changes
  useEffect(() => {
    const saveFileData = async () => {
      try {
        await AsyncStorage.setItem("fileData", JSON.stringify(fileData));
      } catch (error) {
        console.error("Error saving fileData:", error);
      }
    };
    saveFileData();
  }, [fileData]);

  // Save statedup to AsyncStorage when it changes
  useEffect(() => {
    const saveStatedup = async () => {
      try {
        await AsyncStorage.setItem("statedup", JSON.stringify(statedup));
      } catch (error) {
        console.error("Error saving statedup:", error);
      }
    };
    saveStatedup();
  }, [statedup]);

  const setFileData = (data: any[]) => setFileDataState(data);
  const setStatedup = (data: any[]) => setStatedupState(data);

  return (
    <FileDataContext.Provider value={{ fileData, setFileData, statedup, setStatedup }}>
      {children}
    </FileDataContext.Provider>
  );
};

// Custom hook to use the context
export const useFileData = () => useContext(FileDataContext);
