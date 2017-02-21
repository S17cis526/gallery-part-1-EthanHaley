/**
 * server.js
 * This file defines the server for a
 * simple photo gallery web app.
 */
 "use strict";

 var multipart = require('./multipart');
 var template = require('./template');
 var http = require('http');
 var url = require('url');
 var fs = require('fs');
 var port = 12037;
 var title = "Image Gallery Default"; //Default title
 var config = JSON.parse(fs.readFileSync('config.json'));
 var stylesheet = fs.readFileSync('public/gallery.css');
 var script = fs.readFileSync('public/gallery.js');

 template.loadDir("templates");

 function getImageNames(callback) {
   fs.readdir('images/', function(err, fileNames) {
     if(err) callback(err, undefined);
     else callback(false, fileNames);
   });
 }

 function imageNamesToTags(fileNames) {
   return fileNames.map(function(fileName) {
     return '<img src="${fileName}" alt="${fileName}">';
   });
 }

 function buildGallery(imageTags) {
   return template.render('gallery', {
     title: config.title,
     imageTags: imageNamesToTags(imageTags).join('')
   });
 }

 function serveGallery(req, res, query, data) {
  /*if(data && data.title) {
    title = data.title;
    config.title = data.title;
    saveConfig();
  }*/
    getImageNames(function(err, imageNames) {
      if(err) {
        console.error(err);
        res.statusCode = 500;
        res.statusMessage = 'Server Error';
        res.end();
        return;
      }
      res.setHeader('Content-Type', 'text/html');
      res.end(buildGallery(imageNames));
    });
 }

 function serveImage(filename, req, res) {
	fs.readFile('images/' + decodeURIComponent(filename), function(err, data) {
		if(err) {
			console.error(err);
			res.statusCode = 500;
			res.statusMessage = "Resource not found";
			res.end();
			return;
		}
		res.setHeader("Content-Type", "image/jpeg");
		res.end(data);
	});
}

function handleRequest(req, res) {
  var urlParts = url.parse(req.url);

  if(urlParts.query) {
    var matches = /title=(.+)($|&)/.exec(urlParts.query);
    if(matches && matches[1]) {
      config.title = decodeURIComponent(matches[1]);
      fs.writeFile('config.json', JSON.stringify(config));
    }
  }

  switch(urlParts.pathname) {
    case '/':
    case '/gallery':
    case '/gallery/':
     if(req.method == 'GET') {
       serveGallery(req, res);
     }
     else if(req.method == 'POST') {
       uploadImage(req,res);
     }
     break;
   case '/gallery.css':
     res.setHeader('Content-Type', 'text/css');
     res.end(stylesheet);
     break;
   case '/gallery.js':
      res.setHeader('Content-Type', 'text/javascript');
      res.end(script);
      break;
   default:
     serveImage(req.url, req, res);
  }
}

function uploadImage(req, res) {
  multipart(req, res, function(req, res) {
    if(!req.body.image.filename) {
      console.error("No file in upload");
      res.statusCode = 400;
      res.statusMessage = "No file specified";
      res.end("No file specified");
      return;
    }
    fs.writeFile('images/' + req.body.image.filename, req.body.image.data, function(err) {
      if(err) {
        console.error(err);
        res.statusCode = 500;
        res.statusMessage = "Server Error";
        res.end("Server Error");
        return;
      }
      serveGallery(req, res);
    });
  });
}

var server = http.createServer(handleRequest);

server.listen(port, function() {
	console.log("Listening on Port " + port);
});

 function handleError(req, res, err) {
   console.err(err, req, res);
   res.writeHead(500, {'content-type': 'text/html'});
   res.end('Server Error');
 }

 function saveConfig() {
   var data = JSON.stringify(config);
   fs.writeFile("config.json", data, function(err){
     console.error("Error saving configuration", err)
   });
 }
