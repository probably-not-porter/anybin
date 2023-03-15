// ==============
// |   ANYBIN   |          Created by Porter
// ==============          March 2023                 v0.1


// =========== Requires =========== //
require('dotenv').config();
const { QuickDB } = require("quick.db");
const express = require('express');
var bodyParser = require('body-parser')
var path = require('path');
var favicon = require('serve-favicon');

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// =========== Front end setup =========== //
const e_app = express();
e_app.set('view engine', 'ejs');
e_app.get('/', function(_req, res) {
    res.render("index",{
    })
});


// =========== Quick.DB setup =========== //
const db = new QuickDB();

// GETS
e_app.get('/api/user', async function(req, res) {
  console.log(req.query.userid);
  let obj = await db.get( "user/" + req.query.userid );
  res.send(obj);
});
e_app.get('/api/bin', async function(req, res) {
  let obj = await db.get( "bin/" + req.query.binid );
  res.send(obj);
});
e_app.get('/api/item', async function(req, res) {
  let obj = await db.get( "item/" + req.query.itemid );
  res.send(obj);
});

// PUTS
e_app.post('/api/user', jsonParser, async function(req, res) {
  console.log(req.body);
  await db.set("user/" + req.body.userid, req.body.value);
  res.send("success!");
});

e_app.post('/api/bin', jsonParser, async function(req, res) {
  console.log(req.body);
  await db.set("bin/" + req.body.binid, req.body.value);
  res.send("success!");
});
e_app.post('/api/item', jsonParser, async function(req, res) {
  console.log(req.body);
  await db.set("item/" + req.body.itemid, req.body.value);
  res.send("success!");
});

async function create_user(){
  await db.set("myKey", "myValue");
}

//await db.get("myKey");

// =========== Start the app =========== //
e_app.use(express.static(__dirname + '/public'));
e_app.use(express.static(__dirname + '/fileserve'));
e_app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, e_app.settings.env);
});