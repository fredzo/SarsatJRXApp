const { withAndroidManifest } = require('@expo/config-plugins');

const CONFIG_CHANGES = 'keyboard|keyboardHidden|orientation|screenSize|uiMode|screenLayout|smallestScreenSize';

module.exports = function withAndroidConfigChanges(config) {
  return withAndroidManifest(config, async (config) => {
    const modResults = config.modResults;
    // manifest in modResults.manifest
    const manifest = modResults.manifest ? modResults.manifest : modResults;
    const application = manifest.application && manifest.application[0];
    if (!application) {
      console.warn("[no-restart-on-resize] ⚠️ Application not found");
      return config;
    }
    else
    {
      console.log(`[no-restart-on-resize] ✅ Found Application`);
    }

    const activities = application.activity || [];

    // 1) Search mail acticity based on intent-filter MAIN + LAUNCHER
    let mainActivity = activities.find((activity) => {
      const intentFilters = activity['intent-filter'] || [];
      return intentFilters.some((ifilter) => {
        const actions = ifilter.action || [];
        const hasMain = actions.some(a => a.$ && a.$['android:name'] === 'android.intent.action.MAIN');
        const categories = ifilter.category || [];
        const hasLauncher = categories.some(c => c.$ && c.$['android:name'] === 'android.intent.category.LAUNCHER');
        return hasMain && hasLauncher;
      });
    });

    // 2) Fallback : search for an activity with name ending with MainActivity
    if (!mainActivity) {
      mainActivity = activities.find(a => a.$ && /MainActivity$/.test(a.$['android:name'] || ''));
    }

    if (mainActivity) {
      mainActivity.$ = mainActivity.$ || {};
      const existing = mainActivity.$['android:configChanges'] || '';
      const setParts = new Set(existing.split('|').filter(Boolean));
      CONFIG_CHANGES.split('|').forEach(p => setParts.add(p));
      mainActivity.$['android:configChanges'] = Array.from(setParts).join('|');
      console.log(`[no-restart-on-resize] ✅ Found android:configChanges: ${Array.from(setParts).join(" | ")}`);
    }
    else
    {
      console.warn("[no-restart-on-resize] ⚠️ MainACtivity not found");
    }

    config.modResults = modResults;
    return config;
  });
};