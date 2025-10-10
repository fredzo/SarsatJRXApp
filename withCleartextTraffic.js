const fs = require("fs");
const path = require("path");
const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");

module.exports = function withCleartextNetworkConfig(config) {
  // 1️⃣ Inject "usesCleartextTraffic" dans le manifest Android
  config = withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (app) {
      app.$["android:usesCleartextTraffic"] = "true";
      app.$["android:networkSecurityConfig"] = "@xml/network_security_config";
    }
    return config;
  });

  // 2️⃣ Crée le fichier XML dans le dossier de build Android
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const resDir = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "xml"
      );
      fs.mkdirSync(resDir, { recursive: true });

      const filePath = path.join(resDir, "network_security_config.xml");

      const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="true"/>
</network-security-config>`;

      fs.writeFileSync(filePath, xmlContent);
      return config;
    },
  ]);

  return config;
};
