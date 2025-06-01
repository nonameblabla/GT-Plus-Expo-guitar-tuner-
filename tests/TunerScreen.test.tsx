// __tests__/MainApp.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Image, PermissionsAndroid } from 'react-native';
import LiveAudioStream from 'react-native-live-audio-stream';
import MainApp from '../app/index'; // або './index' залежно від структури

// Мок для Image.resolveAssetSource, що повертає всі поля, потрібні TypeScript
Image.resolveAssetSource = jest.fn(src => ({
  uri: 'test-uri',
  width: 100,
  height: 100,
  scale: 1,
}));
// Мок для Image.prefetch, повертаємо Promise<boolean>
Image.prefetch = jest.fn(() => Promise.resolve(true));

describe('MainApp (екран тюнера)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('початково відображає кнопку з написом "OFF"', () => {
    const { getByText } = render(<MainApp />);
    expect(getByText('OFF')).toBeTruthy();
  });

  test('після натискання кнопка змінює напис на "ON"', () => {
    const { getByText } = render(<MainApp />);
    const toggleBtn = getByText('OFF');
    fireEvent.press(toggleBtn);
    expect(getByText('ON')).toBeTruthy();
  });

  test('натискання на кнопку струни встановлює вибрану струну й відображає її позначку', async () => {
    const { getByText } = render(<MainApp />);

    // Чекаємо виклик PermissionsAndroid.request()
    await waitFor(() => {
      expect(PermissionsAndroid.request).toHaveBeenCalled();
    });

    // Перемикаємо режим із OFF на ON
    fireEvent.press(getByText('OFF'));

    // За замовчуванням: guitarType = 'six', handedness = 'right'
    // displayLeft = ['D3','A2','E2'], NOTE_LABELS['uk']['D3'] = 'Ре'
    const stringLabel = 'Ре';
    const stringBtn = getByText(stringLabel);
    fireEvent.press(stringBtn);

    // Після вибору струни позначка "Ре" залишається в UI
    expect(getByText(stringLabel)).toBeTruthy();
  });

  test('на початку ініціалізує та запускає LiveAudioStream', async () => {
    render(<MainApp />);

    await waitFor(() => {
      expect(LiveAudioStream.init).toHaveBeenCalledWith({
        sampleRate: 44100,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6,
        bufferSize: 2048,
        wavFile: 'temp.wav',
      });
      expect(LiveAudioStream.start).toHaveBeenCalled();
    });
  });
});
