const createSwaggerRedirectHandler = require('./createSwaggerRedirectHandler')

const { bold, green, RETURNS, CALLS } = require('../test/colors')

describe(`Utility function ${bold('createSwaggerRedirectHandler()')}`, () => {
  it(green('is accessible'), () => {
    expect(createSwaggerRedirectHandler).toBeFunction()
  })

  it(`${green('expects')} one argument (redirectUrl)`, () => {
    expect(createSwaggerRedirectHandler.length).toBe(1)
  })

  it(`- when used w/o arguments - ${RETURNS} a function`, () => {
    expect(createSwaggerRedirectHandler()).toBeFunction()
  })

  describe(`  - when used with redirect-URL - ${RETURNS} ${bold('a handler')} which`, () => {
    const redirectUrl = '/api/node/swagger?url=/api/node/swagger.json'
    let handler = null

    const res = { redirect: jest.fn() }
    const next = jest.fn()

    beforeAll(() => {
      handler = createSwaggerRedirectHandler(redirectUrl)
    })

    it(green('is accessible'), () => {
      expect(handler).toBeFunction()
    })

    it(`${green('expects')} three arguments (req, res, next)`, () => {
      expect(handler.length).toBe(3)
    })

    const testRuns = [
      {
        caption: 'no url and no query',
        url: null,
        query: {},
        willRedirect: false,
      },
      {
        caption: 'url "" and no query',
        url: '',
        query: {},
        willRedirect: false,
      },
      {
        caption: 'url "/swagger" and no query',
        url: '/swagger',
        query: {},
        willRedirect: false,
      },
      {
        caption: 'no url and query {"url":"/swagger.json"}',
        url: null,
        query: { url: '/swagger.json' },
        willRedirect: false,
      },
      {
        caption: 'url "/swagger" and query {"url":"/swagger.json"}',
        url: '/swagger',
        query: { url: '/swagger.json' },
        willRedirect: false,
      },
      {
        caption: 'url "/" and query {"url":"/swagger.json"}',
        url: '/',
        query: { url: '/swagger.json' },
        willRedirect: false,
      },
      {
        caption: 'url "/" and no query',
        url: '/',
        query: {},
        willRedirect: true,
      },
      {
        caption: 'url "/index.html" and no query',
        url: '/index.html',
        query: {},
        willRedirect: true,
      },
    ]

    it.each(testRuns.filter(item => item.willRedirect).map(item => [item.caption, item]))(
      `- when used with %s - ${green('redirects')} to initially given URL`,
      (caption, item) => {
        const req = { url: item.url, query: item.query }

        expect(handler(req, res, next)).toBeUndefined()

        expect(res.redirect).toHaveBeenCalledTimes(1)
        expect(res.redirect).toHaveBeenCalledWith(redirectUrl)

        expect(next).not.toHaveBeenCalled()
      }
    )

    it.each(testRuns.filter(item => !item.willRedirect).map(item => [item.caption, item]))(
      `- when used with %s - ${CALLS} next(), only`,
      (caption, item) => {
        const req = { url: item.url, query: item.query }

        expect(handler(req, res, next)).toBeUndefined()

        expect(res.redirect).not.toHaveBeenCalled()

        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith()
      }
    )
  })
})
