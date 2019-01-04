---
title: "12 Days of Node.js - Day 1: The beginning of a web application."
date: "2018-12-26 10:00:00"
layout: "post"
unsplashArgs: EWZ0STfVSug
tags: ["12-days-of-node"]
series: "12-days-of-node"
draft: true
---

## Introduction

This post is the beginning of a series of posts on building a web application in Node.js.
The goal is to finish with a working web application that has common user signup, authentication, and management. This includes allowing users to reset their passwords when they know their current password or if they've forgotten their password. It also includes managing users through an administration interface.

The series is split into 12 days starting on December 26th, 2018 and finishing on January 6th, 2019. Each post should only take 5 to 10 minutes to read and implement on your own.

## Setting up the server and web application

To see the final code for this post, checkout the [Day 1](https://github.com/doowb/12-days-of-node/tree/day-01) branch of the [12 days of node repository](https://github.com/doowb/12-days-of-node).

The structure for the project was created using the [generate][generate] [project](https://github.com/generate/generate-project) generator. This generator creates common Node.js project files, configurations for linting and NPM, and GitHub repository files.

### The app

We'll start with our [application JavaScript file](https://github.com/doowb/12-days-of-node/blob/day-01/app.js) which contains the code for creating an instance of an [Express](http://expressjs.com) app:

```js
'use strict';

const express = require('express');

async function create() {
  let app = express();

  app.use((req, res) => {
    res.send('hello world');
  });

  return app;
};

module.exports = { create };
```

This file exports an object with a `create` method that is used to create the application. The application uses a single middleware that returns the string `"hello world"`. We'll get into middleware and how they're used in Express applications in future posts. For now, you just need to know that when someone goes to your web site in a browser, they'll see `hello world`.

### The server

The next file to review is the [server JavaScript file](https://github.com/doowb/12-days-of-node/blob/day-01/server.js) which contains the code that will start a server running that "listens" on port 3000. This means that on your local computer you'll be able to go to [http://localhost:3000](http://localhost:3000) to access your web application (which will show "hello world").

```js
'use strict';

const http = require('http');
const { create } = require('./app');

const PORT = process.env.PORT || 3000;

const run = () => {
  return new Promise(async (resolve, reject) => {
    let app = await create();
    app.once('error', reject);

    let server = http.createServer(app);
    server.listen(PORT, () => {
      console.log('Web application listening on port:', PORT);
      console.log(`\thttp://localhost:${PORT}`);
    });

    process.on('SIGINT', resolve);
    process.on('SIGTERM', resolve);
  });
};

run()
  .then(() => {
    console.log('\nShutting down');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
```

Since this file is named `server.js`, you can run `npm start` from the command line to start the server. If you don't want to use NPM, you can also run `node server.js`. Once the server is started, go to [http://localhost:3000](http://localhost:3000) to see your web app in action!

To stop the server, press `Ctrl+c` at the command line.

## Conclusion

That's all for this post. In the next post, we'll talk routes, middleware, and how to use them to return something other than "hello world" to the browser.

[generate]: https://github.com/generate/generate
