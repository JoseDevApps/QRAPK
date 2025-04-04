// import React from 'react';
// import { View, Text, StyleSheet, FlatList } from 'react-native';
// import { useFileData } from '@/contexts/FileDataContext';

// export default function QRListScreen() {
//   const { fileData } = useFileData();

//   // Count QR codes by state
//   const summary = fileData.reduce(
//     (acc, row) => {
//       if (row.Estado === 'available') acc.aprobado++;
//       else if (row.Estado === 'scanned') acc.duplicado++;
//       else acc.denegado++;
//       return acc;
//     },
//     { aprobado: 0, denegado: 0, duplicado: 0 }
//   );

//   const data = [
//     { estado: 'APROBADO', count: summary.aprobado, color: 'rgba(170, 204, 0, 0.8)' },
//     { estado: 'DENEGADO', count: summary.denegado, color: 'rgba(239, 35, 60, 0.8)' },
//     { estado: 'DUPLICADO', count: summary.duplicado, color: 'rgba(33, 37, 41, 0.8)' },
//   ];

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Resumen de QR Codes</Text>
//       <View style={styles.summaryContainer}>
//         <Text style={styles.summaryText}>Disponibles: {summary.aprobado}</Text>
//         <Text style={styles.summaryText}>Escaneados: {summary.duplicado}</Text>
//         <Text style={styles.summaryText}>Denegados: {summary.denegado}</Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#f4f4f4',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   summaryContainer: {
//     width: '80%',
//     padding: 20,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.2,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 5,
//     alignItems: 'center',
//   },
//   summaryText: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginVertical: 5,
//   },
// });

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFileData } from '@/contexts/FileDataContext';

export default function QRListScreen() {
  const { fileData } = useFileData();

  // Count QR codes by state
  const summary = fileData.reduce(
    (acc, row) => {
      if (row.Estado === 'available') acc.aprobado++;
      else if (row.Estado === 'scanned') acc.duplicado++;
      else acc.denegado++;
      return acc;
    },
    { aprobado: 0, denegado: 0, duplicado: 0 }
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen del evento</Text>
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryItem, { backgroundColor: '#aacc00' }]}>
          <Text style={styles.summaryLabel}>Disponibless</Text>
          <Text style={styles.summaryCount}>{summary.aprobado}</Text>
        </View>
        <View style={[styles.summaryItem, { backgroundColor: '#212529' }]}>
          <Text style={styles.summaryLabel}>Escaneados</Text>
          <Text style={styles.summaryCount}>{summary.duplicado}</Text>
        </View>
        <View style={[styles.summaryItem, { backgroundColor: '#ef233c' }]}>
          <Text style={styles.summaryLabel}>DENEGADO</Text>
          <Text style={styles.summaryCount}>{summary.denegado}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  summaryContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  summaryItem: {
    width: '90%',
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
});