// @ts-check

const createApiPaths = require('./createApiPaths')

const { bold, green, FAILS, RETURNS, WORKS } = require('../test/colors')

function _getTestSecurityBlocks(valid) {
  const allBlocks = [
    {
      security: 'read',
      errorText: 'this must be a `array` type',
    },
    {
      security: {},
      errorText: 'this must be a `array` type',
    },
    {
      security: [],
      errorText: null,
    },
    {
      security: ['read'],
      errorText: '[0] must be a `object` type',
    },
    {
      security: [{}],
      errorText: '[0] must contain exactly one strategy',
    },
    {
      security: [{ api_key: 'read' }],
      errorText: '[0].api_key must be a `array` type',
    },
    {
      security: [{ api_key: [] }],
      errorText: '[0].api_key field must have at least 1 items',
    },
    {
      security: [{ api_key: [179] }],
      errorText: '[0].api_key[0] must be a `string` type',
    },
    {
      security: [{ api_key: ['read'] }],
      errorText: null,
    },
    {
      security: [{ api_key: ['read', 'write', 'remove'] }],
      errorText: null,
    },
    {
      security: [{ openIdConnect: ['write'] }],
      errorText: '[0] field has unspecified keys: openIdConnect',
    },
    {
      security: [{ api_key: ['read'], openIdConnect: ['write'] }],
      errorText: '[0] field has unspecified keys: openIdConnect',
    },
    {
      security: [{ api_key: ['read'] }, { api_key: ['write'] }],
      errorText: 'this repeats strategy "api_key"',
    },
  ]

  return allBlocks.filter(item => (valid ? item.errorText == null : item.errorText != null))
}

describe(`Utility function ${bold('createApiPaths()')}`, () => {
  it(green('is accessible'), () => {
    expect(createApiPaths).toBeFunction()
  })

  it(`${green('expects')} one argument (inputBag)`, () => {
    expect(createApiPaths.length).toBe(1)
  })

  it(`- when used w/o arguments - ${FAILS} as expected`, () => {
    expect(createApiPaths).toThrow('Cannot destructure property')
  })

  it(`- when used with non-object as first argument - ${FAILS} as expected`, () => {
    expect(() => createApiPaths(null)).toThrow('Cannot destructure property')
    // @ts-ignore
    expect(() => createApiPaths(true)).toThrow('Cannot destructure property')
    // @ts-ignore
    expect(() => createApiPaths(179)).toThrow('Cannot destructure property')
    // @ts-ignore
    expect(() => createApiPaths('test')).toThrow('Cannot destructure property')
  })

  it(`- when used with only "proxyPrefixPathUri" in input-bag - ${FAILS} as expected`, () => {
    const inputBag = {
      proxyPrefixPathUri: '',
    }
    // @ts-ignore
    expect(() => createApiPaths(inputBag)).toThrow('Cannot destructure property')
  })

  it(`- when used with only "swagger" in input-bag - ${RETURNS} an object`, () => {
    const inputBag = {
      swagger: {
        paths: {},
      },
    }
    const result = createApiPaths(inputBag)
    expect(result).toEqual({})
  })

  it(`- when used with both "swagger" and "proxyPrefixPathUri" in input-bag - ${RETURNS} an object`, () => {
    const inputBag = {
      swagger: {
        paths: {},
      },
      proxyPrefixPathUri: '',
    }
    const result = createApiPaths(inputBag)
    expect(result).toEqual({})
  })

  it(`- when given a simple Swagger-configuration - ${WORKS} as expected`, () => {
    const inputBag = {
      swagger: {
        basePath: '/api/test/',
        paths: {
          'v1/status/{username}': {
            head: {
              operationId: 'headUserStatus',
            },
            get: {
              operationId: 'getUserStatus',
            },
            post: {
              operationId: 'postUserStatus',
            },
            put: {
              operationId: 'putUserStatus',
            },
            delete: {
              operationId: 'deleteUserStatus',
            },
          },
          'v1/info/{username}/{field}': {
            get: {
              operationId: 'getUserInfo',
              security: [{ api_key: ['read'] }],
            },
          },
        },
      },
    }

    const result = createApiPaths(inputBag)

    expect(result).toContainKeys(['getUserStatus', 'getUserInfo'])
    expect(result.getUserStatus).toEqual({
      method: 'GET',
      uri: '/api/test/v1/status/:username',
    })
    expect(result.getUserInfo).toEqual({
      method: 'GET',
      uri: '/api/test/v1/info/:username/:field',
      openid: {
        scope_required: true,
        scopes: { api_key: ['read'] },
      },
    })
    expect(result).toMatchSnapshot()
  })

  it.each(_getTestSecurityBlocks(true).map(item => [JSON.stringify(item.security), item]))(
    `- when input contains valid "security"-block %s - ${RETURNS} an object`,
    // @ts-ignore
    (caption1, { security }) => {
      const inputBag = {
        swagger: {
          paths: {
            'v1/status/{username}': {
              get: {
                operationId: 'getUserStatus',
                security,
              },
            },
          },
        },
      }

      expect(createApiPaths(inputBag)).toContainAllKeys(['getUserStatus'])
    }
  )

  it.each(_getTestSecurityBlocks(false).map(item => [JSON.stringify(item.security), item]))(
    `- when input contains invalid "security"-block %s - ${FAILS} as expected`,
    // @ts-ignore
    (caption1, { security, errorText }) => {
      const inputBag = {
        swagger: {
          paths: {
            'v1/status/{username}': {
              get: {
                operationId: 'getUserStatus',
                security,
              },
            },
          },
        },
      }

      expect(() => createApiPaths(inputBag)).toThrow(errorText)
    }
  )
})
