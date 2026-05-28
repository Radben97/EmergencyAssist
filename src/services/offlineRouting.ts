import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import { NativeModules } from 'react-native';

const { OfflineRouter } = NativeModules;

const GRAPH_DIR =
  `${RNFS.DocumentDirectoryPath}/graph-cache/graph-cache`;

const ZIP_PATH =
    `${RNFS.DocumentDirectoryPath}/graph-cache.zip`;
  
    async function debugGraphDir() {
  const GRAPH_DIR = `${RNFS.DocumentDirectoryPath}/graph-cache/graph-cache`;

  const exists = await RNFS.exists(GRAPH_DIR);
  console.log('DIR EXISTS:', exists);

  if (exists) {
    const files = await RNFS.readDir(GRAPH_DIR);
    console.log('FILES:', files.map(f => f.name));
  }
}

export async function initializeOfflineRouting() {

  const exists =
        await RNFS.exists(GRAPH_DIR);
    const files = await RNFS.readDir(GRAPH_DIR);
console.log("here")
console.log(files);

  if (!exists) {

    await RNFS.copyFileAssets(
      'graph-cache.zip',
      ZIP_PATH
    );

    await unzip(
      ZIP_PATH,
      GRAPH_DIR
    );
  }
  await debugGraphDir();
  await OfflineRouter.loadGraph(
    GRAPH_DIR
  );
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