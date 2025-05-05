import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Modal, Image, StyleSheet, Platform, Button, Alert, View, Dimensions, TouchableOpacity, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFileData } from '@/contexts/FileDataContext';
import { useFonts } from 'expo-font';

const { height, width } = Dimensions.get('window');

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    ProtestStrike: require('@/assets/fonts/ProtestStrike-Regular.ttf'),
  });

  useFocusEffect(
    useCallback(() => {
      const prepare = async () => {
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
        }
      };
      prepare();
    }, [fontsLoaded])
  );

  const { setFileData, clearFileData } = useFileData();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [messageModal, setMessageModal] = useState<string | null>(null);
  const [modalMessageType, setModalMessageType] = useState<'error' | 'success'>('error');

  if (!fontsLoaded) return null;

  const pickExcelFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      if (result.type === 'cancel') return;

      const uri = result.assets[0].uri;
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const bytes = base64ToUint8Array(base64);
      const workbook = XLSX.read(bytes, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const requiredColumns = ['QRCode', 'Status'];
      const firstRow = jsonData[0] || {};
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));

      if (missingColumns.length > 0) {
        setModalMessageType('error');
        setMessageModal(`The following required columns are missing: ${missingColumns.join(', ')}`);
        setModalVisible(true);
        return;
      }

      setFileData(jsonData);
      Alert.alert('Data loaded successfully');
      router.push('/explore');
    } catch (error) {
      console.error(error);
      setModalMessageType('error');
      setMessageModal('Retry loading Excel in the correct format');
      setModalVisible(true);
    }
  };

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
    <View style={styles.container} >
      {/* Title */}
      <View style={styles.title}>
        <ThemedView style={styles.titleContainer}>
          <Image source={require('@/assets/images/qr-logo.jpeg')} style={styles.logo} />
          <ThemedText style={styles.titleContainer1} type="title">QR</ThemedText>
          <ThemedText style={styles.titleContainer2} type="title"> Pass</ThemedText>
        </ThemedView>
      </View>

      {/* Buttons */}
      <View style={styles.body}>
        <ThemedView style={styles.stepContainer1}>
          <TouchableOpacity style={styles.customButton} onPress={pickExcelFile}>
            <Text style={styles.buttonText}>Load Excel File</Text>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.stepContainer2}>
          <TouchableOpacity style={styles.customButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonTextM}>Need Help?</Text>
          </TouchableOpacity>
         
        </ThemedView>
        <ThemedView style={styles.stepContainer2}>
        <TouchableOpacity
          style={styles.customButton}
          onPress={() => {
            Alert.alert(
              'Confirm',
              'Are you sure you want to clear all loaded data?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes, Clear', style: 'destructive', onPress: clearFileData },
              ]
            );
          }}
        >
          <Text style={styles.buttonText}>Clear Data</Text>
        </TouchableOpacity>
        </ThemedView>
      </View>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setMessageModal(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              {messageModal ?? 'Please upload an .xlsx file with "QRCode" and "Status" columns.'}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setModalVisible(false);
                setMessageModal(null);
              }}
            >
              <Text style={styles.buttonText}>Close</Text>
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
    backgroundColor: 'black',
    paddingTop: height * 0.1,
    
  },
  body: {
    flex: 0.75,
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
    backgroundColor:'black',
    color: "#FFFFFF",
    fontFamily: 'SpaceMono',
  },
  titleContainer2: {
    color: "#009FE3",
    fontFamily: 'SpaceMono',
  },
  helptext: {
    fontFamily: 'ProtestStrike',
    color: '#009FE3',
    fontSize: 20,
  },
  stepContainer: {
    gap: 8,
    marginBottom: height * 0.1,
    alignItems: 'center',
    backgroundColor:'black',
  },
  stepContainer1: {
    gap: 8,
    marginBottom: height * 0.1,
    alignItems: 'center',
    backgroundColor:'#000000'
  },
  stepContainer2: {
    marginTop: height * 0.1,
    marginBlockEnd: -height*0.1,
    alignItems: 'center',
    backgroundColor:'#000000'
  },
  
  subtitle: {
    fontFamily: 'ProtestStrike',
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  loadedData: {
    fontFamily: 'ProtestStrike',
    fontSize: 14,
    color: '#cccccc',
  },
  customButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor:'#000000',
  },
  buttonText: {
    fontFamily: 'ProtestStrike-Regular',
    color: '#009FE3',
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor:'#000000',
  },
  buttonTextM: {
    fontFamily: 'ProtestStrike-Regular',
    color: '#009FE3',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor:'#000000',
  },
  logo: {
    marginTop: -3,
    width: 35, // adjust as needed
    height: 35,
    resizeMode: 'contain',
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#009FE3',
  },
  modalText: {
    fontFamily: 'ProtestStrike-Regular',
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalCloseButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#000',
    borderColor: '#009FE3',
    borderWidth: 1,
  },
});