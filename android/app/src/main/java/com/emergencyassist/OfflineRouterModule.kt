package com.emergencyassist

import com.facebook.react.bridge.*
import com.graphhopper.GraphHopper
import com.graphhopper.GraphHopperConfig
import com.graphhopper.GHRequest
import com.graphhopper.util.Parameters
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import java.io.File
import java.util.zip.ZipInputStream

class OfflineRouterModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private var hopper: GraphHopper? = null

    private val filesDir get() = reactApplicationContext.filesDir
    private val graphCacheDir get() = File(filesDir, "graph-cache")
    private val configFile get() = File(filesDir, "config.yml")

    override fun getName() = "OfflineRouter"

    // ---------------------------------------------------------------------------
    // Extract graph-cache.zip from assets to internal storage (once)
    // ---------------------------------------------------------------------------
    private fun extractAssetsIfNeeded() {
        // Copy config.yaml
        if (!configFile.exists()) {
            reactApplicationContext.assets.open("config.yml").use { input ->
                configFile.outputStream().use { input.copyTo(it) }
            }
        }

        // Unzip graph-cache.zip
        if (!graphCacheDir.exists() || graphCacheDir.list().isNullOrEmpty()) {
            graphCacheDir.mkdirs()
            reactApplicationContext.assets.open("graph-cache.zip").use { input ->
                ZipInputStream(input).use { zip ->
                    var entry = zip.nextEntry
                    while (entry != null) {
                        val outFile = File(filesDir, entry.name)
                        if (entry.isDirectory) {
                            outFile.mkdirs()
                        } else {
                            outFile.parentFile?.mkdirs()
                            outFile.outputStream().use { zip.copyTo(it) }
                        }
                        zip.closeEntry()
                        entry = zip.nextEntry
                    }
                }
            }
        }
    }

    // ---------------------------------------------------------------------------
    // Load GraphHopper using config.yaml (fixes profile hash mismatch)
    // ---------------------------------------------------------------------------
    @ReactMethod
    fun loadGraph(promise: Promise) {
        try {
            if (hopper != null) {
                promise.resolve(true)
                return
            }

            // Step 1: extract zip + config.yaml from assets to internal storage
            extractAssetsIfNeeded()

            // Step 2: load config.yaml — same file used during import
            // this is the fix from the forum: init from config so profile
            // hash matches the graph cache exactly
            val mapper = ObjectMapper(YAMLFactory())
            val config = mapper.treeToValue(
                mapper.readTree(configFile).at("/graphhopper"),
                GraphHopperConfig::class.java
            )

            // Step 3: init GraphHopper from config, override location to
            // internal storage path (config.yaml has an empty datareader.file
            // which is fine — we only need it for import, not load)
            val gh = GraphHopper()
            gh.init(config)
            gh.graphHopperLocation = graphCacheDir.absolutePath

            // Step 4: load from graph-cache (no import, read-only)
            gh.load()

            hopper = gh
            promise.resolve(true)

        } catch (e: Exception) {
            promise.reject("LOAD_ERROR", e.message, e)
        }
    }

    // ---------------------------------------------------------------------------
    // Route between two coordinates
    // ---------------------------------------------------------------------------
    @ReactMethod
    fun route(
        startLat: Double,
        startLon: Double,
        endLat: Double,
        endLon: Double,
        promise: Promise
    ) {
        try {
            val gh = hopper ?: throw Exception("Graph not loaded. Call loadGraph first.")

            val request = GHRequest(startLat, startLon, endLat, endLon)
                .setProfile("car")
                .putHint(Parameters.Routing.INSTRUCTIONS, true)

            val response = gh.route(request)

            if (response.hasErrors()) {
                throw Exception(response.errors.joinToString { it.message ?: "unknown error" })
            }

            val bestPath = response.best
            val points = bestPath.points

            val coordinates = Arguments.createArray()
            for (i in 0 until points.size()) {
                val coord = Arguments.createArray()
                coord.pushDouble(points[i].lon)
                coord.pushDouble(points[i].lat)
                coordinates.pushArray(coord)
            }

            val result = Arguments.createMap()
            result.putArray("coordinates", coordinates)
            result.putDouble("distance", bestPath.distance)
            result.putDouble("time", bestPath.time.toDouble())

            promise.resolve(result)

        } catch (e: Exception) {
            promise.reject("ROUTE_ERROR", e.message, e)
        }
    }

    // ---------------------------------------------------------------------------
    // Cleanup
    // ---------------------------------------------------------------------------
    @ReactMethod
    fun unload(promise: Promise) {
        try {
            hopper?.close()
            hopper = null
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("UNLOAD_ERROR", e.message, e)
        }
    }
}