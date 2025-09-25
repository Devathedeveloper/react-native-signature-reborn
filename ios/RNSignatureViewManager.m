#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>

@interface RCT_EXTERN_MODULE(RNSignatureViewManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(strokeColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(strokeWidth, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(imageFormat, NSString)
RCT_EXPORT_VIEW_PROPERTY(imageQuality, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(shouldIncludeBase64, BOOL)
RCT_EXPORT_VIEW_PROPERTY(imageBackgroundColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(exportScale, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(onSave, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onStrokeStart, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onStrokeEnd, RCTDirectEventBlock)
RCT_EXTERN_METHOD(save:(nonnull NSNumber *)reactTag)
RCT_EXTERN_METHOD(clear:(nonnull NSNumber *)reactTag)
RCT_EXTERN_METHOD(setStrokeColor:(nonnull NSNumber *)reactTag color:(nonnull NSNumber *)color)
RCT_EXTERN_METHOD(setStrokeWidth:(nonnull NSNumber *)reactTag width:(nonnull NSNumber *)width)
@end
