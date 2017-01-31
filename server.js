"use strict";

/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.

 alternate lines
 var server = http.createServer(function(req, res) {

 server.listen(port, function() {
 */

 var http = require('http');
 var fs = require('fs');
 var port = 12037;

 var stylesheet = fs.readFileSync('gallery.css');

 var imageNames = ['ace.jpg', 'bubble.jpg', 'chess.jpg', 'fern.jpg', 'mobile.jpg'];

 function serveImage(filename, req, res) {
	fs.readFile('images/' + filename, (err, body) => {
		if(err) {
			console.error(err);
			res.statusCode = 500;
			res.statusMessage = "Ow";
			res.end("Something went wrong");
			return;
		}
		res.setHeader("Content-Type", "image/jpeg");
		res.end(body);
	});
}

 var server = http.createServer((req, res) => {
	switch(req.url) {
		case '/gallery':
      var ghtml = imageNames.map(function(fileName){
        return '<img src="' + fileName + '" alt="a fishing ace at work">'
      }).join(' ');
			var html = '<!doctype html>';
				html += '<head>';
        html += ' <title>Gallery</title>';
        html += '<link href="gallery.css" rel = "stylesheet" type="">';
        html += '</head>';
				html += '<body>';
				html += '	<h1>Gallery</h1>';
				html += ghtml;
				html += '	<h1>Hello.</h1> Time is ' + Date.now();
				html += '</body>';
			res.setHeader('Content-Type', 'text/html');
			res.end(html);
      break;
		case "/chess":
		case "/chess/":
		case "/chess.jpg":
		case "/chess.jpeg":
			serveImage('chess.jpg', req, res);
			break;
		case "/fern":
		case "/fern/":
		case "/fern.jpg":
		case "/fern.jpeg":
			serveImage('fern.jpg', req, res);
			break;
		case "/ace":
		case "/ace/":
		case "/ace.jpg":
		case "/ace.jpeg":
			serveImage('ace.jpg', req, res);
			break;
		case "/bubble":
		case "/bubble/":
		case "/bubble.jpg":
		case "/bubble.jpeg":
			serveImage('bubble.jpg', req, res);
			break;
		case "/mobile":
		case "/mobile/":
		case "/mobile.jpg":
		case "/mobile.jpeg":
			serveImage('mobile.jpg', req, res);
			break;
    case '/gallery.css':
      res.setHeader('Content-Type', 'text/css');
      res.end(stylesheet);
      break;
		default:
			res.statusCode = 404;
			res.statusMessage = "Requested Resource Not Found";
			res.end();
	}
 });

 server.listen(port, ()=> {
	 console.log("Listening on Port " + port);
 });
