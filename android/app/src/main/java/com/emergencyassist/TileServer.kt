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

        if (session.method == Method.OPTIONS) {

            val response = newFixedLengthResponse(
                Response.Status.OK,
                "text/plain",
                ""
            )

            response.addHeader(
                "Access-Control-Allow-Origin",
                "*"
            )

            response.addHeader(
                "Access-Control-Allow-Methods",
                "GET, OPTIONS"
            )

            response.addHeader(
                "Access-Control-Allow-Headers",
                "*"
            )

            return response
        }

        val path = session.uri.trim('/')

        val parts = path.split("/")

        if (parts.size != 3) {

            val response = newFixedLengthResponse(
                Response.Status.NOT_FOUND,
                "text/plain",
                "Invalid path"
            )

            response.addHeader(
                "Access-Control-Allow-Origin",
                "*"
            )

            return response
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

                val response = newFixedLengthResponse(
                    Response.Status.NOT_FOUND,
                    "text/plain",
                    "Tile not found"
                )

                response.addHeader(
                    "Access-Control-Allow-Origin",
                    "*"
                )

                return response
            }

            val tile = cursor.getBlob(0)

            cursor.close()

            val response = newFixedLengthResponse(
                Response.Status.OK,
                "application/x-protobuf",
                ByteArrayInputStream(tile),
                tile.size.toLong()
            )

            response.addHeader(
                "Access-Control-Allow-Origin",
                "*"
            )

            response.addHeader(
                "Access-Control-Allow-Methods",
                "GET, OPTIONS"
            )

            response.addHeader(
                "Access-Control-Allow-Headers",
                "*"
            )

            response.addHeader(
                "Content-Encoding",
                "gzip"
            )

            return response

        } catch (e: Exception) {

            val response = newFixedLengthResponse(
                Response.Status.INTERNAL_ERROR,
                "text/plain",
                e.message ?: "error"
            )

            response.addHeader(
                "Access-Control-Allow-Origin",
                "*"
            )

            return response
        }
    }
}