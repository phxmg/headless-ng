// This script is used by electron-builder to notarize the app with Apple
const { notarize } = require('@electron/notarize');
const path = require('path');
const fs = require('fs');

exports.default = async function notarizing(context) {
  // Only notarize macOS builds
  if (context.electronPlatformName !== 'darwin') {
    return;
  }
  
  console.log('Notarizing app...');
  
  // Get build path and app name from context
  const appBundleId = context.packager.appInfo.info._configuration.appId;
  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(context.appOutDir, `${appName}.app`);
  
  // Ensure the app exists
  if (!fs.existsSync(appPath)) {
    console.error(`Cannot find application at: ${appPath}`);
    return;
  }

  // Check for Apple Team ID
  if (!process.env.APPLE_TEAM_ID) {
    console.warn('APPLE_TEAM_ID environment variable not set. Skipping notarization.');
    return;
  }

  // Check for Apple ID credentials
  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
    console.warn('APPLE_ID or APPLE_ID_PASSWORD environment variables not set. Skipping notarization.');
    return;
  }

  // Attempt to notarize
  try {
    await notarize({
      tool: 'notarytool',
      appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    });
    console.log(`Successfully notarized ${appName}`);
  } catch (error) {
    console.error('Notarization failed:', error);
    throw error;
  }
}; 