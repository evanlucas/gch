var log = require('npmlog')
  , http = require('http')
  , request = require('request')
  , util = require('util')
  , builds = []
  , moment = require('moment')
  , url = require('url')
  , apiUrl = 'https://api.hipchat.com/v1/rooms/message?format=json&auth_token='

log.heading = 'gch'

var gl = exports

gl.log = log
gl.load = function(opts) {
  gl.port = opts.port || 3030
  gl.token = opts.token
  gl.url = url.parse(opts.url).href
  gl.roomId = opts.roomId
  log.verbose('[opts]', {
    token: gl.token
  , url: gl.url
  , roomId: gl.roomId
  })
  return gl
}

gl.start = function() {
  gl.server = http
    .createServer(app)
    .listen(gl.port, function() {
      log.info('[listen]', gl.port)
    })
}

function app(req, res) {
  log.http(req.method, req.url)
  var buf = ''
  req.on('data', function(d) {
    buf += d
  })

  req.on('end', function() {
    try {
      var response = JSON.parse(String(buf))
      res.writeHead(200, {
        'Content-Type': 'application/json'
      })
      res.end(JSON.stringify({ status: 'success' }))
      var bid = response.build_id
      if (!~builds.indexOf(bid)) {
        builds.push(bid)
        postNotification(response)
      }
    }
    catch (err) {
      log.error('[parse]', err)
      res.writeHead(500, {
        'Content-Type': 'application/json'
      })
      res.end(JSON.stringify({ status: 'error' }))
      return
    }
  })
}

function postNotification(input, cb) {
  var data = status(input)+ciUrl(input)
  var start = moment(input.build_started_at)
  var end = moment(input.build_finished_at)
  var duration = moment.duration(end.diff(start)).humanize()
  data += util.format('- Build took <strong>%s</strong><br/>', duration)
  if (input.push_data) {
    if (input.push_data.total_commits_count) {
      data += util.format('- Commits: %s<br/>', input.push_data.total_commits_count)
    }
    if (input.push_data.user_name) {
      data += util.format('- Pushed by: %s', input.push_data.user_name)
    }
  }
  log.http('POST', apiUrl)
  var r = request.post(apiUrl+gl.token, function(err, res, body) {
    if (err) {
      log.error('[hipchat]', err)
      return cb && cb(err)
    }
    var code = res.statusCode
    log.http(code, apiUrl)
    if (code !== 200) {
      var err = new Error('Received non-200 status code: '+code)
      err.body = body
      log.error('[hipchat]', err, body)
      return cb && cb(err)
    }
    log.info('[hipchat]', 'success', input.build_id)
    cb && cb()
  })
  var form = r.form()
  form.append('color', 'green')
  form.append('message', data)
  form.append('room_id', gl.roomId)
  form.append('from', 'GitLab CI')
}

function status(data) {
  return util.format( 'Build <strong>%s</strong> for <a href="%sprojects/%s">'+
                    '%s</a> '
                    , data.build_status
                    , gl.url
                    , data.project_id
                    , data.project_name
                    )
}

function ciUrl(data) {
  return util.format( '(<a href="%sprojects/%s/builds/%s">'+
                      'Build #%s</a>)<br/>'
                    , gl.url
                    , data.project_id
                    , data.build_id
                    , data.build_id
                    )
}
