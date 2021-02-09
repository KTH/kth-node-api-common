/**
 * @param {string} redirectUrl
 *      e.g. /api/node/swagger?url=/api/node/swagger.json
 */
function createSwaggerRedirectHandler(redirectUrl) {
  const handler = (req, res, next) => {
    if ((req.url === '/' || req.url === '/index.html') && !req.query.url) {
      res.redirect(redirectUrl)
    } else {
      next()
    }
  }
  return handler
}

module.exports = createSwaggerRedirectHandler
