import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator  } from 'react-native';
import { useFileData } from '@/contexts/FileDataContext';
import XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { TouchableOpacity } from 'react-native';


export default function QRListScreen() {
  const { fileData, statedup = [] } = useFileData();


  const summary = Array.isArray(fileData) ? fileData.reduce(
    (acc, row) => {
      const estado = (row['Status'] || '').toString().trim().toLowerCase();
      if (estado === 'available') acc.aprobado++;
      else if (estado === 'scanned') acc.duplicado++;
      else acc.denegado++;
      return acc;
    },
    { aprobado: 0, denegado: 0, duplicado: 0 }
  ) : { aprobado: 0, denegado: 0, duplicado: 0 };

  const exportToExcel = async () => {
    try {
      const ws = XLSX.utils.json_to_sheet(fileData); // Convert JSON to worksheet
      const wb = XLSX.utils.book_new(); // Create a new workbook
      XLSX.utils.book_append_sheet(wb, ws, 'QR Report'); // Append worksheet
  
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' }); // Write workbook to base64
  
      const fileUri = FileSystem.cacheDirectory + 'qr_report.xlsx';
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      await Sharing.shareAsync(fileUri, {
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export QR Report',
        UTI: 'com.microsoft.excel.xlsx',
      });
    } catch (error) {
      console.error('Error exporting file:', error);
    }
  };
  

  const duplicatedCount = Array.isArray(statedup) ? statedup.length : 0;
  const total = summary.aprobado + summary.duplicado + summary.denegado;
  const verified = summary.duplicado;
  const verifiedPercentage = total > 0 ? Math.min(Math.max(verified / total, 0), 1) : 0;

  if (fileData.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#009FE3" />
        <Text>Waiting for QR data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageHeader}>REPORT</Text>
        <Text style={styles.title}>Summary</Text>

      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>
          Verified: {Math.round(verifiedPercentage * 100)}%
        </Text>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${verifiedPercentage * 100}%` },
            ]}
          />
        </View>
      </View>

        <View style={styles.summaryContainer}>
          <View style={[styles.summaryItem, { backgroundColor: '#009FE3' }]}>
            <Text style={styles.summaryLabel}>Verified</Text>
            <Text style={styles.summaryCount}>
              {summary.duplicado}/{total}
            </Text>
          </View>
        </View>

        <Text style={styles.dupListTitle}>Duplicated Scans</Text>
        <View style={[styles.summaryItem, { backgroundColor: '#212529' }]}>
          <Text style={styles.summaryLabel}>Duplicated</Text>
          <Text style={styles.summaryCount}>{duplicatedCount}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: '#28a745',
          padding: 12,
          marginVertical: 10,
          marginHorizontal: 20,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={exportToExcel}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          Export to Excel
        </Text>
      </TouchableOpacity>

      <FlatList
        contentContainerStyle={styles.scrollArea}
        data={statedup}
        keyExtractor={(_, index) => index.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>No duplicated scans yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.dupItem}>
            <Text style={styles.dupText}>QR ID: {item?.duplicateQRID || "Unknown"}</Text>
            <Text style={styles.dupText}>
              Time:{' '}
              {item?.scannedAt
                ? new Date(item.scannedAt).toLocaleString('es-BO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : "Unknown"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, marginTop: 20, backgroundColor: '#f4f4f4' },
  scrollArea: { paddingHorizontal: 20, paddingBottom: 20 },
  pageHeader: { fontSize: 32, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  progressContainer: { alignItems: 'center', marginBottom: 20 },
  summaryContainer: { backgroundColor: '#fff', borderRadius: 10, paddingVertical: 20, paddingHorizontal: 15, marginBottom: 20, elevation: 5 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 8, paddingVertical: 15, paddingHorizontal: 20, marginVertical: 8 },
  summaryLabel: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  summaryCount: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  dupListTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10, color: '#333' },
  dupItem: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  dupText: { fontSize: 16, color: '#444' },
  emptyMessage: { fontStyle: 'italic', color: '#666', textAlign: 'center', marginTop: 10 },
  progressLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBarBackground: {
    width: '100%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#009FE3',
    borderRadius: 10,
  },
});
