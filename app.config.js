const appJson = require('./app.json')

/**
 * google-services.json is gitignored.
 * Local: falls back to ./google-services.json
 * EAS: set file env GOOGLE_SERVICES_JSON (preview/production/development)
 */
const googleServicesFile =
  process.env.GOOGLE_SERVICES_JSON || './google-services.json'

module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      googleServicesFile,
    },
  },
}
