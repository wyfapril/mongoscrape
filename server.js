var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

var Article = require("./models/Article.js");
var Note = require("./models/Note.js");

mongoose.Promise = Promise;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));

mongoose.connect("mongodb://ds121192.mlab.com:21192/webrush_db");
var db = mongoose.connection;

db.on("error", function(error){
  console.log("Mongoose Error: " + error);
});
db.once("open", function(){
  console.log("Mongoose connection successful.");
});

app.get("/scrape", function(req, res){
  request("https://www.nytimes.com/",function(error, response, html){
    var $ = cheerio.load(html);
    $("article h2").each(function(i, element){
      var result = {};
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      var entry = new Article(result);
      entry.save(function(err, doc){
        if (err) {
          console.log(err);
        } else {
          console.log(doc);
        }
      });
    });
  });
  res.send("Scrape Completed.");
});

app.get("/articles", function(req, res){
  Article.find({},function(err,doc){
    if (err) {
      console.log(err);
    } else {
      res.json(doc);
    }
  });
});

app.get("/articles/:id", function(req, res){
  Article.findOne({"_id": req.params.id}).populate("note").exec(function(err, doc){
    if (err) {
      console.log(err);
    } else {
      res.json(doc);
    }
  });
});

app.post("/articles/:id", function(req, res){
  var newNote =  new Note(req.body);
  newNote.save(function(error, doc){
    if (err) {
      console.log(err);
    } else {
      Article.findOneAndUpdate({"_id": req.params.id}, {"note": doc._id}).exec(function(err, doc){
        if (err) {
          console.log(err);
        } else {
          res.json(doc);
        }
      });
    }
  });
});

app.listen(8080, function() {
  console.log("App running on port 8080!");
});
