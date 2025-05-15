module.exports = {
  preset: 'jest-expo',
  setupFiles: [
    // сначала наше окружение…
    '<rootDir>/jest.setup.js'
  ],
  transformIgnorePatterns: [
    // транспилировать необходимые node_modules
    'node_modules/(?!(@react-native|expo-dev-client|react-native-live-audio-stream)/)'
  ],
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|wav)$': '<rootDir>/__mocks__/fileMock.js'
  },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
