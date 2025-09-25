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
import android.util.Base64
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
import kotlin.math.max
import kotlin.math.roundToInt

private enum class ExportFormat(val compressFormat: Bitmap.CompressFormat, val fileExtension: String) {
  PNG(Bitmap.CompressFormat.PNG, "png"),
  JPEG(Bitmap.CompressFormat.JPEG, "jpg");

  companion object {
    fun from(value: String?): ExportFormat {
      return when (value?.lowercase()) {
        "jpeg", "jpg" -> JPEG
        else -> PNG
      }
    }
  }
}

private data class Stroke(val path: Path, val paint: Paint)

class SignatureView @JvmOverloads constructor(
  context: Context,
  attrs: AttributeSet? = null
) : View(context, attrs) {

  var strokeColor: Int = Color.BLACK
  var strokeWidth: Float = 3f

  private var imageFormat: ExportFormat = ExportFormat.PNG
  private var imageQuality: Float = DEFAULT_JPEG_QUALITY
  private var shouldIncludeBase64: Boolean = true
  private var exportScale: Float = 0f
  private var imageBackgroundColor: Int? = null

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

  fun setImageFormat(value: String?) {
    imageFormat = ExportFormat.from(value)
  }

  fun setImageQualityInternal(quality: Double?) {
    imageQuality = quality?.toFloat()?.let { clampQuality(it) } ?: DEFAULT_JPEG_QUALITY
  }

  fun setShouldIncludeBase64Internal(include: Boolean?) {
    shouldIncludeBase64 = include ?: true
  }

  fun setExportScaleInternal(scale: Double?) {
    exportScale = clampScale(scale)
  }

  fun setImageBackgroundColorInternal(color: Int?) {
    imageBackgroundColor = color
  }

  fun saveSignature() {
    val map = renderSignature() ?: return
    dispatchSaveEvent(map)
  }

  private fun renderSignature(): WritableMap? {
    if (width <= 0 || height <= 0) {
      return null
    }

    val scale = resolveExportScale()
    val outputWidth = max(1, (width * scale).roundToInt())
    val outputHeight = max(1, (height * scale).roundToInt())
    val bitmap = Bitmap.createBitmap(outputWidth, outputHeight, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)

    val customBackground = imageBackgroundColor
    if (customBackground != null) {
      canvas.drawColor(customBackground)
    } else {
      val drawable = background
      if (drawable != null) {
        val previousBounds = drawable.copyBounds()
        drawable.setBounds(0, 0, outputWidth, outputHeight)
        drawable.draw(canvas)
        drawable.setBounds(previousBounds.left, previousBounds.top, previousBounds.right, previousBounds.bottom)
      } else {
        canvas.drawColor(Color.TRANSPARENT, PorterDuff.Mode.CLEAR)
      }
    }

    if (scale != 1f) {
      canvas.save()
      canvas.scale(scale, scale)
    }

    for (stroke in strokes) {
      canvas.drawPath(stroke.path, stroke.paint)
    }

    if (scale != 1f) {
      canvas.restore()
    }

    val stream = ByteArrayOutputStream()
    bitmap.compress(imageFormat.compressFormat, resolvedQuality(), stream)
    bitmap.recycle()

    val bytes = stream.toByteArray()
    stream.close()

    val file = File(
      context.cacheDir,
      "signature-${UUID.randomUUID()}.${imageFormat.fileExtension}"
    )
    FileOutputStream(file).use { output ->
      output.write(bytes)
    }

    return Arguments.createMap().apply {
      putString("path", file.absolutePath)
      if (shouldIncludeBase64) {
        putString("base64", Base64.encodeToString(bytes, Base64.NO_WRAP))
      }
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

  private fun clampQuality(value: Float): Float {
    return value.coerceIn(0f, 1f)
  }

  private fun clampScale(value: Double?): Float {
    val raw = value?.toFloat() ?: 0f
    if (raw.isNaN() || raw.isInfinite() || raw <= 0f) {
      return 0f
    }
    return raw.coerceIn(0.1f, 4f)
  }

  private fun resolveExportScale(): Float {
    return if (exportScale > 0f) exportScale else 1f
  }

  private fun resolvedQuality(): Int {
    return if (imageFormat == ExportFormat.JPEG) {
      (imageQuality * 100).roundToInt().coerceIn(0, 100)
    } else {
      100
    }
  }

  private companion object {
    const val DEFAULT_JPEG_QUALITY = 0.8f
  }
}
