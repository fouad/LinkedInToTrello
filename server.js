(function() {
  var app, express, http;

  express = require("express");

  http = require("http");

  app = express();

  app.configure(function() {
    app.set("views", __dirname + "/views");
    app.set("view engine", "jade");
    app.use(express.favicon());
    app.use(express.logger("dev"));
    app.use(express.static(__dirname + "/public"));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    return app.use(app.router);
  });

  app.configure("development", function() {
    return app.use(express.errorHandler());
  });

  app.get("/", function(req, res) {
    return res.render('index');
  });

  http.createServer(app).listen(3000);

  console.log("Express server listening on port 3000");

}).call(this);
