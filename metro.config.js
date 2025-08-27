// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// CRITICAL: Disable package exports for Firebase compatibility
config.resolver.unstable_enablePackageExports = false;

// Add .cjs extension support
config.resolver.sourceExts.push('cjs');

module.exports = config;
