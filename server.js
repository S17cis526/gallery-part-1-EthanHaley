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
		case "/chess": 
			serveImage('chess.jpg', req, res);
			break;
		case "/fern":
		case "/fern/":
		case "/fern.jpg":
		case "/fern.jpeg":
			serveImage('fern.jpg', req, res);
			break;
		case "/ace":
			serveImage('ace.jpg', req, res);
			break;
		case "/bubble":
			serveImage('bubble.jpg', req, res);
			break;
		case "/mobile":
			serveImage('mobile.jpg', req, res);
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
 
 
 
 
 
 
 