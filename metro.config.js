const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // The web/ directory is a standalone Vite app; keep it out of the RN bundle.
  resolver: {
    blockList: [new RegExp(`^${path.resolve(__dirname, 'web')}/.*`)],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
