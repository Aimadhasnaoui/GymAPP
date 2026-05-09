import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Zap, X } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const scanAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 240,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanAnim]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Accès à la caméra requis pour scanner les codes QR</Text>
        <Pressable onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Autoriser la caméra</Text>
        </Pressable>
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }) => {
    setScanned(true);
    // Logic for handling the scanned QR code
    console.log('Scanned Data:', data);
    
    // Example: redirect to a specific member or confirm check-in
    alert(`Scanned: ${data}`);
    
    // Reset after delay
    setTimeout(() => setScanned(false), 2000);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          {/* Viewfinder masks */}
          <View style={styles.maskTop} />
          <View style={styles.maskMiddle}>
            <View style={styles.maskSide} />
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <Animated.View 
                style={[
                  styles.scanLine, 
                  { transform: [{ translateY: scanAnim }] }
                ]} 
              />
            </View>
            <View style={styles.maskSide} />
          </View>
          <View style={styles.maskBottom}>
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>ALIGN QR CODE WITHIN FRAME</Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.controlItem}>
                <Pressable 
                  style={[styles.btnAction, torch && styles.btnActionActive]}
                  onPress={() => setTorch(!torch)}
                >
                  <Zap color="white" size={26} />
                </Pressable>
                <Text style={styles.btnLabel}>Flash</Text>
              </View>

              <View style={styles.controlItem}>
                <Pressable 
                  style={styles.btnActionCancel}
                  onPress={() => router.back()}
                >
                  <X color="white" size={26} />
                </Pressable>
                <Text style={styles.btnLabel}>Cancel</Text>
              </View>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#2f9f3d',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
  },
  maskTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  maskMiddle: {
    height: 260,
    flexDirection: 'row',
  },
  maskSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  viewfinder: {
    width: 260,
    height: 260,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  maskBottom: {
    flex: 1.5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    paddingTop: 50,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#2f9f3d',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    left: 15,
    right: 15,
    height: 4,
    backgroundColor: '#2f9f3d',
    borderRadius: 2,
    opacity: 0.8,
    shadowColor: '#2f9f3d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  instructionContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 60,
  },
  instructionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  footer: {
    flexDirection: 'row',
    gap: 60,
  },
  controlItem: {
    alignItems: 'center',
    gap: 12,
  },
  btnAction: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnActionActive: {
    backgroundColor: '#2f9f3d',
  },
  btnActionCancel: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
