import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

// Mapping SF Symbol-style names to MaterialIcons
const MAPPING = {
  // Load screen icon
  'tray.and.arrow.down.fill': 'cloud-download',

  // Scan screen icon
  'qrcode.viewfinder': 'qr-code-scanner',

  // Report screen icon
  'doc.plaintext': 'description',

  // Additional mappings if needed
  'chevron.right': 'chevron-right',
  'house.fill': 'home',
  'paperplane.fill': 'send',
} as const;

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons name={MAPPING[name]} size={size} color={color} style={style} />;
}