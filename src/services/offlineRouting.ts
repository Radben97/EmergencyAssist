import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import { NativeModules } from 'react-native';

const { OfflineRouter } = NativeModules;

export async function initializeOfflineRouting() {
  try {
    const zipPath    = `${RNFS.DocumentDirectoryPath}/graph-cache.zip`;
    const unzipPath  = `${RNFS.DocumentDirectoryPath}/graph-cache`;

    // ── 1. Extract graph-cache.zip if not already extracted ───────────────
    const unzipExists = await RNFS.exists(unzipPath);
    if (unzipExists) {
      const contents = await RNFS.readDir(unzipPath);
      if (contents.length === 0) {
        console.log('EMPTY GRAPH FOLDER, DELETING...');
        await RNFS.unlink(unzipPath);
      }
    }

    const graphReady = await RNFS.exists(unzipPath);
    if (!graphReady) {
      console.log('COPYING graph-cache.zip FROM ASSETS...');
      await RNFS.copyFileAssets('graph-cache.zip', zipPath);
      console.log('ZIP COPIED, UNZIPPING...');
      await unzip(zipPath, RNFS.DocumentDirectoryPath);
      console.log('UNZIP DONE');

      const contents = await RNFS.readDir(unzipPath);
      console.log('EXTRACTED FILES:', contents.map(f => f.name));

      await RNFS.unlink(zipPath); // cleanup zip
    }

    // ── 2. Load graph — Kotlin handles paths internally ───────────────────
    console.log('LOADING GRAPH...');
    await OfflineRouter.loadGraph();  // ← no arguments
    console.log('GRAPH LOADED SUCCESSFULLY');

  } catch (e) {
    console.error('INIT ROUTING ERROR:', e);
    throw e;
  }
}

export async function getOfflineRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number
) {
  try {
    return await OfflineRouter.route(startLat, startLon, endLat, endLon);
  } catch (e) {
    console.error('ROUTING ERROR:', e);
    throw e;
  }
}