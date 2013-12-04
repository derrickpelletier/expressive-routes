module.exports = function (app, routes, triggerMap, verbose) {
  
  if(typeof triggerMap !== 'object') {
    verbose = triggerMap;
    triggerMap = {};
  }

  /**
   * Recursive mapper function set on app to provide scope
   * Works through nested object of routes, checking for triggers and compiling middleware for routes.
   *
   * @param <Object> a (hash map of routes)
   * @param <String> route
   * @param <String> force_trigger
   */
  var mapper = function(a, route, force_trigger){
    force_trigger = typeof force_trigger === 'undefined' ? false : force_trigger;
    route = route || '';
    for (var key in a) {
      var triggers = force_trigger ? force_trigger.slice() : [];
      var trigger_check = key.match(new RegExp("[" + Object.keys(triggerMap).join("") + "]", "g"));
      if(trigger_check || (!triggers.length && trigger_check)) {
        triggers = triggers.concat(trigger_check);
      }
      route = route.replace(new RegExp("\[" + Object.keys(triggerMap).join("") + "]", "g"), '');
      if(!Array.isArray(a[key]) && typeof a[key] !== 'function') {
        mapper(a[key], route + key, triggers.length ? triggers : false);
        continue;
      }
      if(!Array.isArray(a[key])) a[key] = [a[key]];
      var mappedMiddleware = triggers.map(function(el){
        return triggerMap[el];
      });
      var endpoints = [route].concat(mappedMiddleware).concat(a[key]);
      if(verbose) console.log('%s\t\x1B[31m%s\x1B[39m\t%s \x1B[90m(%d)\x1B[39m', key, (triggers.length ? triggers.join("") : '-'), route, endpoints.length - 1);
      app[key].apply(app, endpoints);
    }
  }

  mapper(routes, null, null, verbose);
}
