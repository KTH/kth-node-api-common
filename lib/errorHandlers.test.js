const ErrorHandlers = require('./errorHandlers')

const { bold, green, red, FAILS, RETURNS, CALLS } = require('../test/colors')

function runTestsAboutNotFoundHandler() {
  describe(`contain function ${bold('notFoundHandler()')} which`, () => {
    const { notFoundHandler } = ErrorHandlers

    it(green('is accessible'), () => {
      expect(notFoundHandler).toBeFunction()
    })

    it(`${green('expects')} three arguments (req, res, next)`, () => {
      expect(notFoundHandler.length).toBe(3)
    })

    it(`- when used w/o arguments - ${FAILS} as expected`, () => {
      expect(notFoundHandler).toThrow(/Cannot read (property|properties)/)
    })

    it(`- when used with "req", "res" and "next" - ${RETURNS} nothing`, () => {
      const req = {}
      const res = {}
      const next = jest.fn()

      expect(notFoundHandler(req, res, next)).toBeUndefined()
    })

    it(`- when used with "req", "res" and "next" - ${CALLS} next() with an error`, () => {
      const originalUrl = '/admin/test'

      const req = { originalUrl }
      const res = {}
      const next = jest.fn()

      notFoundHandler(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)

      const args = next.mock.calls[0]
      expect(args).toHaveLength(1)

      const [error] = args
      expect(error).toBeInstanceOf(Error)
      expect([error.message, error.status, error.statusCode]).toEqual(['Not Found: /admin/test', 404, undefined])
    })
  })
}

function runTestsAboutErrorHandler() {
  describe(`contain function ${bold('errorHandler()')} which`, () => {
    const { errorHandler } = ErrorHandlers

    it(green('is accessible'), () => {
      expect(errorHandler).toBeFunction()
    })

    it(`${green('expects')} four arguments (err, req, res, next)`, () => {
      expect(errorHandler.length).toBe(4)
    })

    it(`- when used w/o arguments - ${FAILS} as expected`, () => {
      expect(errorHandler).toThrow('Cannot destructure property')
    })

    describe(`- when used with valid arguments`, () => {
      const req = {}
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
      const next = jest.fn()

      it(`- ${RETURNS} nothing`, () => {
        const err = new Error('test-error')
        expect(errorHandler(err, req, res, next)).toBeUndefined()
      })

      it(`- ${CALLS} res.status() and res.json() as expected`, () => {
        const err = new Error('test-error')
        errorHandler(err, req, res, next)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ message: 'test-error' })
        expect(next).not.toHaveBeenCalled()
      })

      it(`- ${green('uses')} err.status if given`, () => {
        const err = new Error('test-error')
        err.status = 404
        errorHandler(err, req, res, next)

        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({ message: 'test-error' })
        expect(next).not.toHaveBeenCalled()
      })

      it(`- ${green('uses')} err.errors if given`, () => {
        const err = new Error('test-error')
        err.errors = [{ message: 'first error in list' }, { message: 'second error in list' }]
        errorHandler(err, req, res, next)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ message: 'test-error', errors: err.errors })
        expect(next).not.toHaveBeenCalled()
      })

      it(`- ${green('uses')} err.code if given`, () => {
        const err = new Error('test-error')
        err.code = 'ENOTFOUND'
        errorHandler(err, req, res, next)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ message: 'test-error', code: 'ENOTFOUND' })
        expect(next).not.toHaveBeenCalled()
      })

      it(`- ${red('IGNORES')} err.statusCode if given`, () => {
        const err = new Error('test-error')
        err.statusCode = 404
        errorHandler(err, req, res, next)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ message: 'test-error' })
        expect(next).not.toHaveBeenCalled()
      })
    })
  })
}

describe(`Utilities "errorHandlers"`, () => {
  runTestsAboutNotFoundHandler()
  runTestsAboutErrorHandler()
})
