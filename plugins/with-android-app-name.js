const { withStringsXml, AndroidConfig } = require('@expo/config-plugins')

/** Force launcher label to AiShopy (not uppercase AISHOPY). */
function withAndroidAppName(config) {
  return withStringsXml(config, (config) => {
    config.modResults = AndroidConfig.Strings.setStringItem(config.modResults, {
      name: 'app_name',
      value: 'AiShopy',
    })
    return config
  })
}

module.exports = withAndroidAppName
