package com.emergencyassist

import android.content.Context
import java.io.File

object MBTilesManager {

    private const val ASSET_PATH =
        "map/tiles/chennaimax.mbtiles"

    private const val FILE_NAME =
        "chennaimax.mbtiles"

    fun prepareMBTiles(
        context: Context
    ): String {

        val mbtilesDir =
            File(context.filesDir, "mbtiles")

        if (!mbtilesDir.exists()) {
            mbtilesDir.mkdirs()
        }

        val targetFile =
            File(mbtilesDir, FILE_NAME)

        if (!targetFile.exists()) {

            context.assets.open(ASSET_PATH).use { input ->

                targetFile.outputStream().use { output ->

                    input.copyTo(output)
                }
            }
        }

        return targetFile.absolutePath
    }
}