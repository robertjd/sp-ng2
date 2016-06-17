var express = require('express');
var stormpath = require('express-stormpath');
var cors = require('cors');

var applicationId = '24k7HnDOz4tQ9ARsBtPUN6';

var app = express();
app.use(cors()); // zomg dont use * for cors


app.use(stormpath.init(app,{
  web: {
    oauth2: {
      uri: '/client/v1/'+applicationId+'/oauth/token'
    },
    me: {
      uri: '/client/v1/'+applicationId+'/me'
    },
    logout: {
      uri: '/client/v1/'+applicationId+'/logout'
    }
  }
}));


var port = process.env.PORT || 4000;

app.listen(port, function () {
  console.log('Application running at http://localhost:'+port);
});