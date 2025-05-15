import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MainApp from '../app/index';
import LiveAudioStream from 'react-native-live-audio-stream';

// Заглушаем playTone, чтобы отслеживать вызовы
jest.spyOn(global.AudioContext.prototype, 'createOscillator');

describe('MainApp (Tuner Screen)', () => {
  it('рендерит переключатель режима и визуализатор', () => {
    const { getByText, getByTestId } = render(<MainApp />);
    expect(getByText('OFF')).toBeTruthy();
    // SpectrumVisualizer должен присутствовать по testID
    expect(getByTestId('spectrum-visualizer')).toBeTruthy();
  });

  it('переключает режим ON ↔ OFF и сбрасывает состояние', () => {
    const { getByText, queryByText } = render(<MainApp />);
    const btn = getByText('OFF');
    fireEvent.press(btn);
    expect(getByText('ON')).toBeTruthy();
    // При включении сбрасывается автоматический выбор струны
    fireEvent.press(getByText('ON'));
    expect(getByText('OFF')).toBeTruthy();
  });

  it('вызывает init и start LiveAudioStream на монтировании', () => {
    render(<MainApp />);
    expect(LiveAudioStream.init).toHaveBeenCalledWith(expect.objectContaining({
      sampleRate: 44100,
      channels: 1,
    }));
    expect(LiveAudioStream.start).toHaveBeenCalled();
  });

  it('генерирует тон при нажатии на кнопку струны', async () => {
    const { getByText } = render(<MainApp />);
    // Имитация наличия строки E (первой)
    const stringBtn = getByText('E');
    fireEvent.press(stringBtn);
    // Ожидаем, что AudioContext.createOscillator был вызван
    await waitFor(() => {
      expect(global.AudioContext.prototype.createOscillator).toHaveBeenCalled();
    });
  });
});
