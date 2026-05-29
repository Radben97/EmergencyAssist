package com.emergencyassist

import com.facebook.react.bridge.*
import com.graphhopper.GraphHopper
import com.graphhopper.GraphHopperConfig
import com.graphhopper.GHRequest
import com.graphhopper.util.Parameters
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import java.io.File
import java.io.FileOutputStream
import java.util.zip.ZipInputStream

class OfflineRouterModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private var hopper: GraphHopper? = null

    private val filesDir get() = reactApplicationContext.filesDir
    private val graphCacheDir get() = File(filesDir, "graph-cache")
    private val configFile get() = File(filesDir, "config.yml")

    override fun getName() = "OfflineRouter"

    // ------------------------------------------------------------------------
    // Extract config + graph-cache from assets
    // ------------------------------------------------------------------------
    private fun extractAssetsIfNeeded() {

        // Copy config.yml
        if (!configFile.exists()) {
            reactApplicationContext.assets.open("config.yml").use { input ->
                FileOutputStream(configFile).use { output ->
                    input.copyTo(output)
                }
            }
        }

        // Extract graph-cache.zip
        if (!graphCacheDir.exists() || graphCacheDir.list().isNullOrEmpty()) {

            graphCacheDir.mkdirs()

            reactApplicationContext.assets.open("graph-cache.zip").use { input ->

                ZipInputStream(input).use { zip ->

                    var entry = zip.nextEntry

                    while (entry != null) {

                        // Remove leading "graph-cache/" if present
                        val cleanName = entry.name.removePrefix("graph-cache/")

                        if (cleanName.isNotEmpty()) {

                            val outFile = File(graphCacheDir, cleanName)

                            if (entry.isDirectory) {
                                outFile.mkdirs()
                            } else {

                                outFile.parentFile?.mkdirs()

                                FileOutputStream(outFile).use { output ->
                                    zip.copyTo(output)
                                }
                            }
                        }

                        zip.closeEntry()
                        entry = zip.nextEntry
                    }
                }
            }
        }
    }

    // ------------------------------------------------------------------------
    // Load GraphHopper
    // ------------------------------------------------------------------------
    @ReactMethod
    fun loadGraph(promise: Promise) {

        try {

            if (hopper != null) {
                promise.resolve(true)
                return
            }

            // Extract assets
            extractAssetsIfNeeded()

            // Parse config.yml
            val mapper = ObjectMapper(YAMLFactory())

            val config = mapper.readValue(
                configFile,
                GraphHopperConfig::class.java
            )

            // Init GraphHopper
            val gh = GraphHopper()

            gh.init(config)

            // Override graph location to app internal storage
            gh.config.putObject(
                "graph.location",
                graphCacheDir.absolutePath
            )

            // Load existing graph-cache
            val loaded = gh.load(graphCacheDir.absolutePath)

            if (!loaded) {
                throw Exception(
                    "Failed to load graph-cache from: ${graphCacheDir.absolutePath}"
                )
            }

            hopper = gh

            promise.resolve(true)

        } catch (e: Exception) {

            promise.reject(
                "LOAD_ERROR",
                e.message,
                e
            )
        }
    }

    // ------------------------------------------------------------------------
    // Route between two points
    // ------------------------------------------------------------------------
    @ReactMethod
    fun route(
        startLat: Double,
        startLon: Double,
        endLat: Double,
        endLon: Double,
        promise: Promise
    ) {

        try {

            val gh = hopper
                ?: throw Exception("Graph not loaded")

            val request = GHRequest(
                startLat,
                startLon,
                endLat,
                endLon
            )
                .setProfile("car")
                .putHint(
                    Parameters.Routing.INSTRUCTIONS,
                    true
                )

            val response = gh.route(request)

            if (response.hasErrors()) {

                throw Exception(
                    response.errors.joinToString {
                        it.message ?: "Unknown routing error"
                    }
                )
            }

            val best = response.best
            val points = best.points

            val coordinates = Arguments.createArray()

            for (i in 0 until points.size()) {

                val coord = Arguments.createArray()

                coord.pushDouble(points[i].lon)
                coord.pushDouble(points[i].lat)

                coordinates.pushArray(coord)
            }

            val result = Arguments.createMap()

            result.putArray("coordinates", coordinates)
            result.putDouble("distance", best.distance)
            result.putDouble("time", best.time.toDouble())

            promise.resolve(result)

        } catch (e: Exception) {

            promise.reject(
                "ROUTE_ERROR",
                e.message,
                e
            )
        }
    }

    // ------------------------------------------------------------------------
    // Cleanup
    // ------------------------------------------------------------------------
    @ReactMethod
    fun unload(promise: Promise) {

        try {

            hopper?.close()
            hopper = null

            promise.resolve(true)

        } catch (e: Exception) {

            promise.reject(
                "UNLOAD_ERROR",
                e.message,
                e
            )
        }
    }
}