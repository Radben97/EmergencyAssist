import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import { NativeModules } from 'react-native';

const { OfflineRouter } = NativeModules;

const GRAPH_DIR =
  `${RNFS.DocumentDirectoryPath}/graph-cache`;

const ZIP_PATH =
  `${RNFS.DocumentDirectoryPath}/graph-cache.zip`;

export async function initializeOfflineRouting() {

  const exists =
    await RNFS.exists(GRAPH_DIR);

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