var http = require('http');
var url = require('url');
var fs = require('fs');
var config = require('config-yml');
var formidable = require('formidable');
var fb = require('fb');

fb.setAccessToken(config.app_token);

http.createServer(onRequest).listen(3535, '0.0.0.0');

function onRequest(request, response) {
  var pathname = url.parse(request.url).pathname;
  if (pathname == '/') {
    if (request.method.toLowerCase() == 'get') {
      displayForm(response);
    } else if (request.method.toLowerCase() == 'post') {
      submitForm(request, response);
    }
  }
  else if (pathname == '/response') {
    response.write('<!doctype html><html><meta charset=\'utf-8\'><title>Response</title>');
    getGroupMembers(request, response);
  }
};

function displayForm(res) {
  fs.readFile('form.html', function (err, data) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.write(data);
    res.end();
  });
};

function submitForm(request, response) {
  var form = new formidable.IncomingForm();
  form.encoding = 'utf-8';

  form.parse(request, function (err, fields) {
    var url = fields.groupURL;
    url = url ? url.substring(url.lastIndexOf('/') + 1) : null;
    response.writeHead(301, {
      'Content-Type': 'text/html; charset=utf-8',
      'Location': '/response?groupID=' + url
    });
    response.end();
  });
};

function getGroupMembers(request, response) {
  var groupID = url.parse(request.url, true).query.groupID;

  // check if group ID is integer number
  if (groupID && (+groupID ^ 0 === +groupID)) {
    // query for facebook graph api   
    getMembers(groupID + '/members?limit=1500');

    function getMembers(query) {
      if (query) {
        fb.api(query, function (res) {
          if (!res || res.error) {
            if (res) {
              if (res.error.message == 'Unsupported operation')
                response.write('The specified element is not a group');
              else response.write(res.error.message);
            }
            else response.write('Error occurred');
            response.end();
            return;
          }
          res.data.forEach(function (obj) {
            response.write('<a href = https://facebook.com/' + obj.id + ' target=\'_blank\'>' + obj.name + '</a><br/>');
          });
          if (res.paging.next) {
            getMembers(res.paging.next.split('https://graph.facebook.com/')[1]);
          } else {
            response.end();
          }
        });
      }
    };
  } else {
    response.write('The specified element is not a group');
    response.end();
  }
};