var express = require('express');
var stormpath = require('express-stormpath');
var cors = require('cors');

var applicationId = process.env.STORMPATH_APPLICATION_HREF.match(/([^\/]+)$/)[0];

var app = express();

app.use(cors()); // zomg dont use * for cors

app.use(stormpath.init(app,{
  web: {
    changePassword: {
      uri: '/client/v1/'+applicationId+'/change'
    },
    forgotPassword: {
      uri: '/client/v1/'+applicationId+'/forgot'
    },
    logout: {
      uri: '/client/v1/'+applicationId+'/logout'
    },
    me: {
      uri: '/client/v1/'+applicationId+'/me'
    },
    oauth2: {
      uri: '/client/v1/'+applicationId+'/oauth/token'
    },
    register: {
      uri: '/client/v1/'+applicationId+'/register'
    },
    verifyEmail: {
      uri: '/client/v1/'+applicationId+'/verify'
    }
  }
}));


var port = process.env.PORT || 4000;

app.listen(port, function () {
  console.log('Application running at http://localhost:'+port);
});