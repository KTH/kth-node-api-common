/**
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
function notFoundHandler(req, res, next) {
  const error = new Error(`Not Found: ${req.originalUrl}`)
  error.status = 404
  next(error)
}

/**
 * Handle any errors thrown or forwarded through the next callback
 *
 * Can be used as error-handling middleware in Express.js
 * as long as it still has exactly four arguments.
 *
 * @param {object} err
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const { message, status, errors, code } = err

  if (status) {
    res.status(status)
  } else {
    res.status(errors ? 400 : 500)
  }

  res.json({ message, errors, code })
}

module.exports = {
  notFoundHandler,
  errorHandler,
}
