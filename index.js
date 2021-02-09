const createApiPaths = require('./lib/createApiPaths')
const createSwaggerRedirectHandler = require('./lib/createSwaggerRedirectHandler')
const { notFoundHandler, errorHandler } = require('./lib/errorHandlers')

module.exports = {
  createApiPaths,
  createSwaggerRedirectHandler,
  notFoundHandler,
  errorHandler,
}
