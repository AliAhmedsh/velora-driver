const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === '@store' || moduleName.startsWith('@store/')) {
        const rest = moduleName === '@store' ? 'index' : moduleName.slice('@store/'.length);
        const target = `./src/store/${rest}`;
        return context.resolveRequest(context, target, platform);
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
