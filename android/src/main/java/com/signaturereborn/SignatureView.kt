package com.signaturereborn

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ValueAnimator
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
import android.view.animation.DecelerateInterpolator
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
import kotlin.math.roundToLong
import kotlin.math.sqrt

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
  private var isSigningAnimationEnabled: Boolean = false
  private var signingAnimationColor: Int = strokeColor
  private var animationBaseAlpha: Int = DEFAULT_ANIMATION_ALPHA
  private var animationDurationMs: Long = DEFAULT_ANIMATION_DURATION
  private var animationRadiusMultiplier: Float = DEFAULT_ANIMATION_RADIUS_MULTIPLIER
  private var hasCustomAnimationColor: Boolean = false

  private val strokes = mutableListOf<Stroke>()
  private var currentStroke: Stroke? = null
  private val activeRipples = mutableListOf<Ripple>()
  private val ripplePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    style = Paint.Style.FILL
  }
  private var lastRipplePoint: PointF? = null

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

    if (isSigningAnimationEnabled) {
      drawRipples(canvas)
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
    lastRipplePoint = PointF(point.x, point.y)
    spawnRipple(point, force = true)
  }

  private fun addPoint(point: PointF) {
    spawnRipple(point)
    currentStroke?.path?.lineTo(point.x, point.y)
  }

  private fun endStroke() {
    currentStroke = null
    lastRipplePoint = null
  }

  fun clearSignature() {
    strokes.clear()
    currentStroke = null
    clearRipples()
    invalidate()
  }

  fun setStrokeColorInternal(color: Int) {
    strokeColor = color
    if (!hasCustomAnimationColor) {
      signingAnimationColor = color
      animationBaseAlpha = DEFAULT_ANIMATION_ALPHA
    }
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

  fun setSigningAnimationEnabled(enabled: Boolean?) {
    isSigningAnimationEnabled = enabled ?: false
    if (!isSigningAnimationEnabled) {
      clearRipples()
    }
  }

  fun setSigningAnimationColorInternal(color: Int?) {
    if (color != null) {
      hasCustomAnimationColor = true
      signingAnimationColor = color
      animationBaseAlpha = resolveBaseAlpha(color)
    } else {
      hasCustomAnimationColor = false
      signingAnimationColor = strokeColor
      animationBaseAlpha = DEFAULT_ANIMATION_ALPHA
    }
  }

  fun setSigningAnimationDuration(durationMs: Double?) {
    val duration = durationMs?.roundToLong() ?: DEFAULT_ANIMATION_DURATION
    animationDurationMs = duration.coerceIn(MIN_ANIMATION_DURATION, MAX_ANIMATION_DURATION)
  }

  fun setSigningAnimationRadiusMultiplier(multiplier: Double?) {
    if (multiplier == null) {
      animationRadiusMultiplier = DEFAULT_ANIMATION_RADIUS_MULTIPLIER
      return
    }
    val coerced = multiplier.toFloat()
    if (coerced.isNaN() || coerced.isInfinite() || coerced <= 0f) {
      animationRadiusMultiplier = DEFAULT_ANIMATION_RADIUS_MULTIPLIER
    } else {
      animationRadiusMultiplier = coerced.coerceIn(MIN_ANIMATION_RADIUS_MULTIPLIER, MAX_ANIMATION_RADIUS_MULTIPLIER)
    }
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

  private fun spawnRipple(point: PointF, force: Boolean = false) {
    if (!isSigningAnimationEnabled) {
      return
    }
    val radius = resolveRippleRadius()
    if (radius <= 0f || animationDurationMs <= 0L) {
      return
    }

    if (!force) {
      val lastPoint = lastRipplePoint
      if (lastPoint != null) {
        val dx = point.x - lastPoint.x
        val dy = point.y - lastPoint.y
        val distance = sqrt(dx * dx + dy * dy)
        if (distance < rippleSpacingThreshold()) {
          return
        }
      }
    }

    val ripplePoint = PointF(point.x, point.y)
    lastRipplePoint = ripplePoint

    val ripple = Ripple(
      center = ripplePoint,
      maxRadius = radius,
      color = signingAnimationColor
    )

    val animator = ValueAnimator.ofFloat(0f, 1f).apply {
      duration = animationDurationMs
      interpolator = DecelerateInterpolator()
      addUpdateListener { animation ->
        ripple.progress = animation.animatedValue as Float
        invalidate()
      }
      addListener(object : AnimatorListenerAdapter() {
        override fun onAnimationEnd(animation: Animator) {
          activeRipples.remove(ripple)
        }

        override fun onAnimationCancel(animation: Animator) {
          activeRipples.remove(ripple)
        }
      })
    }

    ripple.animator = animator
    activeRipples.add(ripple)
    animator.start()
  }

  private fun drawRipples(canvas: Canvas) {
    if (activeRipples.isEmpty()) {
      return
    }

    val baseAlpha = animationBaseAlpha
    val iterator = activeRipples.iterator()
    while (iterator.hasNext()) {
      val ripple = iterator.next()
      val progress = ripple.progress.coerceIn(0f, 1f)
      val radius = ripple.maxRadius * progress
      val alpha = (baseAlpha * (1f - progress)).roundToInt().coerceIn(0, 255)
      ripplePaint.color = ripple.color
      ripplePaint.alpha = alpha
      canvas.drawCircle(ripple.center.x, ripple.center.y, radius, ripplePaint)
      if (progress >= 1f) {
        iterator.remove()
      }
    }
  }

  private fun clearRipples() {
    val iterator = activeRipples.iterator()
    while (iterator.hasNext()) {
      val ripple = iterator.next()
      ripple.animator?.cancel()
      iterator.remove()
    }
    invalidate()
  }

  private fun rippleSpacingThreshold(): Float {
    return max(strokeWidth * 0.75f, 6f)
  }

  private fun resolveRippleRadius(): Float {
    val base = max(strokeWidth, 1f)
    return base * animationRadiusMultiplier
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    clearRipples()
  }

  private fun resolveBaseAlpha(color: Int): Int {
    val alpha = Color.alpha(color)
    return if (alpha in 1 until 255) {
      alpha
    } else {
      DEFAULT_ANIMATION_ALPHA
    }
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
    const val DEFAULT_ANIMATION_DURATION = 220L
    const val MIN_ANIMATION_DURATION = 60L
    const val MAX_ANIMATION_DURATION = 2000L
    const val DEFAULT_ANIMATION_RADIUS_MULTIPLIER = 3f
    const val MIN_ANIMATION_RADIUS_MULTIPLIER = 0.5f
    const val MAX_ANIMATION_RADIUS_MULTIPLIER = 12f
    val DEFAULT_ANIMATION_ALPHA = (0.35f * 255).roundToInt()
  }

  private class Ripple(
    val center: PointF,
    val maxRadius: Float,
    val color: Int
  ) {
    var progress: Float = 0f
    var animator: ValueAnimator? = null
  }
}
