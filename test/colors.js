const DISABLED = false

function green(text) {
  return DISABLED ? text : `\x1b[0;32m${text}\x1b[0m`
}

function red(text) {
  return DISABLED ? text : `\x1b[1;31m${text}\x1b[0m`
}

function bold(text) {
  return DISABLED ? text : `\x1b[1;37m${text}\x1b[0m`
}

module.exports = {
  green,
  WORKS: green('works'),
  SENDS: green('sends'),
  DELIVERS: green('delivers'),
  RETURNS: green('returns'),
  RESOLVES: green('resolves'),
  CALLS: green('calls'),

  red,
  FAILS: red('FAILS'),
  THROWS: red('THROWS'),
  REJECTS: red('REJECTS'),

  bold,
}
