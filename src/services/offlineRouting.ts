import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import { NativeModules } from 'react-native';

const { OfflineRouter } = NativeModules;

export async function initializeOfflineRouting() {
  try {
    const zipPath = `${RNFS.DocumentDirectoryPath}/graph-cache.zip`;
    const unzipPath = `${RNFS.DocumentDirectoryPath}/graph-cache`;

    console.log('STEP 1 - Checking unzip folder:', unzipPath);
    const unzipExists = await RNFS.exists(unzipPath);
    console.log('UNZIP EXISTS:', unzipExists);

    if (unzipExists) {
      const contents = await RNFS.readDir(unzipPath);
      console.log('CONTENTS COUNT:', contents.length);

      if (contents.length === 0) {
        console.log('EMPTY FOLDER, DELETING...');
        await RNFS.unlink(unzipPath);
      }
    }

    const graphReady = await RNFS.exists(unzipPath);
    console.log('GRAPH READY:', graphReady);

    if (!graphReady) {
      console.log('COPYING ZIP FROM ASSETS...');
      await RNFS.copyFileAssets('graph-cache.zip', zipPath);
      console.log('ZIP COPIED');

      console.log('UNZIPPING TO:', RNFS.DocumentDirectoryPath);
      await unzip(zipPath, RNFS.DocumentDirectoryPath);
      console.log('UNZIP DONE');

      const contents = await RNFS.readDir(unzipPath);
      console.log('EXTRACTED FILES:', contents.map(f => f.name));
    }

    console.log('LOADING GRAPH FROM:', unzipPath);
    await OfflineRouter.loadGraph(unzipPath);
    console.log('GRAPH LOADED SUCCESSFULLY');

  } catch (e) {
    console.log('INIT ROUTING ERROR:', e);
    throw e;
  }
}

export async function getOfflineRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number
) {
  return await OfflineRouter.route(
    startLat,
    startLon,
    endLat,
    endLon
  );
}