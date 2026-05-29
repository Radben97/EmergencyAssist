import React from 'react';
import { View, Button } from 'react-native';
import BackgroundActions from 'react-native-background-actions';

const testBackground = async () => {
  await BackgroundActions.start(async () => {
    await new Promise(() => {
      let count = 0;
      const tick = () => {
        count++;
        console.log(`Background tick: ${count}`);
        setTimeout(tick, 2000);
      };
      setTimeout(tick, 2000);
    });
  }, {
    taskName: 'BackgroundTest',
    taskTitle: 'Background Test',
    taskDesc: 'Testing if background task stays alive...',
    taskIcon: { name: 'ic_launcher', type: 'mipmap' },
    color: '#ff0000',
  });

  console.log('Started — now press home and watch logs');
};

export default function EmergencyCallTest() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="TEST BACKGROUND" onPress={testBackground} />
    </View>
  );
}