// mbtiles.ts — drastically simplified
import RNFS from 'react-native-fs';

const DB_NAME = 'chennaimax.mbtiles';
export const DB_DIR = `${RNFS.DocumentDirectoryPath}/mbtiles`;
export const DB_PATH = `${DB_DIR}/${DB_NAME}`;

export const prepareMBTiles = async (): Promise<string> => {
  try {
    const dirExists = await RNFS.exists(DB_DIR);
    if (!dirExists) await RNFS.mkdir(DB_DIR);

    const exists = await RNFS.exists(DB_PATH);
    if (!exists) {
      console.log('[MBTiles] Copying from assets...');
      await RNFS.copyFileAssets(`tiles/${DB_NAME}`, DB_PATH);
      console.log('[MBTiles] Copy complete');
    }

    const stat = await RNFS.stat(DB_PATH);
    console.log('[MBTiles] Ready at:', DB_PATH, 'size:', stat.size);

    return DB_PATH;
  } catch (err) {
    console.error('[MBTiles] Prepare failed:', err);
    throw err;
  }
};