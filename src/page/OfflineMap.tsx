import React from 'react';
import { SafeAreaView } from 'react-native';
import WebView from 'react-native-webview';

export default function OfflineMap() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        source={{
          uri: 'file:///android_asset/map/index.html',
        }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        originWhitelist={['*']}
        onLoadStart={() => {
          console.log('WEBVIEW: LOAD START');
        }}
        onLoadEnd={() => {
          console.log('WEBVIEW: LOAD END');
        }}
        onError={(e) => {
          console.log(
            'WEBVIEW ERROR:',
            e.nativeEvent.description
          );
        }}
        onHttpError={(e) => {
          console.log(
            'WEBVIEW HTTP ERROR:',
            e.nativeEvent.statusCode
          );
        }}
        onMessage={(e) => {
          console.log(
            'WEBVIEW:',
            e.nativeEvent.data
          );
        }}
      />
    </SafeAreaView>
  );
}