'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require('dns')

var cors = require('cors');
var tot=0;
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI);

var Schema = mongoose.Schema;
var urlSchema = new Schema({
  fwdId: {
    type: Number,
    required: true
  },
  url : String
});

const options = {
  family: 6,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,
};

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());
var Url = mongoose.model('Url', urlSchema);


/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended:false}))

app.use('/api/shorturl/new',(req,res,next)=>{
  
  dns.resolve('freecodecamp.com', function (err, addresses, family) {
    let u;
    if(!err){
      console.log(addresses);
      tot++;
      if(req.body.url[0]!='h'){
        if(req.body.url[0]!="w"&&req.body.url[1]!="w"&&req.body.url[1]!="w"){
          u = 'https://www.' + req.body.url;
        }else{
          u = 'https://' + req.body.url;
        }
      }else{
        u = req.body.url;
      }
      var url = new Url({"fwdId":tot,"url":u});
      url.save((err,data)=>{
        if(!err){
          console.log(data);
        }else{
          console.log(err);
        }
      })
      res.json({"original_url":u,"short_url":tot});
      
    }else{
      res.json({"original_url":u,"valid":false});
    }
    
  });
  
  
});
app.use('/api/shorturl/:id',(req,res)=>{
  Url.findOne({"fwdId":req.params.id},(err,data)=>{
    if(!err){
      // res.json({"url":data["url"]});
      res.redirect(data["url"]);
    }else{
      res.json({"url":"not Found"});
    }
  })
});

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});