const { withStringsXml, AndroidConfig } = require('@expo/config-plugins')

/** Force launcher label to AiShopy (not uppercase AISHOPY). */
function withAndroidAppName(config) {
  return withStringsXml(config, (config) => {
    config.modResults = AndroidConfig.Strings.setStringItem(
      [
        AndroidConfig.Resources.buildResourceItem({
          name: 'app_name',
          value: 'AiShopy',
        }),
      ],
      config.modResults
    )
    return config
  })
}

module.exports = withAndroidAppName
