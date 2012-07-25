express = require("express")
http = require("http")
app = express()
app.configure ->
  app.set "views", __dirname + "/views"
  app.set "view engine", "jade"
  app.use express.favicon()
  app.use express.logger("dev")
  app.use express.static(__dirname + "/public")
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use app.router

app.configure "development", ->
  app.use express.errorHandler()

app.get "/", (req, res) ->
  res.render 'index'

http.createServer(app).listen 3000
console.log "Express server listening on port 3000"
