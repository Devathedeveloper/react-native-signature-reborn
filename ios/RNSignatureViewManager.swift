import Foundation
import React

@objc(RNSignatureViewManager)
class RNSignatureViewManager: RCTViewManager {
  private var signatureView: RNSignatureView?
  
  override static func moduleName() -> String! {
    return "RNSignatureView"
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    let view = RNSignatureView(frame: .zero)
    signatureView = view
    return view
  }

  // Note: supportedEvents and customDirectEventTypes are handled automatically
  // by React Native's new architecture in version 0.79+

  override func constantsToExport() -> [AnyHashable: Any]! {
    return [
      "Commands": [
        "save": 0,
        "clear": 1,
        "setStrokeColor": 2,
        "setStrokeWidth": 3,
      ],
    ]
  }

  @objc func save(_ reactTag: NSNumber) {
    print("🔍 [iOS Manager] save() called with reactTag: \(reactTag)")
    
    // Use the stored reference instead of view registry
    guard let view = signatureView else {
      print("❌ [iOS Manager] No signature view reference stored")
      return
    }
    
    print("✅ [iOS Manager] Found stored RNSignatureView, calling saveSignature()")
    view.saveSignature()
  }

  @objc func clear(_ reactTag: NSNumber) {
    guard let view = signatureView else {
      return
    }
    
    view.clear()
  }

  @objc func setStrokeColor(_ reactTag: NSNumber, color: NSNumber) {
    guard let view = signatureView else {
      return
    }
    view.updateStrokeColor(RCTConvert.uiColor(color))
  }

  @objc func setStrokeWidth(_ reactTag: NSNumber, width: NSNumber) {
    guard let view = signatureView else {
      return
    }
    view.updateStrokeWidth(CGFloat(truncating: width))
  }
}
