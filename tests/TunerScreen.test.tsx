import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MainApp from '../app/index';
import LiveAudioStream from 'react-native-live-audio-stream';

// Мок для осциллятора
const mockOscillator = {
  frequency: { value: 0 },
  type: 'sine',
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  disconnect: jest.fn()
};

describe('MainApp (Tuner Screen)', () => {
  
  it('рендерит переключатель режима и визуализатор', () => {
    const { getByText, UNSAFE_getAllByType } = render(<MainApp />);
    expect(getByText('OFF')).toBeTruthy();
    
    // Проверяем наличие анимированных компонентов в визуализаторе
    // Using type assertion to avoid TypeScript errors
    const animatedViews = UNSAFE_getAllByType('Animated.View' as any);
    expect(animatedViews.length).toBeGreaterThan(0);
  });

  it('переключает режим ON ↔ OFF и сбрасывает состояние', () => {
    const { getByText } = render(<MainApp />);
    const btn = getByText('OFF');
    fireEvent.press(btn);
    expect(getByText('ON')).toBeTruthy();
    // При включении сбрасывается автоматический выбор струны
    fireEvent.press(getByText('ON'));
    expect(getByText('OFF')).toBeTruthy();
  });

  it('вызывает init и start LiveAudioStream на монтировании', () => {
    // Проверяем, что mock LiveAudioStream.init и start активны
    expect(LiveAudioStream.init).toBeDefined();
    expect(LiveAudioStream.start).toBeDefined();
    
    render(<MainApp />);
    
    // Проверяем только факт вызова методов без проверки параметров
    expect(LiveAudioStream.init).toHaveBeenCalled();
    expect(LiveAudioStream.start).toHaveBeenCalled();
  });

  it('отображает кнопки струн', () => {
    const { getByText } = render(<MainApp />);
    
    // Проверяем наличие всех струн
    expect(getByText('Мі2')).toBeTruthy();
    expect(getByText('Ля2')).toBeTruthy();
    expect(getByText('Ре3')).toBeTruthy();
    expect(getByText('Соль3')).toBeTruthy();
    expect(getByText('Сі3')).toBeTruthy();
    expect(getByText('Мі4')).toBeTruthy();
  });
});
