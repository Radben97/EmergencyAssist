import RNFS from 'react-native-fs';

import {
  open,
} from 'react-native-quick-sqlite';

let db: any;

const DB_NAME =
  'chennai.mbtiles';

const DEST_PATH =
  `${RNFS.DocumentDirectoryPath}/${DB_NAME}`;

export const openMBTiles =
  async () => {

    try {

      const exists =
        await RNFS.exists(
          DEST_PATH
        );

      if (!exists) {

        console.log(
          'Copying MBTiles...'
        );

        await RNFS.copyFileAssets(
          `tiles/${DB_NAME}`,
          DEST_PATH,
        );

        console.log(
          'MBTiles copied'
        );
      }

      db = open({
        name: DEST_PATH,
      });

      console.log(
        'MBTiles opened'
      );

    } catch (error) {

      console.error(
        'Failed opening MBTiles:',
        error,
      );
    }
};

export const getVectorTile =
  (
    z: number,
    x: number,
    y: number,
  ) => {

    try {

      if (!db) {

        console.warn(
          'DB not initialized'
        );

        return null;
      }

      // XYZ -> TMS
      const tmsY =
        (1 << z) - 1 - y;

      const result =
        db.execute(
          `
          SELECT tile_data
          FROM tiles
          WHERE zoom_level = ?
          AND tile_column = ?
          AND tile_row = ?
          LIMIT 1
          `,
          [
            z,
            x,
            tmsY,
          ],
        );

      if (
        result.rows &&
        result.rows.length > 0
      ) {

        return result.rows.item(0)
          .tile_data;
      }

      return null;

    } catch (error) {

      console.error(
        'Tile fetch failed:',
        error,
      );

      return null;
    }
};