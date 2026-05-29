package com.emergencyassist

import com.facebook.react.bridge.*
import com.graphhopper.GraphHopper
import com.graphhopper.GraphHopperConfig
import com.graphhopper.GHRequest
import com.graphhopper.ResponsePath
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

    private val filesDir: File
        get() = reactApplicationContext.filesDir

    private val graphCacheDir: File
        get() = File(filesDir, "graph-cache")

    private val configFile: File
        get() = File(filesDir, "config.yml")

    override fun getName(): String {
        return "OfflineRouter"
    }

    // ------------------------------------------------------------------------
    // Extract config + graph-cache.zip
    // ------------------------------------------------------------------------
    private fun extractAssetsIfNeeded() {

        // config.yml
        if (!configFile.exists()) {

            reactApplicationContext.assets
                .open("config.yml")
                .use { input ->

                    FileOutputStream(configFile)
                        .use { output ->

                            input.copyTo(output)
                        }
                }
        }

        // graph-cache
        if (
            !graphCacheDir.exists() ||
            graphCacheDir.list().isNullOrEmpty()
        ) {

            graphCacheDir.mkdirs()

            reactApplicationContext.assets
                .open("graph-cache.zip")
                .use { input ->

                    ZipInputStream(input).use { zip ->

                        var entry = zip.nextEntry

                        while (entry != null) {

                            // remove top-level graph-cache/
                            val cleanName = entry.name
                                .removePrefix("graph-cache/")

                            if (cleanName.isNotEmpty()) {

                                val outFile =
                                    File(graphCacheDir, cleanName)

                                if (entry.isDirectory) {

                                    outFile.mkdirs()

                                } else {

                                    outFile.parentFile?.mkdirs()

                                    FileOutputStream(outFile)
                                        .use { output ->

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

            // already loaded
            if (hopper != null) {

                promise.resolve(true)
                return
            }

            // extract assets
            extractAssetsIfNeeded()

            // yaml mapper
            val mapper = ObjectMapper(YAMLFactory())

            // parse config.yml
            val config = mapper.readValue(
                configFile,
                GraphHopperConfig::class.java
            )

            // override graph location
            config.putObject(
                "graph.location",
                graphCacheDir.absolutePath
            )

            // init hopper
            val gh = GraphHopper()

            gh.init(config)

            // load existing graph-cache
            val loaded = gh.load()

            if (!loaded) {

                throw Exception(
                    "Failed to load graph-cache from:\n" +
                            graphCacheDir.absolutePath
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
    // Route
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
                ?: throw Exception(
                    "Graph not loaded. Call loadGraph first."
                )

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
                    response.errors.joinToString("\n") {
                        it.message ?: "Unknown routing error"
                    }
                )
            }

            val best: ResponsePath = response.best

            val coordinates = Arguments.createArray()

            val points = best.points

            for (i in 0 until points.size()) {

                val coord = Arguments.createArray()

                coord.pushDouble(points[i].lon)
                coord.pushDouble(points[i].lat)

                coordinates.pushArray(coord)
            }

            val result = Arguments.createMap()

            result.putArray(
                "coordinates",
                coordinates
            )

            result.putDouble(
                "distance",
                best.distance
            )

            result.putDouble(
                "time",
                best.time.toDouble()
            )

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