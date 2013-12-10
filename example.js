var router = require('./index'),
    express = require('express'),
    app = express();

// The Helper endpoints
var helper = {
  ensureAuthenticated: function(req, res, next) {
    console.log("ensuring auth")
    next()
  },
  ensureAdministrator: function(req, res, next) {
    console.log("ensuring admin")
    next()
  }
}

// Some other endpoint
var someEndpoint = function(req, res) {
  res.send("doin some endpoint " + req.method)
}

// map of route triggers to appropriate middleware
var triggers = {
  '!': helper.ensureAuthenticated,
  '$': helper.ensureAdministrator
};

// some contrived routes
var routes = {
  '/': {get: someEndpoint},
  '/login': {
    get: someEndpoint,
    post: someEndpoint
  },
  '/logout': {get: someEndpoint},
  '/$admin': {
    get: someEndpoint,
    '/users' : {
      get: someEndpoint,
      '/:user_id': {
        get: someEndpoint,
        '/!destroy' : {post: [someEndpoint]},
        '/update' : {post: someEndpoint}
      }
    }
  },
  '/!account': {
    get: someEndpoint,
    post: someEndpoint
  }
};

var opts = {
  triggerMap: triggers,
  verbose: true
};

router(routes, app, opts);
app.listen(3000);