import Foundation
import QuartzCore
import React
import UIKit

private enum ExportFormat {
  case png
  case jpeg

  init(format: String) {
    switch format.lowercased() {
    case "jpeg", "jpg":
      self = .jpeg
    default:
      self = .png
    }
  }

  var fileExtension: String {
    switch self {
    case .png:
      return "png"
    case .jpeg:
      return "jpg"
    }
  }
}

private final class Stroke {
  let path: UIBezierPath
  let color: UIColor
  let width: CGFloat

  init(startPoint: CGPoint, color: UIColor, width: CGFloat) {
    self.path = UIBezierPath()
    self.path.lineJoinStyle = .round
    self.path.lineCapStyle = .round
    self.path.move(to: startPoint)
    self.path.addLine(to: startPoint)
    self.path.lineWidth = width
    self.color = color
    self.width = width
  }
}

@objc(RNSignatureView)
class RNSignatureView: UIView {
  @objc var onSave: RCTBubblingEventBlock?
  @objc var onStrokeStart: RCTDirectEventBlock?
  @objc var onStrokeEnd: RCTDirectEventBlock?
  @objc var strokeColor: UIColor = .black {
    didSet {
      if !usesCustomAnimationColor {
        resolvedAnimationColor = strokeColor.withAlphaComponent(1)
      }
    }
  }
  @objc var strokeWidth: CGFloat = 3.0
  @objc var imageFormat: NSString = "png" {
    didSet {
      exportFormat = ExportFormat(format: imageFormat as String)
    }
  }
  @objc var imageQuality: NSNumber = 0.8 {
    didSet {
      exportQuality = RNSignatureView.clampQuality(imageQuality)
    }
  }
  @objc var shouldIncludeBase64: Bool = true
  @objc var imageBackgroundColor: UIColor?
  @objc var exportScale: NSNumber = 0 {
    didSet {
      exportScaleFactor = RNSignatureView.clampScale(exportScale)
    }
  }
  @objc var signingAnimationEnabled: Bool = false {
    didSet {
      if !signingAnimationEnabled {
        clearRippleLayers()
      }
    }
  }
  @objc var signingAnimationColor: UIColor? {
    didSet {
      if let color = signingAnimationColor {
        usesCustomAnimationColor = true
        resolvedAnimationColor = color.withAlphaComponent(1)
        let alpha = color.cgColor.alpha
        if alpha > 0 && alpha < 1 {
          animationBaseOpacity = Float(alpha)
        } else {
          animationBaseOpacity = Float(Self.defaultAnimationOpacity)
        }
      } else {
        usesCustomAnimationColor = false
        resolvedAnimationColor = strokeColor.withAlphaComponent(1)
        animationBaseOpacity = Float(Self.defaultAnimationOpacity)
      }
    }
  }
  @objc var signingAnimationDuration: NSNumber = 220 {
    didSet {
      animationDuration = RNSignatureView.clampDuration(signingAnimationDuration)
    }
  }
  @objc var signingAnimationRadiusMultiplier: NSNumber = 3 {
    didSet {
      animationRadiusMultiplier = RNSignatureView.clampRadius(signingAnimationRadiusMultiplier)
    }
  }

  private var strokes: [Stroke] = []
  private var currentStroke: Stroke?
  private var exportFormat: ExportFormat = .png
  private var exportQuality: CGFloat = 0.8
  private var exportScaleFactor: CGFloat = 0
  private var resolvedAnimationColor: UIColor = .black
  private var usesCustomAnimationColor: Bool = false
  private var animationDuration: CFTimeInterval = RNSignatureView.defaultAnimationDuration
  private var animationRadiusMultiplier: CGFloat = RNSignatureView.defaultAnimationRadiusMultiplier
  private var animationBaseOpacity: Float = Float(RNSignatureView.defaultAnimationOpacity)
  private var activeRippleLayers: [CAShapeLayer] = []
  private var lastRipplePoint: CGPoint?

  override init(frame: CGRect) {
    super.init(frame: frame)
    isOpaque = false
    isMultipleTouchEnabled = false
    contentMode = .redraw
    exportFormat = ExportFormat(format: imageFormat as String)
    exportQuality = RNSignatureView.clampQuality(imageQuality)
    exportScaleFactor = RNSignatureView.clampScale(exportScale)
    resolvedAnimationColor = strokeColor.withAlphaComponent(1)
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    setNeedsDisplay()
  }

  override func draw(_ rect: CGRect) {
    guard let context = UIGraphicsGetCurrentContext() else {
      return
    }

    context.clear(rect)

    if let backgroundColor, backgroundColor != .clear {
      context.setFillColor(backgroundColor.cgColor)
      context.fill(rect)
    }

    for stroke in strokes {
      stroke.color.setStroke()
      stroke.path.lineWidth = stroke.width
      stroke.path.stroke()
    }
  }

  private func addPoint(_ point: CGPoint) {
    guard let stroke = currentStroke else {
      return
    }
    stroke.path.addLine(to: point)
    setNeedsDisplay()
  }

  override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
    guard let point = touches.first?.location(in: self) else {
      return
    }
    let stroke = Stroke(startPoint: point, color: strokeColor, width: strokeWidth)
    strokes.append(stroke)
    currentStroke = stroke
    onStrokeStart?([:])
    lastRipplePoint = point
    spawnRipple(at: point, force: true)
    setNeedsDisplay()
  }

  override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
    guard let point = touches.first?.location(in: self) else {
      return
    }
    addPoint(point)
    spawnRipple(at: point)
  }

  override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
    if let point = touches.first?.location(in: self) {
      addPoint(point)
      spawnRipple(at: point)
    }
    currentStroke = nil
    lastRipplePoint = nil
    onStrokeEnd?([:])
  }

  override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
    currentStroke = nil
    lastRipplePoint = nil
    onStrokeEnd?([:])
  }

  func clear() {
    strokes.removeAll()
    currentStroke = nil
    clearRippleLayers()
    setNeedsDisplay()
  }

  func saveSignature() {
    print("🔍 [iOS] saveSignature() called")
    guard bounds.width > 0, bounds.height > 0 else {
      print("❌ [iOS] Invalid bounds: \(bounds)")
      return
    }
    print("✅ [iOS] Bounds are valid: \(bounds)")

    let fillColor = imageBackgroundColor ?? backgroundColor
    let format = UIGraphicsImageRendererFormat.default()
    let scale = exportScaleFactor > 0 ? exportScaleFactor : UIScreen.main.scale
    format.scale = scale
    format.opaque = fillColor != nil && fillColor != .clear

    let renderer = UIGraphicsImageRenderer(bounds: bounds, format: format)
    let image = renderer.image { _ in
      if let fillColor, fillColor != .clear {
        fillColor.setFill()
        UIBezierPath(rect: bounds).fill()
      }

      for stroke in strokes {
        stroke.color.setStroke()
        stroke.path.lineWidth = stroke.width
        stroke.path.stroke()
      }
    }

    let data: Data?
    switch exportFormat {
    case .png:
      data = image.pngData()
    case .jpeg:
      data = image.jpegData(compressionQuality: exportQuality)
    }

    guard let data else {
      print("❌ [iOS] Failed to create image data")
      return
    }
    print("✅ [iOS] Image data created, size: \(data.count) bytes")

    let filename = "signature-\(UUID().uuidString).\(exportFormat.fileExtension)"
    let url = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(filename)

    do {
      try data.write(to: url, options: .atomic)
      var payload: [String: Any] = [
        "path": url.path,
      ]

      if shouldIncludeBase64 {
        payload["base64"] = data.base64EncodedString()
        print("✅ [iOS] Base64 included, length: \(data.base64EncodedString().count)")
      }
      print("🎯 [iOS] About to call onSave callback with payload: \(payload)")
      print("🔍 [iOS] onSave callback exists: \(onSave != nil)")
      onSave?(payload)
      print("✅ [iOS] onSave callback called!")
    } catch {
      print("❌ [iOS] Error saving file: \(error)")
      NSLog("[RNSignatureView] Failed to persist signature: %@", error.localizedDescription)
    }
  }

  func updateStrokeColor(_ color: UIColor) {
    strokeColor = color
  }

  func updateStrokeWidth(_ width: CGFloat) {
    strokeWidth = width
  }
}

private extension RNSignatureView {
  static func clampQuality(_ value: NSNumber) -> CGFloat {
    let quality = CGFloat(truncating: value)
    return min(max(quality, 0), 1)
  }

  static func clampScale(_ value: NSNumber) -> CGFloat {
    let scale = CGFloat(truncating: value)
    guard scale.isFinite, scale > 0 else {
      return 0
    }
    return min(max(scale, 0.1), 4)
  }

  static func clampDuration(_ value: NSNumber) -> CFTimeInterval {
    let raw = max(60, min(2000, value.doubleValue))
    return raw / 1000.0
  }

  static func clampRadius(_ value: NSNumber) -> CGFloat {
    let raw = CGFloat(truncating: value)
    guard raw.isFinite, raw > 0 else {
      return defaultAnimationRadiusMultiplier
    }
    return min(max(raw, 0.5), 12)
  }

  static func rippleSpacing(for strokeWidth: CGFloat) -> CGFloat {
    return max(strokeWidth * 0.75, 6)
  }

  static let defaultAnimationDuration: CFTimeInterval = 0.22
  static let defaultAnimationRadiusMultiplier: CGFloat = 3
  static let defaultAnimationOpacity: CGFloat = 0.35
}

private extension RNSignatureView {
  func spawnRipple(at point: CGPoint, force: Bool = false) {
    guard signingAnimationEnabled else {
      return
    }

    let radius = max(strokeWidth, 1) * animationRadiusMultiplier
    guard radius > 0 else {
      return
    }

    if !force, let last = lastRipplePoint {
      let dx = point.x - last.x
      let dy = point.y - last.y
      let distance = hypot(dx, dy)
      if distance < Self.rippleSpacing(for: strokeWidth) {
        return
      }
    }

    lastRipplePoint = point

    let rippleLayer = CAShapeLayer()
    rippleLayer.fillColor = resolvedAnimationColor.cgColor
    rippleLayer.opacity = animationBaseOpacity

    let startPath = UIBezierPath(ovalIn: CGRect(origin: point, size: .zero))
    let endRect = CGRect(
      x: point.x - radius,
      y: point.y - radius,
      width: radius * 2,
      height: radius * 2
    )
    let endPath = UIBezierPath(ovalIn: endRect)
    rippleLayer.path = endPath.cgPath

    layer.addSublayer(rippleLayer)
    activeRippleLayers.append(rippleLayer)

    CATransaction.begin()
    CATransaction.setCompletionBlock { [weak self, weak rippleLayer] in
      guard let layer = rippleLayer else { return }
      layer.removeAllAnimations()
      layer.removeFromSuperlayer()
      self?.activeRippleLayers.removeAll { $0 === layer }
    }

    let group = CAAnimationGroup()
    group.duration = animationDuration
    group.timingFunction = CAMediaTimingFunction(name: .easeOut)
    group.fillMode = .forwards
    group.isRemovedOnCompletion = false

    let pathAnimation = CABasicAnimation(keyPath: "path")
    pathAnimation.fromValue = startPath.cgPath
    pathAnimation.toValue = endPath.cgPath

    let opacityAnimation = CABasicAnimation(keyPath: "opacity")
    opacityAnimation.fromValue = animationBaseOpacity
    opacityAnimation.toValue = 0

    group.animations = [pathAnimation, opacityAnimation]
    rippleLayer.add(group, forKey: "ripple")

    CATransaction.commit()
  }

  func clearRippleLayers() {
    guard !activeRippleLayers.isEmpty else {
      return
    }
    activeRippleLayers.forEach { layer in
      layer.removeAllAnimations()
      layer.removeFromSuperlayer()
    }
    activeRippleLayers.removeAll()
  }
}

