module.exports = function withNoRestartOnResize(config) {
  return {
    ...config,
    android: {
      ...config.android,
      userInterfaceStyle: "dark", // ton setting
      intentFilters: config.android?.intentFilters,
      extra: config.android?.extra,
      permissions: config.android?.permissions,
      androidNavigationBar: config.android?.androidNavigationBar,
      androidStatusBar: config.android?.androidStatusBar,
      // Force add manifest options
      configChanges: [
        "keyboard",
        "keyboardHidden",
        "orientation",
        "screenSize",
        "screenLayout",
        "smallestScreenSize",
        "screenDensity",
        "uiMode"
      ]
    }
  };
};