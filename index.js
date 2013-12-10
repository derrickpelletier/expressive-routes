module.exports = function (routes, app, opts) {
  var settings = {
    triggerMap: {},
    verbose: false,
    app: null,
    processor: function(method, route, endpoints) {
      if(!settings.app) return console.log("You must specify an express app instance for default functionality.")
      settings.app[method].apply(settings.app, [route].concat(endpoints));
    }
  };

  if(typeof app === 'function') {
    settings.app = app;
  } else if(typeof app === 'object') {
    opts = app;
  }
  opts = opts ? opts : {};
  
  for(var i in settings) {
    settings[i] = opts.hasOwnProperty(i) ? opts[i] : settings[i];
  }

  var regex = new RegExp("[" + Object.keys(settings.triggerMap).join("") + "]", "g");

  /**
   * Recursive mapper function set on app to provide scope
   * Works through nested object of routes, checking for triggers and compiling middleware for routes.
   *
   * @param <Object> a (hash map of routes)
   * @param <String> route
   */
  var mapper = function(ob, route){
    route = route || '';

    Object.keys(ob).forEach(function(key){
      // If this value is just another object, recurse.
      if(!Array.isArray(ob[key]) && typeof ob[key] !== 'function') {
        return mapper(ob[key], route + key);
      }

      // Check for new triggers on this level and add to trigger stack
      var triggers = route.match(regex) || [];

      // Generate the middleware stack from the triggers and endpoints
      var mappedMiddleware = triggers.map(function(el){
        return settings.triggerMap[el];
      });
      if(!Array.isArray(ob[key])) ob[key] = [ob[key]];
      var endpoints = mappedMiddleware.concat(ob[key]);

      if(settings.verbose) console.log('%s\t\x1B[31m%s\x1B[39m\t%s \x1B[90m(%d)\x1B[39m', key, (triggers.length ? triggers.join("") : '-'), route, endpoints.length);

      // run the processor to create this route
      settings.processor(key, route.replace(regex, ''), endpoints);
    });
  }

  mapper(routes, null);
}
