module.exports = function _assemble (options) {
  const swagger = options.swagger
  const proxyPrefixPathUri = options.proxyPrefixPathUri

  const basePath = swagger.basePath
  const paths = swagger.paths

  return Object.keys(paths).reduce((endpoints, pathname) => {
    const config = paths[ pathname ]
    const uri = (basePath || proxyPrefixPathUri) + pathname.replace(/{(.+?)}/g, ':$1')

    Object.keys(config).forEach((verb) => {
      const operation = config[ verb ]
      const endpoint = {
        uri: uri,
        method: verb.toUpperCase()
      }

      if (operation.security) {
        const security = {
          scope_required: false
        }

        const type = Object.keys(operation.security)[ 0 ]

        if (type && operation.security[ type ]) {
          security.scopes = operation.security[ type ]
          security.scope_required = true
          security.type = type

          if (type === 'api_key') {
            endpoint.apikey = security
          } else {
            endpoint.openid = security
          }
        }
      }

      endpoints[ operation.operationId ] = endpoint
    })

    return endpoints
  }, {})
}
