A really simple helper to transform hierarchically structured route maps into server routes.
Supports trigger characters to add middleware downstream.

Designed to work with express.js by default, or any route system when using a custom processor (see below).

Get it like this: `npm install expressive-routes`

See example.js for full suggested usage.

---

Example of a contrived route map.

```javascript
var routes = {
  '/': {get: Main.index},
  '/login': {
    post: Session.performLogin,
    get: Session.login
  },
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
```

The `$` and `!` in these keys are used to trigger middleware downstream to its children:
Contrived trigger map:

```javascript
var triggers = {
  '!': helper.ensureAuthenticated,
  '$': helper.ensureAdministrator
};
```

With a route map, and an optional trigger map in place, the routing can be processed as follows:

```javascript
var expressive = require('expressive-routes');

var opts = {
  triggerMap: triggers,
  verbose: true
};

expressive(routes, app, opts);

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

---

A sample using a custom processor, in case you aren't using express, or just want it to do something fancier.
```
var opts = {
  triggerMap: triggers,
  processor: function(method, route, endpoints) {
    console.log("Something fancier", method, route);
    app[method].apply(app, [route].concat(endpoints));
  }
};

expressive(routes, opts);
```

---

With verbose mapping, the output is printed, with the preceeding triggers depicting which middleware was injected. The trailing number indicating the number of middlewares on the route.

Because the $ was set on the `/admin` route, itself and all children will have the `ensureAdministrator()` middleware. 
If a trigger is added to the child of a route that also has a trigger, the subsequent trigger will be added to the stack.

The `/$admin/users/:user_id/destroy` also shows arrays of functions are also supported as endpoints.

------

+ Real tests soon?
+ Better regex support, perhaps?