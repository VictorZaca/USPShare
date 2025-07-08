module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '\\.(gif|ttf|eot|svg|png|jpeg)$': '<rootDir>/__mocks__/fileMock.js',
    },
    transformIgnorePatterns: ['/node_modules/'],
  };