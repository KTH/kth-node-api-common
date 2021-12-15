const createApiPaths = require('./lib/createApiPaths')
const { notFoundHandler, errorHandler } = require('./lib/errorHandlers')

module.exports = {
  createApiPaths,
  notFoundHandler,
  errorHandler,
}
