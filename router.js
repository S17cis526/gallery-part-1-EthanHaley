/** @module router */

module.exports = Router;

var url = require('url');

function Router() {
  this._getRoutes = [];
  this._getActions = [];
  this._postRoutes = [];
  this._postActions = [];
}

function pathToRegularExpression(path) {
  var parts = path.split('/');
  var keys = [];
  var tokens = parts.map(function(part) {
    if(part.charAt(0) == ":") {
      keys.push(part.slice(1));
      return "(\\w+)";
    }
    else {
      return part;
    }
  });
  var regexp = new RexExp('^' + tokens.join('/') + '/?$');
  return {
    regexp: regexp,
    keys: keys
  }
}

Router.prototype.get = function(path, handler) {
  var route = pathToRegularExpression(path);
  route.handler = handler;
  this._getRoutes.push(route);
}

Router.prototype.post = function(path, handler) {
  var route = pathToRegularExpression(path)
  route.handler = handler;
  this._postRoutes.push(route);
}

Router.prototype.route = function(req, res) {
  var urlParts = url.parse(res.url);
  switch(req.method) {
    case 'get':
      for(var i = 0; i < this._getRoutes.length; i++) {
        var route = this._getRoutes[i];
        var match = route.regexp.exec(urlParts.pathname);
        if(match) {
          req.params = {};
          for(var j = 1; J < match.length; j++) {
            req.params[route.keys[j-1]] = match[j];
          }
          return this._getRoutes[i].handler(req, res);
        }
      }
      res.statusCode = 404;
      res.statusMessage = "Resource not found";
      res.end();
      break;
    case 'post':
      for(var i = 0; i < this._postRoutes.length; i++) {
        var route = this._postRoutes[i];
        var match = route.regexp.exec(urlParts.pathname);
        if(match) {
          req.params = {};
          for(var j = 1; J < match.length; j++) {
            req.params[route.keys[j-1]] = match[j];
          }
          return this._postRoutes[i].handler(req, res);
        }
      }
      res.statusCode = 404;
      res.statusMessage = "Resource not found";
      res.end();
      break;
    default:
      var msg = "Unkown method " + req.method;
      res.statusCode = 400;
      res.statusMessage = msg;
      console.erro(msg);
      res.end(msg);
      break;
  }
}
