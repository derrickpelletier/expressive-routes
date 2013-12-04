module.exports = function (app, routes, triggerMap, verbose) {
  
  if(typeof triggerMap !== 'object') {
    verbose = triggerMap;
    triggerMap = {};
  }

  var regex = new RegExp("[" + Object.keys(triggerMap).join("") + "]", "g");

  /**
   * Recursive mapper function set on app to provide scope
   * Works through nested object of routes, checking for triggers and compiling middleware for routes.
   *
   * @param <Object> a (hash map of routes)
   * @param <String> route
   * @param <String> force_trigger
   */
  var mapper = function(ob, route, force_trigger){

    route = route || '';
    
    // Iterate over the current object level
    for (var key in ob) {

      // Current triggers for this level are either forced parent triggers or empty
      var triggers = force_trigger ? force_trigger.slice() : [];

      // Check for new triggers on this level and add to trigger stack
      var trigger_check = key.match(regex);
      if(trigger_check || (!triggers.length && trigger_check)) {
        triggers = triggers.concat(trigger_check);
      }

      // remove the triggers from the route
      route = route.replace(regex, '');

      // If this value is just another object, recurse.
      if(!Array.isArray(ob[key]) && typeof ob[key] !== 'function') {
        mapper(ob[key], route + key, triggers);
        continue;
      }

      // Generate the middleware stack from the triggers
      var mappedMiddleware = triggers.map(function(el){
        return triggerMap[el];
      });

      // concatenate the route with the middleware stack and the final endpoint.
      if(!Array.isArray(ob[key])) ob[key] = [ob[key]];
      var endpoints = [route].concat(mappedMiddleware).concat(ob[key]);


      if(verbose) console.log('%s\t\x1B[31m%s\x1B[39m\t%s \x1B[90m(%d)\x1B[39m', key, (triggers.length ? triggers.join("") : '-'), route, endpoints.length - 1);

      // set the callbacks on the currente verb!
      app[key].apply(app, endpoints);
    }
  }

  mapper(routes, null, null, verbose);
}
