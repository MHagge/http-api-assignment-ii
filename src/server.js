const http = require('http');

const url = require('url');

const query = require('querystring');

const responseHandler = require('./response.js');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': responseHandler.getIndex,
  '/style.css': responseHandler.getStyle,
  '/getUsers': responseHandler.whenGetUsers,
  '/addUser': responseHandler.whenAddUsers,
  notFound: responseHandler.whenNotFound,
};


const onRequest = (request, response) => {
  // url module allows us to grab sections of the URL by name
  // neat
  const parsedUrl = url.parse(request.url);
  // grab the query parameters and put em in an object
  // const params = query.parse(parsedUrl.query);


  if (request.method === 'POST') {
    const body = [];

      // if the upload stream errors out, just throw a
      // a bad request and send it back
    request.on('error', (err) => {
      console.dir(err);
      const res = response;
      res.statusCode = 400;
      res.end();
    });

      // on 'data' is for each byte of data that comes in
      // from the upload. We will add it to our byte array.
    request.on('data', (chunk) => {
      body.push(chunk);
    });

      // on end of upload stream.
    request.on('end', () => {
        // combine our byte array (using Buffer.concat)
        // and convert it to a string value (in this instance)
      const bodyString = Buffer.concat(body).toString();
        // since we are getting x-www-form-urlencoded data
        // the format will be the same as querystrings
        // Parse the string into an object by field name
      const bodyParams = query.parse(bodyString);

        // pass to our addUser function
      responseHandler.whenAddUsers(request, response, bodyParams);
    });
  }


  // tells you what the browser want to get... i think?
  // json or xml or etc i dunno lol
  // const acceptedTypes = request.headers.accept.split(',');
  // console.dir(body);
  // console.log(parsedUrl.pathname);// thanks url module
  if (request.method !== 'POST') {
    if (urlStruct[parsedUrl.pathname]) {
      urlStruct[parsedUrl.pathname](request, response);
    } else {
      urlStruct.notFound(request, response);
    }
  }
};

http.createServer(onRequest).listen(PORT);
console.log(`Listening on 127.0.0.1: ${PORT}`);
