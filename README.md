A really simple helper to transform hierarchically structured routes into express routes.
Supports trigger characters to add middleware downstream.

Get it like this: `npm install expressive-routes`

Use it like this:
```javascript
var router = require('expressive-routes'),
    app = express();

// map of route triggers to appropriate middleware
var triggerMap = {
  '!': helper.ensureAuthenticated,
  '$': helper.ensureAdministrator
};

// some contrived routes
var routes = {
  '/': {get: Main.index},
  '/login': {post: Session.login},
  '/logout': {get: Session.logout},
  '/$admin': {
    get: Admin.index,
    '/users' : {
      get: Admin.users,
      '/:user_id': {
        get: Admin.userDetails,
        '/destroy' : {post: [Admin.contrivedMethod, Admin.destroyUser]},
        '/update' : {post: Admin.updateUser}
      }
    }
  },
  '/!account': {
    get: Account.index,
    post: Account.updateProfile
  }
};

router(app, routes, triggerMap, true);

// OUTPUT:

// get    / (1)
// post   /login (1)
// get    /logout (1)
// get  $ /admin (2)
// get  $ /admin/users (2)
// get  $ /admin/users/:user_id (2)
// post $ /admin/users/:user_id/destroy (3)
// post $ /admin/users/:user_id/update (2)
// get  ! /account (2)
// post ! /account (2)
```

With verbose mapping, the above output is printed, with the preceeding triggers depicting which middleware was injected. The trailing number indicating the number of middlewares on the route.

Because the $ was set on the `/admin` route, itself and all children will have the `ensureAdministrator()` middleware. 
If a trigger is added to the child of a route that also has a trigger, the subsequent trigger will be added to the stack.

The `/$admin/users/:user_id/destroy` also shows arrays of functions are also supported as endpoints.

------

+ More tests soon?
+ Better regex support, perhaps?
