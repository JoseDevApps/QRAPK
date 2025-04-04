import React from 'react';
import { Image, StyleSheet, Platform, Button, Alert, View, Dimensions,TouchableOpacity, Text} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFileData } from '@/contexts/FileDataContext'; // Import the custom hook
import { useFonts } from 'expo-font';
const { height,width } = Dimensions.get('window'); // Obtiene el ancho de la pantalla
SplashScreen.preventAutoHideAsync(); // Prevent splash screen from hiding before fonts load

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    'ProtestStrike-Regular': require('@/assets/fonts/ProtestStrike-Regular.ttf'),
  });
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  
  if (!fontsLoaded) {
    return null; // Prevent rendering before fonts are loaded
  }


  const { setFileData } = useFileData(); // Access the function to set fileData
  const router = useRouter();

  // Function to pick and process the Excel file
  const pickExcelFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel MIME type
      });

      if (result.type === 'cancel') return; // Handle cancellation

      const uri = result.assets[0].uri; // Get the correct file URI

      // Read the file content as Base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert Base64 to a Uint8Array for XLSX parsing
      const bytes = base64ToUint8Array(base64);
      const workbook = XLSX.read(bytes, { type: 'array' });
      const sheetName = workbook.SheetNames[0]; // Get the first sheet
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet); // Convert sheet to JSON

      setFileData(jsonData); // Set the data to state
      Alert.alert('File loaded successfully', 'Excel file data has been processed.');
      // Navigate to the Explore screen with the fileData
      router.push({
        pathname: '/explore',

      });

    } catch (error) {
      console.error('Error loading the document:', error);
      Alert.alert('Error', 'An error occurred while loading the file.');
    }
  };

  // Function to convert Base64 to Uint8Array
  const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  return (
    <View style={styles.container}> 
     <View style={styles.title}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText style={styles.titleContainer1} type="title">QR</ThemedText>
        <ThemedText style={styles.titleContainer2} type="title"> Pass</ThemedText>
      </ThemedView>
     </View>

      <View style={styles.body}>
      {/* Load Excel File Button */}
      <ThemedView style={styles.stepContainer1}>
        <TouchableOpacity style={styles.customButton} onPress={pickExcelFile}>
          <Text style={styles.buttonText}>Load Excel File</Text>
        </TouchableOpacity>
    </ThemedView>
      {/* Display loaded data */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle" style={styles.titleContainer1} >Loaded Excel Data:</ThemedText>
      </ThemedView>
      </View>
       
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: height * 0.1,
    
  },
  body: {
    flex: 0.6,
    paddingLeft: width * 0.1,
    paddingRight: width * 0.1,
    justifyContent: 'center',
  },
  title: {
    flex: 0.1,
    flexDirection: 'column',
    paddingTop: height * 0.05,
    alignItems: 'center',
  },
  titleContainer: {
    backgroundColor: 'black',
    flexDirection: 'row',

  },
  titleContainerHelp: {
    backgroundColor: 'black',
    flexDirection: 'row',
    justifyContent: 'center',

  },
  titleContainer1: {
    color: "#FFFFFF",
    fontFamily: 'ProtestStrike-Regular',
  },
  titleContainer2: {
    color: "#009FE3",
    fontFamily: 'ProtestStrike-Regular',
  },
  titleText: {
    fontFamily: 'ProtestStrike-Regular',
    color: '#009FE3',
    fontSize: 32,
    fontWeight: 'bold',
    
  },
  helptext: {
    fontFamily: 'ProtestStrike-Regular',
    color: '#009FE3',
    fontSize: 20,
  },
  
  stepContainer: {
    gap: 8,
    marginBottom: height * 0.1,
    alignItems: 'center',
    
  },
  stepContainer1: {
    gap: 8,
    marginBottom: height * 0.1,
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: 'ProtestStrike-Regular',
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  loadedData: {
    fontFamily: 'ProtestStrike-Regular',
    fontSize: 14,
    color: '#cccccc',
  },
  customButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'ProtestStrike-Regular',
    color: '#009FE3',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
