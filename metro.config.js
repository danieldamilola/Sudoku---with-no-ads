// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ─── Web / SVG support ───────────────────────────────────────────────────────
// react-native-svg ships a web implementation — tell Metro to resolve it
// so lucide-react-native icons render correctly in the browser / Tauri window.
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

module.exports = config;
