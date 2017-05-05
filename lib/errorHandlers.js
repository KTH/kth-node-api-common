module.exports = {
  notFoundHandler: notFoundHandler,
  errorHandler: errorHandler
}

function notFoundHandler (req, res, next) {
  const error = new Error(`Not Found: ${req.originalUrl}`)
  error.status = 404
  next(error)
}

// handle any errors thrown or forwarded through the next callback
function errorHandler (err, req, res, next) {
  let status = err.status

  if (!status) {
    if (err.errors) {
      status = 400
    } else {
      status = 500
    }
  }

  res.status(status).json({ message: err.message, errors: err.errors, code: err.code })
}
