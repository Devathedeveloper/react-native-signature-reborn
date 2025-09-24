import Foundation
import React
import UIKit

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

  private var strokes: [Stroke] = []
  private var currentStroke: Stroke?

  override init(frame: CGRect) {
    super.init(frame: frame)
    isOpaque = false
    isMultipleTouchEnabled = false
    contentMode = .redraw
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

    let format = UIGraphicsImageRendererFormat.default()
    format.scale = UIScreen.main.scale
    format.opaque = backgroundColor != nil && backgroundColor != .clear

    let renderer = UIGraphicsImageRenderer(bounds: bounds, format: format)
    let image = renderer.image { _ in
      if let backgroundColor, backgroundColor != .clear {
        backgroundColor.setFill()
        UIBezierPath(rect: bounds).fill()
      }

      for stroke in strokes {
        stroke.color.setStroke()
        stroke.path.lineWidth = stroke.width
        stroke.path.stroke()
      }
    }

    guard let data = image.pngData() else {
      return
    }

    let filename = "signature-\(UUID().uuidString).png"
    let url = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(filename)

    do {
      try data.write(to: url, options: .atomic)
      let payload: [String: Any] = [
        "path": url.path,
        "base64": data.base64EncodedString(),
      ]
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
