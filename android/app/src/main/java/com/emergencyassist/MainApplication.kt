package com.emergencyassist

import android.util.Log
import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // add custom packages here if needed
        },
    )
  }

  override fun onCreate() {
    super.onCreate()

    // Copy MBTiles from assets to app storage
    val mbtilesPath = MBTilesManager.prepareMBTiles(this)

    // Start localhost tile server
    TileServerHolder.server = TileServer(mbtilesPath)
    TileServerHolder.server?.start()

    Log.d(
      "TileServer",
      "Running on http://127.0.0.1:8080"
    )

    loadReactNative(this)
  }
}