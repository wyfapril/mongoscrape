$.getJSON("/articles", function(data){
  for (var i=0; i<20; i++) {
    $("article").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  }
});
