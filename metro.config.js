const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.cacheVersion = `${process.env.SUPABASE_URL || 'no-url'}-v2`;

config.resolver.sourceExts = ['mjs', 'js', 'jsx', 'ts', 'tsx', 'json'];

config.resolver.unstable_enablePackageExports = false;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'iceberg-js') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'mocks/iceberg-js.js'),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
    keep_fnames: true,
  },
};

module.exports = config;
