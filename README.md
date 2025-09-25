# React Native Signature Reborn

A native-accelerated signature capture component for React Native that feels at home on both iOS and Android. Draw fluid signatures, tweak stroke settings on the fly, and export perfectly crisp PNGs together with a Base64 payload – all wrapped in a TypeScript-first API.

> ⚠️ **Currently in Testing Phase** - This library is under active development and testing. While the core functionality is working, please use with caution in production environments and report any issues you encounter.

## Features

- ✍️ **Smooth, pressure-free drawing** powered by native Swift and Kotlin rendering layers
- 🧼 **One-tap clearing** of the current canvas
- 💾 **Instant exporting** to a file + optional Base64 string saved in the temp directory
- 🗜️ **Tunable output** – choose PNG for crisp edges or JPEG with custom quality for lightweight payloads
- 🎨 **Runtime styling** with `setStrokeColor()` and `setStrokeWidth()` helpers
- 💫 **Optional live ink ripples** that follow the pen with customizable duration, color, and size
- 📐 **Responsive by default** – the canvas automatically fills its container
- ⚛️ **TypeScript friendly** with typed refs, props, and result payloads

## Installation

```bash
# with npm
npm install react-native-signature-reborn

# with yarn
yarn add react-native-signature-reborn

# with bun
bun add react-native-signature-reborn
```

After installing, run `pod install` inside your iOS directory (as you would for any native dependency).

## Testing Status

This library is currently in **active testing phase**. Here's what we know:

### ✅ **Working Features**
- Basic signature drawing and clearing
- PNG/JPEG export with Base64 encoding
- Stroke color and width customization
- iOS and Android compatibility
- TypeScript support
- Simplified API with better performance

### 🧪 **Under Testing**
- Various device configurations and screen sizes
- Memory usage and performance optimization
- Edge cases and error handling
- Export quality and file size optimization

### 🐛 **Known Issues**
- Some iOS compilation issues have been recently fixed
- API has been simplified and may require code updates
- Testing on different React Native versions ongoing

### 📝 **Reporting Issues**
If you encounter any problems, please:
1. Test with the latest version (0.2.1+)
2. Report issues with device info and reproduction steps
3. Check the usage examples for proper implementation

## Usage

```tsx
import React, { useRef, useState } from 'react';
import { Alert, Button, SafeAreaView, Share, StyleSheet, View } from 'react-native';
import SignatureView, {
  SignatureResult,
  SignatureViewHandle,
} from 'react-native-signature-reborn';

export default function SignatureExample() {
  const signatureRef = useRef<SignatureViewHandle>(null);
  const [latestSignature, setLatestSignature] = useState<SignatureResult | null>(null);

  const handleSave = async () => {
    signatureRef.current?.save();
  };

  const handleClear = () => {
    signatureRef.current?.clear();
    setLatestSignature(null);
  };

  const handleShare = async () => {
    if (!latestSignature) {
      Alert.alert('No signature yet', 'Tap Save first to capture the drawing.');
      return;
    }

    await Share.share({
      url: latestSignature.path,
      message: `Signature (Base64 preview): ${latestSignature.base64.slice(0, 32)}…`,
    });
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
          onSave={setLatestSignature}
        />
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
```

### Imperative API

Grab a ref to the component to access native-powered helpers:

```ts
signatureRef.current?.save(); // renders to PNG + base64 and triggers onSave
signatureRef.current?.clear(); // wipes the canvas clean
signatureRef.current?.setStrokeColor('#FF2D55'); // switches to a new color
signatureRef.current?.setStrokeWidth(6); // use thicker lines
```

### Export customization

Fine-tune how much data you persist when calling `save()`:

```tsx
<SignatureView
  imageFormat="jpeg"        // switch to JPEG to reduce file size
  imageQuality={0.6}         // tweak compression (only for JPEG)
  shouldIncludeBase64={false} // omit the Base64 payload when you only need the file path
  imageBackgroundColor="#FFFFFF" // force opaque output even if the view is transparent
  exportScale={0.75}         // shrink pixel dimensions to further trim the bytes
/>
```

Set `exportScale` below `1` to downscale the exported bitmap, which typically brings the payload well under 100 KB even for large signatures. When you need transparent PNGs on screen but opaque JPEG exports, provide `imageBackgroundColor` so the renderer fills the canvas before compressing.

### Animated signing experience

Turn on the native ripple animation to give users immediate visual feedback as they glide across the canvas:

```tsx
<SignatureView
  signingAnimationEnabled
  signingAnimationColor="rgba(10, 132, 255, 0.4)"
  signingAnimationDuration={260} // milliseconds
  signingAnimationRadiusMultiplier={3.5} // relative to the current stroke width
/>
```

All animation knobs can be tweaked at runtime. Disable the effect entirely by setting `signingAnimationEnabled={false}` for a classic ink-only experience.

### Event payload

When `save()` completes (or the user triggers `onSave` via native UI in the future), you receive:

```ts
interface SignatureResult {
  path: string;    // absolute path to the generated image file
  base64?: string; // optional Base64 payload (enable/disable via shouldIncludeBase64)
}
```

## Expo & bare React Native compatibility

`react-native-signature-reborn` works in bare React Native applications (including Expo Bare / Development Builds). For Expo Go, create a development build so the native module is included.

## Troubleshooting

- **Testing Phase Warning**: This library is under active development. Use with caution in production and report any issues.
- Ensure you call `save()` after the user finishes drawing. The resulting PNG is stored inside the OS cache directory – copy or upload it before the cache is cleared.
- If you change the component size dynamically, the canvas will scale automatically, but clearing before resizing provides the crispest results.
- **API Changes**: The API has been simplified in recent versions. Check the usage examples for the current implementation.
- **Build Issues**: If you encounter compilation errors, ensure you're using the latest version (0.2.1+) with the fixed TypeScript configuration.

## Building & releasing

The repository ships with the precompiled JavaScript and type declarations under `lib/` so you can publish straight away. When you make source changes, rebuild the distributable bundles with:

```bash
npm run build
```

This clears the previous artifacts and generates synchronized CommonJS, ES modules, and TypeScript definition files. Once satisfied, bump the version in `package.json`, optionally run `npm pack` to inspect the tarball, and publish with:

```bash
npm publish
```

Use the `--access public` flag the first time you publish under a new npm scope.

## License

MIT © React Native Signature Reborn contributors
