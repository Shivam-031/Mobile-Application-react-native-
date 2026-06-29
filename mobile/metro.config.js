const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const config = {
  // Watch the project root so Metro picks up changes to sibling node_modules
  // packages (e.g. @react-native-firebase/app living next to messaging).
  // Without this, Metro 0.80's default resolver can miss scoped packages
  // declared as bare specifiers like '@react-native-firebase/app' from
  // inside @react-native-firebase/messaging/dist/module/modular.js.
  watchFolders: [path.resolve(__dirname)],
  transformer: {
    getTransformOptions: async () => ({
      transform: { experimentalImportSupport: false, inlineRequires: true },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
