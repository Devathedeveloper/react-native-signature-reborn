package com.signaturereborn

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class SignatureViewManager : SimpleViewManager<SignatureView>() {
  override fun getName(): String = "RNSignatureView"

  override fun createViewInstance(reactContext: ThemedReactContext): SignatureView {
    return SignatureView(reactContext)
  }

  @ReactProp(name = "strokeColor", customType = "Color")
  fun setStrokeColor(view: SignatureView, color: Int?) {
    color?.let { view.setStrokeColorInternal(it) }
  }

  @ReactProp(name = "strokeWidth")
  fun setStrokeWidth(view: SignatureView, width: Double?) {
    width?.let { view.setStrokeWidthInternal(it.toFloat()) }
  }

  @ReactProp(name = "imageFormat")
  fun setImageFormat(view: SignatureView, format: String?) {
    view.setImageFormat(format)
  }

  @ReactProp(name = "imageQuality")
  fun setImageQuality(view: SignatureView, quality: Double?) {
    view.setImageQualityInternal(quality)
  }

  @ReactProp(name = "shouldIncludeBase64")
  fun setShouldIncludeBase64(view: SignatureView, include: Boolean?) {
    view.setShouldIncludeBase64Internal(include)
  }

  @ReactProp(name = "imageBackgroundColor", customType = "Color")
  fun setImageBackgroundColor(view: SignatureView, color: Int?) {
    view.setImageBackgroundColorInternal(color)
  }

  @ReactProp(name = "exportScale")
  fun setExportScale(view: SignatureView, scale: Double?) {
    view.setExportScaleInternal(scale)
  }

  @ReactProp(name = "signingAnimationEnabled")
  fun setSigningAnimationEnabled(view: SignatureView, enabled: Boolean?) {
    view.setSigningAnimationEnabled(enabled)
  }

  @ReactProp(name = "signingAnimationColor", customType = "Color")
  fun setSigningAnimationColor(view: SignatureView, color: Int?) {
    view.setSigningAnimationColorInternal(color)
  }

  @ReactProp(name = "signingAnimationDuration")
  fun setSigningAnimationDuration(view: SignatureView, duration: Double?) {
    view.setSigningAnimationDuration(duration)
  }

  @ReactProp(name = "signingAnimationRadiusMultiplier")
  fun setSigningAnimationRadiusMultiplier(view: SignatureView, multiplier: Double?) {
    view.setSigningAnimationRadiusMultiplier(multiplier)
  }

  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
    return MapBuilder.builder<String, Any>()
      .put("onSave", MapBuilder.of("registrationName", "onSave"))
      .put("onStrokeStart", MapBuilder.of("registrationName", "onStrokeStart"))
      .put("onStrokeEnd", MapBuilder.of("registrationName", "onStrokeEnd"))
      .build()
  }

  override fun getCommandsMap(): MutableMap<String, Int> {
    return MapBuilder.builder<String, Int>()
      .put("save", 0)
      .put("clear", 1)
      .put("setStrokeColor", 2)
      .put("setStrokeWidth", 3)
      .build()
  }

  override fun receiveCommand(view: SignatureView, commandId: Int, args: ReadableArray?) {
    when (commandId) {
      0 -> view.saveSignature()
      1 -> view.clearSignature()
      2 -> args?.getInt(0)?.let { view.setStrokeColorInternal(it) }
      3 -> args?.getDouble(0)?.toFloat()?.let { view.setStrokeWidthInternal(it) }
    }
  }
}
