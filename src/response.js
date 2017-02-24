const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);

const style = fs.readFileSync(`${__dirname}/../client/style.css`);

const crypto = require('crypto');

const users = {};

let etag = crypto.createHash('sha1').update(JSON.stringify(users));
let digest = etag.digest('hex');


const respond = (request, response, status, object) => {
  const header = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, header);
  // response.write(JSON.stringify(object));
  response.write(JSON.stringify(object));
  console.log('legolas');
  response.end();
};

const respondMeta = (request, response, status) => {
  const header = {
    'Content-Type': 'application/json',
    etag: digest,
  };
  response.writeHead(status, header);
  console.log('boromir');
  response.end();
};

const getIndex = (request, response) => {
  // writeResponse(request, response, 200, index, { 'Content-Type': 'text/html' });
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getStyle = (request, response) => {
  // writeResponse(request, response, 200, style, { 'Content-Type': 'text/css' });
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(style);
  response.end();
};

const whenGetUsers = (request, response) => {
  if (request.method === 'GET') {
    if (request.headers['if-none-match'] === digest) {
    // if GET retrieves 304 not motified without results thereafter until content changes
      return respond(request, response, 304, users);
    }

    // if GET retrieves 200 success with results first time
    console.log('humor ryan');
    console.dir(users);
    return respond(request, response, 200, users);
  } // (request.method === 'HEAD') {
  if (request.headers['if-none-match'] === digest) {
    // if HEAD retrieves 304 not motified without results thereafter until content changes
    return respondMeta(request, response, 304);
  }

    // if HEAD retrieves 200 success without results first time
  return respondMeta(request, response, 200);
};

const whenAddUsers = (request, response, params) => {
  // console.log(params);

  if (params.name === '' || params.age === '') {
    // fields were empty 400 client error message
    const responseJSON = {
      message: '*both a name and an age are required',
      id: '400: Client Error',
    };
    return respond(request, response, 400, responseJSON);
  }

  if (!users[params.name]) { // if a user with that name does not exist
    // if POST(all are post) add new user with 201. no response body
    const responseJSON = {
      message: 'Message: Created Successfully',
      id: 'Create',
    };
    users[params.name] = params.age;

    etag = crypto.createHash('sha1').update(JSON.stringify(users));
    digest = etag.digest('hex');
    /*
    users ={
      muriel: 20,
    }
    */
    // console.dir(users);
    return respond(request, response, 201, responseJSON);
  }
    // if new user already exists don't add them 204
  const responseJSON = {
    message: '',
    id: 'Updated(No Content)',
  };
  return respond(request, response, 204, responseJSON);
};

const whenNotFound = (request, response) => {
  // error message with a description and consistent error id
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'Not Found',
  };
  respond(request, response, 404, responseJSON);
};

module.exports = {
  respond,
  getIndex,
  getStyle,
  whenGetUsers,
  whenAddUsers,
  whenNotFound,
};
