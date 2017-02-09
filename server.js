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
 var url = require('url');
 var fs = require('fs');
 var port = 12037;
 var title = "Image Gallery"; //default title
 var config = JSON.parse(fs.readFileSync('config.json'));

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
   // at most, the url should have two parts-
   //a resource and a querystring separated by a ?
   var urlParts = url.parse(req.url);

   //var url = req.url.split('?');
   //var resource = url[0];
   //var queryString = url[1];

   if(urlParts.query) {
     var matches = /title=(.+)($|&])/.exec(urlParts.query);
     if(matches && matches[1]) {
       config.title = matches[1];
       saveConfig();
     }
   }

   switch(urlParts.pathname) {
     case '/':
     case '/gallery':
      if(req.method == 'GET') {
        serveGallery(req, res);
      }
      else if(req.method == 'POST') {
        uploadPicture(req, res);
      }
      break;
    case "/favicon.ico":
        res.statusCode = 400;
        res.end();
        break;
    case "/gallery.css":
        res.setHeader('Content-Type', 'text/css');
        res.end(stylesheet);
        break;
    default:
        serveImage(req, res);
        break;
	}
 });

 server.listen(port, ()=> {
	 console.log("Listening on Port " + port);
 });

 function handleError(req, res, err) {
   console.err(err, req, res);
   res.writeHead(500, {'content-type': 'text/html'});
   res.end('Server Error');
 }

 function handleRequest(req, res) {
   if(req.url == "/") buildGallery(req, res);
   else if(req.substring(0,8) == "/images/") serveImage(req, res);
   else {
     res.writeHead(404, {"content-type": "text/html"});
     res.end("not found");
   }
 }

 function serveImage(req, res) {
   var filename = "./" + req.url;
   fs.stat(filename, function(err, stats) {
     if(err) {handleError(req, res, err); return;}
     if(stats.isFile()) {
       fs.readFile(filename, function(err, file) {
         if(err) { handleError(req, res, err); return;}
         res.writeHead(200, {'content-type': 'image/' + filename.split('.').last });
         res.end(file);
       });
     }
   });
 }

 function uploadImage(req, res) {
   var body = '';
   req.on('error', function(){
     res.statusCode = 500;
     res.end();
   });
   req.on('data', function(data){
     body += data;
   });
   req.on('end', function(){
     fs.writeFile('filename', data, function(err) {
       if(err) {
         console.error(err);
         res.statusCode = 500;
         res.end();
         return;
       }
       serveGallery(req, res);
     });
   });
 }

 function generateTitleForm() {
   return '<form action="/" method="POST">' +
    ' <input type="text" name="title" value="' + title + '"/>' +
    ' <input type="submit" value="Save Changes" />' +
    '</form>';
 }

 function serveGallery(req, res, query, data) {
  if(data && data.title) {
    title = data.title;
    config.title = data.title;
    saveConfig();
  }

   // Load our images
  fs.readdir('images', function(err, files) {
    if(err) {
      console.error("Error in serveGallery", err);
      res.writeHead(500, {'Content-Type': 'text/html'});
      res.end('Server Error');
      return;
    }

    // Create a list of image tags from the directory contents
    var imageTags = files.filter( function(file){
      // Filter files for images
      return fs.statSync('images/' + file).isFile();
    }).map( function(file) {
      // Wrap file with img tag
      return "<img src='/images/" + file + "'/>";
    }).join("\n");

    // Show a gallery page
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(
      '<!doctype html>\n' +
      '<html>\n' +
      ' <head>\n' +
      '   <title>' + config.title + '</title>\n' +
      '    <link href="gallery.css" type="text/css" rel="stylesheet"/>' +
      ' </head>\n' +
      ' <body>\n' +
      '   <h1>' + config.title + '</h1>\n' +
      generateTitleForm() +
      '   <div class="gallery">' +
      imageTags +
      '   </div>' +
      '   <form action = "" method="POST">' +
      '    <input type="file" name="image">' +
      '    <input type="submit" name="Upload Image">' +
      '   </form>' +
      '	  <h1>Hello.</h1> Time is ' + Date.now() +
      ' </body>\n' +
      '</html>\n'
    );
  });
 }

 function saveConfig() {
   var data = JSON.stringify(config);
   fs.writeFile("config.json", data, function(err){
     console.error("Error saving configuration", err)
   });
 }

 function parsePostData(req, res, callback) {
   if(request.method.toUpperCase() != 'POST') return callback(req, res);

   var body = ''

   req.on('data', function(data) {
     body += data
   });

   req.on('end', function() {
     var data = qs.parse(body);
     req.body = data;
     callback(req, res);
   });
 }
