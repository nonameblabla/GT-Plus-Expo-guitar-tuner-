// Моки нативных модулей
import 'react-native-reanimated/mock';

// LiveAudioStream
jest.mock('react-native-live-audio-stream', () => ({
  init: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
}));

// NativeEventEmitter/NativeModules
import { NativeModules } from 'react-native';
NativeModules.LiveAudioStream = {};
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// AudioContext (Web API) в Node
class MockOscillator {
  constructor() { this.frequency = { value: 0 }; }
  connect() {}
  start() {}
  stop() {}
  disconnect() {}
}
class MockAudioContext {
  createOscillator() { return new MockOscillator(); }
  get destination() { return {}; }
  close() { return Promise.resolve(); }
}
global.AudioContext = MockAudioContext;

// Buffer
global.Buffer = require('buffer').Buffer;
