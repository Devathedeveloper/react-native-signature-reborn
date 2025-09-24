package com.signaturereborn

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PointF
import android.graphics.PorterDuff
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

private data class Stroke(val path: Path, val paint: Paint)

class SignatureView @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null
) : View(context, attrs) {

  var strokeColor: Int = Color.BLACK
  var strokeWidth: Float = 3f

  private val strokes = mutableListOf<Stroke>()
  private var currentStroke: Stroke? = null

  init {
    isFocusable = true
    isFocusableInTouchMode = true
    setWillNotDraw(false)
  }

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)

    background?.draw(canvas) ?: run {
      canvas.drawColor(Color.TRANSPARENT, PorterDuff.Mode.CLEAR)
    }

    for (stroke in strokes) {
      canvas.drawPath(stroke.path, stroke.paint)
    }
  }

  override fun onTouchEvent(event: MotionEvent): Boolean {
    val point = PointF(event.x, event.y)
    when (event.action) {
      MotionEvent.ACTION_DOWN -> {
        startStroke(point)
        dispatchDirectEvent("onStrokeStart")
      }
      MotionEvent.ACTION_MOVE -> {
        addPoint(point)
      }
      MotionEvent.ACTION_UP -> {
        addPoint(point)
        endStroke()
        dispatchDirectEvent("onStrokeEnd")
      }
      MotionEvent.ACTION_CANCEL -> {
        endStroke()
        dispatchDirectEvent("onStrokeEnd")
      }
    }
    invalidate()
    return true
  }

  private fun startStroke(point: PointF) {
    val path = Path()
    path.moveTo(point.x, point.y)
    path.lineTo(point.x, point.y)

    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      style = Paint.Style.STROKE
      strokeJoin = Paint.Join.ROUND
      strokeCap = Paint.Cap.ROUND
      color = strokeColor
      strokeWidth = this@SignatureView.strokeWidth
    }

    val stroke = Stroke(path, paint)
    strokes.add(stroke)
    currentStroke = stroke
  }

  private fun addPoint(point: PointF) {
    currentStroke?.path?.lineTo(point.x, point.y)
  }

  private fun endStroke() {
    currentStroke = null
  }

  fun clearSignature() {
    strokes.clear()
    currentStroke = null
    invalidate()
  }

  fun setStrokeColorInternal(color: Int) {
    strokeColor = color
  }

  fun setStrokeWidthInternal(width: Float) {
    strokeWidth = width
  }

  fun saveSignature() {
    val map = renderSignature() ?: return
    dispatchSaveEvent(map)
  }

  private fun renderSignature(): WritableMap? {
    if (width <= 0 || height <= 0) {
      return null
    }

    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)

    if (background != null) {
      background.draw(canvas)
    } else {
      canvas.drawColor(Color.TRANSPARENT, PorterDuff.Mode.CLEAR)
    }

    for (stroke in strokes) {
      canvas.drawPath(stroke.path, stroke.paint)
    }

    val stream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
    bitmap.recycle()

    val bytes = stream.toByteArray()
    stream.close()

    val file = File(context.cacheDir, "signature-${UUID.randomUUID()}.png")
    FileOutputStream(file).use { output ->
      output.write(bytes)
    }

    return Arguments.createMap().apply {
      putString("path", file.absolutePath)
      putString("base64", android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP))
    }
  }

  private fun dispatchSaveEvent(map: WritableMap) {
    val reactContext = context as? ReactContext ?: return
    reactContext.getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onSave", map)
  }

  private fun dispatchDirectEvent(event: String) {
    val reactContext = context as? ReactContext ?: return
    reactContext.getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, event, Arguments.createMap())
  }
}
