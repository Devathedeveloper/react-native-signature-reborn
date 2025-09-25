# Signature Example App

This is a test app to verify the `react-native-signature-reborn` library functionality.

## Features

- **Drawing**: Draw signatures with customizable stroke color and width
- **Save**: Save signatures as JPEG images with Base64 data
- **Clear**: Clear the current drawing
- **Share**: Share saved signatures
- **Debug Info**: Real-time feedback on operations

## Usage

1. Install the library in your React Native project:
   ```bash
   npm install react-native-signature-reborn
   ```

2. For iOS, run:
   ```bash
   cd ios && pod install
   ```

3. Import and use the component:
   ```tsx
   import SignatureView from 'react-native-signature-reborn';
   ```

## Debug Information

The example app includes debug information that shows:
- Current operation status
- Save results (file paths)
- Error messages if any occur

## Troubleshooting

If the save/clear/share functionality doesn't work:

1. **Check Console Logs**: Look for `SignatureView:` prefixed logs in your console
2. **Verify Native Linking**: Ensure the native modules are properly linked
3. **Check Permissions**: Ensure your app has file system permissions
4. **Platform Differences**: Test on both iOS and Android

## Common Issues

### Save Not Working
- Check if `onSave` callback is being called
- Verify file path is being generated
- Check console for error messages

### Clear Not Working
- Check if the native clear command is being dispatched
- Verify the ref is properly attached

### Share Not Working
- Ensure signature was saved first
- Check if file path exists
- Verify Share API permissions

## Testing

The example app provides visual feedback for all operations, making it easy to identify where issues might occur in the signature capture workflow.
