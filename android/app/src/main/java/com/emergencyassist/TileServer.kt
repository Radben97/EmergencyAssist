package com.emergencyassist

import android.database.sqlite.SQLiteDatabase
import fi.iki.elonen.NanoHTTPD
import java.io.ByteArrayInputStream

class TileServer(
    private val mbtilesPath: String
) : NanoHTTPD(8080) {

    private val db: SQLiteDatabase =
        SQLiteDatabase.openDatabase(
            mbtilesPath,
            null,
            SQLiteDatabase.OPEN_READONLY
        )

    override fun serve(session: IHTTPSession): Response {

        val path = session.uri.trim('/')

        val parts = path.split("/")

        if (parts.size != 3) {
            return newFixedLengthResponse(
                Response.Status.NOT_FOUND,
                "text/plain",
                "Invalid path"
            )
        }

        try {
            val z = parts[0].toInt()
            val x = parts[1].toInt()
            val y = parts[2]
                .replace(".pbf", "")
                .toInt()

            val tmsY = (1 shl z) - 1 - y

            val cursor = db.rawQuery(
                """
                SELECT tile_data
                FROM tiles
                WHERE zoom_level=?
                AND tile_column=?
                AND tile_row=?
                """.trimIndent(),
                arrayOf(
                    z.toString(),
                    x.toString(),
                    tmsY.toString()
                )
            )

            if (!cursor.moveToFirst()) {
                cursor.close()

                return newFixedLengthResponse(
                    Response.Status.NOT_FOUND,
                    "text/plain",
                    "Tile not found"
                )
            }

            val tile = cursor.getBlob(0)

            cursor.close()

            return newFixedLengthResponse(
                Response.Status.OK,
                "application/x-protobuf",
                ByteArrayInputStream(tile),
                tile.size.toLong()
            )

        } catch (e: Exception) {

            return newFixedLengthResponse(
                Response.Status.INTERNAL_ERROR,
                "text/plain",
                e.message ?: "error"
            )
        }
    }
}