import Foundation
import React

@objc(RNSignatureViewManager)
class RNSignatureViewManager: RCTViewManager {
  override static func moduleName() -> String! {
    return "RNSignatureView"
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    return RNSignatureView(frame: .zero)
  }

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
    bridge.uiManager.addUIBlock { _, viewRegistry in
      guard let view = viewRegistry?[reactTag] as? RNSignatureView else {
        return
      }
      view.saveSignature()
    }
  }

  @objc func clear(_ reactTag: NSNumber) {
    bridge.uiManager.addUIBlock { _, viewRegistry in
      guard let view = viewRegistry?[reactTag] as? RNSignatureView else {
        return
      }
      view.clear()
    }
  }

  @objc func setStrokeColor(_ reactTag: NSNumber, color: NSNumber) {
    bridge.uiManager.addUIBlock { _, viewRegistry in
      guard let view = viewRegistry?[reactTag] as? RNSignatureView else {
        return
      }
      view.updateStrokeColor(RCTConvert.uiColor(color))
    }
  }

  @objc func setStrokeWidth(_ reactTag: NSNumber, width: NSNumber) {
    bridge.uiManager.addUIBlock { _, viewRegistry in
      guard let view = viewRegistry?[reactTag] as? RNSignatureView else {
        return
      }
      view.updateStrokeWidth(CGFloat(truncating: width))
    }
  }
}
