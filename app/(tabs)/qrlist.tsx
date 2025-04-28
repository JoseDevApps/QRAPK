import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFileData } from '@/contexts/FileDataContext';
import * as Progress from 'react-native-progress';

export default function QRListScreen() {
  const { fileData, statedup = [] } = useFileData();
  if (!fileData || !Array.isArray(fileData)) {
    return <Text style={{ padding: 20 }}>Data not loaded yet</Text>;
  }
  const summary = fileData.reduce(
    (acc, row) => {
      if (row.Estado === 'available') acc.aprobado++;
      else if (row.Estado === 'scanned') acc.duplicado++;
      else acc.denegado++;
      return acc;
    },
    { aprobado: 0, denegado: 0, duplicado: 0 }
  );

  const duplicatedCount = Array.isArray(statedup) ? statedup.length : 0;

  const total = summary.aprobado + summary.duplicado + summary.denegado;
  const verified = summary.duplicado;
  const verifiedPercentage = total > 0 ? verified / total : 0;

  return (
    
    <View style={styles.container}>
      {/* Header fijo */}
      <View style={styles.header}>
        <Text style={styles.pageHeader}>REPORT</Text>
        <Text style={styles.title}>Summary</Text>

        <View style={styles.progressContainer}>
          <Progress.Circle
            size={100}
            progress={verifiedPercentage}
            showsText
            formatText={() => `${Math.round(verifiedPercentage * 100)}%`}
            color="#009FE3"
            thickness={8}
            textStyle={{ fontWeight: 'bold' }}
          />
        </View>

        <View style={styles.summaryContainer}>
          <View style={[styles.summaryItem, { backgroundColor: '#009FE3' }]}>
            <Text style={styles.summaryLabel}>Verified </Text>
            <Text style={styles.summaryCount}>
            {summary.duplicado}/{total}
            </Text>
          </View>
        </View>

        <Text style={styles.dupListTitle}>Duplicated Scans</Text>
        <View style={[styles.summaryItem, { backgroundColor: '#212529' }]}>
          <Text style={styles.summaryLabel}>Duplicated </Text>
          <Text style={styles.summaryCount}>{duplicatedCount}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollArea}>
        {duplicatedCount === 0 ? (
          <Text style={styles.emptyMessage}>No duplicated scans yet.</Text>
        ) : (
          statedup.map((entry, index) => (
            <View key={index} style={styles.dupItem}>
              <Text style={styles.dupText}>QR ID: {entry.duplicateQRID}</Text>
              <Text style={styles.dupText}>
                Time:{' '}
                {new Date(entry.scannedAt).toLocaleString('es-BO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    padding: 20,
    marginTop: 20,
    backgroundColor: '#f4f4f4',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pageHeader: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 5,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  dupListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  dupItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  dupText: {
    fontSize: 16,
    color: '#444',
  },
  emptyMessage: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});
