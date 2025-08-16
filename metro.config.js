const { getDefaultConfig } = require('expo/metro-config');

console.log('[DEBUG] metro.config.js: Loading Metro bundler configuration...');

const config = getDefaultConfig(__dirname);

// Add logging for bundler events
config.resolver = {
  ...config.resolver,
  resolverMainFields: ['react-native', 'browser', 'main'],
  // Log module resolution
  resolveRequest: (context, moduleName, platform) => {
    if (moduleName.includes('disney') || moduleName.includes('App')) {
      console.log(`[DEBUG] Metro: Resolving module: ${moduleName}`);
    }
    // Default resolver
    return context.resolveRequest(context, moduleName, platform);
  }
};

// Enable source maps for better debugging
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

console.log('[DEBUG] metro.config.js: Configuration loaded successfully');

module.exports = config;