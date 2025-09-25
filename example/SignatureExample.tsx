import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  Share,
  StyleSheet,
  Switch,
  View,
  Text,
} from 'react-native';
import SignatureView, {
  SignatureResult,
  SignatureViewHandle,
} from 'react-native-signature-reborn';

export default function SignatureExample() {
  const signatureRef = useRef<SignatureViewHandle>(null);
  const [latestSignature, setLatestSignature] = useState<SignatureResult | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Ready to draw...');
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [animationColorIndex, setAnimationColorIndex] = useState(0);
  const [animationDuration, setAnimationDuration] = useState(260);
  const [animationRadiusMultiplier, setAnimationRadiusMultiplier] = useState(3.5);

  const animationColor = useMemo(() => {
    const palette = ['#0A84FF66', '#00C85366', '#FF9F0A66'];
    return palette[animationColorIndex % palette.length];
  }, [animationColorIndex]);

  const handleSave = async () => {
    console.log('Save button pressed');
    setDebugInfo('Saving signature...');
    try {
      signatureRef.current?.save();
    } catch (error) {
      console.error('Error calling save:', error);
      setDebugInfo(`Error calling save: ${error}`);
    }
  };

  const handleClear = () => {
    console.log('Clear button pressed');
    setDebugInfo('Clearing signature...');
    try {
      signatureRef.current?.clear();
      setLatestSignature(null);
      setDebugInfo('Signature cleared');
    } catch (error) {
      console.error('Error calling clear:', error);
      setDebugInfo(`Error calling clear: ${error}`);
    }
  };

  const handleShare = async () => {
    if (!latestSignature) {
      Alert.alert('No signature yet', 'Tap Save first to capture the drawing.');
      return;
    }

    try {
      await Share.share({
        url: latestSignature.path,
        message: `Signature (Base64 preview): ${latestSignature.base64?.slice(0, 32)}…`,
      });
      setDebugInfo('Share dialog opened');
    } catch (error) {
      console.error('Error sharing:', error);
      setDebugInfo(`Error sharing: ${error}`);
    }
  };

  const handleSaveResult = (result: SignatureResult) => {
    console.log('Save result received:', result);
    setLatestSignature(result);
    setDebugInfo(`Signature saved! Path: ${result.path}`);
  };

  const handleStrokeStart = () => {
    console.log('Stroke started');
    setDebugInfo('Drawing started...');
  };

  const handleStrokeEnd = () => {
    console.log('Stroke ended');
    setDebugInfo('Drawing ended');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <SignatureView
          ref={signatureRef}
          style={styles.signature}
          strokeColor="#0A84FF"
          strokeWidth={4}
          imageFormat="jpeg"
          imageQuality={0.7}
          shouldIncludeBase64={true}
          signingAnimationEnabled={animationEnabled}
          signingAnimationColor={animationColor}
          signingAnimationDuration={animationDuration}
          signingAnimationRadiusMultiplier={animationRadiusMultiplier}
          onSave={handleSaveResult}
          onStrokeStart={handleStrokeStart}
          onStrokeEnd={handleStrokeEnd}
        />
      </View>

      <View style={styles.controlsRow}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Animated Ink</Text>
          <Switch value={animationEnabled} onValueChange={setAnimationEnabled} />
        </View>

        <Button
          title="Pulse Color"
          onPress={() => setAnimationColorIndex((value) => value + 1)}
        />
        <Button
          title="Faster"
          onPress={() =>
            setAnimationDuration((value) => Math.max(120, value - 40))
          }
        />
        <Button
          title="Slower"
          onPress={() =>
            setAnimationDuration((value) => Math.min(600, value + 40))
          }
        />
      </View>

      <View style={styles.controlsRow}>
        <Text style={styles.controlText}>Duration: {animationDuration} ms</Text>
        <Text style={styles.controlText}>
          Radius ×{animationRadiusMultiplier.toFixed(1)}
        </Text>
        <Button
          title="Shrink"
          onPress={() =>
            setAnimationRadiusMultiplier((value) =>
              Math.max(1.5, Number((value - 0.5).toFixed(1)))
            )
          }
        />
        <Button
          title="Expand"
          onPress={() =>
            setAnimationRadiusMultiplier((value) =>
              Math.min(8, Number((value + 0.5).toFixed(1)))
            )
          }
        />
      </View>

      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>{debugInfo}</Text>
        {latestSignature && (
          <Text style={styles.debugText}>
            Last signature: {latestSignature.path}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <Button title="Save" onPress={handleSave} />
        <Button title="Clear" onPress={handleClear} />
        <Button title="Share" onPress={handleShare} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1116',
    padding: 24,
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  signature: {
    flex: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  controlText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  debugContainer: {
    backgroundColor: '#1C1C1E',
    padding: 12,
    borderRadius: 8,
    minHeight: 60,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
