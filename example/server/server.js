'use strict';

var express = require('express');
var path = require('path');
var stormpath = require('express-stormpath');

/**
 * Create the Express application.
 */
var app = express();

/**
 * The 'trust proxy' setting is required if you will be deploying your
 * application to Heroku, or any other environment where you will be behind an
 * HTTPS proxy.
 */
app.set('trust proxy',true);


/*
  We need to setup a static file server that can serve the assets for the
  angular application.  We don't need to authenticate those requests, so we
  setup this server before we initialize Stormpath.

 */

app.use('/',express.static(path.join(__dirname, '..' ),{ redirect: false }));


app.use(function(req, res, next){
  console.log(new Date, req.method, req.url);
  next();
})

// app.post('/forgot', function (req,res) {
//   res.status(500).json({message:'foo'});
// })

/**
 * Now we initialize Stormpath, any middleware that is registered after this
 * point will be protected by Stormpath.
 */

console.log('Initializing Stormpath');

app.use(stormpath.init(app, {
  web: {
    // produces: ['text/html'],
    spa: {
      enabled: true,
      view: path.join(__dirname, '..', 'index.html')
    },
    me: {
      // enabled: false,
      expand: {
        customData: true,
        groups: true
      }
    }
  }
}));

/**
 * Now that our static file server and Stormpath are configured, we let Express
 * know that any other route that hasn't been defined should load the Angular
 * application.  It then becomes the responsiliby of the Angular application
 * to define all view routes, and rediret to the home page if the URL is not
 * defined.
 */
app.route('/*')
  .get(function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'client','index.html'));
  });

/**
 * Start the web server.
 */
app.on('stormpath.ready',function () {
  console.log('Stormpath Ready');
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Application running at http://localhost:'+port);
});