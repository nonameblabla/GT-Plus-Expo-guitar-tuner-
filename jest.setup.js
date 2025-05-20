// Jest setup file with clean mocks for React Native and Expo modules

// Mock LiveAudioStream first
jest.mock('react-native-live-audio-stream', () => ({
  init: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
}));

// Mock react-native-audio-api
jest.mock('react-native-audio-api', () => ({
  AudioContext: jest.fn(() => ({
    createAudioPlayer: jest.fn(() => ({
      play: jest.fn(),
      pause: jest.fn(),
      stop: jest.fn(),
    })),
    createRecorder: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn(),
    })),
  })),
}));

// Mock Expo SQLite
jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(callback => {
      callback({
        executeSql: jest.fn((query, params, success) => success && success({}, { rows: { _array: [], length: 0 }})),
      });
      return Promise.resolve();
    }),
    closeAsync: jest.fn(() => Promise.resolve()),
    deleteAsync: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock other Expo modules
jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({ downloadAsync: jest.fn() })),
    loadAsync: jest.fn(),
  },
}));

jest.mock('expo-modules-core', () => ({
  EventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
}));

// Fix for NativeEventEmitter - make it a proper constructor
const mockNativeEventEmitter = function() {
  return {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeAllListeners: jest.fn(),
    removeSubscription: jest.fn(),
    emit: jest.fn(),
  };
};

// Mock React Native with proper NativeEventEmitter support
jest.mock('react-native', () => {
  return {
    NativeModules: {
      LiveAudioStream: {},
      ImageLoader: {
        prefetchImage: jest.fn(),
        getSize: jest.fn((uri, success) => setTimeout(() => success(100, 100), 0)),
      },
      ImageViewManager: {
        getSize: jest.fn((uri, success) => setTimeout(() => success(100, 100), 0)),
        prefetchImage: jest.fn(),
      },
      Linking: {
        openURL: jest.fn(),
        canOpenURL: jest.fn(() => Promise.resolve(true)),
        getInitialURL: jest.fn(() => Promise.resolve(null)),
      },
    },
    NativeEventEmitter: mockNativeEventEmitter,
    Animated: {
      Value: jest.fn(() => ({
        interpolate: jest.fn(() => ({
          interpolate: jest.fn(),
        })),
        setValue: jest.fn(),
      })),
      timing: jest.fn(() => ({
        start: jest.fn(cb => cb && cb()),
      })),
      spring: jest.fn(() => ({
        start: jest.fn(cb => cb && cb()),
      })),
      View: 'Animated.View',
      Text: 'Animated.Text',
      Image: 'Animated.Image',
      createAnimatedComponent: jest.fn(component => component),
    },
    Platform: {
      OS: 'android',
      select: jest.fn(obj => obj.android || obj.default),
    },
    StyleSheet: {
      create: jest.fn(styles => styles),
      flatten: jest.fn(style => style),
      hairlineWidth: 1,
      absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    },
    View: 'View',
    Text: 'Text',
    Image: 'Image',
    TouchableOpacity: 'TouchableOpacity',
    ScrollView: 'ScrollView',
    FlatList: 'FlatList',
    PermissionsAndroid: {
      request: jest.fn(() => Promise.resolve('granted')),
      PERMISSIONS: {
        RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
      },
      RESULTS: {
        GRANTED: 'granted',
      },
    },
    // Add LogBox mock
    LogBox: {
      ignoreLogs: jest.fn(),
      ignoreAllLogs: jest.fn(),
    },
  };
});

// Mock AudioContext for web audio API testing with properly implemented close method
class MockOscillator {
  constructor() { this.frequency = { value: 0 }; }
  connect() {}
  start() {}
  stop() {}
  disconnect() {}
}

class MockAudioContext {
  constructor() {
    this.destination = {};
  }
  createOscillator() { return new MockOscillator(); }
  close() { return Promise.resolve(); }
}

global.AudioContext = MockAudioContext;

// Buffer
global.Buffer = require('buffer').Buffer;
