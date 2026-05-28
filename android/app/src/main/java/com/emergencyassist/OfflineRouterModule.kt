package com.emergencyassist

import com.facebook.react.bridge.*
import com.graphhopper.GraphHopper
import com.graphhopper.GHRequest
import com.graphhopper.config.Profile
import com.graphhopper.util.Parameters

class OfflineRouterModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private var hopper: GraphHopper? = null

    override fun getName(): String {
        return "OfflineRouter"
    }

    @ReactMethod
    fun loadGraph(
        graphPath: String,
        promise: Promise
    ) {

        try {

            if (hopper != null) {
                promise.resolve(true)
                return
            }

            val gh = GraphHopper()

            gh.setProfiles(
                Profile("car")
            )

            gh.load(graphPath)

            hopper = gh

            promise.resolve(true)

        } catch (e: Exception) {

            promise.reject(
                "LOAD_ERROR",
                e
            )
        }
    }

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
                    response.errors.toString()
                )
            }

            val bestPath = response.best

            val points = bestPath.points

            val coordinates = Arguments.createArray()

            for (i in 0 until points.size()) {

                val point = points[i]

                val coord = Arguments.createArray()

                coord.pushDouble(point.lon)
                coord.pushDouble(point.lat)

                coordinates.pushArray(coord)
            }

            val result = Arguments.createMap()

            result.putArray(
                "coordinates",
                coordinates
            )

            result.putDouble(
                "distance",
                bestPath.distance
            )

            result.putDouble(
                "time",
                bestPath.time.toDouble()
            )

            promise.resolve(result)

        } catch (e: Exception) {

            promise.reject(
                "ROUTE_ERROR",
                e
            )
        }
    }
}