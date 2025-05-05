import { CameraView, CameraType, useCameraPermissions, FlashMode  } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Button, StyleSheet, Text, View, Modal, TouchableOpacity, Platform,StatusBar, AppState, Alert } from 'react-native';
import Overlay from "@/components/Overlay";
import { Audio } from 'expo-av';
import { useFileData } from '@/contexts/FileDataContext'; // Access the context

export default function App() {
  const { statedup,setStatedup,fileData, setFileData } = useFileData(); // Get the fileData from the context
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [matchFound, setMatchFound] = useState(false); // New state to track if the match is found
  const [stateqr, setStateQR] = useState<string | null>(null);
  const [scannedState, setScannedState] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [qrID, setQrID] = useState<string | null>(null); 
  const lastDuplicate = statedup.find(item => item.duplicateQRID === qrID);
  const [isActive, setIsActive] = useState(false);

  // Load sound for scanning
  const playScanSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sounds/scan-sound.mp3') // Add your sound file here
    );
    setSound(sound);
    await sound.playAsync(); // Play the sound when QR code is scanned
  };

  
  // Compare scanned QR code with the loaded Excel data
  const compareWithExcelData = (scannedCode: string) => {
    // Find the entry that matches the scanned QR code
    setScannedState(" ");
    const match = fileData.find((row) => row["QRCode"] === scannedCode);
  
    if (match) {
      setQrID(match["QR ID"])
      console.log(match["QR ID"])
      if (match.Status === "scanned") {
        // If QR code is already scanned, show an alert
        setStateQR("DUPLICATE");
        setScannedState("scanned");
        setMatchFound((prevCount) => prevCount + 1);
        const currentTime = new Date().toISOString();
          setStatedup(prev => [
            ...prev,
            { duplicateQRID: match["QR ID"], scannedAt: currentTime }
          ]);

        return; // Exit the function to prevent re-updating
      }
  
      // If a match is found and it's not scanned, update matchFound state
      setMatchFound(true);
      setStateQR("APPROVED");
      // Update "Estado" field to "scanned"
      setFileData((prevData) =>
        prevData.map((row) =>
          row["QRCode"] === scannedCode
            // ? { ...row, Status: "scanned" }
            ?{ ...row, Status: "scanned", scannedAt: currentTime }
            : row
        )
      );
    } else {
      // If no match is found, update matchFound state and show a failure message
      setMatchFound(false);
      setQrID(null);
      setStateQR("DENIED");
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsActive(true); // Activar cámara cuando este tab está enfocado
  
      return () => {
        setIsActive(false); // Desactivarla al salir del tab
      };
    }, [])
  );

  useEffect(() => {
    console.log('Loaded file data:', fileData); // Ensure fileData is available
  }, [fileData]);

  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);


  useEffect(() => {
    // Listen to app state changes
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        qrLock.current = false; // Reset QR lock when app comes to the foreground
      }
      appState.current = nextAppState; // Update app state
    });

    // Cleanup the subscription when the component is unmounted
    return () => {
      subscription.remove();
    };
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function handleBarcodeScanned({ data }: { data: string }) {
    if (data && !qrLock.current) {
      qrLock.current = true;
      setScannedData(data);
      playScanSound(); // Play the scan sound
      setModalVisible(true);
      compareWithExcelData(data); // Compare the scanned data with the file data

    }
  }

  function handleConfirm() {
    setModalVisible(false);
    setTimeout(async () => {
      qrLock.current = false;
    }, 2000); // 2 seconds delay before unlocking again
  }

  function toggleFlashlight() {
    setTorchOn((prev) => !prev);
  }

  const getModalBackgroundColor = (stateqr: string | null) => {
    switch (stateqr) {
      case "APPROVED":
        return "rgba(170, 204, 0, 0.8)"; // Green
      case "DENIED":
        return "rgba(239, 35, 60, 0.8)";// Red
      case "DUPLICATE":
        return "rgb(239, 35, 60)";// Orange
      default:
        return "rgba(62, 72, 64, 0.5)"; // Default gray
    }
  };
  function getTimeAgoString(isoTime: string) {
    const now = new Date();
    const past = new Date(isoTime);
    const diffMs = now.getTime() - past.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffSec = Math.floor((diffMs % 60000) / 1000);
  
    if (diffMin > 0) {
      return `${diffMin} min ago`;
    } else {
      return `${diffSec} sec ago`;
    }
  }

  return (
    <View style={styles.container}>
      
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      {isActive && (
      <CameraView style={styles.camera} facing="back" onBarcodeScanned={handleBarcodeScanned} enableTorch={torchOn } />
      )}
      <Overlay />
      <TouchableOpacity style={styles.flashlightButton} onPress={toggleFlashlight}>
        <Text style={styles.flashlightText}>{torchOn ? 'Flash ON' : 'Flash OFF'}</Text>
      </TouchableOpacity>
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: getModalBackgroundColor(stateqr) }]}>
          <Text style={styles.modalText}>
            {stateqr}
          </Text>
          <Text style={styles.modalData}>QR ID: {qrID}</Text>
          <Text style={styles.modalData}>{scannedData}</Text>
          {stateqr === "DUPLICATE" && lastDuplicate && (
        <Text style={styles.modalData}>Last scanned: {getTimeAgoString(lastDuplicate.scannedAt)}</Text>
      )}
          <TouchableOpacity style={styles.modalButton} onPress={handleConfirm}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(62, 72, 64, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'rgba(44, 197, 72, 0.5)',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "white"
  },
  modalData: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: "white"
  },
  modalButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  flashlightButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 10,
  },
  flashlightText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
