import Foundation
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
  @objc var strokeColor: UIColor = .black
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

  private var strokes: [Stroke] = []
  private var currentStroke: Stroke?
  private var exportFormat: ExportFormat = .png
  private var exportQuality: CGFloat = 0.8
  private var exportScaleFactor: CGFloat = 0

  override init(frame: CGRect) {
    super.init(frame: frame)
    isOpaque = false
    isMultipleTouchEnabled = false
    contentMode = .redraw
    exportFormat = ExportFormat(format: imageFormat as String)
    exportQuality = RNSignatureView.clampQuality(imageQuality)
    exportScaleFactor = RNSignatureView.clampScale(exportScale)
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
    setNeedsDisplay()
  }

  override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
    guard let point = touches.first?.location(in: self) else {
      return
    }
    addPoint(point)
  }

  override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
    if let point = touches.first?.location(in: self) {
      addPoint(point)
    }
    currentStroke = nil
    onStrokeEnd?([:])
  }

  override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
    currentStroke = nil
    onStrokeEnd?([:])
  }

  func clear() {
    strokes.removeAll()
    currentStroke = nil
    setNeedsDisplay()
  }

  func saveSignature() {
    guard bounds.width > 0, bounds.height > 0 else {
      return
    }

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
      return
    }

    let filename = "signature-\(UUID().uuidString).\(exportFormat.fileExtension)"
    let url = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(filename)

    do {
      try data.write(to: url, options: .atomic)
      var payload: [String: Any] = [
        "path": url.path,
      ]

      if shouldIncludeBase64 {
        payload["base64"] = data.base64EncodedString()
      }
      onSave?(payload)
    } catch {
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
}
