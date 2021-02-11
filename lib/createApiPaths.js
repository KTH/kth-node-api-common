// @ts-check

const yup = require('yup')

/**
 * This function throws a ValidationError
 * if a given "security"-array from swagger.json
 * doesn't fit into the expected structure.
 *
 * @param {*} input
 * @throws
 */
function ensureValidSecurityArray(input) {
  const _objectContainsExactlyOneStrategy = {
    name: 'every item contains exactly one strategy',
    // eslint-disable-next-line no-template-curly-in-string
    message: '${path} must contain exactly one strategy',
    test: object => Object.keys(object).length === 1,
  }

  const _listDoesNotRepeatAnyStrategy = {
    name: "list doesn't repeat any strategy",
    // eslint-disable-next-line no-template-curly-in-string
    message: '${path} repeats one or more strategies',
    test(array, context) {
      const alreadyUsedStrategies = []
      array.forEach(object => {
        Object.keys(object).forEach(strategy => {
          if (alreadyUsedStrategies.includes(strategy)) {
            throw new yup.ValidationError(`${context.path || 'this'} repeats strategy "${strategy}"`)
          }
          alreadyUsedStrategies.push(strategy)
        })
      })
      return true
    },
  }

  const securityObjectSchema = yup
    .array(
      yup
        .object({
          api_key: yup.array(yup.string().required()).min(1),
          // openIdConnect: yup.array(yup.string().required()).min(1),
        })
        .required()
        .noUnknown()
        .test(_objectContainsExactlyOneStrategy)
    )
    .required()
    .test(_listDoesNotRepeatAnyStrategy)

  securityObjectSchema.validateSync(input, { strict: true })
}

/**
 * @param {object} inputBag
 * @param {object} inputBag.swagger
 *    Parsed content from a "swagger.json" file
 * @param {string} [inputBag.proxyPrefixPathUri]
 * @throws
 * @returns {object}
 *    Description of all endpoints from "swagger.json" in the shape
 *      { <operationId>: { uri, method, openid? },
 *        <operationId>: { uri, method, openid? }, ... }
 */
function createApiPaths({ swagger, proxyPrefixPathUri = '' }) {
  const { basePath, paths: swaggerPaths } = swagger

  const allPaths = {}

  Object.keys(swaggerPaths).forEach(pathname => {
    const config = swaggerPaths[pathname]
    const uri = (basePath || proxyPrefixPathUri) + pathname.replace(/{(.+?)}/g, ':$1')

    Object.keys(config).forEach(verb => {
      const { operationId, security } = config[verb]

      const newEndpoint = {
        uri,
        method: verb.toUpperCase(),
      }

      if (security) {
        try {
          ensureValidSecurityArray(security)
        } catch ({ message }) {
          throw new Error(
            `createApiPaths() failed - invalid "security" in swagger - ${message}` +
              ` (path: ${pathname}, method: ${verb}, security: ${JSON.stringify(security)})`
          )
        }

        security.forEach(item => {
          if (item.api_key) {
            newEndpoint.openid = {
              scopes: item,
              scope_required: true,
            }
          } else {
            throw new Error(`Security-strategy not implemented, yet: ${Object.keys(item)[0]}`)
          }
        })
      }

      allPaths[operationId] = newEndpoint
    })
  })

  return allPaths
}

module.exports = createApiPaths
