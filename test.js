var router = require('./index'),
    chai = require('chai'),
    expect = chai.expect,
    express = require('express'),
    app = express();

var helper = {
  ensureAuthenticated: function(req, res, next) {
    // 
  },
  ensureAdministrator: function(req, res, next) {
    // 
  }
}

var someEndpoint = function(req, res) {

}

before(function(done){

  // map of route triggers to appropriate middleware
  var triggerMap = {
    '!': helper.ensureAuthenticated,
    '$': helper.ensureAdministrator
  };

  // some contrived routes
  var routes = {
    '/': {get: someEndpoint},
    '/login': {post: someEndpoint},
    '/logout': {get: someEndpoint},
    '/$admin': {
      get: someEndpoint,
      '/users' : {
        get: someEndpoint,
        '/:user_id': {
          get: someEndpoint,
          '/destroy' : {post: [someEndpoint]},
          '/update' : {post: someEndpoint}
        }
      }
    },
    '/!account': {
      get: someEndpoint,
      post: someEndpoint
    }
  };

  router(app, routes, triggerMap);
  done();
});


describe("Untriggered routes should have 1 endpoint.", function(){
  it("/ should have one", function(done){
    for(var i in app.routes.get) {
      if(app.routes.get[i].path === '/'){
        expect(app.routes.get[i].callbacks.length).to.equal(1);
        done();
      }
    }
  });
  
  it("/login should have one", function(done){
    for(var i in app.routes.post) {
      if(app.routes.post[i].path === '/login'){
        expect(app.routes.post[i].callbacks.length).to.equal(1);
        done();
      }
    }
  });

});

describe("Triggered routes should have 2 endpoints.", function(){

  it("/admin should have two", function(done){
    for(var i in app.routes.get) {
      if(app.routes.get[i].path === '/admin'){
        expect(app.routes.get[i].callbacks.length).to.equal(2);
        done();
      }
    }
  });

  it("/admin/users/:user_id should have two", function(done){
    for(var i in app.routes.get) {
      if(app.routes.get[i].path === '/admin/users/:user_id'){
        expect(app.routes.get[i].callbacks.length).to.equal(2);
        done();
      }
    }
  });
});