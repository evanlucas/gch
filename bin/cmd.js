#!/usr/bin/env node

process.title = 'gch'
var fs = require('fs')
  , nopt = require('nopt')
  , knownOpts = { loglevel: ['verbose', 'info', 'error']
                , help: Boolean
                , version: Boolean
                , url: String
                , token: String
                , roomId: String
                , port: Number
                }
  , shortHand = { verbose: ['--loglevel', 'verbose']
                , h: ['--help']
                , u: ['--usage']
                , p: ['--port']
                , u: ['--url']
                , t: ['--token']
                , r: ['--roomId']
                }
  , parsed = nopt(knownOpts, shortHand)
  , gch = require('../')
  , pkg = require('../package')

if (parsed.help) {
  usage(0)
  return
}

if (parsed.version) {
  console.log('gch', 'v'+pkg.version)
  return
}

if (parsed.loglevel) gch.log.level = parsed.loglevel

if (!parsed.url) {
  gch.log.error('[args]', 'url is required')
  usage(1)
  return
}

if (!parsed.token) {
  gch.log.error('[args]', 'token is required')
  usage(1)
  return
}

if (!parsed.roomId) {
  gch.log.error('[args]', 'roomId is required')
  usage(1)
  return
}

gch.load(parsed).start()

function usage(code) {
  var rs = fs.createReadStream(__dirname + '/usage.txt')
  rs.pipe(process.stdout)
  rs.on('exit', function() {
    if (code) process.exit(code)
  })
}
