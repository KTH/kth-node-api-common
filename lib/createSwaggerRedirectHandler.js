module.exports = function (redirectUrl) {
  return function (req, res, next) {
    if ((req.url !== '/' && req.url !== '/index.html') || req.query[ 'url' ]) {
      next()
      return
    }
    res.redirect(redirectUrl)
  }
}
