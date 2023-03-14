// ==============
// |   ANYBIN   |          Created by Porter
// ==============          March 2023                 v0.1


// =========== Requires =========== //
require('dotenv').config();
const { QuickDB } = require("quick.db");
const express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
const { resolveSoa } = require('dns');


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
e_app.get('/user', async function(req, res) {
  console.log(req.query.userid);
  let obj = await db.get( req.query.userid );
  res.send(obj);
});
e_app.get('/bin', async function(req, res) {
  let obj = await db.get( req.query.userid + "/" + req.query.binid );
  res.send(obj);
});
e_app.get('/item', async function(req, res) {
  let obj = await db.get( req.query.userid + "/" + req.query.binid + "/" + req.query.itemid );
  res.send(obj);
});

// PUTS
e_app.post('/user', async function(req, res) {
  console.log(req.body);
  //await db.set(req.query.userid, req.query.value);
  res.send("success!");
});
e_app.post('/bin', async function(req, res) {

});
e_app.post('/item', async function(req, res) {

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