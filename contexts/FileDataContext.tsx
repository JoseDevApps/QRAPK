import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FileDataContextType = {
  fileData: any[];
  setFileData: (data: any[]) => void;
  statedup: any[];
  setStatedup: (data: any[]) => void;
  clearFileData: () => void;
};

const FileDataContext = createContext<FileDataContextType>({
  fileData: [],
  setFileData: () => {},
  statedup: [],
  setStatedup: () => {},
  clearFileData: () => {},
});

export const FileDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [fileData, setFileDataState] = useState<any[]>([]);
  const [statedup, setStatedupState] = useState<any[]>([]);

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

  useEffect(() => {
    AsyncStorage.setItem("fileData", JSON.stringify(fileData)).catch(console.error);
  }, [fileData]);

  useEffect(() => {
    AsyncStorage.setItem("statedup", JSON.stringify(statedup)).catch(console.error);
  }, [statedup]);

  const setFileData = (data: any[]) => setFileDataState(data);
  const setStatedup = (data: any[]) => setStatedupState(data);

  const clearFileData = async () => {
    setFileDataState([]);
    setStatedupState([]);
    await AsyncStorage.removeItem("fileData");
    await AsyncStorage.removeItem("statedup");
  };

  return (
    <FileDataContext.Provider value={{ fileData, setFileData, statedup, setStatedup, clearFileData }}>
      {children}
    </FileDataContext.Provider>
  );
};

export const useFileData = () => useContext(FileDataContext);
