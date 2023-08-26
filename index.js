// ==============
// |   ANYBIN   |          Created by Porter
// ==============          April 2023                 v0.1


// =========== Requires =========== //
const { QuickDB } =   require("quick.db");
const express =       require('express');
const passport =      require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session =       require('express-session');
const bodyParser =    require('body-parser');
const path =          require('path');
const favicon =       require('serve-favicon');
const multer =        require('multer');


// =========== Express App =========== //
require('dotenv').config();
const e_app = express();
e_app.set('view engine', 'ejs');
e_app.get('/dashboardhack', function(_req, res) {
    res.render("dashboard",{
    })
});
e_app.use(favicon(path.join(__dirname, 'public', 'favicon.png')))
e_app.use(session({
  secret: 'mysecretkey',
  resave: true,
  saveUninitialized: true
}));
e_app.use(passport.initialize());
e_app.use(passport.session());


// =========== Storage and DB =========== //
const db = new QuickDB();
const jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
e_app.use(urlencodedParser);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'fileserve/local_uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
  }
});
const upload = multer({ storage: storage });


// =========== API =========== //
// USER API FUNCTIONS
e_app.get('/api/user', async function(req, res) { // fetch a user
  let obj = await db.get( "user." + req.user.id );
  res.send(obj);
});
// BIN API FUNCTIONS
e_app.get('/api/bin', async function(req, res) { // fetch the contents of a bin
  let bin = await db.get("bin." + req.query.binid);
  res.send(bin);
});
e_app.post('/api/bin', jsonParser, async function(req, res) { // update a bin
  console.log(req.body)
  const newBin = {
    name: req.body.name,
    description: req.body.description,
    id: req.body.id,
    items: JSON.parse(req.body.items),
    tags: JSON.parse(req.body.tags),
    col: req.body.col,
    row: req.body.row,
    editDates: JSON.parse(req.body.editDates),
    editors: JSON.parse(req.body.editors),
    owner: req.body.owner
  };

  await db.set("bin." + req.body.id, newBin);
  res.send("success");
});
e_app.put('/api/bin', jsonParser, async function(req, res) { // create a new bin
  console.info("CREATING BIN");
  let userbins = await db.get("user." + req.user.id + ".bins" );
  const binid = makeid(12);
  userbins.push(binid);

  const date = new Date();
  const newBin = {
    name: "New Bin",
    description: "Brand new bin! Rename this shit",
    id: binid,
    items: [
      [] // page 1
    ], // key is index in the bin, value is item id.
    tags: [],
    col: 5,
    row: 4,
    editDates: [date],
    editors: [req.user.id],
    owner: req.user.id
  };
  
  await db.set("bin." + binid, newBin);
  await db.set("user." + req.user.id + ".bins", userbins);
  
  res.send(binid);
});
e_app.delete('/api/bin', async function(req, res) { // remove a bin
  await db.delete(`bin.${req.body.binid}`);

  let userbins = await db.get(`user.${req.user.id}.bins` );
  userbins = userbins.filter(v => v != req.body.binid.toString()); 
  await db.set(`user.${req.user.id}.bins`, userbins);

  console.log(await db.get(`bin`));
});
// ITEM API FUNCTIONS
e_app.get('/api/item', async function(req, res) { // fetch the contents of an item
  let item = await db.get("item." + req.query.itemid);
  res.send(item);
});
e_app.put('/api/item', jsonParser, async function(req, res) { // create a new item
  console.info("CREATE ITEM");
  let binPage = await db.get(`bin.${req.body.binid}.items.${req.body.page}`);
  let itemId = makeid(14);
  binPage.push({
    id: itemId,
    x: parseInt(req.body.row),
    y: parseInt(req.body.col),
    height: 1,
    width: 1
  })
  const newItem = {
    name: "New Item",
    id: itemId,
    description: "Sample Description",
    links: [],
    image: "https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg"
  }
  await db.set(`bin.${req.body.binid}.items.${req.body.page}`, binPage);
  await db.set(`item.${itemId}`, newItem);
  res.send(newItem);
});
e_app.post('/api/item', jsonParser, async function(req, res) { // update an item
  console.log(req.body);
  const newItem = {
    name: req.body.name,
    id: req.body.id,
    description: req.body.description,
    links: JSON.parse(req.body.links),
    image: req.body.image
  };

  await db.set(`item.${req.body.id}`, newItem);
  res.send("success");
});
// IMAGE API FUNCTIONS
e_app.post('/api/image', upload.single('image'), (req, res) => { // create a new image (upload)
  res.send("/local_uploads/" + req.file.filename);
});

// =========== Auth =========== //
// Passport setup
passport.use(new LocalStrategy(
  async function(username, password, done) {
    console.info("CREATING USER " + username);
    // Check if user exists in database
    const userId = await db.has("user.default");
    if (!userId) {
      // Create default user if it doesn't exist
      const newUser = {
        name: "default",
        password: "password123",
        id: 1
      };
      await db.set("user.default", newUser);
    }

    // Retrieve user from database
    const users = await db.get("user");
    const user = Object.values(users).find(user => user.name === username && user.password === password);

    if (user) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Incorrect username or password.' });
    }
  }
));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(async function(id, done) {
  const users = await db.get("user");
  const user = Object.values(users).find(u => u.id === id);
  done(null, user);
});

// Set up routes
e_app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.render("dashboard",{
    })
  } else {
    res.render("home")
  }
  
});
e_app.get('/test', (req, res) => {
  res.render("test",{
  })
});
e_app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.warn(err);
    }
    res.redirect('/');
  });
});
e_app.post('/login', function(req, res, next) {
  console.info('REQUESTED LOGIN');
  next();
}, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/'
}));
e_app.post('/register', urlencodedParser, async function(req, res) {
  console.info("REQUESTED REGISTER")
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // Check if username already exists
  // Check if user exists in database
  const userId = await db.has("user.default");
  if (!userId) {
    // Create default user if it doesn't exist
    const newUser = {
      name: "default",
      password: "password123",
      id: 1
    };
    await db.set("user.default", newUser);
  }

  // Retrieve user from database
  const users = await db.get("user");
  const userExists = Object.values(users).find(u => u.username === username);
  if (userExists) {
    return res.send('Username already taken');
  }

  // Check if password and confirm password match
  if (password !== confirmPassword) {
    return res.send('Passwords do not match');
  }

  // Create new user object
  const newUserId = makeid(10)
  const newUser = {
    name: username,
    password: password,
    bins: [],
    favorites: [],
    id: newUserId
  };
  
  await db.set("user." + newUserId, newUser);
  console.info("REGISTERING USER")

  // Redirect to login page
  res.redirect('/');
});

// SUB PAGES
e_app.get('/bin', (req, res) => {
  if (req.isAuthenticated()) {
    res.render("bin",{
    })
  } else {
    res.redirect('/');
  }
  
});
e_app.get('/item', (req, res) => {
  if (req.isAuthenticated()) {
    res.render("item",{
    })
  } else {
    res.redirect('/');
  }
  
});
// =========== Start the app =========== //
e_app.use(express.static(__dirname + '/public'));
e_app.use(express.static(__dirname + '/fileserve'));
e_app.listen(process.env.PORT || 8000, function(){
  console.info("Express server listening on port %d in %s mode", this.address().port, e_app.settings.env);
});

// =========== Util Functions =========== //
function makeid(n) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < n; i++ ) {
  result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
