module.exports = {
  createApiPaths: require('./lib/createApiPaths'),
  createSwaggerRedirectHandler: require('./lib/createSwaggerRedirectHandler'),
  notFoundHandler: require('./lib/errorHandlers').notFoundHandler,
  errorHandler: require('./lib/errorHandlers').errorHandler
}
